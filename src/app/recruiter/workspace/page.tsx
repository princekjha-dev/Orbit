"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Briefcase,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface ShortlistCandidate {
  id: string;
  candidateId: string;
  stage: string;
  relevantSkills?: string | null;
  matchReason?: string | null;
  lastActivity: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    headline?: string | null;
    location?: string | null;
    skills: string[];
    verifiedCount: number;
  } | null;
  notes: {
    id: string;
    note: string;
    createdAt: string;
    author: { id: string; name: string };
  }[];
}

interface Shortlist {
  id: string;
  name: string;
  role: string;
  pipelineType: string;
  description?: string | null;
  organizationId: string;
  organization: { id: string; name: string; slug: string };
  candidates: ShortlistCandidate[];
}

const STAGES = [
  { id: "DISCOVERED", label: "Discovered" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "INTERESTED", label: "Interested" },
  { id: "SCREENING", label: "Screening" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "OFFER", label: "Offer" },
  { id: "HIRED", label: "Hired" },
  { id: "REJECTED", label: "Archived" },
];

export default function RecruiterWorkspacePage() {
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [activeShortlist, setActiveShortlist] = useState<Shortlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  // Create Shortlist Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShortlistName, setNewShortlistName] = useState("");
  const [newShortlistRole, setNewShortlistRole] = useState("");
  const [newPipelineType, setNewPipelineType] = useState("JOB");
  const [newShortlistDesc, setNewShortlistDesc] = useState("");
  const [targetOrgId, setTargetOrgId] = useState<string>("");

  // Search & Add Talent Modal
  const [showTalentSearch, setShowTalentSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSkills, setSearchSkills] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Note Modal
  const [activeCandidateForNote, setActiveCandidateForNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    loadShortlists();
  }, []);

  async function loadShortlists() {
    try {
      const res = await fetch("/api/recruiter/shortlists");
      if (!res.ok) throw new Error("Failed to load shortlists");
      const data = await res.json();
      setShortlists(data.shortlists || []);
      if (data.shortlists && data.shortlists.length > 0) {
        setTargetOrgId(data.shortlists[0].organizationId);
        loadShortlistDetail(data.shortlists[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function loadShortlistDetail(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/recruiter/shortlists/${id}`);
      if (!res.ok) throw new Error("Failed to fetch shortlist detail");
      const data = await res.json();
      setActiveShortlist(data.shortlist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateShortlist(e: React.FormEvent) {
    e.preventDefault();
    if (!targetOrgId || !newShortlistName || !newShortlistRole) return;

    try {
      const res = await fetch("/api/recruiter/shortlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: targetOrgId,
          name: newShortlistName,
          role: newShortlistRole,
          pipelineType: newPipelineType,
          description: newShortlistDesc,
        }),
      });

      if (!res.ok) throw new Error("Failed to create shortlist");
      const data = await res.json();
      setShowCreateModal(false);
      setNewShortlistName("");
      setNewShortlistRole("");
      setNewShortlistDesc("");
      await loadShortlists();
      loadShortlistDetail(data.shortlist.id);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSearchTalent() {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (searchSkills) params.set("skills", searchSkills);
      if (verifiedOnly) params.set("verifiedOnly", "true");

      const res = await fetch(`/api/talent/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to search talent");
      const data = await res.json();
      setSearchResults(data.candidates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleAddCandidate(candidate: any) {
    if (!activeShortlist) return;
    try {
      const res = await fetch(`/api/recruiter/shortlists/${activeShortlist.id}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          stage: "DISCOVERED",
          relevantSkills: candidate.skills.join(", "),
          matchReason: candidate.matchReason,
        }),
      });

      if (!res.ok) throw new Error("Failed to add candidate");
      await loadShortlistDetail(activeShortlist.id);
      alert(`Added ${candidate.name} to shortlist.`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdateStage(candidateShortlistId: string, newStage: string) {
    try {
      const res = await fetch(`/api/recruiter/candidates/${candidateShortlistId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) throw new Error("Failed to update candidate stage");
      if (activeShortlist) {
        loadShortlistDetail(activeShortlist.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCandidateForNote || !noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/recruiter/candidates/${activeCandidateForNote}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteContent }),
      });

      if (!res.ok) throw new Error("Failed to save note");
      setNoteContent("");
      setActiveCandidateForNote(null);
      if (activeShortlist) {
        loadShortlistDetail(activeShortlist.id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingNote(false);
    }
  }

  async function handleRemoveCandidate(candidateShortlistId: string) {
    if (!confirm("Remove this candidate from shortlist?")) return;
    try {
      const res = await fetch(`/api/recruiter/candidates/${candidateShortlistId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove candidate");
      if (activeShortlist) {
        loadShortlistDetail(activeShortlist.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  const displayedCandidates = (activeShortlist?.candidates || []).filter(
    (c) => selectedStage === "ALL" || c.stage === selectedStage
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-neutral-800" />
              Recruiter Workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Private candidate shortlists, verified evidence review, and explainable hiring pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Shortlist
            </Button>
            {activeShortlist && (
              <Button
                size="sm"
                onClick={() => {
                  setShowTalentSearch(true);
                  handleSearchTalent();
                }}
              >
                <Search className="h-4 w-4 mr-1.5" />
                Find & Add Talent
              </Button>
            )}
          </div>
        </div>

        {/* Shortlist Switcher bar */}
        {shortlists.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-2 flex-shrink-0">
              Shortlists:
            </span>
            {shortlists.map((sl) => (
              <button
                key={sl.id}
                onClick={() => loadShortlistDetail(sl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeShortlist?.id === sl.id
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                <span>{sl.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeShortlist?.id === sl.id ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                }`}>
                  {sl._count?.candidates ?? 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Shortlist Header Card */}
        {activeShortlist ? (
          <div className="space-y-6">
            <Card className="p-5 bg-white border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-neutral-900">
                      {activeShortlist.name}
                    </h2>
                    <Badge variant="blue">
                      {activeShortlist.pipelineType}
                    </Badge>
                    <Badge variant="neutral">
                      Private Shortlist
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Role: <span className="font-medium text-neutral-800">{activeShortlist.role}</span>
                    {activeShortlist.organization && ` - Org: ${activeShortlist.organization.name}`}
                  </p>
                  {activeShortlist.description && (
                    <p className="text-xs text-neutral-600 mt-2">
                      {activeShortlist.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Filter Stage:</span>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="ALL">All Stages ({activeShortlist.candidates.length})</option>
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({activeShortlist.candidates.filter((c) => c.stage === s.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Pipeline Stage Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {STAGES.map((stage) => {
                const count = activeShortlist.candidates.filter((c) => c.stage === stage.id).length;
                const isSelected = selectedStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(isSelected ? "ALL" : stage.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <div className="text-[11px] font-semibold tracking-wide uppercase truncate">
                      {stage.label}
                    </div>
                    <div className={`text-sm font-bold mt-1 ${isSelected ? "text-white" : "text-neutral-900"}`}>
                      {count}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Candidate List */}
            {displayedCandidates.length === 0 ? (
              <Card className="p-12 text-center bg-white border-neutral-200">
                <Users className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  No candidates in this stage
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Find candidates using explainable talent search to evaluate their verified work records and portfolio evidence.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setShowTalentSearch(true);
                    handleSearchTalent();
                  }}
                >
                  <Search className="h-3.5 w-3.5 mr-1" />
                  Search Talent
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {displayedCandidates.map((candidate) => (
                  <Card key={candidate.id} className="p-5 bg-white border-neutral-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: User details & Match Reason */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-neutral-900 text-sm">
                            {candidate.user?.name || "Candidate"}
                          </h3>
                          {candidate.user?.username && (
                            <Link
                              href={`/p/${candidate.user.username}`}
                              target="_blank"
                              className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>@{candidate.user.username}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                          {candidate.user && candidate.user.verifiedCount > 0 && (
                            <Badge variant="green">
                              <ShieldCheck className="h-3 w-3 mr-1 inline" />
                              {candidate.user.verifiedCount} verified project{candidate.user.verifiedCount > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>

                        {candidate.user?.headline && (
                          <p className="text-xs text-neutral-600">
                            {candidate.user.headline} {candidate.user.location && `- ${candidate.user.location}`}
                          </p>
                        )}

                        {/* Explainable Match Reason */}
                        {candidate.matchReason && (
                          <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100 text-xs text-neutral-700">
                            <span className="font-semibold text-neutral-900">Why matched: </span>
                            {candidate.matchReason}
                          </div>
                        )}

                        {/* Skills */}
                        {candidate.user?.skills && candidate.user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {candidate.user.skills.map((s) => (
                              <Badge key={s} variant="neutral">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Stage Mover & Notes Action */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-400">Stage:</span>
                          <select
                            value={candidate.stage}
                            onChange={(e) => handleUpdateStage(candidate.id, e.target.value)}
                            className="text-xs rounded-md border border-neutral-300 bg-white px-2 py-1.5 font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveCandidateForNote(candidate.id)}
                          className="text-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Notes ({candidate.notes.length})
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(candidate.id)}
                          className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Notes display */}
                    {candidate.notes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
                        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                          Internal Notes ({candidate.notes.length})
                        </span>
                        {candidate.notes.map((n) => (
                          <div key={n.id} className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-100 flex items-start justify-between gap-2">
                            <span>{n.note}</span>
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                              by {n.author.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border-neutral-200">
            <Briefcase className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <h2 className="text-base font-semibold text-neutral-900">
              No shortlists found
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Create a candidate shortlist for your organization to begin tracking candidates through the hiring pipeline.
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Shortlist
            </Button>
          </Card>
        )}

        {/* Modal: Create Shortlist */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-white border-neutral-200 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-neutral-900">
                Create Candidate Shortlist
              </h2>
              <form onSubmit={handleCreateShortlist} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Shortlist Name
                  </label>
                  <Input
                    type="text"
                    value={newShortlistName}
                    onChange={(e) => setNewShortlistName(e.target.value)}
                    placeholder="e.g. Q1 Senior Frontend Candidates"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Target Role
                  </label>
                  <Input
                    type="text"
                    value={newShortlistRole}
                    onChange={(e) => setNewShortlistRole(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Pipeline Type
                  </label>
                  <select
                    value={newPipelineType}
                    onChange={(e) => setNewPipelineType(e.target.value)}
                    className="w-full text-xs rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="JOB">Job Pipeline</option>
                    <option value="INTERNSHIP">Internship Pipeline</option>
                    <option value="PROJECT">Project Contributor Pipeline</option>
                    <option value="STARTUP_ROLE">Startup Founding Role</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Notes / Description
                  </label>
                  <Input
                    type="text"
                    value={newShortlistDesc}
                    onChange={(e) => setNewShortlistDesc(e.target.value)}
                    placeholder="e.g. Evaluating candidates with strong React and TypeScript evidence"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Create Shortlist
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Add Note to Candidate */}
        {activeCandidateForNote && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-white border-neutral-200 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-neutral-900">
                Add Private Internal Note
              </h2>
              <form onSubmit={handleAddNote} className="space-y-4">
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record interview impressions, technical evaluation, questions, or compensation notes..."
                  required
                  className="w-full p-2.5 text-xs rounded-md border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-500 text-neutral-900"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCandidateForNote(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submittingNote}>
                    {submittingNote ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Talent Search & Add Drawer */}
        {showTalentSearch && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-3xl w-full max-h-[85vh] flex flex-col p-6 bg-white border-neutral-200 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Find & Add Talent
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Explainable talent matching based strictly on verified work records and demonstrable skills.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTalentSearch(false)}
                >
                  Close
                </Button>
              </div>

              {/* Search Filters */}
              <div className="py-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or keyword..."
                    className="text-xs"
                  />
                  <Input
                    type="text"
                    value={searchSkills}
                    onChange={(e) => setSearchSkills(e.target.value)}
                    placeholder="Skills (comma separated, e.g. React, TypeScript)..."
                    className="text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Verified work records only</span>
                  </label>

                  <Button
                    size="sm"
                    onClick={handleSearchTalent}
                    disabled={searchLoading}
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Results List */}
              <div className="overflow-y-auto flex-1 space-y-3 pt-2">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">
                    No candidates found matching your criteria.
                  </p>
                ) : (
                  searchResults.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 text-sm">
                            {candidate.name}
                          </span>
                          <span className="text-neutral-500">
                            @{candidate.username}
                          </span>
                          {candidate.verifiedProjectCount > 0 && (
                            <Badge variant="green">
                              <ShieldCheck className="h-3 w-3 mr-1 inline" />
                              {candidate.verifiedProjectCount} verified
                            </Badge>
                          )}
                        </div>

                        {candidate.headline && (
                          <p className="text-neutral-600">{candidate.headline}</p>
                        )}

                        <p className="text-neutral-700 font-medium">
                          {candidate.matchReason}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {candidate.skills.slice(0, 5).map((s: string) => (
                            <Badge key={s} variant="neutral">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/p/${candidate.username}`}
                          target="_blank"
                          className="px-2.5 py-1.5 rounded text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-white"
                        >
                          Portfolio
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAddCandidate(candidate)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add to Shortlist
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
