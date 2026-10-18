"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ORBIT_AVATAR, DOT_AVATARS } from "@/lib/avatars";
import {
  Briefcase,
  Rocket,
  Search,
  Compass,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Building2,
  GraduationCap,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Roles supported by Orbit
const ROLES = [
  {
    id: "TALENT",
    title: "Talent / Job Seeker",
    badge: "Talent",
    icon: Briefcase,
    color: "#0071E3",
    bg: "rgba(0, 113, 227, 0.08)",
    border: "rgba(0, 113, 227, 0.25)",
    tagline: "Build verified work proof and let Scout match you with top teams.",
    feature: "Scout AI Matching & Proof-of-Work Evidence Passport",
  },
  {
    id: "FOUNDER",
    title: "Founder",
    badge: "Founder",
    icon: Rocket,
    color: "#FF9500",
    bg: "rgba(255, 149, 0, 0.08)",
    border: "rgba(255, 149, 0, 0.25)",
    tagline: "Build startup workspaces, post projects, and assemble high-signal teams with Forge.",
    feature: "Startup Workspace Studio, Scoped Hiring & Milestones",
  },
  {
    id: "RECRUITER",
    title: "Recruiter",
    badge: "Recruiter",
    icon: Search,
    color: "#34C759",
    bg: "rgba(52, 199, 89, 0.08)",
    border: "rgba(52, 199, 89, 0.25)",
    tagline: "Discover candidates scored by real deliverables, not keyword resumes, with Signal.",
    feature: "Signal Talent Discovery, Deliverable Reviews & Pipelines",
  },
  {
    id: "MENTOR",
    title: "Mentor / Advisor",
    badge: "Mentor",
    icon: Compass,
    color: "#5856D6",
    bg: "rgba(88, 86, 214, 0.08)",
    border: "rgba(88, 86, 214, 0.25)",
    tagline: "Guide emerging builders and review proof-of-work project milestones.",
    feature: "Advisory Sessions, Milestone Reviews & Attestations",
  },
];

const SUGGESTED_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "AI / LLMs",
  "UI/UX Design",
  "PostgreSQL",
  "TailwindCSS",
  "Product Management",
  "System Architecture",
  "Solidity",
];

const EXPERIENCE_LEVELS = [
  "Student / Early Career",
  "1–3 Years Experience",
  "3–5 Years Experience",
  "5+ Years (Senior / Lead)",
];

const COLLABORATION_PREFERENCES = [
  "Remote",
  "Hybrid",
  "Onsite",
  "Flexible",
];

const DRAFT_STORAGE_KEY = "orbit_onboarding_draft";

export default function OnboardingPage() {
  const router = useRouter();

  // Page state
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    role: "TALENT" as "TALENT" | "FOUNDER" | "RECRUITER" | "MENTOR",
    headline: "",
    about: "",
    location: "",
    skills: [] as string[],
    interests: "",
    company: "",
    college: "",
    experienceLevel: "Student / Early Career",
    collaborationPreference: "Remote",
    website: "",
    github: "",
    linkedin: "",
    portfolio: "",
    avatarUrl: ORBIT_AVATAR,
  });

  // 1. Initial Authentication & Existing Profile Verification
  useEffect(() => {
    async function initOnboarding() {
      try {
        const res = await fetch("/api/onboarding");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?callbackUrl=/onboarding");
            return;
          }
        }

        const data = await res.json();

        // If user already completed onboarding, redirect to /home immediately
        if (data.onboardingCompleted) {
          router.push("/home");
          return;
        }

        // Restore draft from localStorage if available
        let restoredDraft: any = null;
        try {
          const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (savedDraft) {
            restoredDraft = JSON.parse(savedDraft);
          }
        } catch {
          // Ignore parse errors
        }

        setFormData((prev) => ({
          ...prev,
          name: restoredDraft?.name || data.user?.name || prev.name,
          role: restoredDraft?.role || (data.user?.role === "FOUNDER" ? "FOUNDER" : prev.role),
          headline: restoredDraft?.headline || data.profile?.headline || prev.headline,
          about: restoredDraft?.about || data.profile?.about || prev.about,
          location: restoredDraft?.location || data.profile?.location || prev.location,
          skills: restoredDraft?.skills || prev.skills,
          interests: restoredDraft?.interests || data.profile?.skillsLookingFor || prev.interests,
          company: restoredDraft?.company || data.profile?.company || prev.company,
          college: restoredDraft?.college || data.profile?.college || prev.college,
          experienceLevel: restoredDraft?.experienceLevel || prev.experienceLevel,
          collaborationPreference: restoredDraft?.collaborationPreference || prev.collaborationPreference,
          website: restoredDraft?.website || data.profile?.website || prev.website,
          github: restoredDraft?.github || data.profile?.github || prev.github,
          linkedin: restoredDraft?.linkedin || data.profile?.linkedin || prev.linkedin,
          portfolio: restoredDraft?.portfolio || data.profile?.portfolio || prev.portfolio,
          avatarUrl: restoredDraft?.avatarUrl || data.user?.image || prev.avatarUrl,
        }));
      } catch (err) {
        console.error("Failed to initialize onboarding:", err);
      } finally {
        setLoadingInitial(false);
      }
    }

    initOnboarding();
  }, [router]);

  // 2. Persist draft state to localStorage on update
  useEffect(() => {
    if (!loadingInitial) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // Storage might be restricted
      }
    }
  }, [formData, loadingInitial]);

  // Skill management
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed].slice(0, 20),
      }));
    }
    setCustomSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Step validation
  const validateCurrentStep = (): boolean => {
    setSubmitError(null);
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setSubmitError("Please enter your full name.");
        return false;
      }
      if (!formData.headline.trim()) {
        setSubmitError("Please provide a professional title or headline.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.role) {
        setSubmitError("Please choose your primary Orbit role.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Submission Handler
  const handleCompleteOnboarding = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setSubmitError(
          result.error || "We couldn't save your profile. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Also ensure browser-side Supabase session metadata updates immediately
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: {
            name: formData.name,
            orbitRole: formData.role,
            onboarding_completed: true,
            onboarding_status: "COMPLETED",
          },
        });
      } catch {
        // Ignored; server API already performed persistence
      }

      // Clear draft storage
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignored
      }

      // Redirect to Orbit Home
      router.push("/home");
      router.refresh();
    } catch (err: any) {
      console.error("Onboarding submission exception:", err);
      setSubmitError("We couldn't save your profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 relative animate-pulse">
            <Image
              src={ORBIT_AVATAR}
              alt="Orbit"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-sm font-medium text-[#6E6E73] animate-pulse">
            Setting up your Orbit workspace...
          </p>
        </div>
      </div>
    );
  }

  const selectedRoleConfig = ROLES.find((r) => r.id === formData.role) || ROLES[0];

  const STEP_TITLES = [
    "About You",
    "Your Role",
    "Skills & Interests",
    "Experience",
    "Links",
    "Review",
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      {/* Top Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-6 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white border border-[#E5E5EA] flex items-center justify-center p-1.5 shadow-xs">
            <Image
              src={ORBIT_AVATAR}
              alt="Orbit"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#1D1D1F]">Orbit Onboarding</h1>
            <p className="text-xs text-[#6E6E73]">Step {currentStep} of 6 — {STEP_TITLES[currentStep - 1]}</p>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="hidden sm:flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((stepNum) => (
            <button
              key={stepNum}
              type="button"
              disabled={stepNum > currentStep}
              onClick={() => {
                if (stepNum < currentStep) setCurrentStep(stepNum);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                stepNum === currentStep
                  ? "w-7 bg-[#0071E3]"
                  : stepNum < currentStep
                  ? "w-2.5 bg-[#34C759] cursor-pointer hover:opacity-80"
                  : "w-2 bg-[#D1D1D6] cursor-not-allowed"
              )}
              aria-label={`Step ${stepNum}`}
            />
          ))}
        </div>
      </header>

      {/* Progress Bar (Mobile) */}
      <div className="w-full max-w-2xl bg-[#E5E5EA] h-1 rounded-full mt-3 overflow-hidden sm:hidden">
        <div
          className="bg-[#0071E3] h-full transition-all duration-300"
          style={{ width: `${(currentStep / 6) * 100}%` }}
        />
      </div>

      {/* Main Content Card */}
      <main className="w-full max-w-2xl bg-white rounded-2xl border border-[#E5E5EA] shadow-xs mt-6 p-6 sm:p-8">
        {submitError && (
          <div className="mb-6 rounded-xl bg-[#FFF2F2] border border-[#FFD0D0] p-4 flex items-start gap-3 text-xs text-[#D70015]">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{submitError}</p>
              {currentStep === 6 && (
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D70015] text-white font-medium hover:bg-[#B50012] transition-colors"
                >
                  Retry Saving Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: ABOUT YOU */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Tell us about yourself</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Your name and title help teammates and coworker Dots identify you across Orbit.
              </p>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Choose an Avatar <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: ORBIT_AVATAR })}
                  className={cn(
                    "h-12 w-12 rounded-full border-2 p-1 transition-all flex items-center justify-center bg-white",
                    formData.avatarUrl === ORBIT_AVATAR
                      ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 scale-105"
                      : "border-[#E5E5EA] hover:border-[#C7C7CC]"
                  )}
                  title="Orbit Default"
                >
                  <Image src={ORBIT_AVATAR} alt="Orbit" width={28} height={28} className="object-contain" />
                </button>

                {Object.entries(DOT_AVATARS).map(([dotName, dotSrc]) => (
                  <button
                    key={dotName}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: dotSrc })}
                    className={cn(
                      "h-12 w-12 rounded-full border-2 p-1 transition-all flex items-center justify-center bg-white",
                      formData.avatarUrl === dotSrc
                        ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 scale-105"
                        : "border-[#E5E5EA] hover:border-[#C7C7CC]"
                    )}
                    title={`${dotName} Dot`}
                  >
                    <Image src={dotSrc} alt={dotName} width={32} height={32} className="object-contain rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Full Name <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ada Lovelace"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
              />
            </div>

            {/* Professional Headline */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Headline / Professional Title <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Full-Stack Engineer, AI Researcher, Founding Designer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Location <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#1D1D1F]">
                  Bio / Short Introduction <span className="font-normal text-[#86868B]">(Optional)</span>
                </label>
                <span className="text-[11px] text-[#86868B]">{formData.about.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Share a short summary of your background, core focus, or what you're passionate about..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: ROLE SELECTION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Select your primary role</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Your role configures your primary dashboard and tuning, while keeping all 4 Dots fully accessible.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id as any })}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left select-none relative",
                      isSelected
                        ? "border-[#0071E3] bg-[#0071E3]/5 shadow-xs"
                        : "border-[#E5E5EA] hover:border-[#C7C7CC] bg-white"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: r.bg, color: r.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-[#1D1D1F]">{r.title}</h3>
                      <p className="text-xs text-[#6E6E73] leading-relaxed">{r.tagline}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E5E5EA]/80 flex items-center gap-1.5 text-[11px] font-medium text-[#0071E3]">
                      <Sparkles className="h-3 w-3 flex-shrink-0" />
                      <span>{r.feature}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS & INTERESTS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Skills & Interests</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Select your core technical or product skills. Scout uses these for high-signal matching.
              </p>
            </div>

            {/* Selected Skills Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Your Skills ({formData.skills.length})
              </label>
              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] shadow-2xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#86868B] hover:text-[#FF3B30] transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#86868B] italic">No skills added yet. Select from below or type custom skills.</p>
              )}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(customSkillInput);
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(customSkillInput)}
                disabled={!customSkillInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {/* Suggested Skills */}
            <div>
              <p className="text-xs font-medium text-[#6E6E73] mb-2">Suggested skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isSelected) handleRemoveSkill(skill);
                        else handleAddSkill(skill);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                        isSelected
                          ? "bg-[#0071E3] text-white"
                          : "bg-[#F5F5F7] text-[#48484A] border border-[#E5E5EA] hover:bg-[#E5E5EA]"
                      )}
                    >
                      {skill} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests / What they're looking for */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                What are you looking for on Orbit? <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g. Looking to contribute to open-source AI projects, join early-stage startups, or collaborate with experienced founders..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: EXPERIENCE & EDUCATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Experience & Education</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Provide your background context. All fields on this step are optional.
              </p>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Company / Current Organization <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Astra Digital Technologies, Nexora Labs, or Independent"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* College / Institution */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                College / University / School <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <GraduationCap className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. RV College of Engineering, IIT, or Self-Taught"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, experienceLevel: level })}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all",
                      formData.experienceLevel === level
                        ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold"
                        : "border-[#E5E5EA] bg-white text-[#48484A] hover:border-[#C7C7CC]"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Preference */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Work / Collaboration Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLLABORATION_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, collaborationPreference: pref })}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-medium text-center transition-all",
                      formData.collaborationPreference === pref
                        ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold"
                        : "border-[#E5E5EA] bg-white text-[#48484A] hover:border-[#C7C7CC]"
                    )}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: LINKS & SOCIALS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Connect your profiles</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Link your GitHub, LinkedIn, or portfolio to help Avis verify your work proofs.
              </p>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Portfolio / Personal Website <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                GitHub URL <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <GithubIcon className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                LinkedIn URL <span className="font-normal text-[#86868B]">(Optional)</span>
              </label>
              <div className="relative">
                <LinkedinIcon className="h-4 w-4 text-[#86868B] absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-sm text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Review your Orbit profile</h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                Verify your details. Once confirmed, your profile will be safely created in Supabase and you will enter Orbit.
              </p>
            </div>

            {/* Preview Card */}
            <div className="rounded-xl border border-[#E5E5EA] bg-[#F9F9FB] p-5 space-y-4">
              {/* Header section with avatar, name & role */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-full border border-[#E5E5EA] bg-white flex items-center justify-center p-1 shadow-2xs overflow-hidden flex-shrink-0">
                    <Image
                      src={formData.avatarUrl || ORBIT_AVATAR}
                      alt={formData.name}
                      width={48}
                      height={48}
                      className="object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1D1D1F]">{formData.name}</h3>
                    <p className="text-xs text-[#0071E3] font-medium">{formData.headline}</p>
                    {formData.location && (
                      <p className="text-[11.5px] text-[#86868B] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {formData.location}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  style={{ backgroundColor: selectedRoleConfig.bg, color: selectedRoleConfig.color }}
                >
                  <selectedRoleConfig.icon className="h-3.5 w-3.5" />
                  <span>{selectedRoleConfig.badge}</span>
                </div>
              </div>

              {/* Bio */}
              {formData.about && (
                <div className="pt-2 border-t border-[#E5E5EA]">
                  <p className="text-xs text-[#48484A] leading-relaxed italic">&quot;{formData.about}&quot;</p>
                </div>
              )}

              {/* Skills */}
              {formData.skills.length > 0 && (
                <div className="pt-2 border-t border-[#E5E5EA]">
                  <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-white border border-[#E5E5EA] text-[11px] font-medium text-[#1D1D1F]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Background & Links */}
              <div className="pt-2 border-t border-[#E5E5EA] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6E6E73]">
                {formData.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>{formData.company}</span>
                  </div>
                )}
                {formData.college && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>{formData.college}</span>
                  </div>
                )}
                {formData.github && (
                  <div className="flex items-center gap-1.5">
                    <GithubIcon className="h-3.5 w-3.5 text-[#86868B]" />
                    <span className="truncate">{formData.github}</span>
                  </div>
                )}
                {formData.linkedin && (
                  <div className="flex items-center gap-1.5">
                    <LinkedinIcon className="h-3.5 w-3.5 text-[#86868B]" />
                    <span className="truncate">{formData.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="mt-8 pt-6 border-t border-[#E5E5EA] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-xs font-semibold text-[#48484A] hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-colors shadow-xs"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCompleteOnboarding}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Setting up your Orbit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Profile & Enter Orbit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
