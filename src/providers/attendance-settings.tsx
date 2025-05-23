"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AttendanceSettingsContextType {
  targetPercentage: number;
  setTargetPercentage: (percentage: number) => void;
}

const AttendanceSettingsContext = createContext<
  AttendanceSettingsContextType | undefined
>(undefined);

interface AttendanceSettingsProviderProps {
  children: ReactNode;
}

export function AttendanceSettingsProvider({
  children,
}: AttendanceSettingsProviderProps) {
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  useEffect(() => {
    const savedTarget = localStorage.getItem("targetAttendancePercentage");
    if (savedTarget) {
      setTargetPercentage(Number(savedTarget));
    }
  }, []);

  const handleSetTargetPercentage = (percentage: number) => {
    setTargetPercentage(percentage);
    localStorage.setItem("targetAttendancePercentage", percentage.toString());
  };

  return (
    <AttendanceSettingsContext.Provider
      value={{
        targetPercentage,
        setTargetPercentage: handleSetTargetPercentage,
      }}
    >
      {children}
    </AttendanceSettingsContext.Provider>
  );
}

export const useAttendanceSettings = () => {
  const context = useContext(AttendanceSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useAttendanceSettings must be used within an AttendanceSettingsProvider"
    );
  }
  return context;
};
