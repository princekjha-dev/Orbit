import { can, resolveOrbitRole, UserContext } from "@/lib/auth/permissions";

/**
 * Validates whether the user is permitted to review or decide on a verification record.
 * Rule: Reviewer must have PLATFORM_ADMIN capability AND cannot be the subject of the verification.
 */
export function canReviewVerification(
  user: UserContext | null | undefined,
  subjectUserId?: string | null
): boolean {
  if (!user || !user.id) return false;
  if (!can(user, "VERIFY_ORGANIZATION")) return false;
  if (subjectUserId && user.id === subjectUserId) return false; // cannot review self
  return true;
}

/**
 * Validates access to private assessment attempts and submissions.
 * Rule: Candidate who created the attempt OR an authorized reviewer/admin.
 */
export function canAccessSubmission(
  user: UserContext | null | undefined,
  submissionOwnerId: string,
  reviewerId?: string | null
): boolean {
  if (!user || !user.id) return false;
  if (user.id === submissionOwnerId) return true;
  if (reviewerId && user.id === reviewerId) return true;
  return can(user, "MODERATE_PLATFORM");
}

/**
 * Validates access to private Evidence records.
 * Rule: Owner has full access; third parties have access ONLY if they provide a valid share token.
 */
export function canAccessEvidence(
  user: UserContext | null | undefined,
  evidenceOwnerId: string,
  isTokenValid: boolean = false
): boolean {
  if (isTokenValid) return true; // valid revocable token grants read-only access
  if (!user || !user.id) return false;
  return user.id === evidenceOwnerId;
}

/**
 * Validates access to a closed Team Workspace.
 * Rule: CLOSED to anyone who has not accepted the invite or is not the sponsor.
 */
export function canAccessTeamWorkspace(
  userId: string,
  sponsorId: string,
  acceptedMemberIds: string[]
): boolean {
  if (!userId) return false;
  if (userId === sponsorId) return true;
  return acceptedMemberIds.includes(userId);
}

/**
 * Validates whether a user can restore a quarantined held message.
 * Rule: ONLY the intended recipient can restore a message held for review.
 */
export function canRestoreHeldMessage(
  userId: string,
  intendedRecipientId: string
): boolean {
  if (!userId) return false;
  return userId === intendedRecipientId;
}

/**
 * Validates whether a user can review or publish Community Notes.
 */
export function canModerateCommunityNote(
  user: UserContext | null | undefined
): boolean {
  if (!user) return false;
  return can(user, "MODERATE_PLATFORM");
}
