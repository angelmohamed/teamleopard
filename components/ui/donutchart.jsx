'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function ApplicationDonutChart({ data }) {
  const filtered = data.filter((d) => d.count > 0)
  const total = filtered.reduce((sum, d) => sum + d.count, 0)

  const chartData = filtered.map((d) => ({
    name: d.label,
    value: d.count,
    percent: total ? ((d.count / total) * 100).toFixed(1) : 0
  }))

  // Define custom gradient IDs
  const gradients = {
    Accepted: 'url(#gradient-accepted)',
    Rejected: 'url(#gradient-rejected)',
    Pending: 'url(#gradient-pending)'
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="gradient-accepted" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" /> {/* emerald-500 */}
              <stop offset="100%" stopColor="#15803d" /> {/* emerald-700 */}
            </linearGradient>
            <linearGradient id="gradient-rejected" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" /> {/* red-400 */}
              <stop offset="100%" stopColor="#b91c1c" /> {/* red-700 */}
            </linearGradient>
            <linearGradient id="gradient-pending" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" /> {/* yellow-300 */}
              <stop offset="100%" stopColor="#b45309" /> {/* yellow-700 */}
            </linearGradient>
          </defs>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            label={({ name, percent }) => `${name} (${percent}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={gradients[entry.name] || '#ccc'}
              />
            ))}
          </Pie>

          <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />

          <Legend
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
