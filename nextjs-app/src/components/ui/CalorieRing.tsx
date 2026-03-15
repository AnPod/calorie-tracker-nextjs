'use client';

import { motion } from 'framer-motion';

interface CalorieRingProps {
  consumed: number;
  goal: number;
}

export default function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const size = 160;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  const percentage = Math.min((consumed / goal) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(goal - consumed, 0);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="var(--surface-border)"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        {/* Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-gradient-start)" />
            <stop offset="100%" stopColor="var(--primary-gradient-end)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-3xl font-bold tracking-tight text-slate-800">
          {remaining}
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Remaining
        </span>
      </div>
    </div>
  );
}
