"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/calendar-view";
import { CourseAttendance } from "@/components/course-attendance";
import { AttendanceSummary } from "@/components/attendance-summary";
import { DailyAttendance } from "@/components/daily-attendance";
import { Navbar } from "@/components/navbar";
import { getToken } from "@/utils/auth";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";
import { useDetailedAttendance, useAllCoursesWithUsers } from "@/app/api/attendance/attendance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AttendanceDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  const { 
    data: attendanceData, 
    isLoading: isAttendanceLoading, 
    error: attendanceError,
    refetch: refetchAttendance,
    isRefetching: isRefetchingAttendance 
  } = useDetailedAttendance();

  const { 
    data: coursesData, 
    isLoading: isCoursesLoading, 
    error: coursesError,
    refetch: refetchCourses 
  } = useAllCoursesWithUsers();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) {
        redirect("/login");
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refetchAttendance(), refetchCourses()]);
  };

  if (loading || isAttendanceLoading || isCoursesLoading) {
    return <Loading />;
  }

  if (attendanceError || coursesError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {(attendanceError as Error)?.message || (coursesError as Error)?.message || "Failed to load data"}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleRefresh}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!attendanceData || !coursesData) {
    return (
      <Alert className="m-4">
        <AlertDescription>No attendance data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        courses={coursesData?.courses || []}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {attendanceData && (
            <AttendanceSummary 
              courseId={selectedCourse} 
              attendanceData={attendanceData}
            />
          )}
        </div>
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="shadow-sm">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="courses">Course Breakdown</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4 p-6 rounded-lg border shadow-sm">
            {attendanceData ? (
              <CalendarView 
                courseId={selectedCourse} 
                attendanceData={attendanceData}
              />
            ) : isAttendanceLoading ? (
              <div className="text-center py-8">Loading calendar data...</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No calendar data available</div>
            )}
          </TabsContent>
          <TabsContent value="courses" className="space-y-4 p-6 rounded-lg border shadow-sm">
            {attendanceData && coursesData ? (
              <CourseAttendance 
                courseId={selectedCourse} 
                attendanceData={attendanceData}
                coursesData={coursesData.courses}
              />
            ) : isAttendanceLoading || isCoursesLoading ? (
              <div className="text-center py-8">Loading course data...</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No course data available</div>
            )}
          </TabsContent>
          <TabsContent value="daily" className="space-y-4 p-6 rounded-lg border shadow-sm">
            {attendanceData ? (
              <DailyAttendance 
                courseId={selectedCourse} 
                attendanceData={attendanceData}
              />
            ) : isAttendanceLoading ? (
              <div className="text-center py-8">Loading daily data...</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No daily data available</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
