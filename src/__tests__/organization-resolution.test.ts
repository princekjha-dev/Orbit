import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  prisma: {
    organization: {
      findFirst: vi.fn(),
    },
    startup: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Organization Resolution & Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves an organization by slug or id", async () => {
    const mockOrg = {
      id: "org-cuid-123",
      slug: "acme-corp",
      name: "Acme Corp",
      members: [{ userId: "user-1", role: "OWNER" }],
    };

    (prisma.organization.findFirst as any).mockResolvedValue(mockOrg);

    const result = await resolveOrganization("acme-corp");
    expect(result).toEqual(mockOrg);
    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: "acme-corp" }, { slug: "acme-corp" }],
        isDeleted: false,
      },
      include: { members: true },
    });
  });

  it("verifies organization access correctly for OWNER/ADMIN roles", () => {
    const mockOrg = {
      members: [
        { userId: "owner-1", role: "OWNER" },
        { userId: "member-1", role: "MEMBER" },
      ],
    };

    expect(verifyOrgAccess(mockOrg, "owner-1", "STUDENT", ["OWNER", "ADMIN"])).toBe(true);
    expect(verifyOrgAccess(mockOrg, "member-1", "STUDENT", ["OWNER", "ADMIN"])).toBe(false);
    expect(verifyOrgAccess(mockOrg, "member-1", "STUDENT", ["OWNER", "ADMIN", "MEMBER"])).toBe(true);
    expect(verifyOrgAccess(mockOrg, "outsider", "STUDENT")).toBe(false);
    expect(verifyOrgAccess(mockOrg, "any-admin", "ADMIN")).toBe(true);
  });
});

describe("Startup Resolution & Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves a startup by slug or id", async () => {
    const mockStartup = {
      id: "startup-123",
      slug: "orbit-startup",
      creatorId: "user-1",
      members: [{ userId: "user-2" }],
    };

    (prisma.startup.findFirst as any).mockResolvedValue(mockStartup);

    const result = await resolveStartup("orbit-startup");
    expect(result).toEqual(mockStartup);
    expect(prisma.startup.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: "orbit-startup" }, { slug: "orbit-startup" }],
      },
      include: { members: true },
    });
  });

  it("verifies startup access for creator, member, and admin", () => {
    const mockStartup = {
      creatorId: "creator-id",
      members: [{ userId: "member-id" }],
    };

    expect(verifyStartupAccess(mockStartup, "creator-id")).toBe(true);
    expect(verifyStartupAccess(mockStartup, "member-id")).toBe(true);
    expect(verifyStartupAccess(mockStartup, "random-user")).toBe(false);
    expect(verifyStartupAccess(mockStartup, "random-user", "ADMIN")).toBe(true);
  });
});
