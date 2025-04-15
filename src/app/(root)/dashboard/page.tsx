"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/app/api/users/myprofile";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ChevronRight, XCircle, RefreshCw } from "lucide-react";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { CourseCard } from "@/components/course-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { Navbar } from "@/components/navbar";
import { Loading } from "@/components/loading";
import { useAttendanceReport } from "@/app/api/courses/attendance";
import { useFetchCourses } from "@/app/api/courses/courses";
import { useCourseDetails } from "@/app/api/courses/attendance";
import {
  useFetchSemester,
  useFetchAcademicYear,
  useSetSemester,
  useSetAcademicYear,
} from "@/app/api/users/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: semesterData, isLoading: isLoadingSemester } =
    useFetchSemester();
  const { data: academicYearData, isLoading: isLoadingAcademicYear } =
    useFetchAcademicYear();
  const setSemesterMutation = useSetSemester();
  const setAcademicYearMutation = useSetAcademicYear();

  const [selectedSemester, setSelectedSemester] = useState<
    "even" | "odd" | null
  >(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (semesterData) {
      setSelectedSemester(semesterData);
    }
  }, [semesterData]);

  useEffect(() => {
    if (academicYearData) {
      setSelectedYear(academicYearData);
    }
  }, [academicYearData]);

  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useAttendanceReport();

  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useFetchCourses();

  const { data: courseDetails, isLoading: isLoadingCourseDetails } =
    useCourseDetails(selectedCourse || "");

  const handleSemesterChange = (value: "even" | "odd") => {
    setSelectedSemester(value);
    setSemesterMutation.mutate(
      { default_semester: value },
      {
        onSuccess: () => {
          refetchCourses();
          refetchAttendance();
        },
        onError: (error) => {
          console.error("Error changing semester:", error);
          if (semesterData) {
            setSelectedSemester(semesterData);
          }
        },
      }
    );
  };

  const handleAcademicYearChange = (value: string) => {
    setSelectedYear(value);
    setAcademicYearMutation.mutate(
      { default_academic_year: value },
      {
        onSuccess: () => {
          refetchCourses();
          refetchAttendance();
        },
        onError: (error) => {
          console.error("Error changing academic year:", error);
          if (academicYearData) {
            setSelectedYear(academicYearData);
          }
        },
      }
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedCourse(null);

    Promise.all([refetchCourses(), refetchAttendance()])
      .catch((error) => {
        console.error("Error refreshing data:", error);
        if (semesterData) setSelectedSemester(semesterData);
        if (academicYearData) setSelectedYear(academicYearData);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];

    for (let year = startYear; year <= currentYear + 2; year++) {
      const academicYear = `${year}-${(year + 1).toString().slice(-2)}`;
      years.push(academicYear);
    }

    return years;
  };

  const academicYears = generateAcademicYears();

  const calculateOverallStats = () => {
    if (!attendanceData?.studentAttendanceData)
      return { present: 0, absent: 0, total: 0, percentage: 0 };

    let totalPresent = 0;
    let totalAbsent = 0;

    Object.values(attendanceData.studentAttendanceData).forEach(
      (dateData: any) => {
        Object.values(dateData).forEach((session: any) => {
          if (session.attendance === 110) totalPresent++;
          else if (session.attendance === 10) totalAbsent++;
        });
      }
    );

    const totalClasses = totalPresent + totalAbsent;

    return {
      present: totalPresent,
      absent: totalAbsent,
      total: totalClasses,
      percentage:
        totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0,
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold mb-2 italic">
              welcome back, {profile?.first_name} {profile?.last_name}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 justify-between">
              <p className="text-muted-foreground italic">
                {
                  "Stay on top of your classes, track your attendance, and manage your day like a pro."
                }
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <p className="text-muted-foreground italic flex flex-wrap items-center gap-2">
              <span>You&apos;re checking out the</span>
              <Select
                value={selectedSemester || undefined}
                onValueChange={(value) =>
                  handleSemesterChange(value as "even" | "odd")
                }
                disabled={isLoadingSemester || setSemesterMutation.isPending}
              >
                <SelectTrigger className="w-fit h-6 px-2 text-sm rounded-full pl-2.5">
                  {isLoadingSemester ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : selectedSemester ? (
                    <span>{selectedSemester}</span>
                  ) : (
                    <span className="text-muted-foreground">semester</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="even">even</SelectItem>
                  <SelectItem value="odd">odd</SelectItem>
                </SelectContent>
              </Select>
              <span>semester reports for academic year</span>
              <Select
                value={selectedYear || undefined}
                onValueChange={handleAcademicYearChange}
                disabled={
                  isLoadingAcademicYear || setAcademicYearMutation.isPending
                }
              >
                <SelectTrigger className="w-fit h-6 px-2 text-sm rounded-full pl-3">
                  {isLoadingAcademicYear ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : selectedYear ? (
                    <span>{selectedYear}</span>
                  ) : (
                    <span className="text-muted-foreground">year</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={handleRefresh}
                disabled={
                  isRefreshing || isLoadingCourses || isLoadingAttendance
                }
                className="inline-flex h-6 ml-2 items-center justify-center rounded-full bg-primary/10 px-2 text-sm text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </button>
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.percentage}%</div>
                <Progress value={stats.percentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.present} present / {stats.total} total
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent className="mt-2">
                <div className="text-2xl font-bold text-green-500">
                  {stats.present}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Classes attended
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent className="mt-2">
                <div className="text-2xl font-bold text-red-500">
                  {stats.absent}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Classes missed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-2">
                <div className="text-2xl font-bold">
                  {coursesData?.courses
                    ? Object.keys(coursesData.courses).length
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Enrolled this semester
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                  Your attendance across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceChart />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {isLoadingAttendance ? (
                    <div className="flex items-center justify-center h-full">
                      <Loading text="Loading attendance data..." />
                    </div>
                  ) : attendanceData?.attendanceDatesArray ? (
                    Object.entries(attendanceData.attendanceDatesArray)
                      .sort((a, b) => Number(b[0]) - Number(a[0]))
                      .slice(0, 10)
                      .map(([dateKey, dateInfo]: [string, any]) => {
                        const hasAttendance =
                          attendanceData.studentAttendanceData[dateKey];
                        const anyPresent =
                          hasAttendance &&
                          Object.values(hasAttendance).some(
                            (session: any) => session.attendance === 110
                          );

                        return (
                          <div
                            key={dateKey}
                            className="flex items-center py-3 border-b"
                          >
                            <div className="mr-4">
                              {anyPresent ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{dateInfo.date}</p>
                              <p className="text-sm text-muted-foreground">
                                {dateInfo.day}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        );
                      })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        No attendance data available
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>View your attendance by date</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar attendanceData={attendanceData} />
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Your Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingCourses ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Skeleton className="h-40 w-full rounded-none" />
                    </CardHeader>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
            ) : coursesData?.courses &&
              Object.keys(coursesData.courses).length > 0 ? (
              Object.entries(coursesData.courses).map(
                ([courseId, course]: [string, any], index) => (
                  <motion.div
                    key={courseId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CourseCard
                      course={course}
                      onClick={() => setSelectedCourse(courseId)}
                      isSelected={selectedCourse === courseId}
                    />
                  </motion.div>
                )
              )
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No courses found for this semester
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {coursesData?.courses[selectedCourse]?.name ||
                    "Course Details"}
                </CardTitle>
                <CardDescription>
                  {coursesData?.courses[selectedCourse]?.code || ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCourseDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : courseDetails ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="text-sm font-medium">Present</p>
                        <p className="text-2xl font-bold text-green-500">
                          {courseDetails.present}
                        </p>
                      </div>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="text-sm font-medium">Absent</p>
                        <p className="text-2xl font-bold text-red-500">
                          {courseDetails.absent}
                        </p>
                      </div>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold">
                          {courseDetails.totel}
                        </p>
                      </div>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="text-sm font-medium">Percentage</p>
                        <p className="text-2xl font-bold">
                          {courseDetails.persantage}%
                        </p>
                      </div>
                    </div>

                    <Progress
                      value={courseDetails.persantage}
                      className="h-2"
                    />

                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Course Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Course Code
                          </p>
                          <p className="font-medium">
                            {courseDetails.course?.code}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Course ID
                          </p>
                          <p className="font-medium">
                            {courseDetails.course?.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No details available for this course
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
