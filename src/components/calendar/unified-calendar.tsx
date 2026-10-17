"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  ExternalLink,
  Trash2,
  Filter,
} from "lucide-react";

interface CalendarItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  startTime: string;
  endTime?: string | null;
  isAllDay: boolean;
  isCompleted: boolean;
  link?: string | null;
  isEditable: boolean;
  source: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  INTERVIEW: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  APPLICATION_DEADLINE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  PROJECT_DEADLINE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  EVENT: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  HACKATHON: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  TEAM_MEETING: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  MENTORSHIP_SESSION: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  REMINDER: { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200" },
  STARTUP_MILESTONE: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
};

export function UnifiedCalendar() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal / Form for creating custom reminder/event
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("REMINDER");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("10:00");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        typeFilter === "ALL"
          ? "/api/calendar"
          : `/api/calendar?type=${typeFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmitting(true);

    try {
      const startTime = new Date(`${newDate}T${newTime}:00`).toISOString();
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          startTime,
          description: newDescription || undefined,
          isAllDay: false,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setIsCreating(false);
        await fetchEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (event: CalendarItem) => {
    if (!event.isEditable) return;
    try {
      const res = await fetch(`/api/calendar/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !event.isCompleted }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id ? { ...e, isCompleted: !e.isCompleted } : e
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Date Navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const resetToday = () => setCurrentDate(new Date());

  // Month grid calculations
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-brand-600" />
            Smart Orbit Calendar
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Unified schedule combining deadlines, interviews, events, advisory sessions, and milestones.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs gap-1.5 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Close Form" : "Add Reminder"}
        </Button>
      </div>

      {/* Creation Drawer / Inline Form */}
      {isCreating && (
        <Card className="p-4 bg-white border border-neutral-200 shadow-xs">
          <form onSubmit={handleCreate} className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Add Personal Calendar Entry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (e.g. Prep interview with founder)..."
                className="sm:col-span-2 text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="REMINDER">Personal Reminder</option>
                <option value="INTERVIEW">Interview</option>
                <option value="TEAM_MEETING">Team Meeting</option>
                <option value="APPLICATION_DEADLINE">Deadline</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="text-xs border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Notes, agenda, or context..."
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !newTitle}
                className="text-xs"
              >
                {submitting ? "Saving..." : "Save to Calendar"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Control bar: Navigation, Views, and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={prevPeriod} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={nextPeriod} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetToday} className="text-xs h-8">
            Today
          </Button>
          <span className="font-bold text-neutral-900 text-sm ml-2">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              ...(view === "day" ? { day: "numeric" } : {}),
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggles */}
          <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  view === v
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="PROJECT_DEADLINE">Project Deadlines</option>
            <option value="EVENT">Events</option>
            <option value="MENTORSHIP_SESSION">Mentorship Sessions</option>
            <option value="STARTUP_MILESTONE">Startup Milestones</option>
            <option value="INTERVIEW">Interviews</option>
            <option value="REMINDER">Personal Reminders</option>
          </select>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <Card className="p-0 overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-xs font-bold text-neutral-600 py-2.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100">
            {monthDays.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split("T")[0];
              const dayEvents = events.filter((e) => e.startTime.startsWith(dateStr));
              const isToday =
                new Date().toDateString() === cell.date.toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? "bg-white" : "bg-neutral-50/50 text-neutral-400"
                  } ${isToday ? "bg-brand-50/20" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center ${
                        isToday
                          ? "bg-brand-600 text-white"
                          : cell.isCurrentMonth
                          ? "text-neutral-900"
                          : "text-neutral-400"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                    {dayEvents.slice(0, 3).map((item) => {
                      const colors = TYPE_COLORS[item.type] || TYPE_COLORS.REMINDER;
                      return (
                        <div
                          key={item.id}
                          className={`text-[10px] p-1 rounded border leading-tight truncate font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                          title={`${item.title} (${item.type})`}
                        >
                          {item.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] text-neutral-400 font-semibold text-center">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Agenda View */}
      {view === "agenda" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              title="No upcoming events or deadlines"
              description="Your calendar is clean. Deadlines, advisory sessions, and registered events will appear here automatically."
              action={
                <Button size="sm" onClick={() => setIsCreating(true)}>
                  Add a Reminder
                </Button>
              }
              className="py-12 bg-white rounded-xl border border-neutral-200"
            />
          ) : (
            <div className="space-y-3">
              {events.map((ev) => {
                const colors = TYPE_COLORS[ev.type] || TYPE_COLORS.REMINDER;
                return (
                  <Card
                    key={ev.id}
                    className={`p-4 bg-white border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                      ev.isCompleted ? "opacity-60 bg-neutral-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-center shrink-0 w-12 py-1 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">
                          {new Date(ev.startTime).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="text-base font-bold text-neutral-900 leading-none mt-0.5">
                          {new Date(ev.startTime).getDate()}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {ev.type.replace("_", " ")}
                          </span>
                          {ev.isCompleted && (
                            <Badge variant="green" className="text-[10px]">
                              Completed
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {ev.title}
                        </p>

                        {ev.description && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {ev.description}
                          </p>
                        )}

                        <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {new Date(ev.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.link && (
                        <Link
                          href={ev.link}
                          className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}

                      {ev.isEditable && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleComplete(ev)}
                            className="text-xs gap-1"
                          >
                            <CheckCircle
                              className={`h-3.5 w-3.5 ${
                                ev.isCompleted ? "text-emerald-600" : "text-neutral-400"
                              }`}
                            />
                            {ev.isCompleted ? "Done" : "Mark Done"}
                          </Button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Delete reminder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
