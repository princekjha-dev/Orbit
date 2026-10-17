import { NextResponse } from "next/server";

interface QualityResult {
  errors: string[];
  warnings: string[];
}

function validateOpportunityQuality(data: any): QualityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { title, description, skills, compensation, deadline, applicationReqs } = data || {};

  if (!title || title.trim().length < 5) {
    errors.push("Title is required and must be at least 5 characters.");
  }
  if (!description || description.trim().length < 50) {
    warnings.push("Description is very brief. Provide detailed responsibilities to attract qualified applicants.");
  }
  if (!skills || (Array.isArray(skills) && skills.length === 0) || (typeof skills === "string" && !skills.trim())) {
    errors.push("At least one required skill must be specified.");
  }
  if (!compensation || compensation.trim().length === 0) {
    warnings.push("Compensation information is missing. Clear compensation expectations build trust.");
  }
  if (!deadline) {
    warnings.push("Application deadline is missing. Listings without deadlines create applicant uncertainty.");
  }
  if (!applicationReqs) {
    warnings.push("Application requirements are not explicitly defined.");
  }

  return { errors, warnings };
}

function validateProjectQuality(data: any): QualityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { title, problem, scope, deliverable, deadline, acceptanceCriteria } = data || {};

  if (!title || title.trim().length < 5) {
    errors.push("Project title is required.");
  }
  if (!problem || problem.trim().length < 30) {
    warnings.push("Problem definition is vague. Clearly define the challenge you need solved.");
  }
  if (!scope || scope.trim().length < 30) {
    errors.push("Scope definition is required to prevent scope creep.");
  }
  if (!deliverable || deliverable.trim().length < 20) {
    errors.push("Final deliverable must be clearly specified (e.g. GitHub repo, design file, API endpoint).");
  }
  if (!deadline) {
    warnings.push("Project deadline is missing.");
  }
  if (!acceptanceCriteria) {
    warnings.push("Acceptance criteria are missing. State how deliverables will be verified before completion.");
  }

  return { errors, warnings };
}

function getQualityScoreText(isValid: boolean, warningsCount: number): string {
  if (isValid && warningsCount === 0) return "Excellent";
  if (isValid) return "Acceptable with warnings";
  return "Needs Revision";
}

// POST /api/quality - pre-publish deterministic quality validator
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { entityType, data } = body;

    let evaluation: QualityResult;

    if (entityType === "OPPORTUNITY") {
      evaluation = validateOpportunityQuality(data);
    } else if (entityType === "PROJECT") {
      evaluation = validateProjectQuality(data);
    } else {
      return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
    }

    const isValid = evaluation.errors.length === 0;

    return NextResponse.json({
      isValid,
      errors: evaluation.errors,
      warnings: evaluation.warnings,
      scoreText: getQualityScoreText(isValid, evaluation.warnings.length),
    });
  } catch (error) {
    console.error("Error evaluating quality check:", error);
    return NextResponse.json(
      { error: "Failed to evaluate quality check" },
      { status: 500 }
    );
  }
}

