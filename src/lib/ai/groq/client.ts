/**
 * Orbit Dots — Centralized Server-Side Groq Client
 *
 * Guarantees server-only execution. The browser must never directly call Groq.
 * Uses official `groq-sdk` with robust timeouts, token management, and retries.
 */

import Groq from "groq-sdk";
import { getGroqConfig, DotDefinition } from "./config";
import {
  GroqConfigError,
  GroqAuthError,
  GroqRateLimitError,
  GroqTimeoutError,
  GroqContextError,
  GroqProviderError,
} from "./errors";

// Security assertion: Never allow client bundles to instantiate this module
if (typeof window !== "undefined") {
  throw new Error("[Security Violation] Groq client cannot be imported or executed in the browser.");
}

let cachedGroqClient: Groq | null = null;
let lastApiKey: string | undefined = undefined;

/**
 * Initializes or reuses the server-side Groq SDK client.
 */
export function getGroqClient(): Groq {
  const config = getGroqConfig();
  if (!config.apiKey) {
    throw new GroqConfigError("GROQ_API_KEY is not configured in the server environment.");
  }

  if (!cachedGroqClient || lastApiKey !== config.apiKey) {
    let sanitizedBaseUrl = config.baseUrl;
    if (sanitizedBaseUrl && sanitizedBaseUrl.endsWith("/openai/v1")) {
      sanitizedBaseUrl = sanitizedBaseUrl.replace(/\/openai\/v1\/?$/, "");
    }

    const options: { apiKey: string; baseURL?: string } = {
      apiKey: config.apiKey,
      baseURL: sanitizedBaseUrl || "https://api.groq.com",
    };

    cachedGroqClient = new Groq(options);
    lastApiKey = config.apiKey;
  }

  return cachedGroqClient;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCompletionParams {
  dot: DotDefinition;
  messages: ChatMessage[];
  groundedToolContext?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GroqCompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Executes a token-budgeted, timeout-protected chat completion with Groq.
 */
export async function executeGroqChatCompletion(
  params: GroqCompletionParams
): Promise<GroqCompletionResult> {
  const config = getGroqConfig();
  const client = getGroqClient();

  const modelToUse = params.dot.modelOverride || config.model;
  const temperature = params.temperature ?? params.dot.temperature ?? 0.3;
  const maxTokens = params.maxTokens ?? params.dot.maxTokens ?? 1024;

  // 1. Build messages payload with strict prompt isolation
  const finalMessages: ChatMessage[] = [];

  // A. Dot-specific System Prompt
  let systemContent = params.dot.systemPrompt;
  if (params.groundedToolContext) {
    systemContent += `\n\n[VERIFIED APPLICATION DATA / TOOL OUTPUT]\n${params.groundedToolContext}\n\nINSTRUCTION: Strictly answer using the verified data above. Do not hallucinate or invent non-existent jobs, users, or credentials.`;
  }
  finalMessages.push({ role: "system", content: systemContent });

  // B. Context budgeting: Keep up to the last 10 messages, truncating oversized content
  const recentHistory = params.messages.slice(-10);
  for (const msg of recentHistory) {
    const trimmedContent = msg.content.length > 2500 ? msg.content.slice(0, 2500) + "..." : msg.content;
    finalMessages.push({
      role: msg.role,
      content: trimmedContent,
    });
  }

  // 2. Execute with timeout & retry handling
  let attempts = 0;
  const maxAttempts = config.maxRetries + 1;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await client.chat.completions.create(
        {
          model: modelToUse,
          messages: finalMessages,
          temperature,
          max_completion_tokens: maxTokens,
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const choice = response.choices?.[0];
      const replyContent = choice?.message?.content?.trim();

      if (!replyContent) {
        throw new GroqProviderError("Groq returned an empty response.");
      }

      return {
        content: replyContent,
        model: response.model || modelToUse,
        usage: {
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Handle abort / timeout
      if (err.name === "AbortError" || controller.signal.aborted) {
        throw new GroqTimeoutError(
          `Groq request timed out after ${config.timeoutMs}ms.`
        );
      }

      const status = err.status || err.statusCode;
      const errMsg = (err.message || "").toLowerCase();

      // Non-retryable authentication & authorization errors
      if (status === 401 || errMsg.includes("invalid api key") || errMsg.includes("invalid_api_key")) {
        throw new GroqAuthError("Invalid Groq API Key.");
      }

      // Non-retryable context length error
      if (errMsg.includes("context length") || errMsg.includes("maximum context")) {
        throw new GroqContextError("Conversation context exceeds allowable token limit.");
      }

      // Rate limit error (retry if attempts remain)
      if (status === 429 || errMsg.includes("rate limit")) {
        if (attempts >= maxAttempts) {
          throw new GroqRateLimitError("Groq rate limit exceeded.");
        }
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
        continue;
      }

      // Retryable 5xx server error
      if (status >= 500 && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 800 * attempts));
        continue;
      }

      // Throw domain error
      throw new GroqProviderError(err.message || "Failed to communicate with Groq AI API.");
    }
  }

  throw new GroqProviderError("Failed to reach Groq after maximum retry attempts.");
}

/**
 * Checks whether Groq is configured and can be successfully contacted.
 */
export async function checkGroqConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  model: string;
  error?: string;
}> {
  const config = getGroqConfig();
  if (!config.apiKey) {
    return {
      ok: false,
      configured: false,
      model: config.model,
      error: "GROQ_API_KEY is not configured.",
    };
  }

  try {
    const client = getGroqClient();
    // Test with a lightweight model list request
    await client.models.list();
    return {
      ok: true,
      configured: true,
      model: config.model,
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      model: config.model,
      error: err?.message || "Failed to authenticate with Groq API.",
    };
  }
}
