"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceData } from "@/app/api/attendance/attendance"
import { CheckCircle, XCircle, Calendar } from "lucide-react"

interface AttendanceSummaryProps {
  courseId: string;
  attendanceData: AttendanceData;
}

export function AttendanceSummary({ courseId, attendanceData }: AttendanceSummaryProps) {
  const summary = calculateSummary(attendanceData, courseId);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.percentage}%</div>
          <p className="text-xs text-muted-foreground">Overall attendance percentage</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.present}</div>
          <p className="text-xs text-muted-foreground">Classes attended</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.absent}</div>
          <p className="text-xs text-muted-foreground">Classes missed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total}</div>
          <p className="text-xs text-muted-foreground">Total scheduled classes</p>
        </CardContent>
      </Card>
    </>
  )
}

function calculateSummary(data: AttendanceData, courseId: string) {
  let present = 0, absent = 0, total = 0;

  Object.values(data.studentAttendanceData || {}).forEach(sessions => {
    Object.entries(sessions).forEach(([sessionId, attendance]) => {
      if (courseId === "all" || attendance.course?.toString() === courseId) {
        if (attendance.attendance !== null) {
          total++;
          if (attendance.attendance === 1) present++;
          else absent++;
        }
      }
    });
  });

  return {
    present,
    absent,
    total,
    percentage: total ? Math.round((present / total) * 100) : 0
  };
}
