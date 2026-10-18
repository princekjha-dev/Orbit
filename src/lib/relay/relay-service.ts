/**
 * ORBITMOD V5 - RELAY SERVICE
 * Business logic layer for Community Notes, Safe Messaging, and Moderation Reports.
 */

import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit/audit-logger";
import { createOrbitModNotification } from "@/lib/notifications/orbitmod-notifications";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  CommunityNote,
  NoteRatingType,
  validateNeutralTone,
  calculateNoteHelpfulness,
  detectOffPlatformSolicitation,
  OffPlatformContactDetection,
} from "./relay-engine";

export interface ChatMessageData {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  safetyCheck: OffPlatformContactDetection;
  createdAt: string;
}

export interface SafetyReportData {
  id: string;
  reporterId: string;
  targetType: "OPPORTUNITY" | "USER" | "ORGANIZATION" | "MESSAGE";
  targetId: string;
  category: "OFF_PLATFORM_SOLICITATION" | "MISLEADING_OPPORTUNITY" | "IMPERSONATION_RISK" | "UNPAID_TRIAL_WORK" | "HARASSMENT";
  explanation: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

// In-Memory storage for offline development and deterministic testing
const inMemoryNotes = new Map<string, CommunityNote>();
const inMemoryMessages = new Map<string, ChatMessageData[]>();
const inMemoryReports = new Map<string, SafetyReportData>();

// Seed initial realistic Community Note (DEMO / simulated)
const demoNote: CommunityNote = {
  id: "note-demo-001",
  targetEntityType: "ORGANIZATION",
  targetEntityId: "hypergrowth-stealth-demo",
  authorId: "candidate-alex-chen",
  content: "Unable to confirm state corporate registration under this exact name. Domain was registered 12 days ago with privacy guard.",
  evidenceLinks: ["https://whois.domaintools.com/hypergrowth-labs-stealth.xyz"],
  ratings: [
    { raterId: "user-maya", rating: "HELPFUL", ratedAt: new Date().toISOString() },
    { raterId: "user-liam", rating: "HELPFUL", ratedAt: new Date().toISOString() },
    { raterId: "user-sarah", rating: "SOMEWHAT_HELPFUL", ratedAt: new Date().toISOString() },
  ],
  status: "CURRENTLY_RATED_HELPFUL",
  helpfulnessScore: 0.83,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};
inMemoryNotes.set(demoNote.id, demoNote);

// Seed initial channel messages
const demoChannelId = "channel-pod-nexus";
inMemoryMessages.set(demoChannelId, [
  {
    id: "msg-001",
    channelId: demoChannelId,
    senderId: "candidate-alex-chen",
    senderName: "Alex Chen (DEMO / simulated)",
    content: "Welcome to Nexus Pod channel! All sprint discussions happen here on-platform.",
    safetyCheck: { hasOffPlatformRisk: false, detectedPatterns: [] },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]);

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
 * Creates a new Community Note with neutral tone enforcement
 */
export async function createCommunityNote({
  targetEntityType,
  targetEntityId,
  authorId,
  content,
  evidenceLinks = [],
}: {
  targetEntityType: "OPPORTUNITY" | "ORGANIZATION" | "USER_PROFILE";
  targetEntityId: string;
  authorId: string;
  content: string;
  evidenceLinks?: string[];
}): Promise<CommunityNote> {
  // Validate neutral tone
  const toneCheck = validateNeutralTone(content);
  if (!toneCheck.valid) {
    throw new Error(toneCheck.reason || "Content violates neutral tone guidelines");
  }

  // Prevent duplicate notes by same author on same entity
  for (const note of inMemoryNotes.values()) {
    if (note.targetEntityId === targetEntityId && note.authorId === authorId) {
      throw new Error("You have already submitted a Community Note for this item");
    }
  }

  const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const note: CommunityNote = {
    id: noteId,
    targetEntityType,
    targetEntityId,
    authorId,
    content,
    evidenceLinks,
    ratings: [],
    status: "PROPOSED",
    helpfulnessScore: 0,
    createdAt: new Date().toISOString(),
  };

  inMemoryNotes.set(noteId, note);

  await logAuditEvent({
    actorId: authorId,
    action: "RELAY_COMMUNITY_NOTE_CREATED",
    entityType: targetEntityType,
    entityId: targetEntityId,
    metadata: { noteId, contentExcerpt: content.substring(0, 60) },
  });

  return note;
}

/**
 * Rates an existing Community Note
 */
export async function rateCommunityNote({
  noteId,
  raterId,
  rating,
}: {
  noteId: string;
  raterId: string;
  rating: NoteRatingType;
}): Promise<CommunityNote> {
  const note = inMemoryNotes.get(noteId);
  if (!note) throw new Error("Community Note not found");

  if (note.authorId === raterId) {
    throw new Error("Authors cannot rate their own Community Notes");
  }

  // Update or add rating
  const existingIdx = note.ratings.findIndex((r) => r.raterId === raterId);
  const ratingEntry = { raterId, rating, ratedAt: new Date().toISOString() };

  if (existingIdx >= 0) {
    note.ratings[existingIdx] = ratingEntry;
  } else {
    note.ratings.push(ratingEntry);
  }

  const scored = calculateNoteHelpfulness(note.ratings);
  note.helpfulnessScore = scored.helpfulnessScore;
  note.status = scored.status;

  inMemoryNotes.set(noteId, note);

  await logAuditEvent({
    actorId: raterId,
    action: "RELAY_NOTE_RATED",
    entityType: "COMMUNITY_NOTE",
    entityId: noteId,
    metadata: { rating, helpfulnessScore: note.helpfulnessScore, status: note.status },
  });

  return note;
}

/**
 * Retrieves Community Notes for an entity
 */
export async function getCommunityNotes(
  targetEntityType?: "OPPORTUNITY" | "ORGANIZATION" | "USER_PROFILE",
  targetEntityId?: string
): Promise<CommunityNote[]> {
  const all = Array.from(inMemoryNotes.values());
  if (!targetEntityId) {
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return all
    .filter((n) => (!targetEntityType || n.targetEntityType === targetEntityType) && n.targetEntityId === targetEntityId)
    .sort((a, b) => b.helpfulnessScore - a.helpfulnessScore);
}

/**
 * Sends a chat message with safety check & rate limiting
 */
export async function sendChatMessage({
  channelId,
  senderId,
  senderName,
  content,
}: {
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
}): Promise<ChatMessageData> {
  // Rate limiting check
  const allowed = await checkRateLimit(senderId, "MESSAGE");
  if (!allowed) {
    throw new Error("Message rate limit exceeded. Please wait a moment before sending another message.");
  }

  const safetyCheck = detectOffPlatformSolicitation(content);
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const message: ChatMessageData = {
    id: msgId,
    channelId,
    senderId,
    senderName,
    content,
    safetyCheck,
    createdAt: new Date().toISOString(),
  };

  const currentMessages = inMemoryMessages.get(channelId) || [];
  currentMessages.push(message);
  inMemoryMessages.set(channelId, currentMessages);

  if (safetyCheck.hasOffPlatformRisk) {
    await logAuditEvent({
      actorId: senderId,
      action: "RELAY_OFF_PLATFORM_CONTACT_DETECTED",
      entityType: "CHAT_MESSAGE",
      entityId: msgId,
      metadata: { channelId, detectedPatterns: safetyCheck.detectedPatterns },
    });
  }

  return message;
}

/**
 * Retrieves messages for a channel
 */
export async function getChannelMessages(channelId: string): Promise<ChatMessageData[]> {
  return inMemoryMessages.get(channelId) || [];
}

/**
 * Submits a safety report
 */
export async function createSafetyReport({
  reporterId,
  targetType,
  targetId,
  category,
  explanation,
}: {
  reporterId: string;
  targetType: "OPPORTUNITY" | "USER" | "ORGANIZATION" | "MESSAGE";
  targetId: string;
  category: SafetyReportData["category"];
  explanation: string;
}): Promise<SafetyReportData> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const report: SafetyReportData = {
    id: reportId,
    reporterId,
    targetType,
    targetId,
    category,
    explanation,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  inMemoryReports.set(reportId, report);

  await logAuditEvent({
    actorId: reporterId,
    action: "RELAY_SAFETY_REPORT_FILED",
    entityType: targetType,
    entityId: targetId,
    metadata: { reportId, category },
  });

  return report;
}

export async function getSafetyReports(): Promise<SafetyReportData[]> {
  return Array.from(inMemoryReports.values());
}

/**
 * Real Relay metrics
 */
export async function getRelayMetrics(): Promise<{
  totalNotes: number;
  helpfulNotesCount: number;
  activeChannelsCount: number;
  safetyInterventionsCount: number;
}> {
  const notes = Array.from(inMemoryNotes.values());
  const helpfulNotes = notes.filter((n) => n.status === "CURRENTLY_RATED_HELPFUL");
  const channels = inMemoryMessages.size;

  let interventions = 0;
  for (const msgs of inMemoryMessages.values()) {
    for (const m of msgs) {
      if (m.safetyCheck.hasOffPlatformRisk) interventions++;
    }
  }

  return {
    totalNotes: notes.length,
    helpfulNotesCount: helpfulNotes.length,
    activeChannelsCount: channels,
    safetyInterventionsCount: interventions,
  };
}
