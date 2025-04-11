import { Miyagi } from "ldrs/react";
import "ldrs/react/Miyagi.css";

export function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Miyagi size="35" stroke="3.5" speed="0.9" color="#e6d1be" />
    </div>
  );
}
