"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceData } from "@/app/api/attendance/attendance"
import { CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DailyAttendanceProps {
  courseId: string;
  attendanceData: AttendanceData;
}

export function DailyAttendance({ courseId, attendanceData }: DailyAttendanceProps) {
  const dailyDetails = processDailyAttendance(attendanceData, courseId);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Log</CardTitle>
          <CardDescription>Detailed view of attendance by day and session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {dailyDetails.map((day) => (
              <div key={day.dateKey} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">
                    {day.date} ({day.day})
                  </h3>
                </div>

                <div className="grid gap-2">
                  {day.sessions.map((session, index) => {
                    if (!session.course) return null

                    let icon = <CheckCircle className="h-4 w-4 text-green-500" />
                    let statusColor = "bg-green-100 text-green-800 border-green-500"
                    let statusText = "Present"

                    if (session.status === "absent") {
                      icon = <XCircle className="h-4 w-4 text-red-500" />
                      statusColor = "bg-red-100 text-red-800 border-red-500"
                      statusText = "Absent"
                    } else if (session.status === "duty-leave") {
                      icon = <Clock className="h-4 w-4 text-blue-500" />
                      statusColor = "bg-blue-100 text-blue-800 border-blue-500"
                      statusText = "Duty Leave"
                    } else if (session.status === "no-class") {
                      return null
                    }

                    return (
                      <div
                        key={`${day.dateKey}-${session.session}`}
                        className="flex items-center justify-between p-2 rounded-md border"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium min-w-[30px]">{session.session}</div>
                          <div className="text-sm">{session.courseName}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`flex items-center gap-1 ${statusColor}`}>
                            {icon}
                            <span>{statusText}</span>
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {dailyDetails.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance data available for the selected course
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function processDailyAttendance(data: AttendanceData, courseId: string) {
  const dailyData = [];

  for (const dateKey of Object.keys(data.studentAttendanceData || {})) {
    const dateData = data.attendanceDatesArray[dateKey];
    if (!dateData) continue;

    const sessions = Object.entries(data.studentAttendanceData[dateKey])
      .map(([sessionId, attendance]) => {
        if (courseId !== "all" && attendance.course?.toString() !== courseId) {
          return null;
        }

        const session = data.sessions[sessionId];
        const course = attendance.course ? data.courses[attendance.course] : null;

        if (!session || !course) return null;

        let status = "no-class";
        if (attendance.attendance === 1) status = "present";
        else if (attendance.attendance === 0) status = "absent";
        else if (attendance.attendance === 2) status = "duty-leave";

        return {
          session: session.name,
          courseName: course.name,
          course: course,
          status
        };
      })
      .filter(Boolean);

    if (sessions.length > 0) {
      dailyData.push({
        dateKey,
        date: dateData.date,
        day: dateData.day,
        sessions
      });
    }
  }

  return dailyData.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
