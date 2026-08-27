"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export default function RotatingWord({ words, intervalMs = 2600, className }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => {
      const next = (indexRef.current + 1) % words.length;
      setPrevIndex(indexRef.current);
      indexRef.current = next;
      setIndex(next);
    }, intervalMs);
    return () => clearInterval(t);
  }, [words.length, intervalMs]);

  return (
    <span className={cn("word-stack", className)} aria-live="off">
      {words.map((word, i) => {
        const state =
          i === index ? "word-active" : i === prevIndex ? "word-out" : "word-in";
        return (
          <span key={word} className={cn("word-item", state)} aria-hidden={i !== index}>
            {word}
          </span>
        );
      })}
    </span>
  );
}
