import { describe, it, expect } from "vitest";
import {
  createDnsChallenge,
  verifyOrganizationDns,
  getVerificationRecord,
} from "../lib/avis/avis-service";
import {
  submitAssessmentSolution,
  evaluateSubmission,
  getEvidenceArtifact,
} from "../lib/quill/quill-service";
import {
  calculateScoutMatch,
  CandidateProfile,
  OpportunityRequirements,
} from "../lib/scout/matching-engine";
import {
  allocateSlotsForTeam,
  sendTeamInvite,
  respondToTeamInvite,
  getTeam,
} from "../lib/scout/scout-service";
import {
  createCommunityNote,
  rateCommunityNote,
  sendChatMessage,
} from "../lib/relay/relay-service";
import {
  completeProjectAndAttest,
  getEvidencePassport,
} from "../lib/passport/passport-service";

describe("OrbitMod V5: Full End-to-End Core Value Loop Integration Test (Stage 3.5 & 3.6)", () => {
  const candidateId = "candidate-alex-chen";
  const orgSlug = "apex-innovations-demo";
  const oppId = "demo-opp-fullstack-001";
  const assessmentId = "quill-assess-syssec-001";
  const teamId = "team-nexus-demo";

  it("Step 1 & 2: Discover & Verify (Space -> Opportunity -> Avis Verification)", async () => {
    // 1. Verify organization via DNS TXT Challenge
    const challenge = await createDnsChallenge(orgSlug, "apexinnovations.org");
    expect(challenge.token).toBeDefined();
    expect(challenge.hostRecord).toBe("_orbit-challenge.apexinnovations.org");

    // DNS verification confirmation
    const verification = await verifyOrganizationDns(orgSlug);
    expect(verification.verified).toBe(true);
    expect(verification.record.state).toBe("VERIFIED");

    // Query trust record from Avis service
    const record = await getVerificationRecord("ORGANIZATION", orgSlug);
    expect(record).toBeDefined();
    expect(record?.state).toBe("VERIFIED");
  });

  it("Step 3: Prove (Quill Assessment -> Standardized Rubric -> SHA-256 Evidence)", async () => {
    // Candidate submits authentic architecture solution
    const solutionContent = "export class EndToEndAuditModule {\n  verify(hash: string) { return hash.length === 64; }\n}";
    const submission = await submitAssessmentSolution({
      assessmentId,
      candidateId,
      candidateName: "Alex Chen (DEMO / simulated)",
      artifactContent: solutionContent,
    });
    expect(submission.id).toBeDefined();
    expect(submission.artifactSha256).toHaveLength(64);

    // Independent Reviewer 1 scores via rubric
    await evaluateSubmission({
      submissionId: submission.id,
      reviewerId: "reviewer-alpha",
      reviewerName: "Senior Architect Alpha",
      scores: [
        { criterionId: "crit_arch", score: 5 },
        { criterionId: "crit_sec", score: 5 },
        { criterionId: "crit_perf", score: 4 },
        { criterionId: "crit_test", score: 5 },
      ],
    });

    // Independent Reviewer 2 scores and triggers consensus
    const reviewResult = await evaluateSubmission({
      submissionId: submission.id,
      reviewerId: "reviewer-beta",
      reviewerName: "Security Auditor Beta",
      scores: [
        { criterionId: "crit_arch", score: 5 },
        { criterionId: "crit_sec", score: 4 },
        { criterionId: "crit_perf", score: 5 },
        { criterionId: "crit_test", score: 4 },
      ],
    });

    expect(reviewResult.consensusResult.consensusReached).toBe(true);
    expect(reviewResult.submission.status).toBe("PASSED");
    expect(reviewResult.generatedEvidence).toBeDefined();
    expect(reviewResult.generatedEvidence?.status).toBe("VERIFIED");

    // Audit cryptographic integrity
    const audit = await getEvidenceArtifact(reviewResult.generatedEvidence!.id);
    expect(audit.isValidIntegrity).toBe(true);
  });

  it("Step 4: Match & Team Pod Allocation (Scout 5-Signal Formula -> Slot Allocation -> Invite)", async () => {
    const candidate: CandidateProfile = {
      id: candidateId,
      name: "Alex Chen (DEMO / simulated)",
      skills: [
        { name: "TypeScript", level: "EXPERT", verified: true },
        { name: "React", level: "ADVANCED", verified: true },
        { name: "PostgreSQL", level: "ADVANCED", verified: true },
      ],
      availabilityHoursPerWeek: 20,
      rolesInterested: ["Full-Stack Engineer"],
      timezoneOffsetHours: -5,
      evidenceCount: 4,
      discoveryStatus: "ACTIVE",
    };

    const opp: OpportunityRequirements = {
      id: oppId,
      title: "Full-Stack Security & Platform Intern (DEMO / simulated)",
      organizationName: "Apex Innovations (DEMO / simulated)",
      requiredSkills: ["TypeScript", "React", "PostgreSQL"],
      targetHoursPerWeek: 20,
      targetRole: "Full-Stack Engineer",
      targetTimezoneOffsetHours: -5,
      maxTimezoneDeltaHours: 6,
    };

    // 1. Calculate deterministic 5-signal match
    const match = calculateScoutMatch(candidate, opp);
    expect(match.totalScore).toBeGreaterThanOrEqual(85);
    expect(match.isEligible).toBe(true);
    expect(match.signals.skillMatch.score).toBeGreaterThanOrEqual(90);

    // 2. Greedy slot allocation
    const allocation = await allocateSlotsForTeam(teamId, 20);
    expect(allocation.assignedSlots.length).toBeGreaterThan(0);

    // 3. Invite flow & roster update
    const invite = await sendTeamInvite({
      teamId,
      candidateId: "candidate-maya-patel",
      senderId: candidateId,
      roleName: "Frontend UI Specialist",
    });
    expect(invite.status).toBe("PENDING");

    const responded = await respondToTeamInvite({
      inviteId: invite.id,
      candidateId: "candidate-maya-patel",
      action: "ACCEPT",
    });
    expect(responded.status).toBe("ACCEPTED");

    const team = getTeam(teamId);
    expect(team?.members.some((m) => m.candidateId === "candidate-maya-patel")).toBe(true);
  });

  it("Step 5: Collaborate Safely (Relay Channels -> Off-Platform Detection -> Community Notes)", async () => {
    // 1. Safe messaging with off-platform warning
    const message = await sendChatMessage({
      channelId: `channel-pod-${teamId}`,
      senderId: candidateId,
      senderName: "Alex Chen (DEMO / simulated)",
      content: "Let's coordinate on sprint milestones. Contact me on WhatsApp +1-555-0199 for quick ping.",
    });
    expect(message.safetyCheck.hasOffPlatformRisk).toBe(true);
    expect(message.safetyCheck.warningMessage).toContain("Safety Notice");

    // 2. Propose Community Note with neutral copy
    const note = await createCommunityNote({
      targetEntityType: "OPPORTUNITY",
      targetEntityId: oppId,
      authorId: "user-independent-reviewer",
      content: "Interview process includes technical architecture review. Stipend paid biweekly via standard payroll.",
    });
    expect(note.status).toBe("PROPOSED");

    // 3. Community ratings reach HELPFUL consensus
    await rateCommunityNote({ noteId: note.id, raterId: "user-rater-1", rating: "HELPFUL" });
    await rateCommunityNote({ noteId: note.id, raterId: "user-rater-2", rating: "HELPFUL" });
    const rated = await rateCommunityNote({ noteId: note.id, raterId: "user-rater-3", rating: "HELPFUL" });
    expect(rated.status).toBe("CURRENTLY_RATED_HELPFUL");
  });

  it("Step 6: Build Evidence (Project Completion -> Attestations -> Full Evidence Passport)", async () => {
    // 1. Complete project pod milestone and issue peer attestations
    const attestation = await completeProjectAndAttest({
      teamId,
      completerId: candidateId,
      summary: "Delivered production-grade HMAC verification pipeline with 100% test passing rate.",
    });
    expect(attestation.peerAttestationsCount).toBeGreaterThanOrEqual(1);
    expect(attestation.evidenceSha256).toHaveLength(64);

    // 2. Generate aggregated Evidence Passport
    const passport = await getEvidencePassport(candidateId);
    expect(passport.userId).toBe(candidateId);
    expect(passport.avisVerification.status).toBe("VERIFIED");
    expect(passport.verifiedSkills.length).toBeGreaterThanOrEqual(3);
    expect(passport.evidenceArtifacts.length).toBeGreaterThanOrEqual(1);
    expect(passport.completedProjects.length).toBeGreaterThanOrEqual(1);
    expect(passport.portableDigest).toHaveLength(64);
  });
});
