import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PostOpportunityForm } from "@/components/opportunities/post-opportunity-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Post Opportunity" };

interface PageProps { params: { slug: string } }

export default async function PostOpportunityPage({ params }: PageProps) {
  const user = await requireAuth();

  const org = await prisma.organization.findFirst({
    where: {
      slug: params.slug,
      isDeleted: false,
      members: { some: { userId: user.id!, role: { in: ["OWNER", "ADMIN"] } } },
    },
  });

  if (!org) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href={`/org/${org.slug}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {org.name}
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Post an opportunity</h1>
        <p className="text-neutral-500 text-sm mt-1">Fill in accurate details. Applications will be sent directly to you.</p>
      </div>
      <PostOpportunityForm orgId={org.id} orgSlug={org.slug} />
    </div>
  );
}
