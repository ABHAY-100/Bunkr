"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/types";
import { useCourseDetails } from "@/hooks/courses/attendance";
import { AlertCircle } from "lucide-react";
import { calculateAttendance } from "@/utils/bunk";
import { useAttendanceSettings } from "@/providers/attendance-settings";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { data: courseDetails, isLoading } = useCourseDetails(
    course.id.toString()
  );

  const attendancePercentage = courseDetails?.persantage ?? 0;
  const total = courseDetails?.totel || 0;  const present = courseDetails?.present || 0;
  const hasAttendanceData = !isLoading && total > 0 && attendancePercentage > 0;
  
  // Get target percentage from context
  const { targetPercentage } = useAttendanceSettings();
  
  // Calculate attendance metrics
  const attendanceMetrics = calculateAttendance(present, total, targetPercentage);

  function capitalize(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <Card className="pt-0 pb-0 custom-container overflow-clip h-full min-h-[315px]">
      <CardHeader className="flex justify-between items-center flex-row pt-6 bg-[#2B2B2B]/[0.4] pb-5 border-b-2 border-[#2B2B2B]/[0.6]">
        <CardTitle className="line-clamp-1 text-lg w-full">
          {capitalize(course.name.toLowerCase())}
        </CardTitle>
        <Badge
          variant="secondary"
          className="h-7 uppercase custom-button rounded-md! bg-black/20! scale-105"
        >
          {course.code}
        </Badge>
      </CardHeader>
      <CardContent className="h-full pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-pulse h-4 w-24 bg-secondary rounded mb-2"></div>
            <div className="animate-pulse h-2 w-16 bg-secondary rounded"></div>
          </div>
        ) : hasAttendanceData ? (
          <>
            <div className="grid grid-cols-3 gap-2 mt-4">
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
              <div className="flex justify-between items-center mb-1 text-sm mt-1.5 text-muted-foreground">
                <span className="text-sm font-medium">Attendance</span>
                <span className="text-sm font-medium">
                  {`${attendancePercentage}%`}
                </span>
              </div>
            </div>
            <div className="bg-accent/40 rounded-md py-2 flex justify-center items-center mt-4">
              <p className="text-sm text-muted-foreground text-center font-medium">
                {attendanceMetrics.canBunk > 0 && (
                  <>
                    You can bunk up to <span className="font-medium text-green-500">{attendanceMetrics.canBunk}</span> periods
                  </>
                )}
                {attendanceMetrics.requiredToAttend > 0 && (
                  <>
                    You need to attend <span className="font-medium text-amber-500">
                      {!isFinite(attendanceMetrics.requiredToAttend) ? "all" : attendanceMetrics.requiredToAttend}
                    </span> more periods
                  </>
                )}
                {attendanceMetrics.isExact && attendanceMetrics.canBunk === 0 && attendanceMetrics.requiredToAttend === 0 && (
                  <>
                    {attendancePercentage === attendanceMetrics.targetPercentage ? (
                      <>
                        You are at target percentage
                      </>
                    ) : (
                      <>
                        {"It's risky to skip classes now"}
                      </>
                    )}
                  </>
                )}
              </p>
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
    </Card>
  );
}
