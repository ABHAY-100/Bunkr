"use client";

import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.div initial="hidden" animate="visible" exit="hidden">
      <div className="flex justify-center items-center pb-10 pt-4 text-md lowercase">
        <p className="text-[#6a6a6ae1]">
          <span className="inline-block font-mono">built by</span>{" "}
          <span className="text-[#F90D2A] inline-block font-mono ml-1.5">
            Zero-Day
          </span>
        </p>
      </div>
    </motion.div>
  );
};
