"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import AnimatedLogo from "./animated-logo";

export default function EntryPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + Math.random() * 10, 100);
        if (newProgress === 100) {
          clearInterval(timer);
        }
        return newProgress;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-[#5e2c5f]">
      <div className="text-center max-w-md w-full px-4">
        <div className="mb-12">
          <AnimatedLogo />
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Workify
          </motion.h1>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          >
            Preparing your workspaces
          </motion.p>
        </div>
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#5e2c5f] h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {progress < 100 ? "Loading your data..." : "Ready to launch!"}
          </p>
        </div>
      </div>
      <footer className="absolute bottom-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Workify. All rights reserved.
      </footer>
    </div>
  );
}
