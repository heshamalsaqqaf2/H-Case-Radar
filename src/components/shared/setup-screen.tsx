"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { completeSetup } from "@/app/actions"; // استيراد الـ Server Action

interface SetupScreenProps {
  onSetupComplete: () => void;
}

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // استدعاء Server Action بدلاً من الدالة العادية
      completeSetup();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        {/* ... باقي كود الواجهة ... */}
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4 text-6xl"
          >
            ⚙️
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            جاري الإعداد...
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-400"
          >
            نعد الموقع ليناسب تفضيلاتك.
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="mt-6 h-1 w-64 mx-auto bg-gray-700 rounded-full overflow-hidden"
          >
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
