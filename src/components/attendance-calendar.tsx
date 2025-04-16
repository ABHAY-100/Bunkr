"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AttendanceCalendar({ attendanceData }) {
  // Use separate year and month state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // Create a Date object from the current year and month for calculations
  const currentDate = new Date(currentYear, currentMonth, 1);

  // Parse the attendance data and create events when the data changes
  useEffect(() => {
    if (!attendanceData?.studentAttendanceData) return;

    const newEvents = [];

    // Convert the attendance data to events format
    Object.entries(attendanceData.studentAttendanceData).forEach(
      ([dateStr, sessions]) => {
        // Parse the date string in the format YYYYMMDD
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // Adjust month (0-based)
        const day = parseInt(dateStr.substring(6, 8));

        Object.entries(sessions).forEach(([sessionKey, sessionData]) => {
          // If there's no course, skip this entry
          if (!sessionData.course) return;

          // Get course information
          const courseId = sessionData.course.toString();
          const courseName =
            attendanceData.courses?.[courseId]?.name || "Unknown Course";

          // Get session information
          const sessionInfo = attendanceData.sessions?.[sessionKey] || {
            name: `Session ${sessionKey}`,
          };
          const sessionName = sessionInfo.name;

          // Determine attendance status
          let attendanceStatus = "normal";
          let attendanceLabel = "Present";
          let statusColor = "blue";

          if (sessionData.attendance === 110) {
            attendanceStatus = "normal";
            attendanceLabel = "Present";
            statusColor = "blue";
          } else if (sessionData.attendance === 111) {
            attendanceStatus = "important";
            attendanceLabel = "Absent";
            statusColor = "red";
          } else if (sessionData.attendance === 225) {
            attendanceStatus = "normal";
            attendanceLabel = "Duty Leave";
            statusColor = "yellow";
          } else if (sessionData.attendance === 112) {
            attendanceStatus = "important";
            attendanceLabel = "Other Leave";
            statusColor = "teal";
          }

          const date = new Date(year, month, day);

          newEvents.push({
            title: courseName,
            date,
            sessionName,
            sessionKey,
            type: attendanceStatus,
            status: attendanceLabel,
            statusColor,
            courseId,
          });
        });
      }
    );

    setEvents(newEvents);
  }, [attendanceData]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate array of years from 2023 to current year + 5
  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYearNum + 5 - 2023 + 1 },
    (_, i) => 2023 + i
  );

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const getDateEvents = (date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const formatSessionName = (sessionName) => {
    // Convert Roman numerals to ordinal numbers
    const romanToOrdinal = {
      I: "1st hour",
      II: "2nd hour",
      III: "3rd hour",
      IV: "4th hour",
      V: "5th hour",
      VI: "6th hour",
      VII: "7th hour",
    };

    // If it's a Roman numeral, return the corresponding ordinal hour
    if (romanToOrdinal[sessionName]) {
      return romanToOrdinal[sessionName];
    }

    // Otherwise return the original name
    return sessionName;
  };

  const getEventStatus = (date) => {
    const dateEvents = getDateEvents(date);
    if (dateEvents.length === 0) return null;

    const hasAbsent = dateEvents.some((event) => event.status === "Absent");
    const hasPresent = dateEvents.some((event) => event.status === "Present");
    const hasDutyLeave = dateEvents.some(
      (event) => event.status === "Duty Leave"
    );
    const hasOtherLeave = dateEvents.some(
      (event) => event.status === "Other Leave"
    );

    // Return status with priority: Absent > Other Leave > Duty Leave > Present
    if (hasAbsent) return "absent";
    if (hasOtherLeave) return "otherLeave";
    if (hasDutyLeave) return "dutyLeave";
    if (hasPresent) return "present";

    return "normal";
  };

  const selectedDateEvents = getDateEvents(selectedDate);

  // Generate calendar grid cells
  const generateCalendarCells = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    // Generate leading empty cells for the first week
    const leadingEmptyCells = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => (
        <div key={`empty-leading-${index}`} className="h-10 w-full" />
      ));

    // Generate day cells
    const dayCells = Array(daysInMonth)
      .fill(null)
      .map((_, index) => {
        const date = new Date(currentYear, currentMonth, index + 1);
        const status = getEventStatus(date);
        const hasEvents = getDateEvents(date).length > 0;
        const isSelected = isSameDay(date, selectedDate);

        let className =
          "h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm cursor-pointer transition-all duration-200 hover:scale-110 ";

        if (isSelected) {
          className +=
            "bg-primary text-primary-foreground font-medium shadow-lg scale-110";
        } else if (status === "absent") {
          className +=
            "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30";
        } else if (status === "otherLeave") {
          className +=
            "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30";
        } else if (status === "dutyLeave") {
          className +=
            "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30";
        } else if (status === "present") {
          className +=
            "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30";
        } else if (hasEvents) {
          className += "ring-1 ring-gray-500/30 hover:ring-gray-500/50";
        } else {
          className += "hover:bg-accent/50";
        }

        // Add today indicator
        if (isToday(date)) {
          className +=
            " ring-2 ring-offset-1 ring-offset-background ring-primary";
        }

        return (
          <div
            key={`day-${index}`}
            className="flex items-center justify-center"
            onClick={() => setSelectedDate(date)}
          >
            <div className={className}>{index + 1}</div>
          </div>
        );
      });

    // Combine all cells
    return [...leadingEmptyCells, ...dayCells];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="overflow-hidden border border-border/40 shadow-md backdrop-blur-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
          <div className="flex items-center gap-2">
            {/* Month selector dropdown */}
            <Select
              value={currentMonth.toString()}
              onValueChange={(value) => setCurrentMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[130px] h-9 bg-background/60 border-border/60 text-sm capitalize">
                <SelectValue>
                  {monthNames[currentMonth].toLowerCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/90 border-border/60 backdrop-blur-md">
                {monthNames.map((month, index) => (
                  <SelectItem
                    key={month}
                    value={index.toString()}
                    className="capitalize"
                  >
                    {month.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year selector dropdown */}
            <Select
              value={currentYear.toString()}
              onValueChange={(value) => setCurrentYear(parseInt(value))}
            >
              <SelectTrigger className="w-[90px] h-9 bg-background/60 border-border/60 text-sm">
                <SelectValue>{currentYear}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/90 border-border/60 max-h-60 backdrop-blur-md">
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-9 w-9 rounded-full hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 rounded-full hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-9 text-xs hover:bg-accent ml-1"
            >
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Day header row */}
          <div className="grid grid-cols-7 mb-2">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className="text-xs font-medium text-muted-foreground text-center py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 pb-2">
            {generateCalendarCells()}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 text-muted-foreground text-xs justify-center border-t border-border/40 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span>absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-500/20 border border-teal-500/30" />
              <span>other leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <span>duty leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500/20 border border-blue-500/30" />
              <span>present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full ring-2 ring-primary" />
              <span>today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border border-border/40 shadow-md backdrop-blur-sm">
        <CardHeader className="border-b border-border/40 pt-1.5">
          <CardTitle className="text-base font-normal flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {selectedDate
              .toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toLowerCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {selectedDateEvents.length > 0 ? (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3 p-4">
                    {selectedDateEvents.map((event, index) => {
                      // Determine the color scheme based on the status
                      const colors = {
                        Present:
                          "bg-blue-500/10 border-blue-500/30 text-blue-400",
                        Absent: "bg-red-500/10 border-red-500/30 text-red-400",
                        "Duty Leave":
                          "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                        "Other Leave":
                          "bg-teal-500/10 border-teal-500/30 text-teal-400",
                      };

                      const colorClass =
                        colors[event.status] || "bg-accent/50 border-border";

                      return (
                        <motion.div
                          key={`event-${index}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                          }}
                          className={`p-4 rounded-lg border ${colorClass} hover:bg-opacity-20 transition-all`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm">
                              {event.title}
                            </div>
                            <Badge
                              className={`
                                ${
                                  event.status === "Present"
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    : ""
                                }
                                ${
                                  event.status === "Absent"
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : ""
                                }
                                ${
                                  event.status === "Duty Leave"
                                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                    : ""
                                }
                                ${
                                  event.status === "Other Leave"
                                    ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                                    : ""
                                }
                              `}
                            >
                              {event.status}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
                            <span>
                              {event.sessionName
                                ? formatSessionName(event.sessionName)
                                : `Session ${event.sessionKey}`}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[340px] text-center px-4">
                  <div className="rounded-full bg-accent/50 p-4 mb-4">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Events</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    There are no classes or events scheduled for this date.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    onClick={goToToday}
                  >
                    Go to Today
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
