import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

interface Props {
  name: string;
  items: { name: string; link: string }[];
}

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="relative z-20 grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}

function Brand({ name }: { name: string }) {
  return (
    <a href="/" className="relative z-20 px-2 py-1 text-sm font-semibold whitespace-nowrap text-foreground">
      {name}
    </a>
  );
}

export function SiteNavbar({ name, items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Navbar className="top-[max(1rem,env(safe-area-inset-top))]">
      <NavBody className="max-w-6xl">
        <Brand name={name} />
        <NavItems items={items} />
        <div className="relative z-20 flex items-center gap-1">
          <ThemeToggle />
          <NavbarButton
            href="/#contact"
            variant="dark"
            className="rounded-full bg-primary px-4 font-medium text-primary-foreground"
          >
            Get in touch
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Brand name={name} />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <MobileNavToggle isOpen={open} onClick={() => setOpen((value) => !value)} />
          </div>
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              onClick={() => setOpen(false)}
              className="flex h-11 w-full items-center text-base text-foreground"
            >
              {item.name}
            </a>
          ))}
          <NavbarButton
            href="/#contact"
            onClick={() => setOpen(false)}
            variant="dark"
            className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground"
          >
            Get in touch
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
