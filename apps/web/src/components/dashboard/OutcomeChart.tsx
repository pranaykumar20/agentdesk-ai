"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function OutcomeChart({
  data,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-4 sm:flex-row">
      <div className="h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.fill }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-medium text-foreground">
              {entry.value.toLocaleString()} ({total ? ((entry.value / total) * 100).toFixed(1) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
