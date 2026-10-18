import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateSkillScore,
  calculateAvailabilityScore,
  calculateInterestRoleScore,
  calculateTimezoneScore,
  calculateEvidenceScore,
  calculateScoutMatch,
  buildBalancedTeam,
  checkAndRecordExposure,
  resetExposureForTesting,
  CandidateProfile,
  OpportunityRequirements,
  TeamSlotRequirement,
} from "../lib/scout/matching-engine";
import {
  getScoutOpportunitiesForCandidate,
  getScoutCandidatesForOpportunity,
  sendTeamInvite,
  respondToTeamInvite,
  allocateSlotsForTeam,
  getScoutMetrics,
} from "../lib/scout/scout-service";

describe("OrbitMod V5: Scout Matching, Teams & Exposure Engine (Stage 3.2)", () => {
  beforeEach(() => {
    resetExposureForTesting();
  });

  describe("Deterministic 5-Signal Matching Formula Components", () => {
    it("1. Skill Score: should calculate exact overlap and apply verified skill multiplier", () => {
      const candidateSkills = [
        { name: "TypeScript", verified: true },
        { name: "React", verified: false },
      ];
      const requiredSkills = ["TypeScript", "React", "PostgreSQL"];

      // 3 required skills = 33.33 pts each
      // TypeScript: verified => 33.33 * 1.2 = 40 pts
      // React: unverified => 33.33 pts
      // PostgreSQL: missing => 0 pts
      // Total approx 73 pts
      const res = calculateSkillScore(candidateSkills, requiredSkills);
      expect(res.matchedSkills).toEqual(["TypeScript", "React"]);
      expect(res.missingSkills).toEqual(["PostgreSQL"]);
      expect(res.score).toBeGreaterThanOrEqual(70);
      expect(res.score).toBeLessThanOrEqual(75);
    });

    it("2. Availability Score: should award 100% within 20% window and penalize proportionally", () => {
      const perfect = calculateAvailabilityScore(20, 20);
      expect(perfect.score).toBe(100);

      const withinWindow = calculateAvailabilityScore(18, 20); // 90% ratio
      expect(withinWindow.score).toBe(100);

      const underAvail = calculateAvailabilityScore(10, 20); // 50% ratio
      expect(underAvail.score).toBe(50);

      const zeroAvail = calculateAvailabilityScore(0, 20);
      expect(zeroAvail.score).toBe(0);
    });

    it("3. Interest & Role Alignment: should award 100% for direct match", () => {
      const match = calculateInterestRoleScore(["Full-Stack Engineer", "Backend Developer"], "Full-Stack Engineer");
      expect(match.score).toBe(100);
      expect(match.matchedRole).toBe(true);

      const partial = calculateInterestRoleScore(["UI Designer"], "Full-Stack Engineer");
      expect(partial.score).toBe(30);
      expect(partial.matchedRole).toBe(false);
    });

    it("4. Timezone Overlap: should award 100% for 0h delta and decay smoothly", () => {
      expect(calculateTimezoneScore(0, 0).score).toBe(100);
      expect(calculateTimezoneScore(-5, -5).score).toBe(100);
      expect(calculateTimezoneScore(-5, -3).score).toBe(95); // 2h delta
      expect(calculateTimezoneScore(-8, -4).score).toBe(85); // 4h delta
      expect(calculateTimezoneScore(10, -5).score).toBeLessThanOrEqual(50); // Large delta
    });

    it("5. Evidence Confidence: should scale monotonically with verified items count", () => {
      expect(calculateEvidenceScore(0).score).toBe(20);
      expect(calculateEvidenceScore(1).score).toBe(55);
      expect(calculateEvidenceScore(2).score).toBe(75);
      expect(calculateEvidenceScore(3).score).toBe(85);
      expect(calculateEvidenceScore(6).score).toBe(100);
    });

    it("Composite Formula: weights must sum to exactly 1.00 and bounded to [0, 100]", () => {
      const candidate: CandidateProfile = {
        id: "cand-1",
        name: "Test Candidate",
        skills: [
          { name: "TypeScript", verified: true },
          { name: "React", verified: true },
        ],
        availabilityHoursPerWeek: 20,
        rolesInterested: ["Full-Stack Engineer"],
        timezoneOffsetHours: -5,
        evidenceCount: 6,
        discoveryStatus: "ACTIVE",
      };

      const opp: OpportunityRequirements = {
        id: "opp-1",
        title: "Senior Full-Stack Engineer",
        organizationName: "Test Org",
        requiredSkills: ["TypeScript", "React"],
        targetHoursPerWeek: 20,
        targetRole: "Full-Stack Engineer",
        targetTimezoneOffsetHours: -5,
      };

      const match = calculateScoutMatch(candidate, opp);
      expect(match.totalScore).toBe(100);
      expect(match.isEligible).toBe(true);
      expect(match.signals.skillMatch.weight).toBe(0.35);
      expect(match.signals.availability.weight).toBe(0.25);
      expect(match.signals.interestRole.weight).toBe(0.20);
      expect(match.signals.timezone.weight).toBe(0.10);
      expect(match.signals.evidence.weight).toBe(0.10);
      const totalWeight =
        match.signals.skillMatch.weight +
        match.signals.availability.weight +
        match.signals.interestRole.weight +
        match.signals.timezone.weight +
        match.signals.evidence.weight;
      expect(Math.round(totalWeight * 100) / 100).toBe(1.0);
    });

    it("Discovery Opt-Out: candidate with discoveryStatus OFF must yield 0 score and ineligible", () => {
      const hiddenCandidate: CandidateProfile = {
        id: "cand-hidden",
        name: "Hidden Candidate",
        skills: [{ name: "TypeScript", verified: true }],
        availabilityHoursPerWeek: 40,
        rolesInterested: ["Full-Stack Engineer"],
        timezoneOffsetHours: 0,
        evidenceCount: 5,
        discoveryStatus: "OFF",
      };

      const opp: OpportunityRequirements = {
        id: "opp-1",
        title: "Engineer",
        organizationName: "Org",
        requiredSkills: ["TypeScript"],
        targetHoursPerWeek: 40,
        targetRole: "Engineer",
      };

      const match = calculateScoutMatch(hiddenCandidate, opp);
      expect(match.totalScore).toBe(0);
      expect(match.isEligible).toBe(false);
      expect(match.explanation).toContain("disabled discovery");
    });
  });

  describe("Greedy Bipartite Slot Allocation for Team Pods", () => {
    it("should allocate candidates uniquely without duplication across team slots", () => {
      const candidates: CandidateProfile[] = [
        {
          id: "cand-ts",
          name: "TypeScript Specialist",
          skills: [{ name: "TypeScript", verified: true }],
          availabilityHoursPerWeek: 20,
          rolesInterested: ["Backend Lead"],
          timezoneOffsetHours: 0,
          evidenceCount: 2,
          discoveryStatus: "ACTIVE",
        },
        {
          id: "cand-ui",
          name: "Frontend Designer",
          skills: [{ name: "React", verified: true }, { name: "Tailwind CSS", verified: true }],
          availabilityHoursPerWeek: 20,
          rolesInterested: ["Frontend UI"],
          timezoneOffsetHours: 0,
          evidenceCount: 3,
          discoveryStatus: "ACTIVE",
        },
      ];

      const slots: TeamSlotRequirement[] = [
        { slotId: "s-1", roleName: "Backend Lead", requiredSkills: ["TypeScript"] },
        { slotId: "s-2", roleName: "Frontend UI", requiredSkills: ["React"] },
        { slotId: "s-3", roleName: "Data Analyst", requiredSkills: ["Python", "SQL"] },
      ];

      const res = buildBalancedTeam(candidates, slots, 20);

      // Invariant 1: Candidates must be assigned to at most ONE slot
      const assignedCandidateIds = res.assignedSlots.map((s) => s.candidateId);
      const uniqueAssigned = new Set(assignedCandidateIds);
      expect(assignedCandidateIds.length).toBe(uniqueAssigned.size);

      // Invariant 2: s-1 assigned to cand-ts, s-2 assigned to cand-ui
      expect(res.assignedSlots.find((s) => s.slotId === "s-1")?.candidateId).toBe("cand-ts");
      expect(res.assignedSlots.find((s) => s.slotId === "s-2")?.candidateId).toBe("cand-ui");

      // Invariant 3: s-3 has no matching candidate and appears in unassignedSlots
      expect(res.unassignedSlots.some((s) => s.slotId === "s-3")).toBe(true);
      expect(res.teamCoverageScore).toBeGreaterThan(0);
    });
  });

  describe("Fair Exposure Capping & Anti-Scraping Protection", () => {
    it("should allow first 50 reveals and deny the 51st reveal within 24h", () => {
      const recruiterId = "recruiter-test-01";

      for (let i = 1; i <= 50; i++) {
        const check = checkAndRecordExposure(recruiterId, `cand-${i}`);
        expect(check.allowed).toBe(true);
        expect(check.remainingReveals).toBe(50 - i);
      }

      // 51st request should be rejected
      const blocked = checkAndRecordExposure(recruiterId, "cand-51");
      expect(blocked.allowed).toBe(false);
      expect(blocked.remainingReveals).toBe(0);
    });
  });

  describe("Scout Service End-to-End Workflows", () => {
    it("should retrieve ranked opportunities for candidate", async () => {
      const opps = await getScoutOpportunitiesForCandidate("candidate-alex-chen");
      expect(opps.length).toBeGreaterThan(0);
      expect(opps[0].match.totalScore).toBeGreaterThanOrEqual(opps[opps.length - 1].match.totalScore);
    });

    it("should retrieve candidate pool with exposure tracking for recruiter", async () => {
      const res = await getScoutCandidatesForOpportunity("demo-opp-fullstack-001", "recruiter-e2e");
      expect(res.candidates.length).toBeGreaterThan(0);
      expect(res.remainingReveals).toBeLessThan(50);
    });

    it("should allocate slots for a registered team", async () => {
      const allocation = await allocateSlotsForTeam("team-nexus-demo", 20);
      expect(allocation.assignedSlots.length).toBeGreaterThan(0);
      expect(allocation.teamCoverageScore).toBeGreaterThan(0);
    });

    it("should send team invite and prevent duplicate pending invite", async () => {
      const invite = await sendTeamInvite({
        teamId: "team-nexus-demo",
        candidateId: "candidate-maya-patel",
        senderId: "candidate-alex-chen",
        roleName: "Frontend UI Specialist",
      });
      expect(invite.id).toBeDefined();
      expect(invite.status).toBe("PENDING");

      // Duplicate invite should fail
      await expect(
        sendTeamInvite({
          teamId: "team-nexus-demo",
          candidateId: "candidate-maya-patel",
          senderId: "candidate-alex-chen",
          roleName: "Frontend UI Specialist",
        })
      ).rejects.toThrow(/already exists/i);
    });

    it("should accept invite and update team member roster", async () => {
      const invite = await sendTeamInvite({
        teamId: "team-nexus-demo",
        candidateId: "candidate-liam-ross",
        senderId: "candidate-alex-chen",
        roleName: "Backend Engineer",
      });

      const updated = await respondToTeamInvite({
        inviteId: invite.id,
        candidateId: "candidate-liam-ross",
        action: "ACCEPT",
      });
      expect(updated.status).toBe("ACCEPTED");
    });

    it("should return transparent real discovery metrics without fake numbers", async () => {
      const metrics = await getScoutMetrics();
      expect(metrics.activeOpportunities).toBeGreaterThan(0);
      expect(metrics.activeCandidates).toBeGreaterThan(0);
      expect(metrics.avgMatchScore).toBeGreaterThan(0);
      expect(metrics.avgMatchScore).toBeLessThanOrEqual(100);
    });
  });
});
