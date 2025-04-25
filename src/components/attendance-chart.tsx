"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCourseCode } from "@/utils/formatter";
import { AttendanceReport } from "@/types";

interface AttendanceChartProps {
  attendanceData?: AttendanceReport;
}

export function AttendanceChart({ attendanceData }: AttendanceChartProps) {
  const data = useMemo(() => {
    if (
      !attendanceData ||
      !attendanceData.studentAttendanceData ||
      !attendanceData.courses
    ) {
      return [];
    }

    console.log("Attendance Data:", attendanceData);

    const courseAttendance: Record<
      string,
      { present: number; absent: number; total: number; name: string }
    > = {};

    interface CourseSession {
      course: number | null;
      attendance: number | null;
    }

    Object.entries(attendanceData.courses).forEach(([courseId, course]) => {
      const code = formatCourseCode(course.code);
      courseAttendance[courseId] = {
        present: 0,
        absent: 0,
        total: 0,
        name: code,
      };
    });

    Object.values(attendanceData.studentAttendanceData).forEach((dateData) => {
      Object.values(dateData).forEach((session: CourseSession) => {
        if (
          session.course !== null &&
          courseAttendance[session.course.toString()]
        ) {
          if (session.attendance === 110) {
            courseAttendance[session.course].present += 1;
            courseAttendance[session.course].total += 1;
          } else if (session.attendance === 111) {
            courseAttendance[session.course].absent += 1;
            courseAttendance[session.course].total += 1;
          } else if (session.attendance === 225) {
            courseAttendance[session.course].present += 1;
            courseAttendance[session.course].total += 1;
          }
        }
      });
    });

    return Object.values(courseAttendance)
      .filter((course) => course.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [attendanceData]);

  const getBarSize = () => {
    const courseCount = data.length;
    if (courseCount <= 5) return 40;
    if (courseCount <= 8) return 30;
    return 20;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barSize={getBarSize()}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            textAnchor="end"
            angle={-45}
            height={60}
          />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(9,9,11,255)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ fontWeight: "semibold", marginBottom: "5px" }}
            formatter={(value, name) => {
              const label =
                name === "present"
                  ? "Present"
                  : name === "absent"
                  ? "Absent"
                  : name;
              return [`${value} classes`, label];
            }}
            cursor={{ fill: "rgba(78, 78, 78, 0.25)" }}
          />
          <Legend />
          <Bar
            dataKey="present"
            stackId="a"
            fill="#10b981"
            name="Present"
            activeBar={{ fill: "#059669", stroke: "#059669", strokeWidth: 2 }}
          />
          <Bar
            dataKey="absent"
            stackId="a"
            fill="#ef4444"
            name="Absent"
            activeBar={{ fill: "#dc2626", stroke: "#dc2626", strokeWidth: 2 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
