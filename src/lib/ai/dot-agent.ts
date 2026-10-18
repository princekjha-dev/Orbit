/**
 * Orbit Dots — Multi-Agent AI Orchestrator with Independent Groq Integration
 *
 * Implements the Four Coworker Dots:
 * 1. AVIS  — Trust & Verification (DNS TXT, homoglyphs, organization credentials)
 * 2. SCOUT — Discovery, Matching & Teams (Opportunities, 5-signal fit, outreach drafting)
 * 3. QUILL — Skills, Assessments & Evidence (ESCO taxonomy, rubrics, SHA-256 evidence)
 * 4. RELAY — Community, Messaging & Safety (Safe DM routing, off-platform risk flags)
 *
 * Each Dot has independent system instructions, capabilities, tool access, and Groq model settings.
 */

import { inMemoryStore, StoredDotMessage, StoredDotConversation } from "@/lib/database/in-memory-store";
import { DOT_CONFIGS, DotDefinition } from "@/lib/ai/groq/config";
import { executeGroqChatCompletion, ChatMessage } from "@/lib/ai/groq/client";
import {
  toolSearchOpportunities,
  toolGetApplications,
  toolSearchOrganizations,
  toolDraftColdEmail,
  toolConfirmAndSendEmail,
  toolSearchEvents,
  ToolContext,
  ToolResult,
} from "@/lib/ai/dot-tools";

export type DotId = "avis" | "scout" | "quill" | "relay";

export interface DotMetadata extends DotDefinition {}

export const DOT_METADATA: Record<DotId, DotDefinition> = DOT_CONFIGS;

export interface ProcessDotInteractionParams {
  dotId: DotId;
  userId: string;
  userName: string;
  message: string;
  conversationId?: string;
  confirmationAction?: {
    action: string;
    payload: any;
    confirmed: boolean;
  };
}

export interface ProcessDotInteractionResult {
  reply: string;
  toolResult?: ToolResult;
  history: StoredDotMessage[];
  conversationId: string;
  dotId: DotId;
}

/**
 * Handles incoming message from a user to a specific Dot:
 * 1. Authenticates & validates requested Dot configuration
 * 2. Scopes conversation to authenticated user & Dot (strict isolation)
 * 3. Executes authorized tools based on Dot permissions
 * 4. Sends prompt, history, and grounded tool data to Groq
 * 5. Persists interaction and returns response
 */
export async function processDotInteraction(
  params: ProcessDotInteractionParams
): Promise<ProcessDotInteractionResult> {
  const { dotId, userId, userName, message, confirmationAction } = params;

  // Validate Dot existence
  const dot = DOT_CONFIGS[dotId];
  if (!dot) {
    throw new Error(`Unknown Dot ID: ${dotId}`);
  }

  // Derive isolated conversation ID
  const conversationId = params.conversationId || `${userId}:${dotId}`;
  const historyKey = `${userId}:${dotId}`;

  // Ensure conversation record exists
  if (!inMemoryStore.dotConversations.has(conversationId)) {
    inMemoryStore.dotConversations.set(conversationId, {
      id: conversationId,
      userId,
      dotId,
      title: `${dot.name} Conversation`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Ensure message history exists with initial welcome message
  if (!inMemoryStore.dotMessages.has(historyKey)) {
    inMemoryStore.dotMessages.set(historyKey, [
      {
        id: `msg-welcome-${dotId}`,
        conversationId,
        dotId,
        userId,
        sender: "dot",
        content: `Hello ${userName}! I am ${dot.name}, your ${dot.title}. ${dot.tagline} How can I assist you today?`,
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
    ]);
  }

  const ctx: ToolContext = { userId, name: userName };

  // 1. If this is a confirmation response (e.g. user confirmed cold email send)
  if (confirmationAction && confirmationAction.action === "confirmAndSendEmail") {
    const sendResult = await toolConfirmAndSendEmail(ctx, {
      draftId: confirmationAction.payload.draftId,
      recipient: confirmationAction.payload.recipient,
      subject: confirmationAction.payload.subject,
      body: confirmationAction.payload.body,
      confirmed: confirmationAction.confirmed,
    });

    const reply = sendResult.success
      ? `Done! ${sendResult.message}`
      : "Understood. The email dispatch was cancelled and no communication was sent.";

    const dotMsg: StoredDotMessage = {
      id: `msg-dot-${Date.now()}`,
      conversationId,
      dotId,
      userId,
      sender: "dot",
      content: reply,
      timestamp: new Date().toISOString(),
      actionResult: {
        action: "confirmAndSendEmail",
        success: sendResult.success,
        data: sendResult.data,
      },
    };

    inMemoryStore.dotMessages.get(historyKey)!.push(dotMsg);
    return {
      reply,
      toolResult: sendResult,
      history: inMemoryStore.dotMessages.get(historyKey)!,
      conversationId,
      dotId,
    };
  }

  // Record user's incoming message
  const userMsg: StoredDotMessage = {
    id: `msg-user-${Date.now()}`,
    conversationId,
    dotId,
    userId,
    sender: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  inMemoryStore.dotMessages.get(historyKey)!.push(userMsg);

  // 2. Intent Analysis & Tool Authorization
  const lower = message.toLowerCase();
  let toolResult: ToolResult | undefined;
  let groundedToolContext = "";

  // Check if intent requires a tool and whether this Dot is authorized to use it
  const isJobSearch =
    lower.includes("find job") ||
    lower.includes("find opportunity") ||
    lower.includes("internship") ||
    lower.includes("frontend") ||
    lower.includes("remote") ||
    lower.includes("bounty") ||
    lower.includes("search opportunities");

  const isAppSummary =
    lower.includes("my applications") ||
    lower.includes("show applications") ||
    lower.includes("applied");

  const isColdEmail =
    lower.includes("cold email") ||
    lower.includes("draft email") ||
    lower.includes("outreach") ||
    lower.includes("contact company");

  const isEvents =
    lower.includes("hackathon") ||
    lower.includes("event") ||
    lower.includes("meetup");

  const isVerification =
    lower.includes("verify") ||
    lower.includes("dns") ||
    lower.includes("legit") ||
    lower.includes("homoglyph");

  const isSkillsRubric =
    lower.includes("skill") ||
    lower.includes("rubric") ||
    lower.includes("evidence") ||
    lower.includes("passport");

  // A. Scout tool authorization
  if (isJobSearch) {
    if (dot.allowedTools.includes("searchOpportunities")) {
      const isRemote = lower.includes("remote");
      const query = lower.includes("frontend")
        ? "frontend"
        : lower.includes("internship")
        ? "internship"
        : undefined;

      toolResult = await toolSearchOpportunities(ctx, { query, remoteOnly: isRemote });
      toolResult.message = `I searched Orbit's active listings and found ${
        toolResult.data?.length || 0
      } matching opportunities. Here are the top recommendations with verified sponsors:`;
      groundedToolContext = `Tool executed: searchOpportunities. Result: Found ${
        toolResult.data?.length || 0
      } opportunities. Listings: ${JSON.stringify(
        (toolResult.data || []).map((o: any) => ({
          title: o.title,
          organization: o.organization?.name,
          location: o.location,
          type: o.type,
        }))
      )}`;
    } else {
      toolResult = {
        toolName: "searchOpportunities",
        success: false,
        message: `As ${dot.name} (${dot.title}), I am not authorized to search job opportunities. Please consult Scout (Dot #2).`,
      };
    }
  } else if (isAppSummary) {
    if (dot.allowedTools.includes("getApplications")) {
      toolResult = await toolGetApplications(ctx);
      groundedToolContext = `Tool executed: getApplications. Result: ${toolResult.message}. Applications: ${JSON.stringify(
        toolResult.data || []
      )}`;
    } else {
      toolResult = {
        toolName: "getApplications",
        success: false,
        message: `As ${dot.name}, application tracking is handled by Scout (Dot #2).`,
      };
    }
  } else if (isColdEmail) {
    if (dot.allowedTools.includes("draftColdEmail")) {
      if (lower.includes("apex") || lower.includes("first company")) {
        toolResult = await toolDraftColdEmail(ctx, {
          companySlug: "apex-systems",
          position: "Frontend / Systems Engineering",
        });
      } else {
        toolResult = await toolSearchOrganizations(ctx, {});
      }
      groundedToolContext = `Tool executed: ${toolResult.toolName}. Result: ${toolResult.message}`;
    } else {
      toolResult = {
        toolName: "draftColdEmail",
        success: false,
        message: `Cold email outreach drafting is strictly authorized only for Scout (Dot #2).`,
      };
    }
  } else if (isEvents) {
    if (dot.allowedTools.includes("searchEvents")) {
      toolResult = await toolSearchEvents(ctx, {});
      groundedToolContext = `Tool executed: searchEvents. Result: ${toolResult.message}. Events: ${JSON.stringify(
        (toolResult.data || []).slice(0, 3).map((e: any) => ({
          title: e.title,
          type: e.type,
          startDate: e.startDate,
        }))
      )}`;
    } else {
      toolResult = {
        toolName: "searchEvents",
        success: false,
        message: `Events and hackathons are coordinated by Relay (Dot #4).`,
      };
    }
  } else if (isVerification && dotId === "avis") {
    const msg =
      "I monitor organization trust across Orbit using multi-layer verification: DNS TXT challenge resolution, homoglyph risk scanning, and reviewer SLA queue tracking. You can inspect an organization's trust panel at /mod/avis or test domain verification directly.";
    toolResult = {
      toolName: "verifyDomain",
      success: true,
      message: msg,
      actionLinks: [
        { title: "Open Avis Verification Console", href: "/mod/avis" },
        { title: "Review SLA Queue", href: "/mod/avis/queue" },
      ],
    };
    groundedToolContext = `Tool executed: verifyDomain. ${msg}`;
  } else if (isSkillsRubric && dotId === "quill") {
    const msg =
      "I map and validate skills against standardized ESCO taxonomies. When you complete scoped tasks or assessments, I verify submissions with SHA-256 collision checks and rubric scoring to issue verifiable Evidence items.";
    toolResult = {
      toolName: "assessSkillRubric",
      success: true,
      message: msg,
      actionLinks: [
        { title: "View Quill Assessments", href: "/mod/quill" },
        { title: "Submit New Evidence", href: "/mod/quill/evidence/new" },
        { title: "View Evidence Passport", href: "/mod/passport" },
      ],
    };
    groundedToolContext = `Tool executed: assessSkillRubric. ${msg}`;
  }

  // If an unauthorized tool was requested, return clear boundary message immediately
  if (toolResult && !toolResult.success) {
    const dotReplyMsg: StoredDotMessage = {
      id: `msg-dot-${Date.now()}`,
      conversationId,
      dotId,
      userId,
      sender: "dot",
      content: toolResult.message,
      timestamp: new Date().toISOString(),
      actionResult: {
        action: toolResult.toolName,
        success: false,
      },
    };
    inMemoryStore.dotMessages.get(historyKey)!.push(dotReplyMsg);
    return {
      reply: toolResult.message,
      toolResult,
      history: inMemoryStore.dotMessages.get(historyKey)!,
      conversationId,
      dotId,
    };
  }

  // If a tool generated a draft that requires user confirmation, return immediately
  if (toolResult && toolResult.requiresConfirmation) {
    const dotReplyMsg: StoredDotMessage = {
      id: `msg-dot-${Date.now()}`,
      conversationId,
      dotId,
      userId,
      sender: "dot",
      content: toolResult.message,
      timestamp: new Date().toISOString(),
      actionResult: {
        action: toolResult.toolName,
        success: true,
        data: toolResult.data,
      },
    };
    inMemoryStore.dotMessages.get(historyKey)!.push(dotReplyMsg);
    return {
      reply: toolResult.message,
      toolResult,
      history: inMemoryStore.dotMessages.get(historyKey)!,
      conversationId,
      dotId,
    };
  }

  // 3. Format history for Groq chat completion
  const chatMessages: ChatMessage[] = [];
  const storedHistory = inMemoryStore.dotMessages.get(historyKey) || [];

  for (const m of storedHistory.slice(-8)) {
    chatMessages.push({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
    });
  }

  // 4. Execute Groq completion with Dot-specific prompt & isolated context
  let replyText = "";
  try {
    const groqResult = await executeGroqChatCompletion({
      dot,
      messages: chatMessages,
      groundedToolContext: groundedToolContext || undefined,
    });
    replyText = groqResult.content;
  } catch (groqErr: any) {
    // If Groq fails (e.g. invalid key or outage):
    // If a tool successfully ran, return the grounded tool response with clear status
    if (toolResult && toolResult.success) {
      replyText = toolResult.message;
    } else {
      // Re-throw so API route returns structured error as mandated by Section 16 & 31
      throw groqErr;
    }
  }

  // 5. Persist assistant message
  const dotReplyMsg: StoredDotMessage = {
    id: `msg-dot-${Date.now()}`,
    conversationId,
    dotId,
    userId,
    sender: "dot",
    content: replyText,
    timestamp: new Date().toISOString(),
    actionResult: toolResult
      ? {
          action: toolResult.toolName,
          success: toolResult.success,
          data: toolResult.data,
          links: toolResult.actionLinks,
        }
      : undefined,
  };

  inMemoryStore.dotMessages.get(historyKey)!.push(dotReplyMsg);

  // Update conversation timestamp
  const conv = inMemoryStore.dotConversations.get(conversationId);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }

  return {
    reply: replyText,
    toolResult,
    history: inMemoryStore.dotMessages.get(historyKey)!,
    conversationId,
    dotId,
  };
}

/**
 * Retrieves existing conversation history with a Dot for the authenticated user.
 */
export function getDotHistory(userId: string, dotId: DotId, conversationId?: string): StoredDotMessage[] {
  const historyKey = `${userId}:${dotId}`;
  if (!inMemoryStore.dotMessages.has(historyKey)) {
    const dot = DOT_CONFIGS[dotId] || DOT_CONFIGS.scout;
    inMemoryStore.dotMessages.set(historyKey, [
      {
        id: `msg-welcome-${dotId}`,
        conversationId: conversationId || `${userId}:${dotId}`,
        dotId,
        userId,
        sender: "dot",
        content: `Hello! I am ${dot.name}, your ${dot.title}. ${dot.tagline} How can I assist you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }
  return inMemoryStore.dotMessages.get(historyKey)!;
}
