"use client";

import { useState, useEffect } from "react";
import { useTrackingData } from "@/hooks/tracker/useTrackingData";
import { useTrackingCount } from "@/hooks/tracker/useTrackingCount";
import { useUser } from "@/hooks/users/user";
import { getToken } from "@/utils/auth";
import { Badge } from "@/components/ui/badge";
import { Trash2, CircleAlert, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useAttendanceReport } from "@/hooks/courses/attendance";
import { useFetchSemester, useFetchAcademicYear } from "@/hooks/users/settings";
import { Loading } from "@/components/loading";

const Tracking = () => {
  const { data: user } = useUser();
  const accessToken = getToken();
  const [deleteId, setDeleteId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: semester } = useFetchSemester();
  const { data: year } = useFetchAcademicYear();

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setEnabled(true);
    }
  }, [user]);

  const {
    data: remaining,
    error,
    refetch: refetchCount,
  } = useTrackingCount(enabled ? user : null, enabled ? accessToken : null);

  
  const {
    data: trackingData,
    isLoading,
    refetch: refetchTrackingData,
  } = useTrackingData(enabled ? user : null, enabled ? accessToken : null);

  if (!trackingData) {
    console.error("Tracking data is not available");
  }

  const [filteredAttendanceEvents, setFilteredAttendanceEvents] = useState<
    any[]
  >([]);

  const { data: attendanceData } = useAttendanceReport();

  const totalPages = trackingData
    ? Math.ceil(trackingData.length / itemsPerPage)
    : 0;

  const getCurrentPageItems = () => {
    if (!trackingData) return [];
    const startIndex = currentPage * itemsPerPage;
    return trackingData.slice(startIndex, startIndex + itemsPerPage);
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatSessionName = (sessionName: string): string => {
    const romanToOrdinal: Record<string, string> = {
      I: "1st hour",
      II: "2nd hour",
      III: "3rd hour",
      IV: "4th hour",
      V: "5th hour",
      VI: "6th hour",
      VII: "7th hour",
    };
    if (romanToOrdinal[sessionName]) {
      return romanToOrdinal[sessionName];
    }
    return sessionName;
  };

  const handleDeleteTrackData = async (
    username: string,
    session: string,
    course: string,
    date: string
  ) => {
    const deletingId = `${username}-${session}-${course}-${date}`;
    setDeleteId(deletingId);

    const res = await axios.post(
      process.env.NEXT_PUBLIC_SUPABASE_API_URL + "/delete-tracking-data",
      {
        username,
        session,
        course,
        date,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (res.data.success) {
      toast.success("Delete successful", {
        style: {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          color: "rgb(74, 222, 128)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          backdropFilter: "blur(5px)",
        },
      });
    }
    if (!res.data.success) {
      toast.error("Error deleting the record", {
        style: {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          color: "rgb(248, 113, 113)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          backdropFilter: "blur(5px)",
        },
      });
    }
    await refetchTrackingData();
    await refetchCount();
    setDeleteId("");
  };

  useEffect(() => {
    if (!attendanceData?.studentAttendanceData || !trackingData) return;

    const newFilteredEvents: any[] = [];

    const normalizeToYMD = (dateStr: string): string => {
      if (!dateStr) return "";
      // Already in YYYY-MM-DD
      if (dateStr.includes("-")) {
        return dateStr;
      }
      // Likely locale string like DD/MM/YYYY
      if (dateStr.includes("/")) {
        const [dd, mm, yyyy] = dateStr.split("/");
        if (dd && mm && yyyy) {
          const d = dd.padStart(2, "0");
          const m = mm.padStart(2, "0");
          return `${yyyy}-${m}-${d}`;
        }
      }
      return dateStr;
    };

    Object.entries(attendanceData.studentAttendanceData).forEach(
      ([dateStr, sessions]) => {
        const dateYear = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
        const day = parseInt(dateStr.substring(6, 8), 10);

        Object.entries(sessions).forEach(([sessionKey, sessionData]) => {
          if (!sessionData.course) return;

          const courseId = sessionData.course.toString();
          const courseInfo = attendanceData.courses?.[courseId];
          const courseName = courseInfo?.name || "Unknown Course";
          const courseCode = (courseInfo?.code || "").toString();
          const sessionInfo = attendanceData.sessions?.[sessionKey] || {
            name: `Session ${sessionKey}`,
          };
          const sessionName = sessionInfo.name;
          const formattedDate = `${dateYear}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const nameLower = courseName.toLowerCase();
          const codeLower = courseCode.toLowerCase();
          const sessionLower = sessionName.toLowerCase();

          const matchingTrackingItem = trackingData.find((item) => {
            const itemCourseLower = (item.course || "").toLowerCase().trim();
            const itemSessionLower = (item.session || "").toLowerCase().trim();
            const itemDateYmd = normalizeToYMD(item.date);
            const courseMatches =
              itemCourseLower === nameLower ||
              (codeLower && itemCourseLower === codeLower);
            const sessionMatches = itemSessionLower === sessionLower;
            const dateMatches = itemDateYmd === formattedDate;
            return courseMatches && sessionMatches && dateMatches;
          });

          if (matchingTrackingItem) {
            let attendanceStatus = "normal";
            let attendanceLabel = "Absent";
            let statusColor = "red";

            switch (sessionData.attendance) {
              case 110:
                attendanceStatus = "normal";
                attendanceLabel = "Present";
                statusColor = "blue";
                break;
              case 111:
                attendanceStatus = "important";
                attendanceLabel = "Absent";
                statusColor = "red";
                break;
              case 225:
                attendanceStatus = "normal";
                attendanceLabel = "Duty Leave";
                statusColor = "yellow";
                break;
              case 112:
                attendanceStatus = "important";
                attendanceLabel = "Leave";
                statusColor = "teal";
                break;
            }

            newFilteredEvents.push({
              title: courseName,
              date: formattedDate,
              sessionName,
              sessionKey,
              type: attendanceStatus,
              status: attendanceLabel,
              statusColor,
              courseId,
              username: matchingTrackingItem.username,
              trackingId: `${matchingTrackingItem.username}-${matchingTrackingItem.session}-${matchingTrackingItem.course}-${matchingTrackingItem.date}`,
              semester: matchingTrackingItem.semester,
              year: matchingTrackingItem.year,
              matchesCurrent:
                matchingTrackingItem.semester === semester &&
                matchingTrackingItem.year === year,
            });
          }
        });
      }
    );

    setFilteredAttendanceEvents(newFilteredEvents);
  }, [attendanceData, trackingData, semester, year]);

  if (isLoading) {
    return (
      <div className="flex h-[90vh] items-center justify-center bg-background text-xl font-medium text-muted-foreground text-center italic mx-12">
        &quot;Waiting on Ezygo to stop ghosting us 👻&quot;
      </div>
    );
  }

  const deleteAllTrackingData = async () => {
    try {
      setIsProcessing(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_API_URL}/delete-records-of-users`,
        { username: user?.username },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      await refetchTrackingData();
      await refetchCount();
      setCurrentPage(0);

      toast.success(`${response.data.message}`, {
        style: {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          color: "rgb(74, 222, 128)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          backdropFilter: "blur(5px)",
        },
      });
    } catch {
      toast.error("Failed to delete all tracking data", {
        style: {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          color: "rgb(248, 113, 113)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          backdropFilter: "blur(5px)",
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.08,
      },
    },
  };

  const springTransition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
    mass: 0.8,
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  const pageTransition = {
    type: "tween",
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
  };

  return (
    isProcessing ? <div className="h-screen"><Loading /></div> :
    <LazyMotion features={domAnimation}>
      <div className="flex flex-1 flex-col flex-wrap gap-4 h-full m-6 text-center min-h-[100vh] relative">
        {trackingData && trackingData.length > 0 ? (
          <>
            <div className="mb-2 pb-4 mt-10">
              <p className="text-2xl font-semibold text-foreground py-2 max-md:text-xl">
                Attendance Tracker
              </p>
              <p className="text-sm text-muted-foreground max-md:text-xs mb-4">
                These are absences you&apos;ve marked for duty leave. <br />{" "}
                Track their update status here 📋
              </p>
              {(remaining ?? 0) > 0 ? (
                <div className="flex flex-col gap-2 items-center justify-center">
                  <Badge
                    className={`text-sm text-center max-md:text-xs  py-1 px-3 ${
                      (remaining ?? 0) < 4
                        ? "bg-yellow-500/12 text-yellow-400/75 border-yellow-500/15"
                        : "bg-green-500/12 text-green-400/75 border-green-500/15"
                    }`}
                  >
                    You can add <strong>{remaining}</strong> more attendance{" "}
                    {remaining === 1 ? "record" : "records"}
                  </Badge>
                  <button
                    onClick={deleteAllTrackingData}
                    className="text-sm cursor-pointer justify-between items-center gap-2 text-center max-md:text-xs bg-red-500/12 text-red-400/75 hover:bg-red-500/18 duration-300 border-1 border-red-500/15 py-1 px-3 pr-2.5 flex flex-row rounded-md"
                  >
                    Clear all tracking data
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-center justify-center">
                <Badge className="text-sm text-center max-md:text-xs bg-red-500/12 text-red-400/75 border-red-500/15 py-1 px-3">
                  You&apos;ve reached the limit of <strong>20</strong>{" "}
                  attendance records
                </Badge>
                <button
                    onClick={deleteAllTrackingData}
                    className="text-sm cursor-pointer justify-between items-center gap-2 text-center max-md:text-xs bg-red-500/12 text-red-400/75 hover:bg-red-500/18 duration-300 border-1 border-red-500/15 py-1 px-3 pr-2.5 flex flex-row rounded-md"
                  >
                    Clear all tracking data
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {error && (
                <p>An error occured while displaying count of entries</p>
              )}
            </div>

            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4 relative"
            >
              <AnimatePresence
                mode="wait"
                initial={false}
                custom={currentPage > 0 ? -1 : 1}
              >
                <m.div
                  key={currentPage}
                  custom={currentPage}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="flex flex-col gap-4"
                >
                  {getCurrentPageItems().map((trackingItem, index) => {
                    const trackingId = `${trackingItem.username}-${trackingItem.session}-${trackingItem.course}-${trackingItem.date}`;

                    const matchingEvent = filteredAttendanceEvents.find(
                      (event) => event.trackingId === trackingId
                    );

                    let status = "Absent";
                    let colorClass =
                      "bg-red-500/10 border-red-500/30 text-red-400";

                    const statusColorToClass: Record<string, string> = {
                      red: "bg-red-500/10 border-red-500/30 text-red-400",
                      blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                      yellow:
                        "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                      teal: "bg-teal-500/10 border-teal-500/30 text-teal-400",
                    };

                    if (matchingEvent) {
                      status = matchingEvent.status;
                      colorClass =
                        statusColorToClass[matchingEvent.statusColor] ??
                        colorClass;
                    }

                    // const isCurrentTerm =
                    //   trackingItem.semester === semester &&
                    //   trackingItem.year === year;

                    return (
                      <m.div
                        key={trackingId}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        layoutId={trackingId}
                        transition={{
                          layout: springTransition,
                          opacity: { duration: 0.3 },
                        }}
                        className={`p-4 rounded-xl border hover:bg-opacity-20 ${colorClass} transition-all max-w-[700px] w-full mx-auto`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm capitalize">
                            {trackingItem.course.length > 26 &&
                            typeof window !== "undefined" &&
                            window.innerWidth < 600
                              ? trackingItem.course.slice(0, 26).toLowerCase() +
                                "..."
                              : trackingItem.course.toLowerCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            {trackingItem.semester !== semester ||
                            trackingItem.year !== year ? (
                              <Badge className="bg-orange-500/20 text-orange-400 text-sm">
                                ≠
                              </Badge>
                            ) : null}
                            <Badge
                              className={`
                                ${
                                  status === "Present"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : ""
                                }
                                ${
                                  status === "Absent"
                                    ? "bg-red-500/20 text-red-400"
                                    : ""
                                }
                                ${
                                  status === "Duty Leave"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : ""
                                }
                                ${
                                  status === "Other Leave" || status === "Leave"
                                    ? "bg-teal-500/20 text-teal-400"
                                    : ""
                                }
                              `}
                            >
                              {status}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center justify-between mt-2">
                          <div className="flex items-center justify-center gap-1 ">
                            <span className="font-medium">
                              {trackingItem.date}
                            </span>
                            •
                            <span className="font-medium capitalize">
                              {formatSessionName(trackingItem.session)}
                            </span>
                          </div>
                          <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              
                              handleDeleteTrackData(
                                trackingItem.username,
                                trackingItem.session,
                                trackingItem.course,
                                trackingItem.date
                              )
                            }
                            className="flex cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 bg-yellow-400/6 rounded-lg font-medium text-yellow-600 opacity-80 hover:opacity-100 transition-all duration-300"
                          >
                            {deleteId === trackingId ? (
                              <span>Deleting...</span>
                            ) : (
                              <>
                                <div className="max-md:hidden">
                                  {status === "Absent" ? (
                                    <p>Not updated yet</p>
                                  ) : (
                                    <p>Updated</p>
                                  )}
                                </div>
                                <div className="text-yellow-600 pb-[0.1px]">
                                  <Trash2
                                    size={15}
                                    className="hover:cursor-pointer"
                                  />
                                </div>
                              </>
                            )}
                          </m.button>
                        </div>
                      </m.div>
                    );
                  })}
                </m.div>
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-8">
                  <m.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    className={`h-8 w-8 flex justify-center items-center pr-[1.2px] rounded-lg ${
                      currentPage === 0
                        ? "text-muted-foreground bg-accent/30 cursor-not-allowed"
                        : "text-primary bg-accent hover:bg-accent/40"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </m.button>

                  <div className="text-sm text-muted-foreground font-medium mr-0.5">
                    Page {currentPage + 1} of {totalPages}
                  </div>

                  <m.button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`h-8 w-8 flex justify-center items-center pl-[1.2px] rounded-lg ${
                      currentPage === totalPages - 1
                        ? "text-muted-foreground bg-accent/30 cursor-not-allowed"
                        : "text-primary bg-accent hover:bg-accent/40"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </m.button>
                </div>
              )}
            </m.div>
          </>
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center h-[100%] mt-80"
          >
            <div className="rounded-full p-2 mb-4 w-fit h-fit text-amber-500 bg-amber-500/6">
              <CircleAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-1.5">No Records Found</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              You haven&apos;t added any attendance records to tracking yet
            </p>
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
};

export default Tracking;
