import type { ICONS } from "@shsuman/api/content/schema";
import {
  Award,
  BookOpen,
  Briefcase,
  Cloud,
  Cpu,
  FileCheck,
  Globe,
  GraduationCap,
  Landmark,
  Lock,
  type LucideIcon,
  Network,
  Server,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

/** Maps the content icon names (see ICONS in the content schema) to components. */
export const contentIcons: Record<(typeof ICONS)[number], LucideIcon> = {
  shield: ShieldCheck,
  briefcase: Briefcase,
  landmark: Landmark,
  "graduation-cap": GraduationCap,
  award: Award,
  network: Network,
  server: Server,
  lock: Lock,
  users: Users,
  book: BookOpen,
  globe: Globe,
  target: Target,
  "file-check": FileCheck,
  cpu: Cpu,
  cloud: Cloud,
};
