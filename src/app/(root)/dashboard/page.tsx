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
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { CourseCard } from "@/components/course-card";
import { AttendanceChart } from "@/components/attendance-chart";
import { useProfile } from "@/hooks/users/profile";
import { useAttendanceReport } from "@/hooks/courses/attendance";
import { useFetchCourses } from "@/hooks/courses/courses";
import {
  useFetchSemester,
  useFetchAcademicYear,
  useSetSemester,
  useSetAcademicYear,
} from "@/hooks/users/settings";
import { redirect } from "next/navigation";
import { getToken } from "@/utils/auth";
import { Loading as CompLoading } from "@/components/loading";

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

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await getToken();
      if (!token) {
        redirect("/");
      }
    }, 2000);

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

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2003;
    const years: string[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      const academicYear = `${year}-${(year + 1).toString().slice(-2)}`;
      years.push(academicYear);
    }

    return years;
  };

  const academicYears = generateAcademicYears();

  // Attendance status codes
  const ATTENDANCE_STATUS = {
    PRESENT: 110,
    ABSENT: 111,
    DUTY_LEAVE: 225,
    OTHER_LEAVE: 112,
  } as const;

  // Return type for calculateOverallStats
  interface AttendanceStats {
    present: number;
    absent: number;
    total: number;
    percentage: number;
    dutyLeave: number;
    otherLeave: number;
  }

  // Session type for type safety
  interface AttendanceSession {
    attendance: number;
    [key: string]: any;
  }

  // Date data type
  interface DateData {
    [sessionId: string]: AttendanceSession;
  }

  // Student attendance data type
  interface StudentAttendanceData {
    [date: string]: DateData;
  }

  const calculateOverallStats = (): AttendanceStats => {
    const defaultStats: AttendanceStats = {
      present: 0,
      absent: 0,
      total: 0,
      percentage: 0,
      dutyLeave: 0,
      otherLeave: 0,
    };

    if (!attendanceData?.studentAttendanceData) {
      return defaultStats;
    }

    const studentData =
      attendanceData.studentAttendanceData as StudentAttendanceData;

    let totalPresent = 0;
    let totalAbsent = 0;
    let dutyLeave = 0;
    let otherLeave = 0;

    Object.values(studentData).forEach((dateData) => {
      Object.values(dateData).forEach((session) => {
        const { attendance } = session;

        if (attendance === ATTENDANCE_STATUS.PRESENT) totalPresent++;
        else if (attendance === ATTENDANCE_STATUS.ABSENT) totalAbsent++;
        else if (attendance === ATTENDANCE_STATUS.DUTY_LEAVE) dutyLeave++;
        else if (attendance === ATTENDANCE_STATUS.OTHER_LEAVE) otherLeave++;
      });
    });

    // Effective attendance (present + duty leave)
    const effectivePresent = totalPresent + dutyLeave;
    const totalClasses = effectivePresent + totalAbsent + otherLeave;

    // Percentage calculation
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

  if (
    isLoadingSemester ||
    isLoadingAcademicYear ||
    isLoadingAttendance ||
    isLoadingCourses
  ) {
    return (
      <p className="flex h-[90vh] items-center justify-center bg-background text-xl font-medium text-muted-foreground text-center italic mx-12">
        &quot;Waiting on Ezygo to stop ghosting us 👻&quot;
      </p>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-manrope">
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {/* selector statements */}
        <div className="mb-6 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold mb-2 w-full">
              Welcome back,{" "}
              <span className="gradient-name w-full pr-2">
                {profile?.first_name} {profile?.last_name}
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 justify-between">
              <p className="text-muted-foreground font-normal italic">
                {
                  "Stay on top of your classes, track your attendance, and manage your day like a pro!"
                }
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center font-normal">
            <p className="flex flex-wrap items-center gap-2.5 max-sm:text-md text-muted-foreground">
              <span>You&apos;re checking out the</span>
              <Select
                value={selectedSemester || undefined}
                onValueChange={(value) =>
                  handleSemesterChange(value as "even" | "odd")
                }
                disabled={isLoadingSemester || setSemesterMutation.isPending}
              >
                <SelectTrigger className="w-fit h-6 px-2 text-[14px] font-medium rounded-xl pl-3 uppercase custom-dropdown">
                  {isLoadingSemester ? (
                    <span className="text-muted-foreground">...</span>
                  ) : selectedSemester ? (
                    <span>{selectedSemester}</span>
                  ) : (
                    <span className="text-muted-foreground lowercase">
                      semester
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="custom-dropdown">
                  <SelectItem
                    value="odd"
                    className={selectedSemester === "odd" ? "bg-white/5" : ""}
                  >
                    ODD
                  </SelectItem>
                  <SelectItem
                    value="even"
                    className={
                      selectedSemester === "even" ? "bg-white/5 mt-1" : "mt-0.5"
                    }
                  >
                    EVEN
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
                <SelectTrigger className="w-fit h-6 px-2 text-[14px] font-medium rounded-xl pl-3 custom-dropdown">
                  {isLoadingAcademicYear ? (
                    <span className="text-muted-foreground">...</span>
                  ) : selectedYear ? (
                    <span>{selectedYear}</span>
                  ) : (
                    <span className="text-muted-foreground">year</span>
                  )}
                </SelectTrigger>
                <SelectContent className="custom-dropdown max-h-70">
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year}
                      value={year}
                      className={
                        selectedYear === year ? "bg-white/5 mt-0.5" : "mt-0.5"
                      }
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </p>
          </div>
        </div>

        {/* info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-5 mb-6">
          {/* Total Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:col-span-2 xl:col-span-2"
          >
            <Card className="h-full custom-container">
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
            <Card className="h-full custom-container">
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
            <Card className="h-full custom-container">
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
            <Card className="h-full custom-container">
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
            <Card className="h-full custom-container">
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

          {/* Total  */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1"
          >
            <Card className="h-full custom-container">
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
        <div className="grid gap-5 md:grid-cols-2 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="col-span-1 custom-container">
              <CardHeader className="flex flex-col gap-0.5">
                <CardTitle className="text-[16px]">
                  Attendance Overview
                </CardTitle>
                <CardDescription className="text-accent-foreground/60 text-sm">
                  {"See where you've been keeping up"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAttendance ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <CompLoading />
                  </div>
                ) : attendanceData ? (
                  <AttendanceChart attendanceData={attendanceData} />
                ) : (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">
                      No attendance data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="col-span-1 custom-container">
              <CardHeader className="flex flex-col gap-0.5">
                <CardTitle className="text-[16px]">
                  Instructor Details
                </CardTitle>
                <CardDescription className="text-accent-foreground/60 text-sm">
                  Get to know your instructors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <CompLoading />
                  </div>
                ) : coursesData?.courses &&
                  Object.keys(coursesData.courses).length > 0 ? (
                  <div className="rounded-md custom-container overflow-clip">
                    <ScrollArea className="h-[300px]">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="relative">
                          <tr className="border-b-2 border-[#2B2B2B]/[0.6]">
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground bg-[rgb(31,31,32)]">
                              Course
                            </th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground bg-[rgb(31,31,32)]">
                              Instructor
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
                                      className="group transition-colors border-[#2B2B2B]/[0.8]"
                                      data-course-id={courseId}
                                      onMouseEnter={() => {
                                        document
                                          .querySelectorAll(
                                            `tr[data-course-id="${courseId}"]`
                                          )
                                          .forEach((row) => {
                                            row.classList.add("bg-muted/25");
                                          });
                                      }}
                                      onMouseLeave={() => {
                                        document
                                          .querySelectorAll(
                                            `tr[data-course-id="${courseId}"]`
                                          )
                                          .forEach((row) => {
                                            row.classList.remove("bg-muted/25");
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
                                          <div className="text-sm text-muted-foreground capitalize">
                                            {course.name.toLowerCase()}
                                          </div>
                                          {instructors.length > 1 && (
                                            <div className="mt-2">
                                              <span className="inline-flex items-center rounded-full border px-2 min-h-5 pt-[0.05px] justify-center text-xs font-semibold bg-blue-50/3 text-white/60 border-[#2B2B2B]/[0.8]">
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
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">
                      No faculty information available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* attendance calendar */}
        <div className="mb-6">
          <Card className="custom-container">
            <CardHeader className="flex flex-col gap-0.5">
              <CardTitle className="text-[16px]">Attendance Calendar</CardTitle>
              <CardDescription className="text-accent-foreground/60 text-sm">
                Your attendance history at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="flex items-center justify-center h-[200px]">
                  <CompLoading />
                </div>
              ) : attendanceData ? (
                // @ts-ignore
                <AttendanceCalendar attendanceData={attendanceData} />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">
                    No attendance data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* courses lineup */}
        <div className="mb-6 mt-14">
          <div className="mb-6 flex flex-col justify-center items-center mx-3">
            <h2 className="text-lg font-bold mb-0.5 italic">
              Your Courses Lineup <span className="ml-1">⬇️</span>
            </h2>
            <p className="italic text-muted-foreground text-sm text-center">
              Your current courses — organized for easy access.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="col-span-full text-center py-8 bg-accent/50 rounded-xl border-2 border-accent-foreground/12">
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
