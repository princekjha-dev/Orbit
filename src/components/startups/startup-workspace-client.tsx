"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Plus,
  Target,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StartupWorkspaceClientProps {
  startup: any;
  currentUserId?: string;
}

export function StartupWorkspaceClient({ startup, currentUserId }: StartupWorkspaceClientProps) {
  const [milestones, setMilestones] = useState<any[]>(startup.milestones || []);
  const [tasks, setTasks] = useState<any[]>(startup.tasks || []);
  const [hiringNeeds, setHiringNeeds] = useState<any[]>(startup.hiringNeeds || []);

  // Form states
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Milestone Status Toggle
  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "PLANNED"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
        ? "COMPLETED"
        : "PLANNED";

    // Optimistic update
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status: nextStatus } : m))
    );

    try {
      await fetch(`/api/startups/${startup.slug}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update milestone status:", err);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    setIsAddingMilestone(true);
    try {
      const res = await fetch(`/api/startups/${startup.slug}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: milestoneTitle,
          description: milestoneDesc || null,
          dueDate: milestoneDue || null,
          status: "PLANNED",
        }),
      });

      const data = await res.json();
      if (data.milestone) {
        setMilestones((prev) => [...prev, data.milestone]);
      }
      setMilestoneTitle("");
      setMilestoneDesc("");
      setMilestoneDue("");
      setShowAddMilestone(false);
    } catch (err) {
      console.error("Failed to add milestone:", err);
    } finally {
      setIsAddingMilestone(false);
    }
  };

  // Task Status Toggle
  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "TODO"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
        ? "DONE"
        : "TODO";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/startups/${startup.slug}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      const res = await fetch(`/api/startups/${startup.slug}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          assignedTo: taskAssignee || null,
          status: "TODO",
        }),
      });

      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [data.task, ...prev]);
      }
      setTaskTitle("");
      setTaskAssignee("");
      setShowAddTask(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/startups" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
              &larr; Startups
            </Link>
            <span className="text-neutral-300">/</span>
            <Badge variant="blue" className="text-[10px] font-semibold bg-brand-50 text-brand-700">
              Workspace
            </Badge>
            <Badge variant="neutral" className="text-[10px]">
              {startup.stage}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Rocket className="h-6 w-6 text-brand-600" />
            {startup.name} — Venture Workspace
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sprint management, execution milestones, talent recruitment, and ecosystem deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/startups/${startup.slug}`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              Public View
              <ExternalLink className="h-3 w-3 text-neutral-400" />
            </Button>
          </Link>
          <Link href="/ecosystem">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Find Talent
            </Button>
          </Link>
          <Link href={`/startups/${startup.slug}/workspace#milestones`}>
            <Button
              size="sm"
              variant="primary"
              className="text-xs gap-1.5"
              onClick={() => setShowAddMilestone(true)}
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Milestones & Sprint Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Milestones & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Card */}
          <Card className="p-6 bg-white border border-neutral-200 shadow-xs" id="milestones">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Verifiable Milestones ({milestones.length})
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-brand-700 hover:text-brand-900"
                onClick={() => setShowAddMilestone(!showAddMilestone)}
              >
                {showAddMilestone ? "Cancel" : "+ Add Milestone"}
              </Button>
            </div>

            {/* Inline Add Milestone Form */}
            {showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-4 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-800">Add New Milestone</h3>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Milestone title (e.g. Deploy Production Auth System)"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Acceptance criteria / description..."
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="date"
                    value={milestoneDue}
                    onChange={(e) => setMilestoneDue(e.target.value)}
                    className="px-2 py-1 text-xs bg-white border border-neutral-300 rounded-md text-neutral-700"
                  />
                  <Button type="submit" size="sm" variant="primary" disabled={isAddingMilestone} className="text-xs">
                    {isAddingMilestone ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Milestone"}
                  </Button>
                </div>
              </form>
            )}

            {/* Milestone List */}
            {milestones.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">No milestones added yet.</p>
            ) : (
              <div className="space-y-3">
                {milestones.map((ms) => {
                  const isCompleted = ms.status === "COMPLETED";
                  return (
                    <div
                      key={ms.id}
                      className="p-3.5 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleMilestoneStatus(ms.id, ms.status)}
                          className="mt-0.5 transition-transform hover:scale-110"
                          title="Click to toggle status"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-brand-600" />
                          )}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${isCompleted ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                            {ms.title}
                          </p>
                          {ms.description && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">{ms.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMilestoneStatus(ms.id, ms.status)}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={isCompleted ? "green" : ms.status === "IN_PROGRESS" ? "blue" : "neutral"}
                          className="text-[10px] uppercase font-semibold shrink-0"
                        >
                          {ms.status.replace("_", " ")}
                        </Badge>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Sprint Tasks Board */}
          <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Sprint Execution Tasks ({tasks.length})
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-brand-700 hover:text-brand-900"
                onClick={() => setShowAddTask(!showAddTask)}
              >
                {showAddTask ? "Cancel" : "+ Add Task"}
              </Button>
            </div>

            {/* Inline Add Task Form */}
            {showAddTask && (
              <form onSubmit={handleAddTask} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-4 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-800">New Task</h3>
                <input
                  type="text"
                  required
                  placeholder="Task title (e.g. Implement Webhook listener)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
                />
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Assignee (e.g. Sarah Chen)"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white border border-neutral-300 rounded-md text-neutral-700 w-48"
                  />
                  <Button type="submit" size="sm" variant="primary" disabled={isAddingTask} className="text-xs">
                    {isAddingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Task"}
                  </Button>
                </div>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">No sprint tasks created yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* TODO Column */}
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-neutral-700 uppercase">To Do</span>
                    <span className="text-[10px] text-neutral-400">
                      {tasks.filter((t) => t.status === "TODO").length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter((t) => t.status === "TODO").map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTaskStatus(t.id, t.status)}
                        className="p-2.5 bg-white rounded-md border border-neutral-200 text-xs shadow-2xs cursor-pointer hover:border-brand-300 transition-colors"
                      >
                        <p className="font-medium text-neutral-900">{t.title}</p>
                        {t.assignedTo && (
                          <p className="text-[10px] text-neutral-400 mt-1">{t.assignedTo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* IN_PROGRESS Column */}
                <div className="p-3 bg-brand-50/40 rounded-lg border border-brand-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-900 uppercase">In Progress</span>
                    <span className="text-[10px] text-brand-600">
                      {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTaskStatus(t.id, t.status)}
                        className="p-2.5 bg-white rounded-md border border-brand-200 text-xs shadow-2xs cursor-pointer hover:border-brand-400 transition-colors"
                      >
                        <p className="font-medium text-neutral-900">{t.title}</p>
                        {t.assignedTo && (
                          <p className="text-[10px] text-brand-600 mt-1">{t.assignedTo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONE Column */}
                <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase">Done</span>
                    <span className="text-[10px] text-emerald-600">
                      {tasks.filter((t) => t.status === "DONE").length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter((t) => t.status === "DONE").map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTaskStatus(t.id, t.status)}
                        className="p-2.5 bg-white rounded-md border border-emerald-200 text-xs shadow-2xs cursor-pointer hover:border-emerald-300 transition-colors"
                      >
                        <p className="font-medium text-neutral-500 line-through">{t.title}</p>
                        {t.assignedTo && (
                          <p className="text-[10px] text-neutral-400 mt-1">{t.assignedTo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 col): Team & Talent */}
        <div className="space-y-6">
          {/* Team Members */}
          <Card className="p-5 bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-neutral-500" />
                Team Roster ({startup.members?.length || 1})
              </h2>
              <Link href="/ecosystem">
                <Button size="sm" variant="ghost" className="text-xs text-brand-700">
                  + Recruit
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {(startup.members || []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                      {m.name ? m.name.charAt(0) : m.user?.name ? m.user.name.charAt(0) : "M"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">
                        {m.name || m.user?.name || "Member"}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {m.role || "COLLABORATOR"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" className="text-[10px]">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Hiring Needs Card */}
          <Card className="p-5 bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-neutral-500" />
                Hiring Needs ({hiringNeeds.length})
              </h2>
            </div>

            {hiringNeeds.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No active roles defined.</p>
            ) : (
              <div className="space-y-2.5">
                {hiringNeeds.map((hn) => (
                  <div key={hn.id} className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{hn.title}</span>
                      <Badge variant="blue" className="text-[9px]">
                        {hn.roleType || "FULL_TIME"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
