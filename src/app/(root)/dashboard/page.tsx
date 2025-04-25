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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { CourseCard } from "@/components/course-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { Loading } from "@/components/loading";
import { useProfile } from "@/app/api/users/profile";
import { useAttendanceReport } from "@/app/api/courses/attendance";
import { useFetchCourses } from "@/app/api/courses/courses";
import {
  useFetchSemester,
  useFetchAcademicYear,
  useSetSemester,
  useSetAcademicYear,
} from "@/app/api/users/settings";
import { redirect } from "next/navigation";
import { getToken } from "@/utils/auth";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: semesterData, isLoading: isLoadingSemester } =
    useFetchSemester();
  const { data: academicYearData, isLoading: isLoadingAcademicYear } =
    useFetchAcademicYear();
  const setSemesterMutation = useSetSemester();
  const setAcademicYearMutation = useSetAcademicYear();
  // const [loading, setLoading] = useState(true);

  const [selectedSemester, setSelectedSemester] = useState<
    "even" | "odd" | null
  >(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     const token = await getToken();
  //     if (!token) {
  //       redirect("/");
  //     } else {
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 1000);
  //     }
  //   };
  //   fetchToken();
  // }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await getToken();
      if (!token) {
        redirect("/");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // const { data: courseDetails, isLoading: isLoadingCourseDetails } =
  //   useCourseDetails("");

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

  // Define attendance status codes as constants for better readability
  const ATTENDANCE_STATUS = {
    PRESENT: 110,
    ABSENT: 111,
    DUTY_LEAVE: 225,
    OTHER_LEAVE: 112,
  } as const;

  // Define return type for calculateOverallStats
  interface AttendanceStats {
    present: number;
    absent: number;
    total: number;
    percentage: number;
    dutyLeave: number;
    otherLeave: number;
  }

  // Define session type for type safety
  interface AttendanceSession {
    attendance: number;
    [key: string]: any;
  }

  // Define date data type
  interface DateData {
    [sessionId: string]: AttendanceSession;
  }

  // Define student attendance data type
  interface StudentAttendanceData {
    [date: string]: DateData;
  }

  const calculateOverallStats = (): AttendanceStats => {
    // Default return object
    const defaultStats: AttendanceStats = {
      present: 0,
      absent: 0,
      total: 0,
      percentage: 0,
      dutyLeave: 0,
      otherLeave: 0,
    };

    // Return default stats if no data available
    if (!attendanceData?.studentAttendanceData) {
      return defaultStats;
    }

    const studentData =
      attendanceData.studentAttendanceData as StudentAttendanceData;

    // Initialize counters
    let totalPresent = 0;
    let totalAbsent = 0;
    let dutyLeave = 0;
    let otherLeave = 0;

    // Count attendance statuses
    Object.values(studentData).forEach((dateData) => {
      Object.values(dateData).forEach((session) => {
        const { attendance } = session;

        if (attendance === ATTENDANCE_STATUS.PRESENT) totalPresent++;
        else if (attendance === ATTENDANCE_STATUS.ABSENT) totalAbsent++;
        else if (attendance === ATTENDANCE_STATUS.DUTY_LEAVE) dutyLeave++;
        else if (attendance === ATTENDANCE_STATUS.OTHER_LEAVE) otherLeave++;
      });
    });

    // Calculate effective attendance (present + duty leave)
    const effectivePresent = totalPresent + dutyLeave;
    const totalClasses = effectivePresent + totalAbsent + otherLeave;

    // Calculate attendance percentage with rounding
    const percentage =
      totalClasses > 0
        ? Math.round((effectivePresent / totalClasses) * 100)
        : 0;

    return {
      present: effectivePresent,
      absent: totalAbsent,
      total: totalClasses,
      percentage,
      dutyLeave,
      otherLeave,
    };
  };

  const stats = calculateOverallStats();

  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {/* selector statements */}
        <div className="mb-6 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold mb-2 italic">
              welcome back,{" "}
              <span className="gradient-name">
                {profile?.first_name} {profile?.last_name}
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 justify-between">
              <p className="text-muted-foreground italic">
                {
                  "Stay on top of your classes, track your attendance, and manage your day like a pro!"
                }
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <p className="text-muted-foreground flex flex-wrap items-center gap-2 max-sm:text-md">
              <span>You&apos;re checking out the</span>
              <Select
                value={selectedSemester || undefined}
                onValueChange={(value) =>
                  handleSemesterChange(value as "even" | "odd")
                }
                disabled={isLoadingSemester || setSemesterMutation.isPending}
              >
                <SelectTrigger className="w-fit h-6 px-2 text-[14px] font-medium rounded-xl pl-3 uppercase">
                  {isLoadingSemester ? (
                    <span className="text-muted-foreground">...</span>
                  ) : selectedSemester ? (
                    <span>{selectedSemester}</span>
                  ) : (
                    <span className="text-muted-foreground">semester</span>
                  )}
                </SelectTrigger>
                <SelectContent className="capitalize">
                  <SelectItem value="even">EVEN</SelectItem>
                  <SelectItem value="odd">ODD</SelectItem>
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
                <SelectTrigger className="w-fit h-6 px-2 text-[14px] font-medium rounded-xl pl-3">
                  {isLoadingAcademicYear ? (
                    <span className="text-muted-foreground">...</span>
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
                className="inline-flex h-8 ml-2 items-center justify-center rounded-full bg-primary/10 px-2 text-sm text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {/* <span>refresh</span> */}
              </button>
            </p>
          </div>
        </div>

        {/* info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
          {/* Total Attendance - Takes 2 columns on larger screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:col-span-2 xl:col-span-2"
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

          {/* Present */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent className="mt-3">
                <div className="text-2xl font-bold text-green-500 mt-0.5">
                  {stats.present}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Classes attended
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Absent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent className="mt-3">
                <div className="text-2xl font-bold text-red-500 mt-0.5">
                  {stats.absent}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Classes missed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Duty Leaves */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Duty Leaves
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3">
                <div className="text-2xl font-bold text-yellow-500 mt-0.5">
                  {stats.dutyLeave}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Excused absences
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Leave */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Special Leave
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3">
                <div className="text-2xl font-bold text-teal-400 mt-0.5">
                  {stats.otherLeave}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Non-standard off
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3">
                <div className="text-2xl font-bold mt-0.5">
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

        {/* attendance overview graph*/}
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
                  {"See where you've been keeping up"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAttendance ? (
                  <div className="flex items-center justify-center h-full">
                    <Loading />
                  </div>
                ) : (
                  <AttendanceChart attendanceData={attendanceData} />
                )}
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
                <CardTitle>Instructor Details</CardTitle>
                <CardDescription>Get to know your instructors</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <Loading />
                  </div>
                ) : coursesData?.courses &&
                  Object.keys(coursesData.courses).length > 0 ? (
                  <div className="rounded-md border">
                    <ScrollArea className="h-[300px]">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="relative">
                          <tr className="border-b bg-muted/50">
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground rounded-tl-sm">
                              Course
                            </th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                              Instructor
                            </th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell rounded-tr-sm">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {Object.entries(coursesData.courses).map(
                            ([courseId, course]: [string, any]) => {
                              const instructors =
                                course.institution_users.filter(
                                  (user: any) => user.pivot.courserole_id === 1
                                );

                              return instructors.length > 0 ? (
                                instructors.map(
                                  (instructor: any, index: number) => (
                                    <tr
                                      key={`${courseId}-${instructor.id}`}
                                      className="group transition-colors"
                                      data-course-id={courseId}
                                      onMouseEnter={() => {
                                        document
                                          .querySelectorAll(
                                            `tr[data-course-id="${courseId}"]`
                                          )
                                          .forEach((row) => {
                                            row.classList.add("bg-muted/50");
                                          });
                                      }}
                                      onMouseLeave={() => {
                                        document
                                          .querySelectorAll(
                                            `tr[data-course-id="${courseId}"]`
                                          )
                                          .forEach((row) => {
                                            row.classList.remove("bg-muted/50");
                                          });
                                      }}
                                    >
                                      {index === 0 ? (
                                        <td
                                          className="p-4 align-top"
                                          rowSpan={instructors.length}
                                        >
                                          <div className="font-medium">
                                            {course.code}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {course.name}
                                          </div>
                                          {instructors.length > 1 && (
                                            <div className="mt-2">
                                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-blue-50/10 text-white/60 border-white/5">
                                                {instructors.length} instructors
                                              </span>
                                            </div>
                                          )}
                                        </td>
                                      ) : null}
                                      <td className="p-4">
                                        <div className="font-medium">
                                          {instructor.first_name}{" "}
                                          {instructor.last_name}
                                        </div>
                                      </td>
                                      <td className="p-4 hidden md:table-cell">
                                        <div className="flex items-center">
                                          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 ring-1 ring-green-500 ring-offset-1"></span>
                                          <span className="text-sm font-medium text-green-600 dark:text-green-500">
                                            Active
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr
                                  key={courseId}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  <td className="p-4">
                                    <div className="font-medium">
                                      {course.code}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {course.name}
                                    </div>
                                  </td>
                                  <td className="p-4 text-muted-foreground italic">
                                    No instructor assigned
                                  </td>
                                  <td className="p-4 hidden md:table-cell">
                                    <div className="flex items-center">
                                      <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2 ring-1 ring-yellow-500 ring-offset-1"></span>
                                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                                        Pending
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No faculty information available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>
                Your attendance history at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loading />
                </div>
              ) : (
                <AttendanceCalendar attendanceData={attendanceData} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold mb-1 italic">
              My Courses <span className="ml-1">📚</span>
            </h2>
            <p className="italic text-muted-foreground">
              {"A quick look at everything you're taking this semester."}
            </p>
          </div>
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
                ([courseId, course]: [string, any]) => (
                  <div key={courseId}>
                    <CourseCard course={course} />
                  </div>
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
      </main>
    </div>
  );
}
