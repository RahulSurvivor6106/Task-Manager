"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { AdminStats } from "@/lib/contracts";

export default function AdminChart({ stats }: { stats: AdminStats }) {
  const data = stats.users.slice(0, 10).map((u) => ({ name: u.name, tasks: u.totalTasks, completed: u.completedTasks }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: '#fff' }} />
          <YAxis tick={{ fill: '#fff' }} />
          <Tooltip />
          <Bar dataKey="tasks" fill="#22d3ee" />
          <Bar dataKey="completed" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
