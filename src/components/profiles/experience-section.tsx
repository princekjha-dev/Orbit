"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startMonth?: number | null;
  startYear: number;
  endMonth?: number | null;
  endYear?: number | null;
  current: boolean;
  description?: string | null;
}

export function ExperienceSection({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: ExperienceItem[];
}) {
  const [items, setItems] = useState<ExperienceItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    title: string;
    company: string;
    location: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    current: boolean;
    description: string;
  }>();

  const onAdd = async (data: any) => {
    const res = await fetch("/api/profile/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        startMonth: Number(data.startMonth) || null,
        startYear: Number(data.startYear),
        endMonth: Number(data.endMonth) || null,
        endYear: Number(data.endYear) || null,
      }),
    });
    const result = await res.json();
    if (res.ok) {
      setItems((prev) => [...prev, result]);
      setShowForm(false);
      reset();
      router.refresh();
    }
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/profile/experience/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          Experience
        </h2>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowForm((p) => !p)}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </Button>
      </div>

      <div className="space-y-3 mb-4">
        {items.map((exp) => (
          <div key={exp.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900">{exp.title}</p>
              <p className="text-xs text-neutral-500">{exp.company}</p>
              <p className="text-xs text-neutral-400">
                {exp.startYear} – {exp.current ? "Present" : exp.endYear || ""}
              </p>
            </div>
            <button
              onClick={() => onDelete(exp.id)}
              disabled={isPending}
              className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded"
              aria-label="Delete experience"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-neutral-400">No experience added yet.</p>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onAdd)} className="space-y-3 pt-4 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Job title" required {...register("title", { required: true })} />
            <Input label="Company" required {...register("company", { required: true })} />
          </div>
          <Input label="Location" placeholder="City, Country or Remote" {...register("location")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input label="Start month" type="number" min={1} max={12} placeholder="1–12" {...register("startMonth")} />
            <Input label="Start year" type="number" required min={1990} max={2030} {...register("startYear", { required: true })} />
            <Input label="End month" type="number" min={1} max={12} placeholder="1–12" {...register("endMonth")} />
            <Input label="End year" type="number" min={1990} max={2030} {...register("endYear")} />
          </div>
          <Textarea label="Description" rows={2} placeholder="Key responsibilities and achievements" {...register("description")} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
            <Button type="submit" size="sm" loading={isSubmitting}>Add experience</Button>
          </div>
        </form>
      )}
    </Card>
  );
}
