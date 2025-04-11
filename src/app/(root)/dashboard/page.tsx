"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/calendar-view";
import { CourseAttendance } from "@/components/course-attendance";
import { AttendanceSummary } from "@/components/attendance-summary";
import { DailyAttendance } from "@/components/daily-attendance";
import { Navbar } from "@/components/navbar";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";

export default function AttendanceDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) {
        setTimeout(() => {
          redirect("/login");
        }, 1000);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AttendanceSummary courseId={selectedCourse} />
        </div>
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="courses">Course Breakdown</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            <CalendarView courseId={selectedCourse} />
          </TabsContent>
          <TabsContent value="courses" className="space-y-4">
            <CourseAttendance courseId={selectedCourse} />
          </TabsContent>
          <TabsContent value="daily" className="space-y-4">
            <DailyAttendance courseId={selectedCourse} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
