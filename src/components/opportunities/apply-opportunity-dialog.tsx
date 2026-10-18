"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  X,
  FileCheck,
} from "lucide-react";

interface ApplyOpportunityDialogProps {
  opportunityId: string;
  opportunityTitle?: string;
  organizationName?: string;
}

type Step = "check" | "resume" | "feedback" | "review" | "success" | "already_applied";

interface ReadinessData {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; headline?: string } | null;
  isProfileComplete: boolean;
  missingFields: string[];
  hasApplied: boolean;
  existingApplication?: any;
  existingResumeUrl?: string | null;
  existingResumeName?: string | null;
  isOpen: boolean;
  opportunityTitle?: string;
  organizationName?: string;
}

interface AiFeedback {
  matchScore: number;
  summary: string;
  strengths: string[];
  recommendations: string[];
  missingSkills: string[];
}

export function ApplyOpportunityDialog({
  opportunityId,
  opportunityTitle = "Opportunity",
  organizationName = "Organization",
}: ApplyOpportunityDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("check");
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);

  // Resume state
  const [resumeMode, setResumeMode] = useState<"existing" | "upload">("upload");
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const [selectedResumeName, setSelectedResumeName] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Feedback state
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Application details
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const checkReadiness = async () => {
    setLoadingCheck(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply/check`);
      const json = await res.json();
      if (json.success && json.data) {
        setReadiness(json.data);
        if (json.data.hasApplied) {
          setStep("already_applied");
        } else if (json.data.existingResumeUrl) {
          setResumeMode("existing");
          setSelectedResumeUrl(json.data.existingResumeUrl);
          setSelectedResumeName(json.data.existingResumeName || "Existing Resume Document");
          setStep("resume");
        } else {
          setStep("resume");
        }
      }
    } catch {
      // offline fallback
      setStep("resume");
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleOpenClick = () => {
    setOpen(true);
    checkReadiness();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingResume(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadError(data.error?.message || "Failed to upload resume document.");
        return;
      }

      setSelectedResumeUrl(data.data.path);
      setSelectedResumeName(data.data.fileName);
      setResumeMode("upload");
    } catch {
      setUploadError("Network error while uploading resume. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRequestAiFeedback = async () => {
    setLoadingFeedback(true);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/ai/resume-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          resumeName: selectedResumeName,
          coverLetter,
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
        setStep("feedback");
      } else {
        setFeedbackError(data.error?.message || "Unable to analyze resume at this time.");
      }
    } catch {
      setFeedbackError("Failed to reach feedback service.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter,
          portfolioUrl,
          resumeUrl: selectedResumeUrl,
          resumeName: selectedResumeName,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        if (result.error?.code === "ALREADY_APPLIED") {
          setStep("already_applied");
          return;
        }
        setSubmitError(result.error?.message || "Failed to submit application.");
        return;
      }

      setSubmittedData(result.data);
      setStep("success");
      router.refresh();
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentOrg = readiness?.organizationName || organizationName;
  const currentTitle = readiness?.opportunityTitle || opportunityTitle;

  return (
    <>
      <Button
        className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        onClick={handleOpenClick}
      >
        <span>Apply for this role</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={step === "success" ? "Application Confirmed" : `Apply to ${currentTitle}`}
        description={step === "success" ? "Your application was verified and stored in Orbit." : `${currentOrg} • Review requirements and submit application`}
        className="max-w-xl"
      >
        {/* Step Progress Header */}
        {step !== "success" && step !== "already_applied" && (
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B] pb-4 mb-4 border-b border-[#E5E5EA]">
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === "resume" ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}>1</span>
              <span>Resume</span>
            </div>
            <div className="w-8 h-px bg-[#E5E5EA]" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === "feedback" ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}>2</span>
              <span>AI Feedback</span>
            </div>
            <div className="w-8 h-px bg-[#E5E5EA]" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === "review" ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}>3</span>
              <span>Confirm</span>
            </div>
          </div>
        )}

        {/* LOADING CHECK */}
        {loadingCheck && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#0071E3]" />
            <p className="text-xs text-[#6E6E73]">Verifying application readiness...</p>
          </div>
        )}

        {/* AUTH CHECK FAILURE */}
        {!loadingCheck && readiness && !readiness.isAuthenticated && (
          <div className="py-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Sign in to apply</h3>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto leading-relaxed">
                You must be logged in with a verified Orbit account to submit an application.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => router.push(`/login?callbackUrl=/opportunities/${opportunityId}`)}
                className="w-full bg-[#0071E3] text-white font-medium"
              >
                Sign in with Orbit
              </Button>
            </div>
          </div>
        )}

        {/* PROFILE COMPLETENESS CHECK FAILURE */}
        {!loadingCheck && readiness && readiness.isAuthenticated && !readiness.isProfileComplete && (
          <div className="py-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Complete your profile before applying</h3>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto leading-relaxed">
                Recruiters require your verified name and contact information. Missing:{" "}
                <span className="font-semibold text-[#1D1D1F]">{readiness.missingFields.join(", ")}</span>.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => router.push("/profile/edit")}
                className="flex-1 bg-[#0071E3] text-white font-medium"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        )}

        {/* ALREADY APPLIED STATE */}
        {!loadingCheck && step === "already_applied" && (
          <div className="py-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#E8F8EE] text-[#1D7F3E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Already Applied</h3>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
                You have already submitted an active application for this role.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F]">
                Status: <span className="text-[#0071E3] font-semibold">{readiness?.existingApplication?.status || "APPLIED"}</span>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => router.push("/dashboard/talent")}
                className="flex-1 bg-[#0071E3] text-white font-medium"
              >
                View Applications
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: RESUME SELECTION & UPLOAD */}
        {!loadingCheck && readiness?.isAuthenticated && readiness.isProfileComplete && step === "resume" && (
          <div className="space-y-5">
            {/* Existing Resume Option if available */}
            {readiness.existingResumeUrl && (
              <div
                onClick={() => {
                  setResumeMode("existing");
                  setSelectedResumeUrl(readiness.existingResumeUrl!);
                  setSelectedResumeName(readiness.existingResumeName || "Profile Resume");
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  resumeMode === "existing"
                    ? "border-[#0071E3] bg-[#0071E3]/5"
                    : "border-[#E5E5EA] bg-white hover:border-[#D1D1D6]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1D1D1F]">Use existing profile resume</h4>
                    <p className="text-xs text-[#6E6E73]">
                      {readiness.existingResumeName || "Verified resume from profile"}
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={resumeMode === "existing"}
                  onChange={() => {}}
                  className="text-[#0071E3] focus:ring-[#0071E3]"
                />
              </div>
            )}

            {/* Upload New / Different Resume */}
            <div
              onClick={() => {
                if (!uploadingResume && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
                selectedResumeUrl && resumeMode === "upload"
                  ? "border-[#34C759] bg-[#E8F8EE]/30"
                  : "border-[#E5E5EA] bg-[#F5F5F7]/50 hover:border-[#0071E3] hover:bg-[#0071E3]/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadingResume ? (
                <div className="py-3 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0071E3]" />
                  <p className="text-xs font-medium text-[#1D1D1F]">Uploading to secure private storage...</p>
                </div>
              ) : selectedResumeUrl && resumeMode === "upload" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-9 w-9 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1D1D1F]">{selectedResumeName}</p>
                      <p className="text-[11px] text-[#34C759]">Ready for application</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs"
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E5E5EA] text-[#6E6E73] flex items-center justify-center mx-auto shadow-2xs">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1D1D1F]">
                      {readiness?.existingResumeUrl ? "Or upload a different resume" : "Upload your resume"}
                    </p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      PDF, DOC, or DOCX (up to 10MB) • Stored in private Supabase Storage
                    </p>
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <p className="text-xs text-[#FF3B30] flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{uploadError}</span>
              </p>
            )}

            {/* Optional AI Resume Feedback Promo */}
            {selectedResumeUrl && (
              <div className="p-4 rounded-xl bg-[#0071E3]/5 border border-[#0071E3]/20 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-[#1D1D1F]">Optional AI Resume Feedback</h5>
                    <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3]">
                      Powered by Scout
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#6E6E73] leading-relaxed">
                    Get an objective match evaluation against {currentTitle} requirements before submitting.
                  </p>
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRequestAiFeedback}
                      disabled={loadingFeedback}
                      className="text-xs gap-1.5 border-[#0071E3]/30 text-[#0071E3] hover:bg-[#0071E3]/10"
                    >
                      {loadingFeedback ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Analyzing resume alignment...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Get resume feedback before applying</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {feedbackError && (
              <p className="text-xs text-[#FF9500] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{feedbackError}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!selectedResumeUrl || uploadingResume}
                onClick={() => setStep("review")}
                className="bg-[#0071E3] text-white font-medium"
              >
                <span>Continue to Review</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: OPTIONAL AI FEEDBACK REVIEW */}
        {step === "feedback" && feedback && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1D1D1F]">Opportunity Alignment</span>
                  <span className="text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                    {feedback.matchScore}% Match
                  </span>
                </div>
                <span className="text-[11px] text-[#86868B]">Scout AI Rubric</span>
              </div>
              <p className="text-xs text-[#48484A] leading-relaxed">{feedback.summary}</p>
            </div>

            {feedback.strengths.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-[#1D7F3E] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Key Strengths</span>
                </h5>
                <ul className="text-xs text-[#48484A] space-y-1 list-disc list-inside">
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.recommendations.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-[#0071E3] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Suggestions for Improvement</span>
                </h5>
                <ul className="text-xs text-[#48484A] space-y-1.5">
                  {feedback.recommendations.map((rec, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-[#F5F5F7] text-[11.5px] leading-relaxed">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("resume")}
                className="text-xs gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Replace Resume</span>
              </Button>
              <Button
                type="button"
                onClick={() => setStep("review")}
                className="bg-[#0071E3] text-white text-xs font-medium"
              >
                <span>Apply Anyway</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: APPLICATION REVIEW & CONFIRMATION */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E6E73]">Position:</span>
                <span className="font-semibold text-[#1D1D1F]">{currentTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E6E73]">Organization:</span>
                <span className="font-semibold text-[#1D1D1F]">{currentOrg}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E6E73]">Applicant:</span>
                <span className="font-semibold text-[#1D1D1F]">{readiness?.user?.name} ({readiness?.user?.email})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E6E73]">Attached Resume:</span>
                <span className="font-semibold text-[#0071E3] truncate max-w-[200px]">
                  {selectedResumeName || "Resume Document"}
                </span>
              </div>
            </div>

            <Textarea
              label="Cover Note / Motivation (optional)"
              placeholder="Explain why you are interested in this position and how your past work aligns with this scoped role."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="text-xs"
            />

            <Input
              label="Portfolio or Work Sample URL (optional)"
              type="url"
              placeholder="https://github.com/... or live demo"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="text-xs"
            />

            {submitError && (
              <p className="text-xs text-[#FF3B30] flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{submitError}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
              <Button type="button" variant="outline" onClick={() => setStep("resume")} disabled={submitting}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmitApplication}
                loading={submitting}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium"
              >
                Submit Application
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED SUCCESS CONFIRMATION */}
        {step === "success" && (
          <div className="py-6 text-center space-y-5">
            <div className="h-14 w-14 rounded-full bg-[#E8F8EE] text-[#1D7F3E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1D1D1F]">Application Submitted</h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
                Your application has been persisted and notified to the hiring team at {currentOrg}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Opportunity:</span>
                <span className="font-semibold text-[#1D1D1F]">{submittedData?.opportunityTitle || currentTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Organization:</span>
                <span className="font-semibold text-[#1D1D1F]">{submittedData?.organizationName || currentOrg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Resume Used:</span>
                <span className="font-semibold text-[#1D1D1F]">{submittedData?.resumeUsed || selectedResumeName || "Resume Document"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Current Status:</span>
                <span className="font-semibold text-[#1D7F3E]">Submitted</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  router.push("/discover");
                }}
                className="flex-1 text-xs"
              >
                Back to Discover
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  router.push("/dashboard/talent");
                }}
                className="flex-1 bg-[#0071E3] text-white text-xs font-medium"
              >
                View in My Applications
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
