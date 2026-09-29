"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

type DockContextValue = {
  size: number;
  pillLayoutId: string;
};

const DockContext = createContext<DockContextValue | null>(null);

export interface DockProps {
  children: ReactNode;
  className?: string;
  /** Size of each item in px. */
  size?: number;
}

export function Dock({ children, size = 40, className }: DockProps) {
  const pillLayoutId = useId();
  const ctx = useMemo<DockContextValue>(
    () => ({ size, pillLayoutId }),
    [size, pillLayoutId],
  );

  return (
    <DockContext.Provider value={ctx}>
      <nav
        aria-label="Main Navigation Dock"
        className={cn(
          "inline-flex h-auto items-center gap-1 sm:gap-1.5 rounded-full border border-border/80 bg-card/85 p-1.5 shadow-xl shadow-black/5 backdrop-blur-xl ring-1 ring-white/10 dark:shadow-black/40",
          className,
        )}
      >
        {children}
      </nav>
    </DockContext.Provider>
  );
}

export interface DockItemProps {
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  /** When set, the item renders as a <button>. Omit when children carry their own link or button. */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  active?: boolean;
  "aria-label"?: string;
  title?: string;
  showTooltipOnDesktop?: boolean;
}

export function DockItem({
  children,
  className,
  href,
  target,
  rel,
  onClick,
  active = false,
  title,
  showTooltipOnDesktop = false,
  ...rest
}: DockItemProps) {
  const dock = useContext(DockContext);
  const reduce = useReducedMotion();
  const size = dock?.size ?? 40;
  const pillLayoutId = dock?.pillLayoutId ?? "dock-pill";
  const [hovered, setHovered] = useState(false);

  const label = rest["aria-label"] || title;

  const pill = active ? (
    <motion.span
      layoutId={pillLayoutId}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      className="absolute inset-0.5 -z-10 rounded-full bg-brand-8 border border-brand-base/20 shadow-xs"
    />
  ) : null;

  const tooltip = label && hovered ? (
    <motion.span
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 2, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-50 rounded-md bg-foreground px-2 py-0.5 text-[11px] font-medium text-background shadow-lg whitespace-nowrap",
        !showTooltipOnDesktop && "md:hidden",
      )}
    >
      {label}
    </motion.span>
  ) : null;

  const sharedClass = cn(
    "group relative flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full px-2.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5 outline-none text-xs font-medium",
    active && "text-emerald-600 dark:text-emerald-400 font-semibold",
    className,
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        title={title}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        className={sharedClass}
      >
        {pill}
        {children}
        {tooltip}
      </motion.a>
    );
  }

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={label}
        aria-pressed={active}
        title={title}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        className={cn(
          sharedClass,
          "cursor-pointer border-0 bg-transparent",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {pill}
        {children}
        {tooltip}
      </motion.button>
    );
  }

  return (
    <div
      className={sharedClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {pill}
      {children}
      {tooltip}
    </div>
  );
}

export function DockSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-0.5 sm:mx-1 h-5 w-px self-center bg-border", className)}
    />
  );
}
