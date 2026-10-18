export interface DemoApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  candidateUsername: string;
  candidateLocation: string;
  candidateHeadline: string;
  status: "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED" | "OFFER" | "HIRED";
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
}

export const INITIAL_DEMO_APPLICATIONS: DemoApplication[] = [
  // 1. Aarav Sharma -> Frontend Engineer Intern (Nexora Labs) — SHORTLISTED
  {
    id: "demo-app-aarav-frontend",
    opportunityId: "demo-opp-frontend-intern",
    opportunityTitle: "Frontend Engineer Intern",
    opportunitySlug: "frontend-engineer-intern-nexora",
    organizationId: "demo-org-nexora",
    organizationName: "Nexora Labs",
    userId: "demo-talent",
    candidateName: "Aarav Sharma",
    candidateEmail: "demo.talent@orbit.demo",
    candidateUsername: "demo_talent",
    candidateLocation: "Bengaluru, Karnataka, India",
    candidateHeadline: "Full-Stack Software Engineer & AI Systems Developer",
    status: "SHORTLISTED",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    coverLetter:
      "Dear Riya, I have been following Nexora Labs' work on autonomous AI orchestration. As a B.Tech CS developer in Bengaluru proficient in Next.js 15, TypeScript, and React, I have built open-source developer tooling and verifiable state systems that align directly with your technical roadmap.",
    portfolioUrl: "https://github.com/demo_talent",
    resumeUrl: "/resumes/aarav_sharma_resume.pdf",
    resumeName: "Aarav_Sharma_Resume_2026.pdf",
  },

  // 2. Aarav Sharma -> AI Engineering Intern (Nexora Labs) — UNDER_REVIEW
  {
    id: "demo-app-aarav-ai",
    opportunityId: "demo-opp-ai-intern",
    opportunityTitle: "AI Engineering Intern",
    opportunitySlug: "ai-engineering-intern-nexora",
    organizationId: "demo-org-nexora",
    organizationName: "Nexora Labs",
    userId: "demo-talent",
    candidateName: "Aarav Sharma",
    candidateEmail: "demo.talent@orbit.demo",
    candidateUsername: "demo_talent",
    candidateLocation: "Bengaluru, Karnataka, India",
    candidateHeadline: "Full-Stack Software Engineer & AI Systems Developer",
    status: "UNDER_REVIEW",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    coverLetter:
      "Hi Nexora Team, my focus during university research has been evaluating LLM agent latency and tool-calling reliability. I would love to build low-latency FastAPI pipelines and prompt orchestration modules for Nexora's pre-seed release.",
    portfolioUrl: "https://github.com/demo_talent",
    resumeUrl: "/resumes/aarav_sharma_resume.pdf",
    resumeName: "Aarav_Sharma_Resume_2026.pdf",
  },

  // Recruiter Karan Verma's pipeline at Astra Digital Technologies:
  // 3. Rohan Kulkarni -> Full Stack Developer — INTERVIEW
  {
    id: "demo-app-astra-1",
    opportunityId: "demo-opp-fullstack-dev",
    opportunityTitle: "Full Stack Developer",
    opportunitySlug: "full-stack-developer-astra",
    organizationId: "demo-org-astra",
    organizationName: "Astra Digital Technologies",
    userId: "demo-candidate-rohan",
    candidateName: "Rohan Kulkarni",
    candidateEmail: "rohan.kulkarni@demo.orbit",
    candidateUsername: "rohan_k",
    candidateLocation: "Pune, Maharashtra, India",
    candidateHeadline: "Senior Backend & Next.js Engineer (5 yrs exp)",
    status: "INTERVIEW",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    coverLetter: "Excited about Astra's distributed cloud platforms and telemetry stream pipelines in Pune.",
    resumeUrl: "/resumes/rohan_kulkarni_resume.pdf",
    resumeName: "Rohan_Kulkarni_Resume.pdf",
  },

  // 4. Priya Nambiar -> Product Designer — SELECTED
  {
    id: "demo-app-astra-2",
    opportunityId: "demo-opp-product-designer",
    opportunityTitle: "Product Designer",
    opportunitySlug: "product-designer-astra",
    organizationId: "demo-org-astra",
    organizationName: "Astra Digital Technologies",
    userId: "demo-candidate-priya",
    candidateName: "Priya Nambiar",
    candidateEmail: "priya.nambiar@demo.orbit",
    candidateUsername: "priya_n",
    candidateLocation: "Gurugram, Haryana, India",
    candidateHeadline: "Lead Systems & UI/UX Designer | ex-Design Studio",
    status: "SELECTED",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    coverLetter: "Portfolio demonstrates 4 enterprise design system implementations with 200+ Figma components.",
    resumeUrl: "/resumes/priya_nambiar_portfolio.pdf",
    resumeName: "Priya_Nambiar_Design_Resume.pdf",
  },

  // 5. Ankit Roy -> Full Stack Developer — APPLIED
  {
    id: "demo-app-astra-3",
    opportunityId: "demo-opp-fullstack-dev",
    opportunityTitle: "Full Stack Developer",
    opportunitySlug: "full-stack-developer-astra",
    organizationId: "demo-org-astra",
    organizationName: "Astra Digital Technologies",
    userId: "demo-candidate-ankit",
    candidateName: "Ankit Roy",
    candidateEmail: "ankit.roy@demo.orbit",
    candidateUsername: "ankit_r",
    candidateLocation: "Kolkata, West Bengal, India",
    candidateHeadline: "Full Stack Developer | Node.js & React",
    status: "APPLIED",
    appliedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    coverLetter: "Applying for the Full Stack Developer opening in Pune/Remote.",
  },

  // 6. Sneha Sen -> Product Designer — UNDER_REVIEW
  {
    id: "demo-app-astra-4",
    opportunityId: "demo-opp-product-designer",
    opportunityTitle: "Product Designer",
    opportunitySlug: "product-designer-astra",
    organizationId: "demo-org-astra",
    organizationName: "Astra Digital Technologies",
    userId: "demo-candidate-sneha",
    candidateName: "Sneha Sen",
    candidateEmail: "sneha.sen@demo.orbit",
    candidateUsername: "sneha_s",
    candidateLocation: "Delhi NCR, India",
    candidateHeadline: "Product Designer & Design Systems Advocate",
    status: "UNDER_REVIEW",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    coverLetter: "Passionate about creating accessible, developer-friendly interface consoles.",
  },

  // 7. Devansh Patel -> Full Stack Developer — REJECTED
  {
    id: "demo-app-astra-5",
    opportunityId: "demo-opp-fullstack-dev",
    opportunityTitle: "Full Stack Developer",
    opportunitySlug: "full-stack-developer-astra",
    organizationId: "demo-org-astra",
    organizationName: "Astra Digital Technologies",
    userId: "demo-candidate-devansh",
    candidateName: "Devansh Patel",
    candidateEmail: "devansh.patel@demo.orbit",
    candidateUsername: "devansh_p",
    candidateLocation: "Ahmedabad, Gujarat, India",
    candidateHeadline: "Junior Web Developer | PHP & JavaScript",
    status: "REJECTED",
    appliedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    coverLetter: "Seeking Full Stack position at Astra Digital.",
  },
];
