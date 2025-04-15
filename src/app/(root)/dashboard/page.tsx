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
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  // Fetch user profile data
  const { data: profile } = useProfile();
  // Fetch settings data
  const { data: semesterData, isLoading: isLoadingSemester } =
    useFetchSemester();
  const { data: academicYearData, isLoading: isLoadingAcademicYear } =
    useFetchAcademicYear();
  const setSemesterMutation = useSetSemester();
  const setAcademicYearMutation = useSetAcademicYear();

  // State for selected values - initialize with null to indicate "not loaded yet" state
  const [selectedSemester, setSelectedSemester] = useState<
    "even" | "odd" | null
  >(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Update state when data is loaded - always use the server's value without logging
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

  // Handle setting changes with clean, direct mutation calls
  const handleSemesterChange = (value: "even" | "odd") => {
    console.log("Changing semester to:", value);
    setSelectedSemester(value);
    setSemesterMutation.mutate(
      { default_semester: value },
      {
        onSuccess: () => {
          console.log("Semester successfully changed to:", value);
          // Force refetch courses and attendance data with new semester setting
          refetchCourses();
          refetchAttendance();
        },
        onError: (error) => {
          console.error("Error changing semester:", error);
          // Revert UI state on error
          if (semesterData) {
            setSelectedSemester(semesterData);
          }
        },
      }
    );
  };

  // Add a refresh handler function to clear data and refetch everything
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Clear selected course to reset course details view
    setSelectedCourse(null);

    // Reset any cached data - if you have any query client methods to invalidate/clear cache
    // For example with react-query: queryClient.invalidateQueries(['courses'])
    //                              queryClient.invalidateQueries(['attendance'])

    Promise.all([refetchCourses(), refetchAttendance()])
      .then(() => {
        console.log("Data refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        // Even on error, we want to try to reset and refresh the UI state
        if (semesterData) {
          setSelectedSemester(semesterData);
        }
        if (academicYearData) {
          setSelectedYear(academicYearData);
        }
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  const handleAcademicYearChange = (value: string) => {
    console.log("Changing academic year to:", value);
    setSelectedYear(value);
    setAcademicYearMutation.mutate(
      { default_academic_year: value },
      {
        onSuccess: () => {
          console.log("Academic year successfully changed to:", value);
          // Force refetch courses and attendance data with new academic year setting
          refetchCourses();
          refetchAttendance();
        },
        onError: (error) => {
          console.error("Error changing academic year:", error);
          // Revert UI state on error
          if (academicYearData) {
            setSelectedYear(academicYearData);
          }
        },
      }
    );
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];

    // Generate years from 2023 to current year + 2
    for (let year = startYear; year <= currentYear + 2; year++) {
      const endYear = year + 1;
      const academicYear = `${year}-${endYear.toString().slice(-2)}`;
      years.push(academicYear);
    }

    return years;
  };

  const academicYears = generateAcademicYears();

  // Fetch attendance report using the new API hook
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useAttendanceReport();

  // Fetch courses using the new API hook
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useFetchCourses();

  // Fetch course details when a course is selected
  const { data: courseDetails, isLoading: isLoadingCourseDetails } =
    useCourseDetails(selectedCourse || "");

  // Calculate overall attendance statistics
  const calculateOverallStats = () => {
    if (!coursesData || !coursesData.courses)
      return { present: 0, absent: 0, total: 0, percentage: 0 };

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalClasses = 0;

    Object.values(coursesData.courses).forEach((course: any) => {
      // This is a placeholder calculation since we don't have the actual attendance data per course
      // In a real implementation, you would use the actual data
      totalPresent += 15; // Placeholder
      totalAbsent += 2; // Placeholder
      totalClasses += 17; // Placeholder
    });

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
                <SelectTrigger className="w-fit h-6 px-2 text-sm rounded-full pl-3">
                  {isLoadingSemester ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : selectedSemester ? (
                    <span>{selectedSemester}</span>
                  ) : (
                    <span className="text-muted-foreground">semester</span>
                  )}
                  {/* {console.log("selectedSemester", selectedSemester)} */}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="even">
                    even
                    {setSemesterMutation.isPending &&
                      selectedSemester === "even" &&
                      " (saving...)"}
                  </SelectItem>
                  <SelectItem value="odd">
                    odd
                    {setSemesterMutation.isPending &&
                      selectedSemester === "odd" &&
                      " (saving...)"}
                  </SelectItem>
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
                      {setAcademicYearMutation.isPending &&
                        selectedYear === year &&
                        " (saving...)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingCourses || isLoadingAttendance}
                className="inline-flex h-6 items-center justify-center rounded-full bg-primary/10 px-2 text-sm text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
            <Card>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
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
            ) : coursesData?.courses ? (
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
