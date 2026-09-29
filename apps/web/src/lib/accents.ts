import type { ACCENTS } from "@shsuman/api/content/schema";
import type { CSSProperties } from "react";

export type Accent = (typeof ACCENTS)[number];

/**
 * Each accent pairs a hue with its own pattern. Colors are fixed here (UI),
 * content only picks the accent name.
 */
const accents: Record<Accent, { hue: string; pattern: "grid" | "dots" | "diagonal" | "cross" | "rings" }> = {
  amber: { hue: "38 92% 50%", pattern: "grid" },
  sky: { hue: "199 89% 48%", pattern: "dots" },
  emerald: { hue: "160 84% 39%", pattern: "diagonal" },
  violet: { hue: "262 83% 58%", pattern: "cross" },
  rose: { hue: "350 89% 60%", pattern: "rings" },
};

const ORDER: Accent[] = ["amber", "sky", "emerald", "violet", "rose"];

export function accentFor(accent: Accent | undefined, index: number): Accent {
  return accent ?? ORDER[index % ORDER.length];
}

const line = "hsl(var(--accent-hue) / var(--accent-line))";

const patterns: Record<(typeof accents)[Accent]["pattern"], CSSProperties> = {
  grid: {
    backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    backgroundSize: "22px 22px",
  },
  dots: {
    backgroundImage: `radial-gradient(${line} 1.2px, transparent 1.6px)`,
    backgroundSize: "14px 14px",
  },
  diagonal: {
    backgroundImage: `repeating-linear-gradient(135deg, ${line} 0 1px, transparent 1px 11px)`,
  },
  cross: {
    backgroundImage: `radial-gradient(circle, ${line} 1px, transparent 1px), linear-gradient(to right, transparent 10px, ${line} 10px, ${line} 11px, transparent 11px)`,
    backgroundSize: "21px 21px",
  },
  rings: {
    backgroundImage: `repeating-radial-gradient(circle at 100% 0%, transparent 0 13px, ${line} 13px 14px)`,
  },
};

/** Inline styles for the pattern layer and the soft corner wash. */
export function accentStyles(accent: Accent) {
  const { hue, pattern } = accents[accent];
  const vars = { "--accent-hue": hue } as CSSProperties;
  return {
    vars,
    pattern: patterns[pattern],
  };
}
