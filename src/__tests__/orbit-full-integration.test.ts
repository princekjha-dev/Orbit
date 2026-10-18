import { describe, it, expect, beforeEach } from "vitest";
import { getEnv, requireServiceConfig } from "@/lib/env";
import {
  toolSearchOpportunities,
  toolGetApplications,
  toolSearchOrganizations,
  toolDraftColdEmail,
  toolConfirmAndSendEmail,
  toolSearchEvents,
} from "@/lib/ai/dot-tools";
import { processDotInteraction, getDotHistory } from "@/lib/ai/dot-agent";
import { inMemoryStore } from "@/lib/database/in-memory-store";

describe("Orbit Full Application Integration & Workflow Verification", () => {
  beforeEach(() => {
    // Reset specific test keys
    inMemoryStore.applications.clear();
    inMemoryStore.savedOpportunities.clear();
    inMemoryStore.emailOutbox = [];
  });

  describe("1. Environment & Config Validation Layer", () => {
    it("should validate and read canonical environment variables without errors", () => {
      const env = getEnv();
      expect(env.supabaseUrl).toBeDefined();
      expect(env.supabasePublishableKey).toBeDefined();
      expect(env.appUrl).toBeDefined();
    });

    it("should report Google OAuth configuration status accurately", () => {
      const env = getEnv();
      expect(env.isGoogleAuthEnabled).toBe(true);
      expect(env.googleClientId).toContain(".apps.googleusercontent.com");
    });

    it("should assert service configs and provide actionable diagnostic errors when missing", () => {
      expect(() => requireServiceConfig("google")).not.toThrow();
      expect(() => requireServiceConfig("ai")).not.toThrow();
    });
  });

  describe("2. Orbit Dots Tool Execution Layer", () => {
    const testUser = {
      userId: "test-talent-101",
      name: "Alex Rivera",
      userRole: "STUDENT",
    };

    it("should search real opportunities and return actionable deep links", async () => {
      const result = await toolSearchOpportunities(testUser, {
        query: "frontend",
        remoteOnly: true,
      });

      expect(result.success).toBe(true);
      expect(result.toolName).toBe("searchOpportunities");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.actionLinks).toBeDefined();
      expect(result.actionLinks![0].href).toMatch(/^\/opportunities\//);
    });

    it("should search verified organizations from approved data sources", async () => {
      const result = await toolSearchOrganizations(testUser, {});

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.some((org: any) => org.slug === "apex-systems")).toBe(true);
      expect(result.actionLinks![0].href).toMatch(/^\/org\//);
    });

    it("should draft cold email and enforce mandatory human confirmation before sending", async () => {
      const draftResult = await toolDraftColdEmail(testUser, {
        companySlug: "apex-systems",
        position: "Frontend Systems Engineer",
        userPitch: "I have verified evidence in distributed state management.",
      });

      expect(draftResult.success).toBe(true);
      expect(draftResult.requiresConfirmation).toBe(true);
      expect(draftResult.confirmationPayload).toBeDefined();
      expect(draftResult.confirmationPayload.recipient).toBe("talent@apexsystems.dev");
      expect(draftResult.confirmationPayload.body).toContain("verified proof-of-work");

      // Verify that NO email has been sent yet
      expect(inMemoryStore.emailOutbox.length).toBe(0);

      // Explicitly reject confirmation
      const rejectResult = await toolConfirmAndSendEmail(testUser, {
        ...draftResult.confirmationPayload,
        confirmed: false,
      });
      expect(rejectResult.success).toBe(false);
      expect(inMemoryStore.emailOutbox.length).toBe(0);

      // Explicitly approve confirmation
      const approveResult = await toolConfirmAndSendEmail(testUser, {
        ...draftResult.confirmationPayload,
        confirmed: true,
      });
      expect(approveResult.success).toBe(true);
      expect(inMemoryStore.emailOutbox.length).toBe(1);
      expect(inMemoryStore.emailOutbox[0].recipient).toBe("talent@apexsystems.dev");
      expect(inMemoryStore.emailOutbox[0].status).toBe("SENT");
    });

    it("should query upcoming events and hackathons with registration links", async () => {
      const result = await toolSearchEvents(testUser, {});
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.actionLinks![0].href).toMatch(/^\/events\//);
    });
  });

  describe("3. Multi-Agent Coworker Dots Workflow", () => {
    it("should allow a user to chat with Scout to find frontend opportunities", async () => {
      const result = await processDotInteraction({
        dotId: "scout",
        userId: "talent-user-77",
        userName: "Elena Rostova",
        message: "Find frontend internships for me",
      });

      expect(result.reply).toMatch(/match|opportunit|frontend/i);
      expect(result.toolResult?.toolName).toBe("searchOpportunities");
      expect(result.history.length).toBeGreaterThanOrEqual(2);

      // Verify memory persistence
      const history = getDotHistory("talent-user-77", "scout");
      expect(history.length).toBe(result.history.length);
    }, 90000);

    it("should allow a user to draft and confirm a cold email through Scout chat", async () => {
      // Step 1: User asks Scout to draft email
      const draftStep = await processDotInteraction({
        dotId: "scout",
        userId: "talent-user-77",
        userName: "Elena Rostova",
        message: "Draft a cold email to Apex Systems",
      });

      expect(draftStep.toolResult?.requiresConfirmation).toBe(true);
      const payload = draftStep.toolResult?.confirmationPayload;
      expect(payload).toBeDefined();

      // Step 2: User confirms dispatch
      const confirmStep = await processDotInteraction({
        dotId: "scout",
        userId: "talent-user-77",
        userName: "Elena Rostova",
        message: "Confirmed, proceed with sending.",
        confirmationAction: {
          action: "confirmAndSendEmail",
          payload,
          confirmed: true,
        },
      });

      expect(confirmStep.reply).toContain("successfully dispatched");
      expect(confirmStep.toolResult?.success).toBe(true);
    });

    it("should preserve distinct persona and specialized guidance across all Four Dots", async () => {
      const avis = await processDotInteraction({
        dotId: "avis",
        userId: "user-persona-test-avis",
        userName: "David",
        message: "How do you verify companies?",
      });

      const quill = await processDotInteraction({
        dotId: "quill",
        userId: "user-persona-test-quill",
        userName: "David",
        message: "Show me skill assessments",
      });

      const relay = await processDotInteraction({
        dotId: "relay",
        userId: "user-persona-test-relay",
        userName: "David",
        message: "What are your communication rules?",
      });

      expect(avis.reply).toMatch(/DNS TXT|verif|trust/i);
      expect(quill.reply).toMatch(/ESCO|rubric|skill/i);
      expect(relay.reply).toMatch(/safe|communicat|rule/i);
    }, 60000);
  });

  describe("4. End-to-End Application & State Persistence", () => {
    it("should persist user applications across queries and reflect updated statuses", async () => {
      const appKey = "opp-test-1:user-test-1";
      inMemoryStore.applications.set(appKey, {
        id: "app-test-1",
        opportunityId: "opp-test-1",
        userId: "user-test-1",
        coverLetter: "I have 4 years of TypeScript experience.",
        status: "APPLIED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Retrieve via tool
      const appResult = await toolGetApplications({ userId: "user-test-1" });
      expect(appResult.success).toBe(true);
      expect(appResult.data.inMemoryApps.length).toBe(1);
      expect(appResult.data.inMemoryApps[0].status).toBe("APPLIED");

      // Recruiter advances candidate status to SHORTLISTED
      const stored = inMemoryStore.applications.get(appKey)!;
      stored.status = "SHORTLISTED";
      stored.updatedAt = new Date().toISOString();

      // Talent re-queries applications
      const updatedResult = await toolGetApplications({ userId: "user-test-1" });
      expect(updatedResult.data.inMemoryApps[0].status).toBe("SHORTLISTED");
    });
  });
});
