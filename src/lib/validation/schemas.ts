import { z } from "zod";

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "FOUNDER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  headline: z.string().max(160, "Headline too long").optional(),
  about: z.string().max(2000, "About too long").optional(),
  location: z.string().max(100).optional(),
  college: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).max(30, "Maximum 30 skills"),
});

// ─── ORGANIZATION ─────────────────────────────────────────────────────────────

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  industry: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────

export const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["JOB", "INTERNSHIP", "PAID_PROJECT", "STARTUP_ROLE"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().optional(),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  compensation: z.string().optional(),
  duration: z.string().optional(),
  eligibility: z.string().optional(),
  applicationReqs: z.string().optional(),
  deadline: z.string().optional(),
  skills: z.array(z.string()),
});

export const applyOpportunitySchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(5),
  problem: z.string().min(20, "Problem statement must be at least 20 characters"),
  scope: z.string().min(20, "Scope must be at least 20 characters"),
  deliverable: z.string().min(20, "Deliverable must be at least 20 characters"),
  acceptanceCriteria: z.string().optional(),
  expectedHours: z.number().int().positive().optional(),
  deadline: z.string().optional(),
  payment: z.string().optional(),
  ipTerms: z.string().optional(),
  skills: z.array(z.string()),
});

export const projectApplicationSchema = z.object({
  proposal: z.string().min(50, "Proposal must be at least 50 characters"),
  workSamples: z.string().optional(),
  availability: z.string().optional(),
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(["HACKATHON", "STARTUP_EVENT", "TECH_MEETUP", "WORKSHOP", "CAREER_EVENT", "DEMO_DAY", "ENTREPRENEURSHIP", "OTHER"]),
  format: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  city: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  registrationDeadline: z.string().optional(),
  registrationUrl: z.string().url().optional().or(z.literal("")),
  eligibility: z.string().optional(),
  isFree: z.boolean(),
  price: z.string().optional(),
  organizerName: z.string().min(2),
});
