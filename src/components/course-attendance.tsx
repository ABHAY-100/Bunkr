"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceData } from "@/app/api/attendance/attendance"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CourseAttendanceProps {
  courseId: string;
  attendanceData: AttendanceData;
  coursesData: any; // Add proper type from your API
}

export function CourseAttendance({ courseId, attendanceData, coursesData }: CourseAttendanceProps) {
  const courseAttendance = calculateCourseAttendance(attendanceData);

  // Filter by selected course if needed
  const filteredCourses =
    courseId === "all"
      ? Object.entries(courseAttendance)
      : Object.entries(courseAttendance).filter(([id]) => id === courseId);

  // Prepare data for chart
  const chartData = filteredCourses.map(([id, data]) => {
    const course = coursesData[id];
    return {
      name: course.code,
      fullName: course.name,
      present: data.present,
      absent: data.absent,
      dutyLeave: data.dutyLeave,
      percentage: data.percentage,
    };
  });

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Course-wise Attendance</CardTitle>
          <CardDescription>Attendance percentage by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "percentage") return [`${value}%`, "Attendance"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find((item) => item.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Legend />
                <Bar dataKey="percentage" fill="#10b981" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredCourses.map(([id, data]) => {
          const course = coursesData[id];
          return (
            <Card key={id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{course.name}</CardTitle>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{data.percentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {data.present} / {data.total} classes
                  </div>
                </div>
                <Progress
                  value={data.percentage}
                  className="h-2 mt-2"
                  indicatorClassName={data.percentage >= 75 ? "bg-green-500" : "bg-red-500"}
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Present</div>
                    <div className="text-lg font-bold text-green-500">{data.present}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Absent</div>
                    <div className="text-lg font-bold text-red-500">{data.absent}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Duty Leave</div>
                    <div className="text-lg font-bold text-blue-500">{data.dutyLeave}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function calculateCourseAttendance(data: AttendanceData) {
  const courseStats: Record<string, { present: number; absent: number; dutyLeave: number; total: number; percentage: number }> = {};

  Object.values(data.studentAttendanceData || {}).forEach(sessions => {
    Object.values(sessions).forEach(attendance => {
      if (!attendance.course) return;
      
      const courseId = attendance.course.toString();
      if (!courseStats[courseId]) {
        courseStats[courseId] = { present: 0, absent: 0, dutyLeave: 0, total: 0, percentage: 0 };
      }

      if (attendance.attendance === 1) courseStats[courseId].present++;
      else if (attendance.attendance === 0) courseStats[courseId].absent++;
      else if (attendance.attendance === 2) courseStats[courseId].dutyLeave++;

      courseStats[courseId].total++;
    });
  });

  // Calculate percentages
  Object.values(courseStats).forEach(stats => {
    stats.percentage = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
  });

  return courseStats;
}
