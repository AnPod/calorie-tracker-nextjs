'use client';

import { motion } from 'framer-motion';

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  colorVar: string;
}

export default function MacroBar({ label, consumed, goal, colorVar }: MacroBarProps) {
  const percentage = Math.min((consumed / goal) * 100, 100);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        <span>{label}</span>
        <span>{consumed} / {goal}g</span>
      </div>
      <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: `var(${colorVar})` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}
