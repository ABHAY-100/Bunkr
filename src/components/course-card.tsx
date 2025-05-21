"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Course } from "@/types";
import { useCourseDetails } from "@/app/api/courses/attendance";
import { AlertCircle } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { data: courseDetails, isLoading } = useCourseDetails(
    course.id.toString()
  );

  const attendancePercentage = courseDetails?.persantage ?? 0;
  const total = courseDetails?.totel || 0;
  const hasAttendanceData = !isLoading && total > 0 && attendancePercentage > 0;

  const yearParts = course.academic_year.split("-");
  const startYear = yearParts[0];
  const endYear =
    yearParts.length > 1
      ? yearParts[1]
      : (parseInt(startYear) + 1).toString().slice(-2);

  function capitalize(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <Card
      className={
        cn("overflow-hidden") + "pt-6 pb-0 h-full custom-button custom-button"
      }
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-7 uppercase custom-dropdown rounded-md!"
            >
              {course.code}
            </Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-1 text-lg mt-2">
          {capitalize(course.name.toLowerCase())}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-pulse h-4 w-24 bg-secondary rounded mb-2"></div>
            <div className="animate-pulse h-2 w-16 bg-secondary rounded"></div>
          </div>
        ) : hasAttendanceData ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-1 bg-[#1F1F1F]/60 rounded-md py-2.5 flex gap-1 flex-col">
                <span className="text-xs text-muted-foreground block">
                  Present
                </span>
                <span className="text-sm font-medium text-green-500">
                  {courseDetails?.present || 0}
                </span>
              </div>
              <div className="text-center p-1 bg-[#1F1F1F]/60 rounded-md py-2.5 flex gap-1 flex-col">
                <span className="text-xs text-muted-foreground block">
                  Absent
                </span>
                <span className="text-sm font-medium text-red-500">
                  {courseDetails?.absent || 0}
                </span>
              </div>
              <div className="text-center p-1 bg-[#1F1F1F]/60 rounded-md py-2.5 flex gap-1 flex-col">
                <span className="text-xs text-muted-foreground block">
                  Total
                </span>
                <span className="text-sm font-medium">{total}</span>
              </div>
            </div>
            <div className="mt-8">
              <Progress value={attendancePercentage} className="h-2" />
              <div className="flex justify-between items-center mb-2 text-sm mt-1.5 text-muted-foreground">
                <span className="text-sm font-medium">Attendance</span>
                <span className="text-sm font-medium">
                  {`${attendancePercentage}%`}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 px-2 h-full gap-1">
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
      <CardFooter className="border-t bg-white/4 px-6 py-1 rounded-b-[12px] pb-6 border-[#2B2B2B]/[0.6] max-h-14">
        <div className="flex justify-between items-center w-full text-[12.5px] text-muted-foreground font-medium">
          <span className="capitalize">
            {course.academic_semester} Semester
          </span>
          <span>
            {startYear} - {endYear}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
