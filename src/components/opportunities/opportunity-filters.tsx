"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function OpportunityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/opportunities?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/opportunities");
  }, [router]);

  const hasFilters =
    searchParams.get("q") ||
    searchParams.get("type") ||
    searchParams.get("mode") ||
    searchParams.get("location");

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search jobs, skills, organizations..."
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => {
              if (e.target.value.length > 2 || e.target.value === "") {
                updateFilter("q", e.target.value);
              }
            }}
            aria-label="Search opportunities"
          />
        </div>
        <div className="flex gap-2">
          <Select
            defaultValue={searchParams.get("type") || "all"}
            onChange={(e) => updateFilter("type", e.target.value)}
            aria-label="Filter by type"
            className="w-36"
          >
            <option value="all">All types</option>
            <option value="JOB">Jobs</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="PAID_PROJECT">Paid projects</option>
            <option value="STARTUP_ROLE">Startup roles</option>
          </Select>
          <Select
            defaultValue={searchParams.get("mode") || "all"}
            onChange={(e) => updateFilter("mode", e.target.value)}
            aria-label="Filter by work mode"
            className="w-32"
          >
            <option value="all">All modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="md"
              onClick={clearFilters}
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
