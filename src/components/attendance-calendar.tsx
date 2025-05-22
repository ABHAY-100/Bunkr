"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
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
import { SessionData, AttendanceEvent, Session, Course } from "@/types";

interface AttendanceData {
  studentAttendanceData?: Record<string, Record<string, SessionData>>;
  courses?: Record<string, Course>;
  sessions?: Record<string, Session>;
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceData | undefined;
}

export function AttendanceCalendar({
  attendanceData,
}: AttendanceCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!attendanceData?.studentAttendanceData) return;

    const newEvents: AttendanceEvent[] = [];

    Object.entries(attendanceData.studentAttendanceData).forEach(
      ([dateStr, sessions]) => {
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
        const day = parseInt(dateStr.substring(6, 8), 10);

        Object.entries(sessions).forEach(([sessionKey, sessionData]) => {
          if (!sessionData.course) return;

          const courseId = sessionData.course.toString();
          const courseName =
            attendanceData.courses?.[courseId]?.name || "Unknown Course";

          const sessionInfo = attendanceData.sessions?.[sessionKey] || {
            name: `Session ${sessionKey}`,
          };
          const sessionName = sessionInfo.name;

          let attendanceStatus = "normal";
          let attendanceLabel = "Present";
          let statusColor = "blue";

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
              attendanceLabel = "Other Leave";
              statusColor = "teal";
              break;
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

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "present")
      return events.filter((e) => e.status === "Present");
    if (filter === "absent") return events.filter((e) => e.status === "Absent");
    if (filter === "dutyLeave")
      return events.filter((e) => e.status === "Duty Leave");
    if (filter === "otherLeave")
      return events.filter((e) => e.status === "Other Leave");
    return events;
  }, [events, filter]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
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

  const yearOptions = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    return Array.from(
      { length: currentYearNum + 1 - 2018 + 1 },
      (_, i) => 2018 + i
    );
  }, []);

  const getDaysInMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback(
    (year: number, month: number): number => {
      return new Date(year, month, 1).getDay();
    },
    []
  );

  const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  const isToday = useCallback((date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  }, []);

  const getEventStatus = useCallback(
    (date: Date): string | null => {
      const dateEvents = filteredEvents.filter((event) =>
        isSameDay(event.date, date)
      );
      if (dateEvents.length === 0) return null;

      const hasAbsent = dateEvents.some((event) => event.status === "Absent");
      const hasPresent = dateEvents.some((event) => event.status === "Present");
      const hasDutyLeave = dateEvents.some(
        (event) => event.status === "Duty Leave"
      );
      const hasOtherLeave = dateEvents.some(
        (event) => event.status === "Other Leave"
      );

      if (hasAbsent) return "absent";
      if (hasOtherLeave) return "otherLeave";
      if (hasDutyLeave) return "dutyLeave";
      if (hasPresent) return "present";

      return "normal";
    },
    [filteredEvents, isSameDay]
  );

  const selectedDateEvents = useMemo(() => {
    const getDateEvents = (date: Date): AttendanceEvent[] => {
      return filteredEvents.filter((event) => isSameDay(event.date, date));
    };
    return getDateEvents(selectedDate) || [];
  }, [selectedDate, filteredEvents, isSameDay]);

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

  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const leadingEmptyCells = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => (
        <div key={`empty-leading-${index}`} className="h-10 w-full" />
      ));

    const dayCells = Array(daysInMonth)
      .fill(null)
      .map((_, index) => {
        const date = new Date(currentYear, currentMonth, index + 1);
        const status = getEventStatus(date);
        const hasEvents =
          filteredEvents.filter((event) => isSameDay(event.date, date)).length >
          0;
        const isSelected = isSameDay(date, selectedDate);

        let className =
          "h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm cursor-pointer transition-all duration-200 hover:scale-104 ";

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

    return [...leadingEmptyCells, ...dayCells];
  }, [
    currentYear,
    currentMonth,
    selectedDate,
    filteredEvents,
    getDaysInMonth,
    getFirstDayOfMonth,
    getEventStatus,
    isSameDay,
    isToday,
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="overflow-hidden border border-border/40 shadow-md backdrop-blur-sm custom-container">
        <CardHeader className="pb-2 flex flex-row items-center justify-between max-sm:justify-center space-y-0 border-b border-border/40 calendar-trouble">
          <div className="flex items-center gap-2 max-md:flex-wrap max-md:justify-center">
            {/* Filter Dropdown */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px] h-9 bg-background/60 border-border/60 text-sm capitalize custom-dropdown">
                <SelectValue>
                  {filter === "all"
                    ? "All"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/90 border-border/60 backdrop-blur-md custom-dropdown max-h-70">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="dutyLeave">Duty Leave</SelectItem>
                <SelectItem value="otherLeave">Other Leave</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currentMonth.toString()}
              onValueChange={(value) => setCurrentMonth(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[130px] h-9 bg-background/60 border-border/60 text-sm capitalize custom-dropdown">
                <SelectValue>{monthNames[currentMonth]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/90 border-border/60 backdrop-blur-md custom-dropdown max-h-70">
                {monthNames.map((month, index) => (
                  <SelectItem
                    key={month}
                    value={index.toString()}
                    className={
                      currentMonth === index
                        ? "bg-white/5 mt-0.5"
                        : "capitalize"
                    }
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentYear.toString()}
              onValueChange={(value) => setCurrentYear(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[90px] h-9 bg-background/60 border-border/60 text-sm custom-dropdown">
                <SelectValue>{currentYear}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/90 border-border/60 max-h-70 backdrop-blur-md custom-dropdown">
                {yearOptions.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className={
                      currentYear === year ? "bg-white/5 mt-0.5" : "mt-0.5"
                    }
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-9 w-9 rounded-lg bg-accent/50 flex justify-center items-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 rounded-lg bg-accent/50 flex justify-center items-center"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-9 text-xs hover:bg-accent/15! ml-1 custom-button bg-black/20!"
            >
              Today
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="p-4">
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

          <div className="grid grid-cols-7 gap-1 pb-2">{calendarCells}</div>

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
              <div className="h-3 w-3 rounded-full outline-2 outline-primary" />
              <span>today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border border-border/40 shadow-md backdrop-blur-sm custom-container">
        <CardHeader className="border-b border-border/40 pt-1.5">
          <CardTitle className="text-base flex items-center gap-2 font-medium">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
                      const colors: Record<string, string> = {
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
                          key={`event-${event.sessionKey}-${index}`}
                          className={`p-4 rounded-lg border ${colorClass} hover:bg-opacity-20 transition-all`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm capitalize">
                              {event.title.toLowerCase()}
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
                    className="mt-6 h-9 text-xs hover:bg-accent/15! ml-1 custom-button bg-black/20!"
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
