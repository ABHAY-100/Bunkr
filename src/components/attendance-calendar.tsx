"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AttendanceCalendarProps {
  attendanceData: any
}

export function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  if (!attendanceData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  // Function to determine if a date has attendance data
  const hasAttendanceData = (date: Date) => {
    if (!attendanceData || !attendanceData.studentAttendanceData) return false

    // Format date to match the format in the API response (YYYYMMDD)
    const formattedDate = format(date, "yyyyMMdd")
    return !!attendanceData.studentAttendanceData[formattedDate]
  }

  // Function to get attendance status for a date
  const getAttendanceStatus = (date: Date) => {
    if (!attendanceData || !attendanceData.studentAttendanceData) return null

    const formattedDate = format(date, "yyyyMMdd")
    const dateData = attendanceData.studentAttendanceData[formattedDate]

    if (!dateData) return null

    // Check if any session has attendance marked as present (110)
    const hasPresent = Object.values(dateData).some((session: any) => session.attendance === 110)

    // Check if any session has attendance marked as absent (111)
    const hasAbsent = Object.values(dateData).some((session: any) => session.attendance === 111)

    if (hasPresent && hasAbsent) return "partial"
    if (hasPresent) return "present"
    if (hasAbsent) return "absent"

    return null
  }

  // Function to get class count for a date
  const getClassCount = (date: Date) => {
    if (!attendanceData || !attendanceData.studentAttendanceData) return 0

    const formattedDate = format(date, "yyyyMMdd")
    const dateData = attendanceData.studentAttendanceData[formattedDate]

    if (!dateData) return 0

    // Count sessions with course data
    return Object.values(dateData).filter((session: any) => session.course).length
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            present: (date) => getAttendanceStatus(date) === "present",
            absent: (date) => getAttendanceStatus(date) === "absent",
            partial: (date) => getAttendanceStatus(date) === "partial",
            hasClasses: (date) => getClassCount(date) > 0,
          }}
          modifiersClassNames={{
            present: "bg-green-100 text-green-900 font-bold",
            absent: "bg-red-100 text-red-900 font-bold",
            partial: "bg-yellow-100 text-yellow-900 font-bold",
            hasClasses: "border-primary",
          }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm">Partial</span>
        </div>
      </div>

      {date && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">{format(date, "EEEE, MMMM d, yyyy")}</h3>

              {hasAttendanceData(date) ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Attendance for this day:</p>

                  {Object.entries(attendanceData.studentAttendanceData[format(date, "yyyyMMdd")] || {}).map(
                    ([sessionId, sessionData]: [string, any]) => {
                      if (!sessionData.course) return null

                      const courseName = attendanceData.courses[sessionData.course]?.name || "Unknown Course"
                      const sessionName = attendanceData.sessions[sessionId]?.name || "Unknown Session"
                      const attendanceType = attendanceData.attendanceTypes[sessionData.attendance]?.name || "Unknown"
                      const attendanceColor =
                        sessionData.attendance === 110
                          ? "bg-green-100 text-green-800"
                          : sessionData.attendance === 111
                            ? "bg-red-100 text-red-800"
                            : sessionData.attendance === 112
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"

                      return (
                        <div key={sessionId} className="flex items-center justify-between py-1">
                          <div>
                            <p className="font-medium text-sm">{courseName}</p>
                            <p className="text-xs text-muted-foreground">Session {sessionName}</p>
                          </div>
                          <Badge className={attendanceColor}>{attendanceType}</Badge>
                        </div>
                      )
                    },
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attendance data for this day.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
