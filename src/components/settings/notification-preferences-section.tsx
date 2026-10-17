"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";

export function NotificationPreferencesSection() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    eventReminders: true,
    applicationUpdates: true,
    messageAlerts: true,
    communityActivity: true,
    mentorshipAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.preference) {
          setPrefs({
            emailNotifications: data.preference.emailNotifications,
            inAppNotifications: data.preference.inAppNotifications,
            eventReminders: data.preference.eventReminders,
            applicationUpdates: data.preference.applicationUpdates,
            messageAlerts: data.preference.messageAlerts,
            communityActivity: data.preference.communityActivity,
            mentorshipAlerts: data.preference.mentorshipAlerts,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const options: { key: keyof typeof prefs; title: string; desc: string }[] = [
    {
      key: "applicationUpdates",
      title: "Application Updates",
      desc: "Status changes for opportunities and project applications.",
    },
    {
      key: "mentorshipAlerts",
      title: "Mentorship & Advisory Requests",
      desc: "Incoming requests, scheduled session reminders, and follow-ups.",
    },
    {
      key: "eventReminders",
      title: "Event & Hackathon Deadlines",
      desc: "Calendar alerts for registered events and submission deadlines.",
    },
    {
      key: "messageAlerts",
      title: "Direct & Project Messages",
      desc: "New messages in active conversations and team channels.",
    },
    {
      key: "communityActivity",
      title: "Community Discussions",
      desc: "Replies to your posts and pinned announcements in joined communities.",
    },
    {
      key: "emailNotifications",
      title: "Email Digest",
      desc: "Periodic email summaries of critical actions and invitations.",
    },
    {
      key: "inAppNotifications",
      title: "In-App Notification Badge",
      desc: "Show unread activity badges across navigation.",
    },
  ];

  if (loading) {
    return <Card className="p-6 animate-pulse h-48 bg-white border border-neutral-200" />;
  }

  return (
    <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600" />
            Notification Preferences
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Choose what notifications you receive to avoid noise and focus on active collaboration.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="text-xs gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>

      <div className="divide-y divide-neutral-100">
        {options.map((opt) => (
          <div key={opt.key} className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-900">{opt.title}</p>
              <p className="text-[11px] text-neutral-500">{opt.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(opt.key)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs[opt.key] ? "bg-brand-600" : "bg-neutral-200"
              }`}
              role="switch"
              aria-checked={prefs[opt.key]}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  prefs[opt.key] ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
