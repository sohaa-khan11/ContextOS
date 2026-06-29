"use client";
import { Command } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function EnterDemoButton() {
  return (
    <Link href="/projects">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-12 px-8 rounded-full bg-primary text-white font-medium shadow-[0_4px_20px_rgba(255,77,94,0.4)] hover:shadow-[0_6px_25px_rgba(255,77,94,0.6)] transition-all duration-300 flex items-center gap-2 justify-center mx-auto"
      >
        <Command className="w-4 h-4" />
        Initialize ContextOS
      </motion.button>
    </Link>
  );
}
