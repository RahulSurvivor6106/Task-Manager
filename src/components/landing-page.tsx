"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, Layers3, ShieldCheck, Sparkles, Workflow, Users, ListFilter, Settings2 } from "lucide-react";
import AnimatedAI from "@/components/animated-ai";
import { Button, Card } from "@/components/ui";

const features = [
  {
    icon: Workflow,
    title: "Project workflows",
    description: "Plan work across teams with structured projects, member assignment, and status-aware task tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Secure auth + RBAC",
    description: "JWT sessions, protected routes, admin/member permissions, and data validation on every request.",
  },
  {
    icon: BarChart3,
    title: "Analytics that matter",
    description: "Dashboards highlight overdue tasks, completion rate, throughput, and active project health.",
  },
];

const moreFeatures = [
  { icon: CheckCircle2, title: "Smart notifications", description: "Stay on top of blockers and mentions with configurable alerts." },
  { icon: Layers3, title: "Projects", description: "Create projects, set milestones, and track delivery progress across teams." },
  { icon: Users, title: "Team management", description: "Invite members, assign roles, and manage team membership and permissions." },
  { icon: ListFilter, title: "Kanban workflows", description: "Drag-and-drop task boards, swimlanes, and quick filters for daily work." },
  { icon: Settings2, title: "Workspace settings", description: "Configure integrations, notification preferences, and billing for your workspace." },
  { icon: Sparkles, title: "Customizable UI", description: "Flexible components and themes to match your brand and workflow." },
];

const testimonials = [
  { name: "Avery Stone", title: "VP Product", quote: "Team Task Manager helped us cut overdue work by 40% and ship predictably." },
  { name: "Jordan Lee", title: "Engineering Lead", quote: "Clear ownership and real-time Kanban made collaboration seamless." },
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,#050816_0%,#090b1f_52%,#050816_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Task Manager</p>
            <p className="text-xs text-white/55">Linear-grade ops for fast-moving teams</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Link href="/signup">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.06fr_0.94fr] lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl xl:text-7xl">
              Manage projects, tasks, and team flow with a premium SaaS workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              Built for admins and members to collaborate on projects, move tasks through Kanban stages,
              spot overdue work early, and monitor productivity with a responsive analytics dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-cyan-200">
                <Link href="/dashboard">
                  Open dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/login">View auth flow</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Role-based access", "Admin and member permissions"],
                ["Drag and drop", "Move cards across task states"],
                ["Analytics", "Overdue, throughput, and trends"],
              ].map(([title, description]) => (
                <Card key={title} className="border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{description}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.08 }} className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
            <Card className="overflow-hidden border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["14", "Active projects", BarChart3],
                  ["36", "Open tasks", Layers3],
                  ["7", "Overdue tasks", CheckCircle2],
                  ["98%", "On-time rate", ShieldCheck],
                ].map(([value, label, Icon]) => (
                  <div key={label as string} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-white/55">
                      <span className="text-sm">{label as string}</span>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-6 text-4xl font-semibold tracking-tight text-white">{value as string}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-sky-500/10 to-fuchsia-400/10 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Live workflow</p>
                <div className="mt-4 grid gap-3">
                  {[
                    ["Design system refresh", "In Progress", "Maya"],
                    ["Quarterly roadmap", "Blocked", "Alex"],
                    ["Launch checklist", "Done", "Nina"],
                  ].map(([title, status, owner]) => (
                    <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{title}</p>
                        <p className="text-sm text-white/55">Owner: {owner}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan-100">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        <section className="mx-auto mt-8 max-w-5xl px-4">
          <h3 className="text-2xl font-semibold text-white">Why teams choose us</h3>
          <p className="mt-2 text-white/70">Powerful features built for small teams and growing organisations.</p>

          <div className="relative mt-6">
            <AnimatedAI />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {features.concat(moreFeatures).map((f, idx) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * idx }} whileHover={{ scale: 1.02 }}>
                  <Card className="border-white/6 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white/6 p-2 text-cyan-300">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{f.title}</p>
                        <p className="mt-1 text-sm text-white/60">{f.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {testimonials.map((t) => (
              <Card key={t.name} className="rounded-2xl border-white/10 bg-white/5 p-6">
                <p className="text-lg text-white/90">“{t.quote}”</p>
                <p className="mt-4 text-sm text-white/60">— {t.name}, {t.title}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/6 to-sky-500/6 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-2xl font-semibold text-white">Start managing your team better</h4>
                <p className="mt-1 text-white/70">Free plan available — upgrade for advanced analytics and admin controls.</p>
              </div>
              <div className="flex gap-3">
                <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-cyan-200">
                  <Link href="/signup">Get started — it's free</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 w-full border-t border-white/6 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-lg font-semibold text-white">Team Task Manager</p>
                <p className="text-sm text-white/60">Built for teams — open, simple, and secure.</p>
              </div>
              <div className="flex gap-4 text-sm text-white/60">
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
