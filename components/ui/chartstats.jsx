"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ChartStats({ chartData }) {
  if (!chartData || chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <defs>
          {/* Green: Mint (Gradienta style) */}
          <linearGradient id="gradient-accepted" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F260" />
            <stop offset="100%" stopColor="#0575E6" />
          </linearGradient>

          {/* Red: Bloody Mary Gradient */}
          <linearGradient id="gradient-rejected" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF416C" />
            <stop offset="100%" stopColor="#FF4B2B" />
          </linearGradient>

          {/* Yellow: Lemon Twist Vibe */}
          <linearGradient id="gradient-pending" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F9D423" />
            <stop offset="100%" stopColor="#FF4E50" />
          </linearGradient>
        </defs>

        <Bar dataKey="count">
          {chartData.map((entry, index) => (
            <Cell key={index} fill={`url(#gradient-${entry.status})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
