"use client";

import { Loading } from "@/components/loading";
import { useTrackingData } from "@/hooks/tracker/useTrackingData";
import { useUser } from "@/hooks/users/user";
import { getToken } from "@/utils/auth";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Box } from "lucide-react";
const Tracking = () => {
  const { data: user } = useUser();
  const accessToken = getToken();
  const { data: trackingData, isLoading } = useTrackingData(user, accessToken);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 flex-col flex-wrap gap-4 h-full m-6">
      {trackingData && trackingData.length > 0 ? (
        <>
          <div className="mb-2 pb-4">
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
                className={`p-4 rounded-lg border hover:bg-opacity-20 ${colorClass}  transition-all`}
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
                  <span>{formatSessionName(data.session)}</span>
                  <p>Not updated yet</p>
                </div>
              </motion.div>
            );
          })}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[340px] text-center px-4">
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
