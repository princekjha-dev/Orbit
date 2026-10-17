import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CommunityView } from "@/components/communities/community-view";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!community) return { title: "Community Not Found | Orbit" };

  return {
    title: `${community.name} | Orbit Communities`,
    description: community.description,
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      creator: { select: { id: true, name: true, username: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!community) {
    notFound();
  }

  const userMembership = user?.id
    ? community.members.find((m) => m.userId === user.id)
    : null;

  const serialized = {
    ...community,
    memberCount: community._count.members,
    postCount: community._count.posts,
    currentUserRole: userMembership?.role || null,
    isMember: !!userMembership,
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <CommunityView community={serialized} currentUserId={user?.id} />
      </div>
    </AppShell>
  );
}
