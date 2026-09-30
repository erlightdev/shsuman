"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Moon,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";

interface Props {
  name?: string;
  items: { name: string; link: string }[];
}

const ICON_MAP: Record<string, typeof Home> = {
  about: User,
  services: Layers,
  experience: GraduationCap,
  awards: Award,
  resources: FolderOpen,
  blog: BookOpen,
  contact: Mail,
  work: Briefcase,
};

function getIcon(name: string) {
  const key = name.toLowerCase();
  return ICON_MAP[key] ?? Sparkles;
}

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export function SiteNavbar({ items }: Props) {
  const [active, setActive] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (path.startsWith("/resources")) return "/resources/";
      if (path.startsWith("/blog")) return "/blog/";
      if (hash) return `/${hash}`;
      return "/";
    }
    return "/";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLocation = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (path.startsWith("/resources")) {
        setActive("/resources/");
      } else if (path.startsWith("/blog")) {
        setActive("/blog/");
      } else if (hash) {
        setActive(`/${hash}`);
      } else if (path === "/" || path === "") {
        setActive("/");
      }
    };

    window.addEventListener("hashchange", handleLocation);
    window.addEventListener("popstate", handleLocation);

    // Scroll spy for sections on home page
    if (window.location.pathname === "/" || window.location.pathname === "") {
      const sectionIds = ["about", "services", "work", "experience", "credentials", "awards", "contact"];
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (sections.length > 0) {
        const observer = new IntersectionObserver(
          (entries) => {
            const visible = entries.find((e) => e.isIntersecting);
            if (visible) {
              setActive(`/#${visible.target.id}`);
            }
          },
          { rootMargin: "-25% 0px -60% 0px" },
        );

        for (const el of sections) observer.observe(el);

        return () => {
          observer.disconnect();
          window.removeEventListener("hashchange", handleLocation);
          window.removeEventListener("popstate", handleLocation);
        };
      }
    }

    return () => {
      window.removeEventListener("hashchange", handleLocation);
      window.removeEventListener("popstate", handleLocation);
    };
  }, []);

  return (
    <header className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4">
      <div className="pointer-events-auto max-w-full">
        <Dock size={40}>
          {/* Home */}
          <DockItem
            href="/"
            aria-label="Home"
            title="Home"
            showTooltipOnDesktop
            active={active === "/"}
            onClick={() => setActive("/")}
            className="size-10 px-0"
          >
            <Home className="size-4 shrink-0" aria-hidden="true" />
          </DockItem>

          <DockSeparator />

          {/* Nav Items */}
          {items.map((item) => {
            const Icon = getIcon(item.name);
            const isItemActive =
              active === item.link ||
              (item.link.startsWith("/#") && active === item.link);

            return (
              <DockItem
                key={item.link}
                href={item.link}
                aria-label={item.name}
                active={isItemActive}
                onClick={() => setActive(item.link)}
                className="md:px-3.5"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline font-medium">
                  {item.name}
                </span>
              </DockItem>
            );
          })}

          <DockSeparator />

          {/* Contact */}
          <DockItem
            href="/#contact"
            aria-label="Contact"
            title="Contact"
            showTooltipOnDesktop
            active={active === "/#contact"}
            onClick={() => setActive("/#contact")}
            className="size-10 px-0"
          >
            <Mail className="size-4 shrink-0" aria-hidden="true" />
          </DockItem>

          {/* Theme Toggle */}
          <DockItem
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            showTooltipOnDesktop
            className="size-10 px-0"
          >
            <Sun className="hidden size-4 dark:block shrink-0" aria-hidden="true" />
            <Moon className="size-4 dark:hidden shrink-0" aria-hidden="true" />
          </DockItem>
        </Dock>
      </div>
    </header>
  );
}
