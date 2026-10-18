"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Lock,
  SunMoon,
  Link2,
  Check,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Mail,
  Smartphone,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppleSettingsViewProps {
  user: any;
  profile: any;
}

export function AppleSettingsView({ user, profile }: AppleSettingsViewProps) {
  const [activeSection, setActiveSection] = useState<
    "account" | "security" | "notifications" | "privacy" | "appearance" | "connected"
  >("account");

  // State toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [opportunityDigest, setOpportunityDigest] = useState(true);
  const [publicPassport, setPublicPassport] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "appearance", label: "Appearance", icon: SunMoon },
    { id: "connected", label: "Connected Accounts", icon: Link2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left List Navigation (Apple System Settings style) */}
      <div className="md:col-span-4 rounded-2xl border border-[#E5E5EA] bg-white p-2 shadow-xs space-y-0.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors text-left",
                isActive
                  ? "bg-[#0071E3] text-white"
                  : "text-[#1D1D1F] hover:bg-[#F5F5F7]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-white" : "text-[#6E6E73]"
                  )}
                />
                <span>{sec.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 opacity-60",
                  isActive ? "text-white" : "text-[#86868B]"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Right List-Based Content Pane */}
      <div className="md:col-span-8 space-y-6">
        {savedNotice && (
          <div className="p-3 rounded-xl bg-[#E8F8EE] border border-[#C1EAD0] text-xs font-semibold text-[#1D7F3E] flex items-center gap-2 animate-fade-in">
            <Check className="h-4 w-4" /> Preferences updated successfully.
          </div>
        )}

        {/* 1. ACCOUNT */}
        {activeSection === "account" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Account Settings
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Your primary Orbit identity and profile information.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Full Name</p>
                <p className="text-xs text-[#6E6E73]">{user.name || "Member"}</p>
              </div>
              <Link href="/profile" className="text-xs text-[#0071E3] font-medium hover:underline">
                Edit
              </Link>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Email Address</p>
                <p className="text-xs text-[#6E6E73]">{user.email}</p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E8F8EE] text-[#1D7F3E]">
                Verified
              </span>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Primary Role</p>
                <p className="text-xs text-[#6E6E73]">
                  {user.orbitRole || user.role || "Talent"}
                </p>
              </div>
              <span className="text-xs text-[#86868B]">Standard Tier</span>
            </div>
          </div>
        )}

        {/* 2. SECURITY */}
        {activeSection === "security" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Security & Authentication
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Protect your account credentials and sessions.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Password</p>
                <p className="text-xs text-[#6E6E73]">Managed via secure Supabase authentication</p>
              </div>
              <Link href="/forgot-password">
                <Button size="sm" variant="outline">Reset Password</Button>
              </Link>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Active Sessions</p>
                <p className="text-xs text-[#6E6E73]">Current browser session authenticated</p>
              </div>
              <span className="text-xs font-semibold text-[#34C759]">Active</span>
            </div>
          </div>
        )}

        {/* 3. NOTIFICATIONS */}
        {activeSection === "notifications" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Notification Preferences
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Control message routing and email notifications.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Opportunity Alerts</p>
                <p className="text-xs text-[#6E6E73]">Receive matches scored &gt;85% fit by Scout</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  triggerSaveNotice();
                }}
                className="h-4 w-4 rounded accent-[#0071E3] cursor-pointer"
              />
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Weekly Project Digest</p>
                <p className="text-xs text-[#6E6E73]">Milestone reviews and deliverable acceptance proofs</p>
              </div>
              <input
                type="checkbox"
                checked={opportunityDigest}
                onChange={(e) => {
                  setOpportunityDigest(e.target.checked);
                  triggerSaveNotice();
                }}
                className="h-4 w-4 rounded accent-[#0071E3] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. PRIVACY */}
        {activeSection === "privacy" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Privacy & Data
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Control public visibility of your profile and evidence passport.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Public Evidence Passport</p>
                <p className="text-xs text-[#6E6E73]">Allow partner organizations to verify SHA-256 deliverable proofs</p>
              </div>
              <input
                type="checkbox"
                checked={publicPassport}
                onChange={(e) => {
                  setPublicPassport(e.target.checked);
                  triggerSaveNotice();
                }}
                className="h-4 w-4 rounded accent-[#0071E3] cursor-pointer"
              />
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Search Engine Indexing</p>
                <p className="text-xs text-[#6E6E73]">Exclude public profile from web search crawlers</p>
              </div>
              <span className="text-xs text-[#86868B]">Protected by default</span>
            </div>
          </div>
        )}

        {/* 5. APPEARANCE */}
        {activeSection === "appearance" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Appearance & Accessibility
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Interface aesthetics and motion accessibility.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Color Scheme</p>
                <p className="text-xs text-[#6E6E73]">Apple Light with subtle dynamic atmospheric illumination</p>
              </div>
              <span className="text-xs font-medium text-[#1D1D1F] px-2 py-1 rounded bg-[#F5F5F7] border border-[#E5E5EA]">
                Apple Light
              </span>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-[#1D1D1F]">Reduced Motion</p>
                <p className="text-xs text-[#6E6E73]">Disable parallax, large transitions, and ambient animations</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => {
                  setReducedMotion(e.target.checked);
                  triggerSaveNotice();
                }}
                className="h-4 w-4 rounded accent-[#0071E3] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 6. CONNECTED ACCOUNTS */}
        {activeSection === "connected" && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-xs divide-y divide-[#F0F0F2]">
            <div className="p-5">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Connected Accounts
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Integrations for verifiable code evidence and OAuth.
              </p>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-[#1D1D1F]" />
                <div>
                  <p className="text-[13.5px] font-medium text-[#1D1D1F]">GitHub</p>
                  <p className="text-xs text-[#6E6E73]">Link repositories for practical code evidence</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#0071E3]" />
                <div>
                  <p className="text-[13.5px] font-medium text-[#1D1D1F]">Google Authentication</p>
                  <p className="text-xs text-[#6E6E73]">Single Sign-On enabled</p>
                </div>
              </div>
              <span className="text-xs text-[#34C759] font-medium">Connected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
