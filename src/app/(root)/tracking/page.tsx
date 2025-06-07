"use client";

import { useState } from "react";
import { useTrackingData } from "@/hooks/tracker/useTrackingData";
import { useUser } from "@/hooks/users/user";
import { getToken } from "@/utils/auth";
import { Badge } from "@/components/ui/badge";
import { Trash2, CircleAlert, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

const Tracking = () => {
  const { data: user } = useUser();
  const accessToken = getToken();
  const [deleteId, setDeleteId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const {
    data: trackingData,
    isLoading,
    refetch,
  } = useTrackingData(user, accessToken);

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
    refetch();
    setDeleteId("");
  };

  if (isLoading) {
    return (
      <div className="flex h-[90vh] items-center justify-center bg-background text-xl font-medium text-muted-foreground text-center italic mx-12">
        &quot;Waiting on Ezygo to stop ghosting us 👻&quot;
      </div>
    );
  }

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
    <LazyMotion features={domAnimation}>
      <div className="flex flex-1 flex-col flex-wrap gap-4 h-full m-6 text-center min-h-[100vh] relative">
        {trackingData && trackingData.length > 0 ? (
          <>
            <div className="mb-2 pb-4 mt-10">
              <p className="text-2xl font-semibold text-foreground py-2 max-md:text-xl">
                Attendance Tracker
              </p>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                These are absences you&apos;ve marked for duty leave. <br />{" "}
                Track their update status here. 📋
              </p>
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
                  {getCurrentPageItems().map((data, index) => {
                    const trackingId = `${data.username}-${data.session}-${data.course}-${data.date}`;
                    const colors: Record<string, string> = {
                      Present:
                        "bg-blue-500/10 border-blue-500/30 text-blue-400",
                      Absent:
                        "bg-red-500/10 border-red-500/30 text-red-400 backdrop-blur-sm",
                      "Duty Leave":
                        "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                      "Other Leave":
                        "bg-teal-500/10 border-teal-500/30 text-teal-400",
                    };

                    const colorClass =
                      colors[data.status] || "bg-accent/50 border-border";

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
                            {data.course.length > 26 &&
                            typeof window !== "undefined" &&
                            window.innerWidth < 600
                              ? data.course.slice(0, 26).toLowerCase() + "..."
                              : data.course.toLowerCase()}
                          </div>
                          <Badge
                            className={`
                            ${
                              data.status === "Present"
                                ? "bg-blue-500/20 text-blue-400"
                                : ""
                            }
                            ${
                              data.status === "Absent"
                                ? "bg-red-500/20 text-red-400"
                                : ""
                            }
                            ${
                              data.status === "Duty Leave"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : ""
                            }
                            ${
                              data.status === "Other Leave"
                                ? "bg-teal-500/20 text-teal-400"
                                : ""
                            }
                          `}
                          >
                            {data.status}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center justify-between mt-2">
                          <div className="flex items-center justify-center gap-1 ">
                            <span className="font-medium">
                              {data.date.toString()}
                            </span>
                            •
                            <span className="font-medium capitalize">
                              {formatSessionName(data.session)}
                            </span>
                          </div>
                          <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleDeleteTrackData(
                                data.username,
                                data.session,
                                data.course,
                                data.date.toString()
                              )
                            }
                            className="flex cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 bg-yellow-400/6 rounded-lg font-medium text-yellow-600 opacity-80 hover:opacity-100 transition-all duration-300"
                          >
                            {deleteId ===
                            `${data.username}-${data.session}-${
                              data.course
                            }-${data.date.toString()}` ? (
                              <span>Deleting...</span>
                            ) : (
                              <>
                                <div className="max-md:hidden">
                                  {data.status === "Absent" ? (
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
            className="flex flex-col items-center h-[100%] my-auto"
          >
            <div className="rounded-full p-2 mb-4 w-fit h-fit text-amber-500 bg-amber-500/6">
              <CircleAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-1.5">No Records Found</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              You don&apos;t have any attendance records to display at the
              moment.
            </p>
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
};

export default Tracking;
