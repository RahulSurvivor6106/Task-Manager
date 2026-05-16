"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/validators";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const loginDefaults: LoginFormValues = { email: "", password: "" };
const signupDefaults: SignupFormValues = { name: "", email: "", password: "", role: "MEMBER", title: "" };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues: mode === "login" ? loginDefaults : signupDefaults,
  });

  async function onSubmit(values: LoginFormValues | SignupFormValues) {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong");
      }

      toast.success(mode === "login" ? "Welcome back" : "Account created");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const { register, handleSubmit, formState } = form;
  const errors = formState.errors as Record<string, { message?: string }>;

  return (
    <Card className="glass w-full max-w-xl border-white/10">
      <CardHeader>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="rounded-full text-white/70 hover:text-white">
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full text-white/70 hover:text-white">
            <Link href={mode === "login" ? "/signup" : "/login"}>
              {mode === "login" ? "Need signup?" : "Have login?"}
            </Link>
          </Button>
        </div>
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your workspace"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to review projects, update tasks, and check overdue work."
            : "Create your account and start managing team projects immediately."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          {mode === "signup" ? (
            <>
              <Field label="Name" error={errors.name?.message}>
                <Input placeholder="Avery Stone" {...register("name" as never)} />
              </Field>
              <Field label="Title" error={errors.title?.message}>
                <Textarea placeholder="Product Ops Lead" rows={2} {...register("title" as never)} />
              </Field>
            </>
          ) : null}

          <Field label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="name@company.com" {...register("email" as never)} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input type="password" placeholder="••••••••" {...register("password" as never)} />
          </Field>

          {mode === "signup" ? (
            <Field label="Role" error={errors.role?.message}>
              <select className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none ring-0 focus:ring-2 focus:ring-cyan-400" {...register("role" as never)}>
                <option value="MEMBER" className="bg-slate-950">Member</option>
                <option value="ADMIN" className="bg-slate-950">Admin</option>
              </select>
            </Field>
          ) : null}

          <Button type="submit" className="h-12 w-full rounded-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
          <Link className="text-cyan-300 hover:text-cyan-200" href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className={cn(error && "text-rose-200")}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}
