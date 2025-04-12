"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceData } from "@/app/api/attendance/attendance"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface CalendarViewProps {
  courseId: string;
  attendanceData: AttendanceData;
}

export function CalendarView({ courseId, attendanceData }: CalendarViewProps) {
  const calendarData = processCalendarData(attendanceData, courseId);

  // Group by month
  const months: Record<string, Array<{ key: string; date: string; day: string; status: string; classes: number }>> = {}

  Object.entries(calendarData).forEach(([dateKey, data]) => {
    // Extract month from dateKey (format: YYYYMMDD)
    const year = dateKey.substring(0, 4)
    const month = dateKey.substring(4, 6)
    const monthKey = `${year}-${month}`

    if (!months[monthKey]) {
      months[monthKey] = []
    }

    months[monthKey].push({
      key: dateKey,
      date: data.date,
      day: data.day,
      status: data.status,
      classes: data.classes,
    })
  })

  // Sort months in descending order
  const sortedMonths = Object.keys(months).sort((a, b) => b.localeCompare(a))

  // Get month name
  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    return date.toLocaleString("default", { month: "long", year: "numeric" })
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Absent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-sm">Duty Leave</span>
        </div>
      </div>

      {sortedMonths.map((monthKey) => (
        <Card key={monthKey}>
          <CardHeader>
            <CardTitle>{getMonthName(monthKey)}</CardTitle>
            <CardDescription>Attendance calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="text-xs font-medium">Sun</div>
              <div className="text-xs font-medium">Mon</div>
              <div className="text-xs font-medium">Tue</div>
              <div className="text-xs font-medium">Wed</div>
              <div className="text-xs font-medium">Thu</div>
              <div className="text-xs font-medium">Fri</div>
              <div className="text-xs font-medium">Sat</div>

              {/* Generate calendar grid */}
              {generateCalendarGrid(monthKey, months[monthKey])}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function processCalendarData(data: AttendanceData, courseId: string) {
  const calendar: Record<string, { date: string; day: string; status: string; classes: number }> = {};

  Object.entries(data.studentAttendanceData || {}).forEach(([date, sessions]) => {
    const dateObj = data.attendanceDatesArray[date];
    if (!dateObj) return;

    let dayPresent = 0, dayAbsent = 0, dayDutyLeave = 0;
    
    Object.values(sessions).forEach(attendance => {
      if (courseId === "all" || attendance.course?.toString() === courseId) {
        if (attendance.attendance === 1) dayPresent++;
        else if (attendance.attendance === 0) dayAbsent++;
        else if (attendance.attendance === 2) dayDutyLeave++;
      }
    });

    const totalClasses = dayPresent + dayAbsent + dayDutyLeave;
    if (totalClasses > 0) {
      calendar[date] = {
        date: dateObj.date,
        day: dateObj.day,
        status: dayPresent > dayAbsent ? 'present' : 
               dayDutyLeave > dayPresent && dayDutyLeave > dayAbsent ? 'duty-leave' : 'absent',
        classes: totalClasses
      };
    }
  });

  return calendar;
}

function generateCalendarGrid(
  monthKey: string,
  days: Array<{ key: string; date: string; day: string; status: string; classes: number }>,
) {
  const [year, month] = monthKey.split("-")
  const firstDay = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
  const lastDay = new Date(Number.parseInt(year), Number.parseInt(month), 0)

  const startOffset = firstDay.getDay() // 0 for Sunday, 1 for Monday, etc.
  const totalDays = lastDay.getDate()

  // Create a map of day number to attendance data
  const dayMap: Record<number, { key: string; date: string; day: string; status: string; classes: number }> = {}

  days.forEach((day) => {
    // Extract day number from date (format: D.M.YY)
    const dayNumber = Number.parseInt(day.date.split(".")[0])
    dayMap[dayNumber] = day
  })

  const cells = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-start-${i}`} className="h-12 rounded-md p-1"></div>)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= totalDays; day++) {
    const dayData = dayMap[day]

    if (dayData) {
      // Day has attendance data
      let bgColor = "bg-green-100 border-green-500"
      let textColor = "text-green-800"
      let icon = <CheckCircle className="h-4 w-4 text-green-500" />

      if (dayData.status === "absent") {
        bgColor = "bg-red-100 border-red-500"
        textColor = "text-red-800"
        icon = <XCircle className="h-4 w-4 text-red-500" />
      } else if (dayData.status === "duty-leave") {
        bgColor = "bg-blue-100 border-blue-500"
        textColor = "text-blue-800"
        icon = <Clock className="h-4 w-4 text-blue-500" />
      }

      cells.push(
        <div
          key={dayData.key}
          className={`h-12 rounded-md border p-1 flex flex-col items-center justify-between ${bgColor}`}
        >
          <div className="text-xs font-medium">{day}</div>
          <div className="flex items-center justify-center">{icon}</div>
          <div className={`text-xs ${textColor}`}>
            {dayData.classes} class{dayData.classes > 1 ? "es" : ""}
          </div>
        </div>,
      )
    } else {
      // Day has no attendance data
      cells.push(
        <div key={`day-${day}`} className="h-12 rounded-md border border-gray-200 p-1 flex items-start justify-center">
          <div className="text-xs text-gray-500">{day}</div>
        </div>,
      )
    }
  }

  // Add empty cells for days after the last day of the month
  const endOffset = 7 - ((startOffset + totalDays) % 7)
  if (endOffset < 7) {
    for (let i = 0; i < endOffset; i++) {
      cells.push(<div key={`empty-end-${i}`} className="h-12 rounded-md p-1"></div>)
    }
  }

  return cells
}
