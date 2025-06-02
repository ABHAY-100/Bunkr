"use client";
import { useState } from "react";
import { Loading } from "@/components/loading";
import { useTrackingData } from "@/hooks/tracker/useTrackingData";
import { useUser } from "@/hooks/users/user";
import { getToken } from "@/utils/auth";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Box, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
const Tracking = () => {
  const { data: user } = useUser();
  const accessToken = getToken();
  const [deleteId, setDeleteId] = useState<string>("");
  const {
    data: trackingData,
    isLoading,
    refetch,
  } = useTrackingData(user, accessToken);
  console.log("track data", trackingData);
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
      toast.success("Delete successfull");
    }
    if (!res.data.success) {
      toast.error("Error deleting the message");
    }
    refetch();
    setDeleteId("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col flex-wrap gap-4 h-full m-6 text-center min-h-[80vh]">
      {trackingData && trackingData.length > 0 ? (
        <>
          <div className="mb-2 pb-4 mt-10">
            <p className="text-2xl font-semibold text-foreground py-3">
              Tracked Attendance
            </p>
            <p className="text-sm text-muted-foreground">
              Here&apos; a record of your attendance, including duty leaves ,
              other leaves etc...
            </p>
          </div>
          {trackingData.map((data, index) => {
            const colors: Record<string, string> = {
              Present: "bg-blue-500/10 border-blue-500/30 text-blue-400",
              Absent: "bg-red-500/10 border-red-500/30 text-red-400",
              "Duty Leave":
                "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
              "Other Leave": "bg-teal-500/10 border-teal-500/30 text-teal-400",
            };

            const colorClass =
              colors[data.status] || "bg-accent/50 border-border";

            return (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border hover:bg-opacity-20 ${colorClass}  transition-all max-w-[800px] w-full mx-auto`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm capitalize">
                    {data.course.toLowerCase()}
                  </div>
                  <Badge
                    className={`
                    ${
                      data.status === "Present"
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : ""
                    }
                    ${
                      data.status === "Absent"
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : ""
                    }
                    ${
                      data.status === "Duty Leave"
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : ""
                    }
                    ${
                      data.status === "Other Leave"
                        ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                        : ""
                    }
                  `}
                  >
                    {data.status}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-between mt-2">
                  <div className="flex items-center justify-center gap-1 ">
                    <span>{data.date.toString()}</span>
                    <strong className="font-bold">.</strong>
                    <span>{formatSessionName(data.session)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 ">
                    {data.status === "Absent" ? (
                      <p>Not updated yet</p>
                    ) : (
                      <p>Updated</p>
                    )}
                    {deleteId ===
                    `${data.username}-${data.session}-${
                      data.course
                    }-${data.date.toString()}` ? (
                      <span>Deleting...</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleDeleteTrackData(
                            data.username,
                            data.session,
                            data.course,
                            data.date.toString()
                          )
                        }
                      >
                        <Trash2 size={18} className="hover:cursor-pointer" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </>
      ) : (
        <div className="flex flex-col items-center justify-centertext-center px-4">
          <div className="rounded-full bg-accent/50 p-4 mb-4">
            <Box />
          </div>
          <h3 className="text-lg font-medium mb-1">No Records Found</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            You don&apos;t have any attendance records to display at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tracking;
