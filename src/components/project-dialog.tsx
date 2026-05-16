"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { projectSchema } from "@/lib/validators";
import type { z } from "zod";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Label, Textarea, Button } from "@/components/ui";

type ProjectFormValues = z.input<typeof projectSchema>;

export default function ProjectDialog({ defaultValues, teams, onSave }: { defaultValues?: Partial<ProjectFormValues>; teams: { id: string; name: string }[]; onSave: (values: ProjectFormValues) => Promise<void> }) {
  const { register, handleSubmit, formState } = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema) as never, defaultValues: defaultValues as any });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create project</DialogTitle>
        <DialogDescription>Provide basic project details. Only admins can create projects.</DialogDescription>
      </DialogHeader>

      <form className="grid gap-4" onSubmit={handleSubmit(async (values) => await onSave(values))}>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input {...register("name" as never)} placeholder="Website revamp" />
          {formState.errors.name ? <p className="text-xs text-rose-200">{String(formState.errors.name.message)}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label>Key</Label>
          <Input {...register("key" as never)} placeholder="WEBSITE" />
          {formState.errors.key ? <p className="text-xs text-rose-200">{String(formState.errors.key.message)}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label>Team</Label>
          <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("teamId" as never)}>
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-950">{t.name}</option>
            ))}
          </select>
          {formState.errors.teamId ? <p className="text-xs text-rose-200">{String(formState.errors.teamId.message)}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea {...register("description" as never)} placeholder="Short description" rows={3} />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <Label>Status</Label>
            <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" {...register("status" as never)}>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <Label>Color</Label>
            <Input {...register("color" as never)} type="color" className="h-11 w-full rounded-2xl p-1" />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="submit">Create project</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
