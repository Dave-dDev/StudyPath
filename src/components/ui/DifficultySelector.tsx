"use client";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const OPTIONS: { value: Difficulty; label: string; emoji: string; colors: string }[] = [
  { value: "easy",   label: "Easy",   emoji: "🟢", colors: "bg-green-50 text-green-400 border-green-400" },
  { value: "medium", label: "Medium", emoji: "🟡", colors: "bg-teal-50 text-teal-700 border-teal-400" },
  { value: "hard",   label: "Hard",   emoji: "🔴", colors: "bg-coral-50 text-coral-700 border-coral-400" },
];

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-1">Difficulty:</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            value === opt.value
              ? opt.colors + " border-2"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
