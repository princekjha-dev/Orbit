"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EducationItem {
  id: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startYear: number;
  endYear?: number | null;
  current: boolean;
}

export function EducationSection({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: EducationItem[];
}) {
  const [items, setItems] = useState<EducationItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    current: boolean;
  }>();

  const onAdd = async (data: any) => {
    const res = await fetch("/api/profile/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        startYear: Number(data.startYear),
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
      const res = await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
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
          <GraduationCap className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          Education
        </h2>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowForm((p) => !p)}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </Button>
      </div>

      <div className="space-y-3 mb-4">
        {items.map((edu) => (
          <div key={edu.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900">{edu.institution}</p>
              {edu.degree && <p className="text-xs text-neutral-500">{edu.degree}{edu.field && `, ${edu.field}`}</p>}
              <p className="text-xs text-neutral-400">
                {edu.startYear} – {edu.current ? "Present" : edu.endYear || ""}
              </p>
            </div>
            <button
              onClick={() => onDelete(edu.id)}
              disabled={isPending}
              className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded"
              aria-label="Delete education"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-neutral-400">No education added yet.</p>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onAdd)} className="space-y-3 pt-4 border-t border-neutral-100">
          <Input label="Institution" required {...register("institution", { required: true })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Degree" placeholder="e.g. B.E. Computer Science" {...register("degree")} />
            <Input label="Field of study" placeholder="e.g. Computer Science" {...register("field")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start year" type="number" required min={1990} max={2030} {...register("startYear", { required: true })} />
            <Input label="End year (leave blank if current)" type="number" min={1990} max={2035} {...register("endYear")} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
            <Button type="submit" size="sm" loading={isSubmitting}>Add education</Button>
          </div>
        </form>
      )}
    </Card>
  );
}
