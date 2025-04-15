"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function AttendanceChart() {
  // This is placeholder data since we don't have the actual data structure
  // In a real implementation, you would process the actual data
  const data = useMemo(
    () => [
      { name: "CST204", present: 18, absent: 2, total: 20 },
      { name: "CBT204", present: 16, absent: 4, total: 20 },
      { name: "CST206", present: 15, absent: 3, total: 18 },
      { name: "HUT200", present: 12, absent: 2, total: 14 },
      { name: "MCN202", present: 10, absent: 1, total: 11 },
    ],
    [],
  )

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (name === "present") return [`${value} classes`, "Present"]
              if (name === "absent") return [`${value} classes`, "Absent"]
              return [value, name]
            }}
          />
          <Legend />
          <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
          <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
