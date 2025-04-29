import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Ring2 size="35" stroke="3.5" speed="0.9" color="#d3e6e8" />
    </div>
  );
}
