export interface DemoNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "OPPORTUNITY" | "MENTORSHIP" | "APPLICATION" | "PROJECT" | "COMMUNITY" | "SYSTEM";
  read: boolean;
  createdAt: string;
  link?: string;
}

const now = Date.now();

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  // Aarav Sharma (Talent)
  {
    id: "notif-t-1",
    userId: "demo-talent",
    title: "Application Shortlisted!",
    body: "Your application for Frontend Engineer Intern at Nexora Labs has been shortlisted by Riya Mehta.",
    type: "APPLICATION",
    read: false,
    createdAt: new Date(now - 3600000 * 12).toISOString(),
    link: "/dashboard",
  },
  {
    id: "notif-t-2",
    userId: "demo-talent",
    title: "Mentorship Session Scheduled",
    body: "Advisory session with Dr. Ananya Iyer is confirmed for tomorrow at 4 PM IST.",
    type: "MENTORSHIP",
    read: false,
    createdAt: new Date(now - 3600000 * 20).toISOString(),
    link: "/messages/conv-aarav-ananya",
  },
  {
    id: "notif-t-3",
    userId: "demo-talent",
    title: "New Hackathon Announced",
    body: "Orbit India Buildathon 2026 registration is now open with a ₹1,75,000 prize pool.",
    type: "COMMUNITY",
    read: true,
    createdAt: new Date(now - 3600000 * 48).toISOString(),
    link: "/hackathons/demo-hack-buildathon",
  },

  // Riya Mehta (Founder)
  {
    id: "notif-f-1",
    userId: "demo-founder",
    title: "Candidate Responded",
    body: "Aarav Sharma accepted your invitation for the Frontend Engineer Intern interview chat.",
    type: "APPLICATION",
    read: false,
    createdAt: new Date(now - 3600000 * 10).toISOString(),
    link: "/messages/conv-aarav-riya",
  },
  {
    id: "notif-f-2",
    userId: "demo-founder",
    title: "New AI Intern Application",
    body: "Aarav Sharma submitted an application for the AI Engineering Intern role at Nexora Labs.",
    type: "APPLICATION",
    read: true,
    createdAt: new Date(now - 3600000 * 24).toISOString(),
    link: "/dashboard",
  },

  // Karan Verma (Recruiter)
  {
    id: "notif-r-1",
    userId: "demo-recruiter",
    title: "Pipeline Updated",
    body: "Candidate Rohan Kulkarni advanced to INTERVIEW stage for Full Stack Developer opening.",
    type: "APPLICATION",
    read: false,
    createdAt: new Date(now - 3600000 * 6).toISOString(),
    link: "/dashboard",
  },
  {
    id: "notif-r-2",
    userId: "demo-recruiter",
    title: "New High-Signal Candidate",
    body: "Signal Dot identified 3 new candidate matches with verified pull request evidence in Bengaluru.",
    type: "OPPORTUNITY",
    read: false,
    createdAt: new Date(now - 3600000 * 14).toISOString(),
    link: "/dots/signal",
  },

  // Dr. Ananya Iyer (Mentor)
  {
    id: "notif-m-1",
    userId: "demo-mentor",
    title: "Mentorship Request Confirmed",
    body: "Aarav Sharma confirmed the AI systems architecture review session for tomorrow.",
    type: "MENTORSHIP",
    read: false,
    createdAt: new Date(now - 3600000 * 22).toISOString(),
    link: "/messages/conv-aarav-ananya",
  },

  // Vikram Malhotra (Org Admin)
  {
    id: "notif-o-1",
    userId: "demo-organization",
    title: "Astra Digital Organization Verified",
    body: "AVIS Trust Dot has validated your DNS TXT records for astradigital.in. Trust badge is active.",
    type: "SYSTEM",
    read: false,
    createdAt: new Date(now - 3600000 * 18).toISOString(),
    link: "/dashboard",
  },

  // Neha Kapoor (Community Organizer)
  {
    id: "notif-co-1",
    userId: "demo-organizer",
    title: "Hackathon Registrations Milestone",
    body: "Orbit India Buildathon 2026 has crossed 380 builder registrations and 90 teams.",
    type: "COMMUNITY",
    read: false,
    createdAt: new Date(now - 3600000 * 8).toISOString(),
    link: "/hackathons/demo-hack-buildathon",
  },

  // Aditya Rao (Platform Admin)
  {
    id: "notif-pa-1",
    userId: "demo-admin",
    title: "System Integrity Digest",
    body: "All synthetic Indian demo environments and organization endpoints are operational with 0 reported disputes.",
    type: "SYSTEM",
    read: false,
    createdAt: new Date(now - 3600000 * 4).toISOString(),
    link: "/dashboard",
  },
];
