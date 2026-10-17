import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createConnectionSchema = z.object({
  sourceType: z.enum(["USER", "ORGANIZATION", "PROJECT", "EVENT", "COMMUNITY", "STARTUP"]),
  sourceId: z.string().min(1),
  targetType: z.enum(["ORGANIZATION", "PROJECT", "EVENT", "COMMUNITY", "STARTUP", "OPPORTUNITY"]),
  targetId: z.string().min(1),
  relationship: z.string().min(1).max(50),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const focusType = searchParams.get("type") || "ALL";
    const search = searchParams.get("q")?.toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "60", 10), 100);

    const nodes: Array<{
      id: string;
      label: string;
      type: "USER" | "ORGANIZATION" | "PROJECT" | "EVENT" | "COMMUNITY" | "STARTUP" | "OPPORTUNITY";
      subtitle?: string;
      url?: string;
      verified?: boolean;
    }> = [];

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      relationship: string;
    }> = [];

    const nodeIds = new Set<string>();

    const addNode = (node: (typeof nodes)[0]) => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id);
        nodes.push(node);
      }
    };

    const edgeIds = new Set<string>();
    const addEdge = (edge: (typeof edges)[0]) => {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        const key = `${edge.source}-${edge.target}-${edge.relationship}`;
        if (!edgeIds.has(key)) {
          edgeIds.add(key);
          edges.push(edge);
        }
      }
    };

    // 1. Fetch Organizations
    if (focusType === "ALL" || focusType === "ORGANIZATION") {
      const orgs = await prisma.organization.findMany({
        take: 20,
        select: {
          id: true,
          name: true,
          slug: true,
          verificationStatus: true,
          industry: true,
          projects: { take: 3, select: { id: true, title: true, status: true } },
          opportunities: { take: 3, select: { id: true, title: true, type: true } },
          members: { take: 3, select: { userId: true, role: true } },
        },
      });

      for (const org of orgs) {
        if (!search || org.name.toLowerCase().includes(search)) {
          addNode({
            id: `org-${org.id}`,
            label: org.name,
            type: "ORGANIZATION",
            subtitle: org.industry || "Organization",
            url: `/org/${org.slug}`,
            verified: org.verificationStatus === "VERIFIED",
          });

          // Connected projects
          for (const p of org.projects) {
            addNode({
              id: `proj-${p.id}`,
              label: p.title,
              type: "PROJECT",
              subtitle: p.status,
              url: `/projects/${p.id}`,
            });
            addEdge({
              id: `e-org-proj-${org.id}-${p.id}`,
              source: `org-${org.id}`,
              target: `proj-${p.id}`,
              relationship: "HOSTS_PROJECT",
            });
          }

          // Connected opportunities
          for (const opp of org.opportunities) {
            addNode({
              id: `opp-${opp.id}`,
              label: opp.title,
              type: "OPPORTUNITY",
              subtitle: opp.type,
              url: `/opportunities/${opp.id}`,
            });
            addEdge({
              id: `e-org-opp-${org.id}-${opp.id}`,
              source: `org-${org.id}`,
              target: `opp-${opp.id}`,
              relationship: "OFFERS",
            });
          }
        }
      }
    }

    // 2. Fetch Users
    if (focusType === "ALL" || focusType === "USER") {
      const users = await prisma.user.findMany({
        take: 25,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          identityVerification: { select: { status: true } },
          organizations: { take: 2, select: { organizationId: true, role: true } },
          projectApplications: {
            where: { status: "ACCEPTED" },
            take: 2,
            select: { projectId: true },
          },
        },
      });

      for (const u of users) {
        if (!search || u.name.toLowerCase().includes(search) || u.username.toLowerCase().includes(search)) {
          addNode({
            id: `user-${u.id}`,
            label: u.name,
            type: "USER",
            subtitle: `@${u.username} (${u.role})`,
            url: `/users/${u.username}`,
            verified: u.identityVerification?.status === "VERIFIED",
          });

          for (const mem of u.organizations) {
            if (nodeIds.has(`org-${mem.organizationId}`)) {
              addEdge({
                id: `e-user-org-${u.id}-${mem.organizationId}`,
                source: `user-${u.id}`,
                target: `org-${mem.organizationId}`,
                relationship: mem.role,
              });
            }
          }

          for (const pa of u.projectApplications) {
            if (nodeIds.has(`proj-${pa.projectId}`)) {
              addEdge({
                id: `e-user-proj-${u.id}-${pa.projectId}`,
                source: `user-${u.id}`,
                target: `proj-${pa.projectId}`,
                relationship: "CONTRIBUTOR",
              });
            }
          }
        }
      }
    }

    // 3. Fetch Startups
    if (focusType === "ALL" || focusType === "STARTUP") {
      const startups = await prisma.startup.findMany({
        take: 15,
        select: {
          id: true,
          name: true,
          slug: true,
          stage: true,
          creatorId: true,
        },
      });

      for (const s of startups) {
        if (!search || s.name.toLowerCase().includes(search)) {
          addNode({
            id: `startup-${s.id}`,
            label: s.name,
            type: "STARTUP",
            subtitle: s.stage,
            url: `/startups/${s.slug}`,
          });

          if (nodeIds.has(`user-${s.creatorId}`)) {
            addEdge({
              id: `e-user-startup-${s.creatorId}-${s.id}`,
              source: `user-${s.creatorId}`,
              target: `startup-${s.id}`,
              relationship: "FOUNDED",
            });
          }
        }
      }
    }

    // 4. Fetch Communities & Events
    if (focusType === "ALL" || focusType === "COMMUNITY" || focusType === "EVENT") {
      const [communities, events] = await Promise.all([
        prisma.community.findMany({
          take: 10,
          select: { id: true, name: true, slug: true, category: true, creatorId: true },
        }),
        prisma.event.findMany({
          take: 10,
          select: { id: true, title: true, type: true, organizationId: true },
        }),
      ]);

      for (const c of communities) {
        if (!search || c.name.toLowerCase().includes(search)) {
          addNode({
            id: `comm-${c.id}`,
            label: c.name,
            type: "COMMUNITY",
            subtitle: c.category,
            url: `/communities/${c.slug}`,
          });
          if (nodeIds.has(`user-${c.creatorId}`)) {
            addEdge({
              id: `e-user-comm-${c.creatorId}-${c.id}`,
              source: `user-${c.creatorId}`,
              target: `comm-${c.id}`,
              relationship: "ORGANIZED",
            });
          }
        }
      }

      for (const ev of events) {
        if (!search || ev.title.toLowerCase().includes(search)) {
          addNode({
            id: `event-${ev.id}`,
            label: ev.title,
            type: "EVENT",
            subtitle: ev.type,
            url: `/events/${ev.id}`,
          });
          if (ev.organizationId && nodeIds.has(`org-${ev.organizationId}`)) {
            addEdge({
              id: `e-org-event-${ev.organizationId}-${ev.id}`,
              source: `org-${ev.organizationId}`,
              target: `event-${ev.id}`,
              relationship: "HOSTS_EVENT",
            });
          }
        }
      }
    }

    // 5. Fetch Explicit Ecosystem Connections
    const explicitConnections = await prisma.ecosystemConnection.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    for (const conn of explicitConnections) {
      const sourceNodeKey = `${conn.sourceType.toLowerCase()}-${conn.sourceId}`;
      const targetNodeKey = `${conn.targetType.toLowerCase()}-${conn.targetId}`;

      if (nodeIds.has(sourceNodeKey) && nodeIds.has(targetNodeKey)) {
        addEdge({
          id: `e-conn-${conn.id}`,
          source: sourceNodeKey,
          target: targetNodeKey,
          relationship: conn.relationship,
        });
      }
    }

    return NextResponse.json({
      nodes: nodes.slice(0, limit),
      edges,
      totalNodes: nodes.length,
      totalEdges: edges.length,
    });
  } catch (error) {
    console.error("GET /api/ecosystem/map error:", error);
    return NextResponse.json({ error: "Failed to fetch ecosystem map" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createConnectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const { sourceType, sourceId, targetType, targetId, relationship, metadata } = parsed.data;

    // Authorization check: if sourceType is USER, sourceId must be current user unless ADMIN
    if (sourceType === "USER" && sourceId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot create relationship on behalf of another user" }, { status: 403 });
    }

    // If sourceType is ORGANIZATION, user must be member
    if (sourceType === "ORGANIZATION" && user.role !== "ADMIN") {
      const isMember = await prisma.organizationMember.findFirst({
        where: { organizationId: sourceId, userId: user.id },
      });
      if (!isMember) {
        return NextResponse.json({ error: "Forbidden: Not an organization member" }, { status: 403 });
      }
    }

    const connection = await prisma.ecosystemConnection.upsert({
      where: {
        sourceType_sourceId_targetType_targetId_relationship: {
          sourceType,
          sourceId,
          targetType,
          targetId,
          relationship,
        },
      },
      create: {
        sourceType,
        sourceId,
        targetType,
        targetId,
        relationship,
        metadata: (metadata || {}) as any,
      },
      update: {
        metadata: (metadata || {}) as any,
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ecosystem/map error:", error);
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }
}
