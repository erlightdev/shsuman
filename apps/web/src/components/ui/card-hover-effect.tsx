import { type Accent, accentFor, accentStyles } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link?: string;
    tags?: string[];
    accent?: Accent | null;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-muted block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card accent={accentFor(item.accent ?? undefined, idx)}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            {item.tags && (
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {item.tags.map((tag) => (
                  <li key={tag}>#{tag.toLowerCase().replaceAll(" ", "-")}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
  accent,
}: {
  className?: string;
  children: React.ReactNode;
  accent?: Accent | null;
}) => {
  const styles = accent ? accentStyles(accent) : null;
  return (
    <div
      style={styles?.vars}
      className={cn(
        "rounded-2xl h-full w-full p-2 overflow-hidden bg-background border border-border group-hover:border-foreground/20 relative z-20 [--accent-line:0.22] dark:[--accent-line:0.28]",
        className
      )}
    >
      {styles && (
        <>
          {/* Soft color wash from the top-right corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,hsl(var(--accent-hue)/0.12),transparent_60%)] dark:bg-[radial-gradient(120%_90%_at_100%_0%,hsl(var(--accent-hue)/0.16),transparent_60%)]"
          />
          {/* Pattern, faded out toward the text */}
          <div
            aria-hidden="true"
            style={styles.pattern}
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(90%_75%_at_100%_0%,#000,transparent_70%)] transition-opacity duration-200 group-hover:opacity-100 opacity-80"
          />
          <span
            aria-hidden="true"
            className="absolute top-6 right-6 size-2 rounded-full bg-[hsl(var(--accent-hue))] ring-4 ring-[hsl(var(--accent-hue)/0.15)]"
          />
        </>
      )}
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground mt-4", className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-3 text-muted-foreground leading-7",
        className
      )}
    >
      {children}
    </p>
  );
};
