import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  ExternalLink,
  Calendar,
  Building,
  User,
  AlertCircle,
  FileCheck,
  Hash,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const credential = await prisma.portableEvidenceCredential.findUnique({
    where: { slug },
    select: { title: true, recipientName: true },
  });

  if (!credential) {
    return { title: "Verified Credential | Orbit" };
  }

  return {
    title: `${credential.title} | Verified Credential | Orbit`,
    description: `Verified credential for ${credential.recipientName}`,
  };
}

export default async function VerifiedCredentialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const credential = await prisma.portableEvidenceCredential.findUnique({
    where: { slug },
  });

  if (!credential) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Orbit Platform</span>
          </Link>
          <div className="flex items-center gap-2">
            {!credential.isRevoked ? (
              <Badge variant="green">
                <ShieldCheck className="h-3 w-3 mr-1 inline" />
                Valid Credential
              </Badge>
            ) : (
              <Badge variant="red">
                <AlertCircle className="h-3 w-3 mr-1 inline" />
                Revoked by Owner
              </Badge>
            )}
            <Badge variant="neutral">
              {credential.type}
            </Badge>
          </div>
        </div>

        {/* Credential Card */}
        <Card className="p-6 sm:p-8 bg-white border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
              Verified Achievement Credential
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 mt-1">
              {credential.title}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Issued on {formatDate(credential.issuedAt)} by{" "}
              <span className="font-semibold text-neutral-800">{credential.issuerName}</span>
            </p>
          </div>

          {/* Recipient & Role Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Recipient</span>
              <p className="text-sm font-semibold text-neutral-900">{credential.recipientName}</p>
              <Link
                href={`/p/${credential.recipientUsername}`}
                className="text-xs text-brand-600 hover:underline"
              >
                @{credential.recipientUsername}
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Demonstrated Role</span>
              <p className="text-sm font-semibold text-neutral-900">
                {credential.role || "Primary Contributor"}
              </p>
              <p className="text-xs text-neutral-500">Verified participation</p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Scope & Delivery Summary
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-100">
              {credential.summary}
            </p>
          </div>

          {/* Artifact Link */}
          {credential.evidenceUrl && (
            <div className="pt-2">
              <a
                href={credential.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <FileCheck className="h-4 w-4" />
                <span>Inspect Evidence Artifact</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </div>
          )}

          {/* Cryptographic Signature Provenance */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <Hash className="h-3.5 w-3.5 text-neutral-500" />
              <span>Cryptographic Provenance Signature</span>
            </div>
            <div className="p-2.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-700 break-all select-all">
              {credential.signatureDigest}
            </div>
            <p className="text-[11px] text-neutral-400">
              This signature verifies that the record matches the database entry on Orbit. Tampering with parameters invalidates verification.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
