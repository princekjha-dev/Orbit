import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  ExternalLink,
  Calendar,
  Building,
  User,
  ArrowLeft,
  FileCheck,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await prisma.outcomeRecord.findUnique({
    where: { id },
    select: { title: true, activity: true },
  });

  if (!record) {
    return { title: "Evidence Record | Orbit" };
  }

  return {
    title: `${record.title} | Evidence | Orbit`,
    description: `Verified evidence record: ${record.activity}`,
  };
}

export default async function PublicEvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const record = await prisma.outcomeRecord.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (!record) {
    notFound();
  }

  const isOwner = user?.id === record.userId;
  const isAdmin = (user as any)?.role === "ADMIN";

  if (!record.isPublic && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Private Evidence</h1>
          <p className="text-sm text-neutral-600 mb-6">
            This evidence record is private and can only be accessed by the owner.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Status bar */}
        <div className="flex items-center justify-between">
          <Link
            href={isOwner ? "/profile" : "/"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{isOwner ? "Back to Profile" : "Orbit Evidence"}</span>
          </Link>
          <div className="flex items-center gap-2">
            {record.isPublic ? (
              <Badge variant="green">
                Public Record
              </Badge>
            ) : (
              <Badge variant="amber">
                Private Record
              </Badge>
            )}
            <Badge variant="blue">
              Verified Workflow
            </Badge>
          </div>
        </div>

        {/* Evidence Card */}
        <Card className="p-6 sm:p-8 space-y-6 shadow-sm border-neutral-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-6">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
                {record.type.replace(/_/g, " ")}
              </span>
              <h1 className="text-2xl font-bold text-neutral-900 mt-1">
                {record.title}
              </h1>
              <p className="text-neutral-600 mt-2 text-sm">
                {record.activity}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold">
                {record.user.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-900">{record.user.name}</p>
                <Link
                  href={`/p/${record.user.username}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  @{record.user.username}
                </Link>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <Building className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-neutral-500">Organization</p>
                <p className="text-sm font-medium text-neutral-900">
                  {record.organizationName || "Independent Project"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <Calendar className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-neutral-500">Completion Date</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formatDate(record.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Review / Evaluation */}
          {record.reviewText && (
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-neutral-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Verified Assessment</span>
              </div>
              <p className="text-sm text-neutral-700 italic">
                &ldquo;{record.reviewText}&rdquo;
              </p>
            </div>
          )}

          {/* Artifacts & Deliverables */}
          <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-3">
            {record.deliverableUrl && (
              <a
                href={record.deliverableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <FileCheck className="h-4 w-4" aria-hidden="true" />
                <span>View Deliverable</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {record.evidenceUrl && (
              <a
                href={record.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-800 text-sm font-medium hover:bg-neutral-200 transition-colors border border-neutral-200"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Evidence Artifact</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </Card>

        {/* Privacy & Provenance Notice */}
        <div className="text-center text-xs text-neutral-500">
          This record was generated directly from verified activity on the Orbit Platform.
          No unverified or manufactured claims are included.
        </div>
      </div>
    </div>
  );
}
