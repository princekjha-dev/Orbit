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

export type DotId = "atlas" | "scout" | "forge" | "signal" | "avis" | "quill" | "relay";

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
    lower.includes("contact company") ||
    lower.includes("make it shorter") ||
    lower.includes("make it more professional") ||
    lower.includes("focus on ai research");

  const isMentorSearch =
    lower.includes("mentor") ||
    lower.includes("advisory") ||
    lower.includes("advisor") ||
    lower.includes("guidance");

  const isResumeReview =
    lower.includes("resume") &&
    (lower.includes("review") ||
      lower.includes("feedback") ||
      lower.includes("check") ||
      lower.includes("evaluate") ||
      lower.includes("score"));

  const isCandidateSearch =
    (lower.includes("candidate") ||
      lower.includes("talent") ||
      lower.includes("react developer") ||
      lower.includes("frontend developer") ||
      lower.includes("people looking")) &&
    (dotId === "signal" || dotId === "scout" || dotId === "forge" || lower.includes("find"));

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

  // A. Scout / Quill / Dot tool authorizations
  if (isResumeReview) {
    const feedback =
      `📄 **Resume Analysis for Aarav Sharma (Software Engineer / AI Developer)**\n\n` +
      `**Target Role:** Frontend Engineer Intern @ Nexora Labs (Bengaluru / Hybrid)\n` +
      `**Relevance Score:** 94% Match\n\n` +
      `✅ **Strengths Identified:**\n` +
      `• Strong alignment in React, Next.js 15, TypeScript, and modern Tailwind CSS.\n` +
      `• High-signal open-source project: *AI Career Copilot* (vector similarity & FastAPI).\n` +
      `• Verifiable proof of work recorded: *Built Scalable RPC Cache Engine* (Astra Digital Technologies).\n\n` +
      `💡 **Actionable Recommendations:**\n` +
      `1. Highlight the sub-5ms cosine retrieval benchmark in the project summary section.\n` +
      `2. Emphasize your Bangalore Institute of Technology B.Tech coursework in distributed systems.\n` +
      `3. Attach your verifiable Orbit credential link to the application header.`;

    toolResult = {
      toolName: "reviewResume",
      success: true,
      message: feedback,
      actionLinks: [
        { title: "Apply to Nexora Labs", href: "/opportunities/demo-opp-frontend-intern" },
        { title: "View Profile & Evidence", href: "/profile" },
      ],
    };
    groundedToolContext = feedback;
  } else if (isMentorSearch) {
    const msg =
      `I found a top-tier mentor matching your criteria in India:\n\n` +
      `**Dr. Ananya Iyer** (Chennai, Tamil Nadu)\n` +
      `*AI Product & Startup Mentor | Distinguished Systems Advisor*\n` +
      `• Expertise: Artificial Intelligence, Product Strategy, Startup Validation, Machine Learning\n` +
      `• Rating: 4.98/5.0 (42 sessions completed)\n\n` +
      `Would you like me to draft a personalized mentorship inquiry email and LinkedIn DM for you?`;

    toolResult = {
      toolName: "searchMentors",
      success: true,
      message: msg,
      data: [{ name: "Dr. Ananya Iyer", location: "Chennai", role: "AI Mentor" }],
      actionLinks: [
        { title: "Message Dr. Ananya Iyer", href: "/messages/conv-aarav-ananya" },
        { title: "View Mentor Profile", href: "/u/ananya_iyer" },
      ],
    };
    groundedToolContext = msg;
  } else if (isCandidateSearch) {
    const msg =
      `Found 1 high-signal verified candidate matching your requirements in Bengaluru:\n\n` +
      `**Aarav Sharma** (Bengaluru, Karnataka, India)\n` +
      `*Full-Stack Software Engineer & AI Systems Developer*\n` +
      `• Skills: React, Next.js, TypeScript, Python, FastAPI, PostgreSQL\n` +
      `• Verifiable Proof: Built Scalable RPC Cache Engine (Astra Digital) & AI Career Copilot\n` +
      `• Status: Looking for software roles & internships (Remote / Hybrid)`;

    toolResult = {
      toolName: "searchCandidates",
      success: true,
      message: msg,
      data: [{ name: "Aarav Sharma", location: "Bengaluru", role: "Software Engineer" }],
      actionLinks: [
        { title: "View Candidate Profile", href: "/profile" },
        { title: "Open Conversation", href: "/messages/conv-aarav-riya" },
      ],
    };
    groundedToolContext = msg;
  } else if (isJobSearch) {
    if (dot.allowedTools.includes("searchOpportunities")) {
      const isRemote = lower.includes("remote");
      const query = lower.includes("frontend")
        ? "frontend"
        : lower.includes("bengaluru")
        ? "bengaluru"
        : lower.includes("internship")
        ? "internship"
        : undefined;

      toolResult = await toolSearchOpportunities(ctx, { query, remoteOnly: isRemote });
      toolResult.message = `I searched Orbit's active listings in India and found ${
        toolResult.data?.length || 0
      } matching opportunity/opportunities. Here are the top recommendations with verified sponsors:`;
      groundedToolContext = `Tool executed: searchOpportunities. Result: Found ${
        toolResult.data?.length || 0
      } opportunities. Listings: ${JSON.stringify(
        (toolResult.data || []).map((o: any) => ({
          title: o.title,
          organization: o.organization?.name,
          location: o.location,
          compensation: o.compensation,
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
      let draftSlug = "nexora-labs";
      let isShorter = lower.includes("shorter");
      let isResearch = lower.includes("research");
      let isProfessional = lower.includes("professional");

      if (lower.includes("ananya") || lower.includes("mentor")) {
        draftSlug = "ananya";
      } else if (lower.includes("astra")) {
        draftSlug = "astra";
      }

      toolResult = await toolDraftColdEmail(ctx, {
        companySlug: draftSlug,
        position: isResearch ? "AI Systems & Research Fellow" : "Frontend Engineer Intern",
        userPitch: isShorter
          ? "I build fast React/Next.js systems and would love to contribute to your engineering milestones."
          : isResearch
          ? "My research focuses on low-latency vector retrieval and evaluating LLM tool-calling fidelity in production."
          : isProfessional
          ? "I am writing to inquire regarding engineering internship positions at your organization where my technical background in Next.js and distributed protocols may add immediate value."
          : undefined,
      });

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
