"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAttendanceSummary } from "@/lib/data"
import { CheckCircle, XCircle, Calendar } from "lucide-react"

interface AttendanceSummaryProps {
  courseId?: string
}

export function AttendanceSummary({ courseId = "all" }: AttendanceSummaryProps) {
  const summary = getAttendanceSummary(courseId)

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
