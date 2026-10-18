import { describe, it, expect, vi, beforeEach } from "vitest";
import { DOT_CONFIGS, getGroqConfig } from "@/lib/ai/groq/config";
import { formatGroqApiError, GroqConfigError, GroqAuthError, GroqRateLimitError } from "@/lib/ai/groq/errors";
import { executeGroqChatCompletion, checkGroqConnection } from "@/lib/ai/groq/client";
import { processDotInteraction, getDotHistory, DotId } from "@/lib/ai/dot-agent";
import { inMemoryStore } from "@/lib/database/in-memory-store";

describe("Orbit Dots — Independent Groq API Integration Test Suite", () => {
  beforeEach(() => {
    // Clear in-memory dot stores for clean assertions
    inMemoryStore.dotConversations.clear();
    inMemoryStore.dotMessages.clear();
  });

  describe("1. Environment & Server-Only Groq Configuration", () => {
    it("should load Groq configuration with centralized defaults", () => {
      const config = getGroqConfig();
      expect(config.model).toBeDefined();
      expect(config.baseUrl).toContain("api.groq.com");
      expect(config.timeoutMs).toBeGreaterThan(0);
      expect(config.maxRetries).toBeGreaterThanOrEqual(1);
    });

    it("should prevent browser execution and never expose secret keys to window", () => {
      // Temporarily define window to simulate browser environment
      (globalThis as any).window = {};
      expect(() => getGroqConfig()).toThrow(/Security Violation/);
      delete (globalThis as any).window;
    });
  });

  describe("2. Dot Architecture & Strict Prompt Isolation (No Cross-Contamination)", () => {
    it("should define all four Dots with distinct identities, numbers, and avatars", () => {
      const dotIds: DotId[] = ["avis", "scout", "quill", "relay"];
      expect(Object.keys(DOT_CONFIGS)).toEqual(dotIds);

      expect(DOT_CONFIGS.avis.dotNumber).toBe(1);
      expect(DOT_CONFIGS.scout.dotNumber).toBe(2);
      expect(DOT_CONFIGS.quill.dotNumber).toBe(3);
      expect(DOT_CONFIGS.relay.dotNumber).toBe(4);
    });

    it("should ensure Avis has strict Trust & Verification instructions and DNS tools", () => {
      const avis = DOT_CONFIGS.avis;
      expect(avis.systemPrompt).toContain("Avis");
      expect(avis.systemPrompt).toContain("Trust & Verification");
      expect(avis.systemPrompt).toContain("DNS TXT");
      expect(avis.systemPrompt).toContain("homoglyph");
      expect(avis.allowedTools).toContain("verifyDomain");
      expect(avis.allowedTools).not.toContain("draftColdEmail");
      expect(avis.allowedTools).not.toContain("searchOpportunities");
    });

    it("should ensure Scout has Discovery instructions, 5-signal formula, and outreach tools", () => {
      const scout = DOT_CONFIGS.scout;
      expect(scout.systemPrompt).toContain("Scout");
      expect(scout.systemPrompt).toMatch(/5-signal/i);
      expect(scout.systemPrompt).toMatch(/cold email|cold outreach/i);
      expect(scout.allowedTools).toContain("searchOpportunities");
      expect(scout.allowedTools).toContain("draftColdEmail");
      expect(scout.allowedTools).toContain("confirmAndSendEmail");
      expect(scout.allowedTools).not.toContain("verifyDomain");
    });

    it("should ensure Quill has Skills & ESCO taxonomy rubrics", () => {
      const quill = DOT_CONFIGS.quill;
      expect(quill.systemPrompt).toContain("Quill");
      expect(quill.systemPrompt).toContain("ESCO");
      expect(quill.systemPrompt).toContain("rubric");
      expect(quill.allowedTools).toContain("assessSkillRubric");
      expect(quill.allowedTools).not.toContain("draftColdEmail");
    });

    it("should ensure Relay has Community & Safety instructions and off-platform risk flags", () => {
      const relay = DOT_CONFIGS.relay;
      expect(relay.systemPrompt).toContain("Relay");
      expect(relay.systemPrompt).toContain("Safety");
      expect(relay.systemPrompt).toContain("off-platform");
      expect(relay.allowedTools).toContain("checkSafetyRisk");
      expect(relay.allowedTools).not.toContain("searchOpportunities");
    });
  });

  describe("3. Tool Authorization & Intent Scoping", () => {
    it("should allow Scout to execute searchOpportunities and return real opportunities", async () => {
      const result = await processDotInteraction({
        dotId: "scout",
        userId: "test-user-1",
        userName: "Alex Rivera",
        message: "Find frontend remote internships for me",
      });

      expect(result.dotId).toBe("scout");
      expect(result.toolResult).toBeDefined();
      expect(result.toolResult?.toolName).toBe("searchOpportunities");
      expect(result.toolResult?.success).toBe(true);
      expect(result.toolResult?.data?.length).toBeGreaterThan(0);
      expect(result.reply).toBeDefined();
    });

    it("should deny Avis from executing job search tools (Strict boundary)", async () => {
      const result = await processDotInteraction({
        dotId: "avis",
        userId: "test-user-1",
        userName: "Alex Rivera",
        message: "Find frontend remote internships for me",
      });

      expect(result.dotId).toBe("avis");
      expect(result.toolResult?.success).toBe(false);
      expect(result.toolResult?.message).toContain("not authorized to search job opportunities");
    });

    it("should allow Avis to open verification console and review queue", async () => {
      const result = await processDotInteraction({
        dotId: "avis",
        userId: "test-user-1",
        userName: "Alex Rivera",
        message: "How do I verify our domain with DNS TXT challenges?",
      });

      expect(result.dotId).toBe("avis");
      expect(result.toolResult?.toolName).toBe("verifyDomain");
      expect(result.toolResult?.actionLinks?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("4. Cold Email Guardrail & Confirmation Workflow", () => {
    it("should require explicit user confirmation before sending any cold email", async () => {
      // Step 1: User asks Scout to draft cold email
      const draftResult = await processDotInteraction({
        dotId: "scout",
        userId: "test-user-talent",
        userName: "Talent Candidate",
        message: "Draft a cold email to the first company",
      });

      expect(draftResult.toolResult?.requiresConfirmation).toBe(true);
      expect(draftResult.toolResult?.confirmationPayload).toBeDefined();
      const payload = draftResult.toolResult?.confirmationPayload;
      expect(payload.recipient).toContain("@");
      expect(payload.subject).toBeDefined();

      // Step 2: Explicit confirmation from user
      const confirmResult = await processDotInteraction({
        dotId: "scout",
        userId: "test-user-talent",
        userName: "Talent Candidate",
        message: "Confirmed, send it.",
        confirmationAction: {
          action: "confirmAndSendEmail",
          payload,
          confirmed: true,
        },
      });

      expect(confirmResult.toolResult?.success).toBe(true);
      expect(confirmResult.reply).toContain("Done!");
    });
  });

  describe("5. Multi-User Conversation Isolation & State Persistence", () => {
    it("should isolate conversations between different users", async () => {
      await Promise.all([
        processDotInteraction({
          dotId: "scout",
          userId: "user-alpha",
          userName: "User Alpha",
          message: "Find opportunities for Alpha",
        }),
        processDotInteraction({
          dotId: "scout",
          userId: "user-beta",
          userName: "User Beta",
          message: "Find opportunities for Beta",
        }),
      ]);

      const alphaHistory = getDotHistory("user-alpha", "scout");
      const betaHistory = getDotHistory("user-beta", "scout");

      expect(alphaHistory.some((m) => m.content === "Find opportunities for Alpha")).toBe(true);
      expect(alphaHistory.some((m) => m.content === "Find opportunities for Beta")).toBe(false);

      expect(betaHistory.some((m) => m.content === "Find opportunities for Beta")).toBe(true);
      expect(betaHistory.some((m) => m.content === "Find opportunities for Alpha")).toBe(false);
    });

    it("should isolate conversations between different Dots for the same user", async () => {
      await Promise.all([
        processDotInteraction({
          dotId: "avis",
          userId: "user-gamma",
          userName: "User Gamma",
          message: "Check organization DNS trust",
        }),
        processDotInteraction({
          dotId: "quill",
          userId: "user-gamma",
          userName: "User Gamma",
          message: "Evaluate evidence rubric",
        }),
      ]);

      const avisHistory = getDotHistory("user-gamma", "avis");
      const quillHistory = getDotHistory("user-gamma", "quill");

      expect(avisHistory.some((m) => m.content === "Check organization DNS trust")).toBe(true);
      expect(avisHistory.some((m) => m.content === "Evaluate evidence rubric")).toBe(false);

      expect(quillHistory.some((m) => m.content === "Evaluate evidence rubric")).toBe(true);
      expect(quillHistory.some((m) => m.content === "Check organization DNS trust")).toBe(false);
    });
  });

  describe("6. Error Sanitization & Structured Server Responses", () => {
    it("should format missing API key into structured 503 GROQ_NOT_CONFIGURED response", () => {
      const err = new GroqConfigError();
      const { response, statusCode } = formatGroqApiError(err);

      expect(statusCode).toBe(503);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("GROQ_NOT_CONFIGURED");
      expect(response.error.message).toContain("GROQ_API_KEY");
    });

    it("should format invalid API key into structured 401 INVALID_API_KEY without leaking key", () => {
      const err = new GroqAuthError();
      const { response, statusCode } = formatGroqApiError(err);

      expect(statusCode).toBe(401);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("INVALID_API_KEY");
      expect(response.error.message).not.toContain("gsk_");
    });

    it("should format rate limit into structured 429 RATE_LIMIT_EXCEEDED with retry flag", () => {
      const err = new GroqRateLimitError();
      const { response, statusCode } = formatGroqApiError(err);

      expect(statusCode).toBe(429);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(response.error.retryable).toBe(true);
    });
  });

  describe("7. Live Groq Client Connectivity & Completion", () => {
    it("should successfully check Groq connection or report configured status", async () => {
      const status = await checkGroqConnection();
      expect(status.model).toBeDefined();
      if (status.configured) {
        expect(typeof status.ok).toBe("boolean");
      }
    });

    it("should execute real completion when valid key is provided", async () => {
      const config = getGroqConfig();
      if (!config.apiKey) return;

      try {
        const result = await executeGroqChatCompletion({
          dot: DOT_CONFIGS.scout,
          messages: [{ role: "user", content: "Reply with 'ORBIT_OK'" }],
          maxTokens: 20,
        });

        expect(result.content).toBeDefined();
        expect(result.model).toBeDefined();
      } catch (err: any) {
        // If key is rate limited or unavailable, error must be structured
        const { response } = formatGroqApiError(err);
        expect(response.success).toBe(false);
      }
    });
  });
});
