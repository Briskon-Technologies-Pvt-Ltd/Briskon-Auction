"use client";

import React from "react";
import { motion } from "framer-motion";
import { CirclePlus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  onClick?: () => void;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onClick,
  label,
  icon: Icon = CirclePlus,
  className,
}) => {
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: {
          scale: 1,
          boxShadow: "0 6px 18px rgba(34,197,94,0.25)",
        },
        hover: {
          scale: 1.06,
          boxShadow: "0 10px 28px rgba(34,197,94,0.4)",
        },
        tap: {
          scale: 0.95,
        },
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 16,
      }}
      className={cn(
        "relative isolate overflow-hidden px-5 py-2 rounded-full text-white text-sm font-normal bg-gradient-to-br from-green-400 via-green-500 to-emerald-600",
        className
      )}
    >
      {/* Animated glowing aura */}
      <motion.span
        variants={{
          rest: { opacity: 0.7 },
          hover: { opacity: 0.85 },
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 blur-md z-0"
      />

      {/* Shimmer light sweep */}
      <motion.span
        variants={{
          rest: { x: "-120%" },
          hover: { x: "120%" },
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
      />

      {/* Content */}
      <span className="relative z-20 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
    </motion.button>
  );
};
