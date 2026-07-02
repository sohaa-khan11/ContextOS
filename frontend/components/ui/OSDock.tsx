"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutGrid, Settings, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function OSDock() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutGrid, label: "Projects", href: "/" },
    { icon: Brain, label: "Memory Log", href: "/memory" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="flex items-center gap-1 px-2 border-r border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/90 mr-4">ContextOS</span>
        </div>
        
        <div className="flex items-center gap-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith('/projects') && item.href === '/');
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-xl transition-colors duration-200 ${
                    isActive ? "text-primary bg-primary/10" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              </Link>
            );
          })}
        </div>

        <div className="pl-2 border-l border-white/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
