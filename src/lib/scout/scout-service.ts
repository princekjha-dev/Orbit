/**
 * ORBITMOD V5 - SCOUT SERVICE
 * Business logic layer for Discovery, Matching, Team Formation, and Exposure Controls.
 */

import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit/audit-logger";
import { createOrbitModNotification } from "@/lib/notifications/orbitmod-notifications";
import {
  CandidateProfile,
  OpportunityRequirements,
  MatchBreakdown,
  TeamSlotRequirement,
  TeamAllocationResult,
  calculateScoutMatch,
  buildBalancedTeam,
  checkAndRecordExposure,
} from "./matching-engine";

export interface TeamInviteData {
  id: string;
  teamId: string;
  candidateId: string;
  senderId: string;
  roleName: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: string;
  respondedAt?: string;
}

export interface ScoutTeamData {
  id: string;
  name: string;
  description: string;
  opportunityId?: string;
  creatorId: string;
  slots: TeamSlotRequirement[];
  members: Array<{
    candidateId: string;
    candidateName: string;
    roleName: string;
    joinedAt: string;
  }>;
}

// In-Memory Seed Storage for offline development and deterministic tests
const inMemoryCandidates = new Map<string, CandidateProfile>();
const inMemoryOpportunities = new Map<string, OpportunityRequirements>();
const inMemoryTeams = new Map<string, ScoutTeamData>();
const inMemoryInvites = new Map<string, TeamInviteData>();

// Seed initial realistic candidates (DEMO / simulated)
const demoCandidates: CandidateProfile[] = [
  {
    id: "candidate-alex-chen",
    name: "Alex Chen (DEMO / simulated)",
    headline: "Full-Stack TypeScript & Systems Engineer",
    skills: [
      { name: "TypeScript", level: "EXPERT", verified: true },
      { name: "React", level: "ADVANCED", verified: true },
      { name: "PostgreSQL", level: "ADVANCED", verified: true },
      { name: "Docker", level: "INTERMEDIATE", verified: false },
    ],
    availabilityHoursPerWeek: 20,
    rolesInterested: ["Full-Stack Engineer", "Backend Engineer", "Platform Security"],
    timezoneOffsetHours: -5, // EST
    evidenceCount: 4,
    discoveryStatus: "ACTIVE",
  },
  {
    id: "candidate-maya-patel",
    name: "Maya Patel (DEMO / simulated)",
    headline: "Frontend Architect & Design Systems Lead",
    skills: [
      { name: "React", level: "EXPERT", verified: true },
      { name: "TypeScript", level: "ADVANCED", verified: true },
      { name: "Tailwind CSS", level: "EXPERT", verified: true },
      { name: "Figma", level: "ADVANCED", verified: false },
    ],
    availabilityHoursPerWeek: 15,
    rolesInterested: ["Frontend Engineer", "UI Engineer", "Product Design"],
    timezoneOffsetHours: 0, // UTC
    evidenceCount: 3,
    discoveryStatus: "ACTIVE",
  },
  {
    id: "candidate-liam-ross",
    name: "Liam Ross (DEMO / simulated)",
    headline: "Data Platform & Backend Distributed Systems",
    skills: [
      { name: "Python", level: "EXPERT", verified: true },
      { name: "SQL", level: "EXPERT", verified: true },
      { name: "PostgreSQL", level: "ADVANCED", verified: false },
      { name: "Docker", level: "ADVANCED", verified: true },
    ],
    availabilityHoursPerWeek: 25,
    rolesInterested: ["Backend Engineer", "Data Engineer", "Systems Architect"],
    timezoneOffsetHours: -8, // PST
    evidenceCount: 2,
    discoveryStatus: "ACTIVE",
  },
  {
    id: "candidate-sarah-kim",
    name: "Sarah Kim (DEMO / simulated)",
    headline: "Product Security & Penetration Testing",
    skills: [
      { name: "Security Auditing", level: "EXPERT", verified: true },
      { name: "TypeScript", level: "INTERMEDIATE", verified: true },
      { name: "Docker", level: "ADVANCED", verified: true },
    ],
    availabilityHoursPerWeek: 10,
    rolesInterested: ["Security Engineer", "Auditor"],
    timezoneOffsetHours: +5.5, // IST
    evidenceCount: 1,
    discoveryStatus: "PASSIVE",
  },
];

for (const c of demoCandidates) {
  inMemoryCandidates.set(c.id, c);
}

// Seed initial realistic opportunities (DEMO / simulated)
const demoOpportunities: OpportunityRequirements[] = [
  {
    id: "demo-opp-fullstack-001",
    title: "Full-Stack Security & Platform Intern (DEMO / simulated)",
    organizationName: "Apex Innovations (DEMO / simulated)",
    requiredSkills: ["TypeScript", "React", "PostgreSQL"],
    preferredSkills: ["Docker"],
    targetHoursPerWeek: 20,
    targetRole: "Full-Stack Engineer",
    targetTimezoneOffsetHours: -5,
    maxTimezoneDeltaHours: 6,
  },
  {
    id: "demo-opp-frontend-002",
    title: "Design Systems & Frontend Lead (DEMO / simulated)",
    organizationName: "Apex Innovations (DEMO / simulated)",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
    preferredSkills: ["Figma"],
    targetHoursPerWeek: 15,
    targetRole: "Frontend Engineer",
    targetTimezoneOffsetHours: 0,
    maxTimezoneDeltaHours: 5,
  },
];

for (const opp of demoOpportunities) {
  inMemoryOpportunities.set(opp.id, opp);
}

// Seed initial demo team
const demoTeam: ScoutTeamData = {
  id: "team-nexus-demo",
  name: "Nexus Security Pod (DEMO / simulated)",
  description: "Cross-functional team collaborating on verified platform security tooling.",
  creatorId: "candidate-alex-chen",
  slots: [
    { slotId: "slot-lead", roleName: "Full-Stack Lead", requiredSkills: ["TypeScript", "React"] },
    { slotId: "slot-frontend", roleName: "Frontend UI Specialist", requiredSkills: ["React", "Tailwind CSS"] },
    { slotId: "slot-security", roleName: "Security Auditor", requiredSkills: ["Security Auditing", "Docker"] },
  ],
  members: [
    {
      candidateId: "candidate-alex-chen",
      candidateName: "Alex Chen (DEMO / simulated)",
      roleName: "Full-Stack Lead",
      joinedAt: new Date().toISOString(),
    },
  ],
};
inMemoryTeams.set(demoTeam.id, demoTeam);

async function safeDbCall<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await Promise.race([
      call(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 250)),
    ]);
  } catch {
    return null;
  }
}

/**
 * Retrieves all opportunities with deterministic match score calculated for a candidate.
 */
export async function getScoutOpportunitiesForCandidate(
  candidateId: string
): Promise<Array<OpportunityRequirements & { match: MatchBreakdown }>> {
  const candidate = inMemoryCandidates.get(candidateId) || demoCandidates[0];
  const results: Array<OpportunityRequirements & { match: MatchBreakdown }> = [];

  for (const opp of inMemoryOpportunities.values()) {
    const match = calculateScoutMatch(candidate, opp);
    results.push({ ...opp, match });
  }

  // Sort descending by total deterministic score
  return results.sort((a, b) => b.match.totalScore - a.match.totalScore);
}

/**
 * Retrieves candidates matching an opportunity requirements profile,
 * enforcing fair exposure caps for recruiters.
 */
export async function getScoutCandidatesForOpportunity(
  opportunityId: string,
  recruiterId: string
): Promise<{
  candidates: Array<CandidateProfile & { match: MatchBreakdown; exposureAllowed: boolean }>;
  remainingReveals: number;
  resetsInHours: number;
}> {
  const opp = inMemoryOpportunities.get(opportunityId) || demoOpportunities[0];
  const list: Array<CandidateProfile & { match: MatchBreakdown; exposureAllowed: boolean }> = [];
  let remainingReveals = 50;
  let resetsInHours = 24;

  for (const candidate of inMemoryCandidates.values()) {
    if (candidate.discoveryStatus === "OFF") continue;

    const exposure = checkAndRecordExposure(recruiterId, candidate.id);
    remainingReveals = exposure.remainingReveals;
    resetsInHours = exposure.resetsInHours;

    const match = calculateScoutMatch(candidate, opp);
    list.push({
      ...candidate,
      match,
      exposureAllowed: exposure.allowed,
    });
  }

  // Sort descending by deterministic match score
  list.sort((a, b) => b.match.totalScore - a.match.totalScore);

  return {
    candidates: list,
    remainingReveals,
    resetsInHours,
  };
}

/**
 * Executes greedy bipartite slot allocation for a team.
 */
export async function allocateSlotsForTeam(
  teamId: string,
  targetHoursPerWeek: number = 20
): Promise<TeamAllocationResult> {
  const team = inMemoryTeams.get(teamId);
  if (!team) {
    throw new Error(`Team ${teamId} not found`);
  }

  const candidatePool = Array.from(inMemoryCandidates.values());
  return buildBalancedTeam(candidatePool, team.slots, targetHoursPerWeek);
}

/**
 * Sends a team invitation with non-duplication invariant.
 */
export async function sendTeamInvite({
  teamId,
  candidateId,
  senderId,
  roleName,
}: {
  teamId: string;
  candidateId: string;
  senderId: string;
  roleName: string;
}): Promise<TeamInviteData> {
  const team = inMemoryTeams.get(teamId);
  if (!team) throw new Error("Team not found");

  const candidate = inMemoryCandidates.get(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  // Check if candidate is already in the team
  if (team.members.some((m) => m.candidateId === candidateId)) {
    throw new Error("Candidate is already an active member of this team");
  }

  // Check existing pending invite
  for (const inv of inMemoryInvites.values()) {
    if (inv.teamId === teamId && inv.candidateId === candidateId && inv.status === "PENDING") {
      throw new Error("A pending invitation already exists for this candidate");
    }
  }

  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const invite: TeamInviteData = {
    id: inviteId,
    teamId,
    candidateId,
    senderId,
    roleName,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  inMemoryInvites.set(inviteId, invite);

  // Send notification to candidate
  await createOrbitModNotification({
    userId: candidateId,
    type: "MATCH_OPPORTUNITY",
    title: `New Team Invitation: ${team.name}`,
    body: `You have been invited to join ${team.name} as ${roleName}. Review and respond in Scout.`,
    link: `/mod/scout/team-builder?teamId=${teamId}`,
    metadata: { teamId, inviteId, roleName },
  });

  await logAuditEvent({
    actorId: senderId,
    action: "SCOUT_TEAM_INVITE_SENT",
    entityType: "TEAM_INVITATION",
    entityId: inviteId,
    metadata: { teamId, candidateId, roleName },
  });

  return invite;
}

/**
 * Responds to a team invitation (ACCEPT / DECLINE).
 * On ACCEPT, updates the team members roster.
 */
export async function respondToTeamInvite({
  inviteId,
  candidateId,
  action,
}: {
  inviteId: string;
  candidateId: string;
  action: "ACCEPT" | "DECLINE";
}): Promise<TeamInviteData> {
  const invite = inMemoryInvites.get(inviteId);
  if (!invite) throw new Error("Invitation not found");
  if (invite.candidateId !== candidateId) throw new Error("Unauthorized to respond to this invitation");
  if (invite.status !== "PENDING") throw new Error(`Invitation is already ${invite.status}`);

  invite.status = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
  invite.respondedAt = new Date().toISOString();
  inMemoryInvites.set(inviteId, invite);

  const team = inMemoryTeams.get(invite.teamId);
  if (team && action === "ACCEPT") {
    const candidate = inMemoryCandidates.get(candidateId);
    team.members.push({
      candidateId,
      candidateName: candidate?.name || candidateId,
      roleName: invite.roleName,
      joinedAt: new Date().toISOString(),
    });
    inMemoryTeams.set(team.id, team);

    // Notify team creator
    await createOrbitModNotification({
      userId: team.creatorId,
      type: "PROJECT_UPDATE",
      title: `${candidate?.name || "New member"} joined ${team.name}`,
      body: `Accepted invite for role: ${invite.roleName}.`,
      link: `/mod/scout/team-builder?teamId=${team.id}`,
      metadata: { teamId: team.id, memberId: candidateId },
    });
  }

  await logAuditEvent({
    actorId: candidateId,
    action: `SCOUT_INVITE_${action}`,
    entityType: "TEAM_INVITATION",
    entityId: inviteId,
    metadata: { teamId: invite.teamId, action },
  });

  return invite;
}

/**
 * Returns deterministic Scout discovery metrics (no fake numbers).
 */
export async function getScoutMetrics(): Promise<{
  activeOpportunities: number;
  activeCandidates: number;
  teamsFormed: number;
  avgMatchScore: number;
}> {
  const oppCount = inMemoryOpportunities.size;
  const candCount = Array.from(inMemoryCandidates.values()).filter((c) => c.discoveryStatus !== "OFF").length;
  const teamCount = inMemoryTeams.size;

  let totalScore = 0;
  let scoreSamples = 0;
  for (const c of inMemoryCandidates.values()) {
    for (const opp of inMemoryOpportunities.values()) {
      totalScore += calculateScoutMatch(c, opp).totalScore;
      scoreSamples++;
    }
  }

  const avgMatchScore = scoreSamples > 0 ? Math.round(totalScore / scoreSamples) : 0;

  return {
    activeOpportunities: oppCount,
    activeCandidates: candCount,
    teamsFormed: teamCount,
    avgMatchScore,
  };
}

export function getTeam(teamId: string): ScoutTeamData | null {
  return inMemoryTeams.get(teamId) || null;
}

export function getAllTeams(): ScoutTeamData[] {
  return Array.from(inMemoryTeams.values());
}
