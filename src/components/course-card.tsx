"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Course } from "@/app/api/courses/courses"
import { useCourseDetails } from "@/app/api/courses/attendance"
import { AlertCircle } from "lucide-react"

interface CourseCardProps {
  course: Course
  onClick?: () => void
  isSelected?: boolean
}

export function CourseCard({ course, onClick, isSelected = false }: CourseCardProps) {
  // Get actual attendance data for this course
  const { data: courseDetails, isLoading } = useCourseDetails(course.id.toString());
  
  // Calculate attendance percentage based on real data
  const attendancePercentage = courseDetails?.persantage ?? 0;
  const total = courseDetails?.totel || 0;
  const hasAttendanceData = !isLoading && total > 0;

  // Extract the academic year for display as start_year and end_year
  const yearParts = course.academic_year.split("-");
  const startYear = yearParts[0];
  const endYear = yearParts.length > 1 ? yearParts[1] : (parseInt(startYear) + 1).toString().slice(-2);

  return (
    <Card className={cn("overflow-hidden")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-7">{course.code}</Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-1 text-lg mt-2">{course.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {course.academic_year} • {course.academic_semester} semester
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-pulse h-4 w-24 bg-secondary rounded mb-2"></div>
            <div className="animate-pulse h-2 w-16 bg-secondary rounded"></div>
          </div>
        ) : hasAttendanceData ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-1 bg-secondary/20 rounded">
                <span className="text-xs text-muted-foreground block">Present</span>
                <span className="text-sm font-medium text-green-500">
                  {courseDetails?.present || 0}
                </span>
              </div>
              <div className="text-center p-1 bg-secondary/20 rounded">
                <span className="text-xs text-muted-foreground block">Absent</span>
                <span className="text-sm font-medium text-red-500">
                  {courseDetails?.absent || 0}
                </span>
              </div>
              <div className="text-center p-1 bg-secondary/20 rounded">
                <span className="text-xs text-muted-foreground block">Total</span>
                <span className="text-sm font-medium">
                  {total}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Attendance</span>
              <span className="text-sm font-medium">
                {`${attendancePercentage}%`}
              </span>
            </div>
            <Progress value={attendancePercentage} className="h-2" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="flex items-center gap-2 mb-1 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium text-sm">No attendance data</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Instructor has not updated attendance records yet
            </p>
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          <span>ID: {course.id}</span>
          <span>{startYear}-{endYear}</span>
        </div>
      </CardFooter> */}
    </Card>
  )
}
