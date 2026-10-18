import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDotAvatar, getAvatarForName } from "@/lib/avatars";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileCheck2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Clock,
  Building,
} from "lucide-react";

/* ─── 1. OPPORTUNITY CARD ─────────────────────────────────────────────────── */

export interface OpportunityCardProps {
  id: string;
  title: string;
  organization: string;
  organizationSlug?: string;
  location?: string;
  type: string;
  workMode?: string;
  stipend?: string | null;
  skills?: string[];
  isVerified?: boolean;
  className?: string;
}

export function OpportunityCard({
  id,
  title,
  organization,
  organizationSlug,
  location,
  type,
  workMode,
  stipend,
  skills = [],
  isVerified = false,
  className,
}: OpportunityCardProps) {
  return (
    <Link
      href={`/opportunities/${id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          {/* Header row: Org & Type */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-medium text-[#6E6E73] truncate">
                {organization}
              </span>
              {isVerified && (
                <ShieldCheck className="h-3.5 w-3.5 text-[#0071E3] flex-shrink-0" />
              )}
            </div>
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
              {type.replace("_", " ")}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[12.5px] text-[#86868B]">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {workMode && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {workMode}
              </span>
            )}
            {stipend && (
              <span className="font-medium text-[#1D1D1F]">
                {stipend}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Skills tags & Arrow */}
        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73]"
              >
                {skill}
              </span>
            ))}
          </div>
          <span className="text-[12.5px] font-medium text-[#0071E3] flex items-center gap-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
            View <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── 2. PROJECT CARD ─────────────────────────────────────────────────────── */

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  category?: string;
  status?: string;
  membersCount?: number;
  openRolesCount?: number;
  className?: string;
}

export function ProjectCard({
  id,
  title,
  description,
  ownerName,
  category,
  status,
  membersCount,
  openRolesCount,
  className,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-3.5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
              {category || "Project Workspace"}
            </span>
            {status && (
              <span className="text-[11.5px] font-medium text-[#34C759]">
                {status}
              </span>
            )}
          </div>

          <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
            {title}
          </h3>

          <p className="text-[13.5px] text-[#6E6E73] line-clamp-2 mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[12px] text-[#86868B]">
          <span className="truncate">By {ownerName}</span>
          <div className="flex items-center gap-3 flex-shrink-0">
            {membersCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {membersCount}
              </span>
            )}
            {openRolesCount !== undefined && openRolesCount > 0 && (
              <span className="text-[#0071E3] font-medium">
                {openRolesCount} open role{openRolesCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── 3. EVENT CARD ───────────────────────────────────────────────────────── */

export interface EventCardProps {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location?: string;
  format?: string;
  category?: string;
  className?: string;
}

export function EventCard({
  id,
  title,
  organizer,
  date,
  location,
  format,
  category,
  className,
}: EventCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-3.5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
              {category || "Event"}
            </span>
            {format && (
              <span className="text-[11px] text-[#86868B] font-mono">
                {format}
              </span>
            )}
          </div>

          <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors line-clamp-2">
            {title}
          </h3>

          <p className="text-[13px] text-[#6E6E73] mt-1.5 truncate">
            Hosted by {organizer}
          </p>
        </div>

        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[12px] text-[#6E6E73]">
          <span className="flex items-center gap-1 font-medium text-[#1D1D1F]">
            <Calendar className="h-3.5 w-3.5 text-[#0071E3]" />
            {date}
          </span>
          {location && (
            <span className="truncate max-w-[120px] text-[#86868B]">
              {location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── 4. HACKATHON CARD ───────────────────────────────────────────────────── */

export interface HackathonCardProps {
  id: string;
  title: string;
  organizer: string;
  dates: string;
  prizePool?: string | null;
  mode?: string;
  teamsCount?: number;
  className?: string;
}

export function HackathonCard({
  id,
  title,
  organizer,
  dates,
  prizePool,
  mode,
  teamsCount,
  className,
}: HackathonCardProps) {
  return (
    <Link
      href={`/hackathons/${id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover relative overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
              Hackathon
            </span>
            {prizePool && (
              <span className="text-[12px] font-semibold text-[#FF9500] flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" />
                {prizePool}
              </span>
            )}
          </div>

          <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
            {title}
          </h3>

          <p className="text-[13px] text-[#6E6E73] mt-1">
            By {organizer}
          </p>
        </div>

        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[12px] text-[#86868B]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {dates}
          </span>
          {teamsCount !== undefined && (
            <span>{teamsCount} teams registered</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── 5. COMMUNITY CARD ───────────────────────────────────────────────────── */

export interface CommunityCardProps {
  slug: string;
  name: string;
  description: string;
  membersCount: number;
  isVerified?: boolean;
  category?: string;
  className?: string;
}

export function CommunityCard({
  slug,
  name,
  description,
  membersCount,
  isVerified = false,
  category,
  className,
}: CommunityCardProps) {
  return (
    <Link
      href={`/communities/${slug}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
              {category || "Community"}
            </span>
            {isVerified && (
              <ShieldCheck className="h-3.5 w-3.5 text-[#0071E3]" />
            )}
          </div>

          <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
            {name}
          </h3>

          <p className="text-[13px] text-[#6E6E73] line-clamp-2 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[12px] text-[#86868B]">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {membersCount} members
          </span>
          <span className="text-[#0071E3] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Enter space <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── 6. DOT CARD ─────────────────────────────────────────────────────────── */

const DOT_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  avis: ShieldCheck,
  scout: Compass,
  quill: FileCheck2,
  relay: MessageSquare,
};

export interface DotCardProps {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor?: string;
  avatarUrl?: string;
  className?: string;
}

export function DotCard({
  id,
  name,
  role,
  description,
  capabilities,
  status = "Active",
  icon,
  accentColor = "#0071E3",
  avatarUrl,
  className,
}: DotCardProps) {
  const avatar = avatarUrl || getDotAvatar(id) || getDotAvatar(name);
  const Icon = icon || (id ? DOT_ICONS[id.toLowerCase()] : null) || Sparkles;
  return (
    <Link
      href={`/dots/${id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-6 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover relative overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 border border-[#E5E5EA] flex-shrink-0"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon className="h-4 w-4" style={{ color: accentColor }} />
                )}
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">
                  {name}
                </h3>
                <p className="text-[11.5px] font-medium text-[#6E6E73]">
                  {role}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E8F8EE] text-[#1D7F3E] border border-[#C1EAD0]">
              {status}
            </span>
          </div>

          <p className="text-[13.5px] text-[#6E6E73] leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#F0F0F2]">
          <div className="flex flex-wrap gap-1.5">
            {capabilities.slice(0, 3).map((cap) => (
              <span
                key={cap}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73]"
              >
                {cap}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[13px] font-medium text-[#0071E3]">
            <span>Open Dot Workspace</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── 7. PROFILE HEADER ───────────────────────────────────────────────────── */

export interface ProfileHeaderProps {
  name: string;
  role?: string;
  headline?: string;
  location?: string;
  avatarUrl?: string | null;
  skills?: string[];
  isVerified?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileHeader({
  name,
  role,
  headline,
  location,
  avatarUrl,
  skills = [],
  isVerified = false,
  actions,
  className,
}: ProfileHeaderProps) {
  const resolvedAvatar = avatarUrl || getAvatarForName(name);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] overflow-hidden flex items-center justify-center flex-shrink-0 text-xl font-semibold text-[#1D1D1F]">
            {resolvedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedAvatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
                {name}
              </h1>
              {isVerified && (
                <span title="Verified Account">
                  <ShieldCheck className="h-5 w-5 text-[#0071E3]" />
                </span>
              )}
            </div>

            {headline && (
              <p className="text-[14.5px] sm:text-[15.5px] text-[#6E6E73]">
                {headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[12.5px] text-[#86868B]">
              {role && <span className="font-medium text-[#1D1D1F]">{role}</span>}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 self-stretch sm:self-center">
            {actions}
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#F0F0F2] flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="text-[11.5px] px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[#48484A] border border-[#E5E5EA]"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 8. STARTUP CARD ─────────────────────────────────────────────────────── */

export interface StartupCardProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  industry?: string;
  stage?: string;
  location?: string | null;
  membersCount?: number;
  hiringCount?: number;
  logo?: string | null;
  className?: string;
}

export function StartupCard({
  id,
  slug,
  name,
  description,
  industry,
  stage,
  location,
  membersCount = 1,
  hiringCount = 0,
  logo,
  className,
}: StartupCardProps) {
  return (
    <Link
      href={`/startups/${slug || id}`}
      className={cn(
        "group block rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#D1D1D6] hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col h-full justify-between space-y-3.5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
              {industry || "Startup"}
            </span>
            {stage && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                {stage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="h-8 w-8 rounded-lg bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center font-semibold text-[#1D1D1F] text-xs flex-shrink-0">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={name} className="h-full w-full object-cover rounded-lg" />
              ) : (
                name.slice(0, 2).toUpperCase()
              )}
            </div>
            <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors truncate">
              {name}
            </h3>
          </div>

          <p className="text-[13.5px] text-[#6E6E73] line-clamp-2 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[12px] text-[#86868B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {membersCount} {membersCount === 1 ? "member" : "members"}
            </span>
            {location && (
              <span className="flex items-center gap-1 truncate max-w-[110px]">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
          </div>
          {hiringCount > 0 ? (
            <span className="text-[#34C759] font-medium text-[11.5px] flex items-center gap-1">
              Hiring ({hiringCount})
            </span>
          ) : (
            <span className="text-[#0071E3] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Explore <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
