"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle,
  Code,
  Award,
  Globe,
} from "lucide-react";

interface SkillEvidenceItem {
  id: string;
  skillName: string;
  evidenceType: "CLAIMED" | "VERIFIED" | "EXTERNAL";
  proofType: string;
  title: string;
  context?: string | null;
  url?: string | null;
  isVerified: boolean;
  verifiedBy?: string | null;
}

interface SkillEvidenceManagerProps {
  initialEvidences: SkillEvidenceItem[];
  profileSkills: string[];
}

export function SkillEvidenceManager({
  initialEvidences,
  profileSkills,
}: SkillEvidenceManagerProps) {
  const [evidences, setEvidences] = useState<SkillEvidenceItem[]>(initialEvidences);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [skillName, setSkillName] = useState(profileSkills[0] || "");
  const [proofType, setProofType] = useState<string>("GITHUB_REPO");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");

  // Group evidences by skill name
  const grouped: Record<
    string,
    {
      skillName: string;
      verifiedCount: number;
      externalCount: number;
      claimedCount: number;
      items: SkillEvidenceItem[];
    }
  > = {};

  // Initialize with profile skills
  for (const skill of profileSkills) {
    grouped[skill] = {
      skillName: skill,
      verifiedCount: 0,
      externalCount: 0,
      claimedCount: 0,
      items: [],
    };
  }

  for (const item of evidences) {
    if (!grouped[item.skillName]) {
      grouped[item.skillName] = {
        skillName: item.skillName,
        verifiedCount: 0,
        externalCount: 0,
        claimedCount: 0,
        items: [],
      };
    }
    grouped[item.skillName].items.push(item);
    if (item.evidenceType === "VERIFIED") {
      grouped[item.skillName].verifiedCount++;
    } else if (item.evidenceType === "EXTERNAL") {
      grouped[item.skillName].externalCount++;
    } else {
      grouped[item.skillName].claimedCount++;
    }
  }

  async function handleAddEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!skillName || !title) return;

    setLoading(true);
    try {
      const res = await fetch("/api/evidence/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName,
          proofType,
          title,
          url: url || null,
          context: context || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to add skill evidence");
      const data = await res.json();
      setEvidences([data.evidence, ...evidences]);
      setShowAddModal(false);
      setTitle("");
      setUrl("");
      setContext("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this evidence artifact?")) return;
    try {
      const res = await fetch(`/api/evidence/skills/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvidences(evidences.filter((e) => e.id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete evidence");
    }
  }

  return (
    <Card className="p-6 bg-white border-neutral-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-neutral-700" />
            Skill Evidence System
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Demonstrated proof backed by completed work, public repositories, and certifications.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddModal(!showAddModal)}
          className="flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Evidence
        </Button>
      </div>

      {/* Add Evidence Form */}
      {showAddModal && (
        <form
          onSubmit={handleAddEvidence}
          className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-4 text-xs"
        >
          <p className="font-semibold text-neutral-900 text-sm">
            Attach Evidence to Skill
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Skill
              </label>
              <Input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. React, TypeScript, Python"
                required
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Proof Type
              </label>
              <select
                value={proofType}
                onChange={(e) => setProofType(e.target.value)}
                className="w-full text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="GITHUB_REPO">Public GitHub Repository (External)</option>
                <option value="PORTFOLIO_ARTIFACT">Portfolio Artifact / Demo (External)</option>
                <option value="CERTIFICATION">Accredited Certification (External)</option>
                <option value="HACKATHON_SUBMISSION">Hackathon Submission</option>
                <option value="VERIFIED_PROJECT">Self-Declared Claim (Claimed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Title / Summary
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine or Frontend Dashboard"
              required
              className="text-xs py-1.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Proof URL (Repository, Live Demo, or Certificate)
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="text-xs py-1.5"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Context / Notes
              </label>
              <Input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Where or how this was built"
                className="text-xs py-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Adding..." : "Save Evidence"}
            </Button>
          </div>
        </form>
      )}

      {/* Evidence Breakdown */}
      <div className="space-y-4">
        {Object.values(grouped).length === 0 ? (
          <p className="text-xs text-neutral-500 py-3 text-center">
            No skill evidence recorded yet.
          </p>
        ) : (
          Object.values(grouped).map((group) => {
            const hasVerified = group.verifiedCount > 0;
            const hasExternal = group.externalCount > 0;

            return (
              <div
                key={group.skillName}
                className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 text-sm">
                      {group.skillName}
                    </span>
                    {hasVerified && (
                      <Badge variant="green">
                        <ShieldCheck className="h-3 w-3 mr-1 inline" />
                        Verified
                      </Badge>
                    )}
                    {hasExternal && !hasVerified && (
                      <Badge variant="blue">
                        External Proof
                      </Badge>
                    )}
                    {!hasVerified && !hasExternal && (
                      <Badge variant="neutral">
                        Claimed
                      </Badge>
                    )}
                  </div>

                  {/* Fact-based summary line */}
                  <span className="text-xs text-neutral-600 font-medium">
                    {group.verifiedCount > 0 && `${group.verifiedCount} verified project${group.verifiedCount > 1 ? "s" : ""} `}
                    {group.externalCount > 0 && `${group.externalCount} public repo${group.externalCount > 1 ? "s" : ""}`}
                    {group.verifiedCount === 0 && group.externalCount === 0 && "Self-reported"}
                  </span>
                </div>

                {/* Evidence Artifacts list */}
                {group.items.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded border border-neutral-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.evidenceType === "VERIFIED" ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Code className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-neutral-800 truncate">
                            {item.title}
                          </span>
                          {item.context && (
                            <span className="text-neutral-500 truncate hidden sm:inline">
                              - {item.context}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
