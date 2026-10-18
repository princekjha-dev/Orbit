import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { getGroqClient } from "@/lib/ai/groq/client";
import { getGroqConfig } from "@/lib/ai/groq/config";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { opportunityId, resumeName, coverLetter, resumeSkills } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "opportunityId is required." } },
        { status: 400 }
      );
    }

    // 1. Fetch Opportunity Details
    const opp = await safeDbCall(
      () =>
        prisma.opportunity.findUnique({
          where: { id: opportunityId },
          include: {
            organization: { select: { name: true } },
            skills: { include: { skill: true } },
          },
        }),
      null
    );

    const title = opp?.title || "Technical Role";
    const orgName = opp?.organization?.name || "Verified Organization";
    const description = opp?.description || "Engineering role on Orbit.";
    const requiredSkills: string[] = opp?.skills?.map((s: any) => s.skill.name) || ["TypeScript", "React"];

    // 2. Fetch User Profile for known skills and headline
    const profile = await safeDbCall(
      () =>
        prisma.profile.findUnique({
          where: { userId: user.id! },
          include: { skills: { include: { skill: true } } },
        }),
      null
    );

    const userSkills: string[] = [
      ...(resumeSkills || []),
      ...(profile?.skills?.map((s: any) => s.skill.name) || []),
    ];

    // 3. Try Groq AI analysis
    let aiFeedback: any = null;
    const config = getGroqConfig();

    if (config.apiKey) {
      try {
        const client = getGroqClient();
        const prompt = `You are Orbit's Scout Career Analysis Engine.
Evaluate how well the applicant's resume aligns with the following opportunity.

OPPORTUNITY:
Title: ${title}
Organization: ${orgName}
Description: ${description}
Required Skills: ${requiredSkills.join(", ")}

APPLICANT CONTEXT:
Resume File: ${resumeName || "Uploaded Resume"}
Headline: ${profile?.headline || "Not specified"}
Candidate Skills: ${userSkills.length > 0 ? userSkills.join(", ") : "Extracted from resume"}
Optional Cover Note: ${coverLetter || "None provided"}

STRICT CRITERIA:
1. Focus on relevance to this specific opportunity.
2. Identify missing skills or gaps from the requirements.
3. Suggest concrete, actionable improvements for clarity and structure.
4. DO NOT invent skills, fabricate experience, or claim qualifications that are not in the context.
5. Return ONLY a valid JSON object with the following schema:
{
  "matchScore": <number between 50 and 95 based on skill overlap>,
  "summary": "<1-2 concise sentences summarizing alignment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "missingSkills": ["<skill name>"]
}`;

        const response = await client.chat.completions.create({
          model: config.model || "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: "You are an objective technical recruiter and career evaluator. You always output strict JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_completion_tokens: 800,
        });

        const reply = response.choices?.[0]?.message?.content?.trim();
        if (reply) {
          // Parse JSON from output (handle markdown code blocks if present)
          const cleanJson = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          aiFeedback = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.warn("[Groq AI feedback fallback]", e);
      }
    }

    // 4. Grounded algorithmic fallback if AI call wasn't made or failed
    if (!aiFeedback) {
      const matched = requiredSkills.filter((req) =>
        userSkills.some((s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
      );
      const missing = requiredSkills.filter((req) => !matched.includes(req));
      const score = Math.min(95, Math.max(55, Math.round((matched.length / Math.max(1, requiredSkills.length)) * 40 + 50)));

      aiFeedback = {
        matchScore: score,
        summary: `Your profile and resume demonstrate relevant engineering background for ${title} at ${orgName}, with ${matched.length} matching core skills identified.`,
        strengths: [
          matched.length > 0
            ? `Demonstrated alignment in core stack: ${matched.slice(0, 3).join(", ")}.`
            : `General engineering background matches the role level.`,
          coverLetter ? `Cover note articulates specific motivation for ${orgName}.` : `Resume structure is cleanly legible.`,
        ],
        recommendations: [
          missing.length > 0
            ? `Highlight any practical experience with ${missing.join(", ")} in your work deliverables or portfolio.`
            : `Quantify the scale and impact of your contributions in previous projects.`,
          `Ensure recent GitHub repositories or live project links reflect verifiable code.`,
          `Tailor bullet points to emphasize problem-solving relevant to ${title}.`,
        ],
        missingSkills: missing,
      };
    }

    return NextResponse.json({
      success: true,
      feedback: aiFeedback,
    });
  } catch (err: any) {
    console.error("[ai resume feedback error]", err);
    return NextResponse.json(
      { success: false, error: { code: "FEEDBACK_ERROR", message: err?.message || "Failed to generate resume feedback." } },
      { status: 500 }
    );
  }
}
