export interface DemoMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

export interface DemoConversation {
  id: string;
  title: string;
  isGroup: boolean;
  participantIds: string[];
  participants: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    title: string;
    image?: string | null;
  }>;
  messages: DemoMessageItem[];
  updatedAt: string;
}

const now = Date.now();

export const INITIAL_DEMO_CONVERSATIONS: DemoConversation[] = [
  // 1. Aarav Sharma ↔ Riya Mehta (Frontend Internship Opportunity)
  {
    id: "conv-aarav-riya",
    title: "Riya Mehta (Nexora Labs)",
    isGroup: false,
    participantIds: ["demo-talent", "demo-founder"],
    participants: [
      {
        id: "demo-talent",
        name: "Aarav Sharma",
        username: "demo_talent",
        email: "demo.talent@orbit.demo",
        title: "Software Engineer / AI Developer",
      },
      {
        id: "demo-founder",
        name: "Riya Mehta",
        username: "demo_founder",
        email: "demo.founder@orbit.demo",
        title: "Founder & CEO, Nexora Labs",
      },
    ],
    messages: [
      {
        id: "msg-ar-1",
        conversationId: "conv-aarav-riya",
        senderId: "demo-founder",
        senderName: "Riya Mehta",
        senderUsername: "demo_founder",
        content:
          "Hi Aarav! We reviewed your Orbit profile and GitHub repositories. Your Next.js and TypeScript projects look very clean. Would you be open to discussing our Frontend Engineer Intern role at Nexora Labs?",
        createdAt: new Date(now - 3600000 * 24).toISOString(),
      },
      {
        id: "msg-ar-2",
        conversationId: "conv-aarav-riya",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "Hello Riya, thank you for reaching out! I'm very interested in Nexora Labs' work on AI SaaS orchestration. I'd love to learn more about the team's roadmap and how I can contribute.",
        createdAt: new Date(now - 3600000 * 20).toISOString(),
      },
      {
        id: "msg-ar-3",
        conversationId: "conv-aarav-riya",
        senderId: "demo-founder",
        senderName: "Riya Mehta",
        senderUsername: "demo_founder",
        content:
          "Fantastic! Let's set up a quick 20-minute chat this Thursday at 3 PM IST to dive into the architecture and our technical stack.",
        createdAt: new Date(now - 3600000 * 15).toISOString(),
      },
      {
        id: "msg-ar-4",
        conversationId: "conv-aarav-riya",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "Thursday 3 PM IST works perfectly for me. Looking forward to our conversation!",
        createdAt: new Date(now - 3600000 * 10).toISOString(),
      },
    ],
    updatedAt: new Date(now - 3600000 * 10).toISOString(),
  },

  // 2. Aarav Sharma ↔ Dr. Ananya Iyer (AI Career Mentorship)
  {
    id: "conv-aarav-ananya",
    title: "Dr. Ananya Iyer (AI Mentor)",
    isGroup: false,
    participantIds: ["demo-talent", "demo-mentor"],
    participants: [
      {
        id: "demo-talent",
        name: "Aarav Sharma",
        username: "demo_talent",
        email: "demo.talent@orbit.demo",
        title: "Software Engineer / AI Developer",
      },
      {
        id: "demo-mentor",
        name: "Dr. Ananya Iyer",
        username: "demo_mentor",
        email: "demo.mentor@orbit.demo",
        title: "AI Product & Startup Mentor",
      },
    ],
    messages: [
      {
        id: "msg-aa-1",
        conversationId: "conv-aarav-ananya",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "Hello Dr. Ananya, I'm a final-year CS student focusing on AI/ML and full-stack systems. I would appreciate your guidance on transitioning from toy models to production agent pipelines.",
        createdAt: new Date(now - 3600000 * 36).toISOString(),
      },
      {
        id: "msg-aa-2",
        conversationId: "conv-aarav-ananya",
        senderId: "demo-mentor",
        senderName: "Dr. Ananya Iyer",
        senderUsername: "demo_mentor",
        content:
          "Hi Aarav, glad to connect! The most important transition is building verifiable proof-of-work: latency benchmarks, evaluation rubrics, and fault-tolerant agent memory. Let's schedule a session to review your AI Career Copilot architecture.",
        createdAt: new Date(now - 3600000 * 28).toISOString(),
      },
      {
        id: "msg-aa-3",
        conversationId: "conv-aarav-ananya",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "That would be immensely helpful Dr. Ananya. I've prepared our vector retrieval latency benchmark and ESCO skill classification accuracy report.",
        createdAt: new Date(now - 3600000 * 22).toISOString(),
      },
    ],
    updatedAt: new Date(now - 3600000 * 22).toISOString(),
  },

  // 3. Karan Verma ↔ Aarav Sharma (Interview Discussion)
  {
    id: "conv-karan-aarav",
    title: "Karan Verma (Astra Digital)",
    isGroup: false,
    participantIds: ["demo-recruiter", "demo-talent"],
    participants: [
      {
        id: "demo-recruiter",
        name: "Karan Verma",
        username: "demo_recruiter",
        email: "demo.recruiter@orbit.demo",
        title: "Technical Recruiter, Astra Digital",
      },
      {
        id: "demo-talent",
        name: "Aarav Sharma",
        username: "demo_talent",
        email: "demo.talent@orbit.demo",
        title: "Software Engineer / AI Developer",
      },
    ],
    messages: [
      {
        id: "msg-ka-1",
        conversationId: "conv-karan-aarav",
        senderId: "demo-recruiter",
        senderName: "Karan Verma",
        senderUsername: "demo_recruiter",
        content:
          "Hi Aarav, your application for our Full Stack opening was reviewed by our engineering lead Vikram Malhotra. We'd love to invite you to a technical pairing interview.",
        createdAt: new Date(now - 3600000 * 30).toISOString(),
      },
      {
        id: "msg-ka-2",
        conversationId: "conv-karan-aarav",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "Thank you Karan! I'm excited about Astra's cloud infrastructure work. I am available this Friday afternoon.",
        createdAt: new Date(now - 3600000 * 24).toISOString(),
      },
      {
        id: "msg-ka-3",
        conversationId: "conv-karan-aarav",
        senderId: "demo-recruiter",
        senderName: "Karan Verma",
        senderUsername: "demo_recruiter",
        content:
          "Perfect, I've updated your candidate status in our recruiter pipeline and scheduled the invite. Talk soon!",
        createdAt: new Date(now - 3600000 * 18).toISOString(),
      },
    ],
    updatedAt: new Date(now - 3600000 * 18).toISOString(),
  },

  // 4. Neha Kapoor ↔ Community Members (Hackathon Coordination)
  {
    id: "conv-neha-hackathon",
    title: "Orbit India Buildathon Coordination",
    isGroup: true,
    participantIds: ["demo-organizer", "demo-talent", "demo-founder"],
    participants: [
      {
        id: "demo-organizer",
        name: "Neha Kapoor",
        username: "demo_organizer",
        email: "demo.organizer@orbit.demo",
        title: "Community Organizer",
      },
      {
        id: "demo-talent",
        name: "Aarav Sharma",
        username: "demo_talent",
        email: "demo.talent@orbit.demo",
        title: "Software Engineer",
      },
      {
        id: "demo-founder",
        name: "Riya Mehta",
        username: "demo_founder",
        email: "demo.founder@orbit.demo",
        title: "Founder, Nexora Labs",
      },
    ],
    messages: [
      {
        id: "msg-nh-1",
        conversationId: "conv-neha-hackathon",
        senderId: "demo-talent",
        senderName: "Aarav Sharma",
        senderUsername: "demo_talent",
        content:
          "Hi Neha, will there be mentorship office hours during the 48-hour sprint for the Orbit India Buildathon?",
        createdAt: new Date(now - 3600000 * 14).toISOString(),
      },
      {
        id: "msg-nh-2",
        conversationId: "conv-neha-hackathon",
        senderId: "demo-organizer",
        senderName: "Neha Kapoor",
        senderUsername: "demo_organizer",
        content:
          "Yes! Dr. Ananya Iyer and several senior engineers from Astra Digital and Nexora Labs will be hosting dedicated office hours throughout Saturday.",
        createdAt: new Date(now - 3600000 * 11).toISOString(),
      },
      {
        id: "msg-nh-3",
        conversationId: "conv-neha-hackathon",
        senderId: "demo-founder",
        senderName: "Riya Mehta",
        senderUsername: "demo_founder",
        content:
          "I will also be on the jury panel evaluating the Autonomous AI Coworkers track. Looking forward to seeing the submissions!",
        createdAt: new Date(now - 3600000 * 8).toISOString(),
      },
    ],
    updatedAt: new Date(now - 3600000 * 8).toISOString(),
  },
];
