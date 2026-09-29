import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { SiteContent } from "@shsuman/api/content/schema";

interface Props {
  awards: SiteContent["awards"];
  credentials?: SiteContent["credentials"];
}

// ---------------------------------------------------------------------------
// 1. Isometric Glass Stack Graphic (Accreditations & Certifications)
// ---------------------------------------------------------------------------
function IsometricStackGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/30 p-4">
      {/* Ambient background glow rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="h-40 w-40 rounded-full border border-emerald-500/15" />
        <div className="h-56 w-56 rounded-full border border-emerald-500/10" />
      </div>

      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full max-h-[150px] w-auto drop-shadow-2xl transition-transform duration-500 ease-out group-hover/card:scale-105"
      >
        <defs>
          <linearGradient id="glassTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#a7f3d0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="glassSideL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="glassSideR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.7" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floor grid / shadow plate */}
        <ellipse cx="160" cy="168" rx="88" ry="24" fill="#047857" fillOpacity="0.18" filter="url(#glow)" />

        {/* Layer 1 (Bottom Plate) */}
        <g transform="translate(0, 48)">
          <path d="M70 70 L160 30 L250 70 L160 110 Z" fill="url(#glassTop)" fillOpacity="0.4" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M70 70 L160 110 L160 118 L70 78 Z" fill="url(#glassSideL)" />
          <path d="M160 110 L250 70 L250 78 L160 118 Z" fill="url(#glassSideR)" />
        </g>

        {/* Layer 2 */}
        <g transform="translate(0, 24)">
          <path d="M70 70 L160 30 L250 70 L160 110 Z" fill="url(#glassTop)" fillOpacity="0.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M70 70 L160 110 L160 118 L70 78 Z" fill="url(#glassSideL)" />
          <path d="M160 110 L250 70 L250 78 L160 118 Z" fill="url(#glassSideR)" />
        </g>

        {/* Layer 3 */}
        <g transform="translate(0, 0)">
          <path d="M70 70 L160 30 L250 70 L160 110 Z" fill="url(#glassTop)" fillOpacity="0.65" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
          <path d="M70 70 L160 110 L160 118 L70 78 Z" fill="url(#glassSideL)" />
          <path d="M160 110 L250 70 L250 78 L160 118 Z" fill="url(#glassSideR)" />
        </g>

        {/* Layer 4 (Top floating glowing prism) */}
        <g transform="translate(0, -24)" className="transition-transform duration-700 ease-out group-hover/card:-translate-y-8">
          <path d="M70 70 L160 30 L250 70 L160 110 Z" fill="url(#glassTop)" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M70 70 L160 110 L160 118 L70 78 Z" fill="url(#glassSideL)" />
          <path d="M160 110 L250 70 L250 78 L160 118 Z" fill="url(#glassSideR)" />

          {/* Centered illuminated security badge symbol */}
          <circle cx="160" cy="70" r="14" fill="#10b981" fillOpacity="0.3" filter="url(#glow)" />
          <circle cx="160" cy="70" r="8" fill="#ffffff" fillOpacity="0.9" />
          <path d="M157 70 L159 72 L163 68" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Connected Nodes Network Graphic (Leadership & Honors)
// ---------------------------------------------------------------------------
function NetworkNodesGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-stone-900/30 p-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="h-44 w-44 rounded-full border border-amber-500/15" />
      </div>

      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full max-h-[150px] w-auto drop-shadow-xl transition-transform duration-500 ease-out group-hover/card:scale-105"
      >
        <defs>
          <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Connecting branch curves */}
        <path d="M75 60 C110 60, 125 100, 160 100" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M245 60 C210 60, 195 100, 160 100" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M75 140 C110 140, 125 100, 160 100" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M245 140 C210 140, 195 100, 160 100" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="3 3" />

        {/* Top-Left Node */}
        <g transform="translate(55, 40)">
          <rect width="40" height="40" rx="12" fill="url(#nodeGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="6" fill="#f59e0b" />
          <circle cx="20" cy="20" r="3" fill="#ffffff" />
        </g>

        {/* Top-Right Node */}
        <g transform="translate(225, 40)">
          <rect width="40" height="40" rx="12" fill="url(#nodeGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="6" fill="#f59e0b" />
          <circle cx="20" cy="20" r="3" fill="#ffffff" />
        </g>

        {/* Bottom-Left Node */}
        <g transform="translate(55, 120)">
          <rect width="40" height="40" rx="12" fill="url(#nodeGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="6" fill="#f59e0b" />
          <circle cx="20" cy="20" r="3" fill="#ffffff" />
        </g>

        {/* Bottom-Right Node */}
        <g transform="translate(225, 120)">
          <rect width="40" height="40" rx="12" fill="url(#nodeGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="6" fill="#f59e0b" />
          <circle cx="20" cy="20" r="3" fill="#ffffff" />
        </g>

        {/* Center Main Node (Glowing Core) */}
        <g transform="translate(136, 76)">
          <circle cx="24" cy="24" r="32" fill="#f59e0b" fillOpacity="0.18" />
          <rect width="48" height="48" rx="16" fill="url(#amberGlow)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="24" cy="24" r="8" fill="#d97706" />
          <circle cx="24" cy="24" r="4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Orbital Verification Graphic (Audit Standards & Track Record)
// ---------------------------------------------------------------------------
function OrbitalVerifiedGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/15 via-teal-600/5 to-cyan-950/30 p-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full max-h-[150px] w-auto drop-shadow-xl transition-transform duration-500 ease-out group-hover/card:scale-105"
      >
        <defs>
          <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#a7f3d0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Concentric orbital rings */}
        <ellipse cx="160" cy="100" rx="120" ry="60" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <ellipse cx="160" cy="100" rx="90" ry="45" stroke="rgba(52, 211, 153, 0.35)" strokeWidth="1.5" />
        <ellipse cx="160" cy="100" rx="60" ry="30" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />

        {/* Orbiting particles */}
        <circle cx="280" cy="100" r="4" fill="#34d399" />
        <circle cx="70" cy="100" r="3" fill="#6ee7b7" />
        <circle cx="160" cy="40" r="3.5" fill="#a7f3d0" />
        <circle cx="160" cy="160" r="4" fill="#10b981" />

        {/* Glowing Central Badge */}
        <g transform="translate(126, 66)">
          <circle cx="34" cy="34" r="40" fill="#10b981" fillOpacity="0.15" />
          <circle cx="34" cy="34" r="28" fill="url(#orbGrad)" stroke="#ffffff" strokeWidth="2.5" />
          <path
            d="M24 35 L30 41 L45 26"
            stroke="#047857"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Waveform & Governance Graphic (Advisory & Community Roles)
// ---------------------------------------------------------------------------
function WaveformGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/15 via-blue-500/5 to-slate-900/30 p-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="h-40 w-40 rounded-full border border-cyan-500/15" />
      </div>

      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full max-h-[150px] w-auto drop-shadow-xl transition-transform duration-500 ease-out group-hover/card:scale-105"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Sinusoidal Wave Layers */}
        <path
          d="M20 120 Q 80 40, 160 100 T 300 80"
          stroke="rgba(34, 211, 238, 0.25)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 120 Q 80 40, 160 100 T 300 80"
          stroke="url(#waveGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 130 Q 90 60, 160 110 T 300 90"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Floating node points along wave */}
        <circle cx="85" cy="62" r="5" fill="#ffffff" stroke="#0891b2" strokeWidth="2" />
        <circle cx="160" cy="100" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
        <circle cx="235" cy="74" r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Awards & Certifications Carousel Component (Embla Carousel)
// ---------------------------------------------------------------------------
export function AwardsCarousel({ awards, credentials }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const certifications = awards.certifications ?? [];
  const honors = awards.awards ?? [];
  const community = credentials?.community ?? [];

  return (
    <div className="w-full">
      {/* Top Header Row with Embla Navigation Controls */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div>
          <span className="eyebrow text-brand-base font-mono text-xs font-semibold tracking-wider uppercase">
            06 — Recognition
          </span>
          <h2
            id="awards-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground-primary sm:text-4xl font-display text-balance"
          >
            {awards.title || "Certifications & industry honors."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-foreground-secondary leading-relaxed text-pretty">
            {awards.lead || "Professional accreditations, audit credentials, and leadership awards across cybersecurity and digital governance."}
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-secondary bg-background-secondary text-foreground-primary shadow-xs transition-all hover:bg-background-tertiary hover:border-border-tertiary active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="size-4.5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-secondary bg-background-secondary text-foreground-primary shadow-xs transition-all hover:bg-background-tertiary hover:border-border-tertiary active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="size-4.5" />
          </button>
        </div>
      </div>

      {/* Embla Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-6 py-1">
          {/* ========================================================= */}
          {/* SLIDE 1: Professional Accreditations                       */}
          {/* ========================================================= */}
          <div className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
            <article className="group/card flex h-full flex-col justify-between rounded-3xl border border-border-primary/80 bg-background-secondary p-5 sm:p-6 transition-all duration-300 hover:border-border-secondary hover:shadow-xl hover:shadow-emerald-950/5">
              <div>
                {/* Visual Header Graphic */}
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border-primary/40 shadow-inner">
                  <IsometricStackGraphic />
                </div>

                {/* Card Title & Denoised Description */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground-primary sm:text-2xl font-display">
                    Accredited credentials
                  </h3>
                  <p className="mt-2 text-sm text-foreground-secondary/85 leading-relaxed">
                    Formal industry accreditations spanning IS/IT systems audit, enterprise network security, and risk compliance.
                  </p>
                </div>
              </div>

              {/* Clean Minimalist List */}
              <div className="mt-8 border-t border-border-primary/60 pt-5">
                <ul className="space-y-3.5">
                  {certifications.length > 0 ? (
                    certifications.map((cert) => (
                      <li
                        key={cert.name}
                        className="group/item flex items-center justify-between gap-3 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ShieldCheck className="size-4 text-foreground-tertiary group-hover/item:text-brand-base transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            {cert.name}
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <ShieldCheck className="size-4 text-foreground-tertiary group-hover/item:text-brand-base transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            IS/IT Audit Specialist
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Lock className="size-4 text-foreground-tertiary group-hover/item:text-brand-base transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            Certified Network Security Specialist
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Network className="size-4 text-foreground-tertiary group-hover/item:text-brand-base transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            Cisco Network Associate (CCNA)
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </article>
          </div>

          {/* ========================================================= */}
          {/* SLIDE 2: Leadership & Recognition                          */}
          {/* ========================================================= */}
          <div className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
            <article className="group/card flex h-full flex-col justify-between rounded-3xl border border-border-primary/80 bg-background-secondary p-5 sm:p-6 transition-all duration-300 hover:border-border-secondary hover:shadow-xl hover:shadow-amber-950/5">
              <div>
                {/* Visual Header Graphic */}
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border-primary/40 shadow-inner">
                  <NetworkNodesGraphic />
                </div>

                {/* Card Title & Denoised Description */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground-primary sm:text-2xl font-display">
                    Honors & leadership
                  </h3>
                  <p className="mt-2 text-sm text-foreground-secondary/85 leading-relaxed">
                    Recognized for national cybersecurity policy advocacy, executive training, and pioneering the open internet ecosystem.
                  </p>
                </div>
              </div>

              {/* Clean Minimalist List */}
              <div className="mt-8 border-t border-border-primary/60 pt-5">
                <ul className="space-y-3.5">
                  {honors.length > 0 ? (
                    honors.map((award) => (
                      <li
                        key={award.title}
                        className="group/item flex items-center justify-between gap-3 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Award className="size-4 text-foreground-tertiary group-hover/item:text-amber-500 transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            {award.title}
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Award className="size-4 text-foreground-tertiary group-hover/item:text-amber-500 transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            Cybersecurity Leadership Excellence
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Globe className="size-4 text-foreground-tertiary group-hover/item:text-amber-500 transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            Open Internet Contribution Award
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                      <li className="group/item flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <Sparkles className="size-4 text-foreground-tertiary group-hover/item:text-amber-500 transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            National Cyber Awareness Recognition
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </article>
          </div>

          {/* ========================================================= */}
          {/* SLIDE 3: Proven Governance (Metrics Key-Value Rows)        */}
          {/* ========================================================= */}
          <div className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
            <article className="group/card flex h-full flex-col justify-between rounded-3xl border border-border-primary/80 bg-background-secondary p-5 sm:p-6 transition-all duration-300 hover:border-border-secondary hover:shadow-xl hover:shadow-emerald-950/5">
              <div>
                {/* Visual Header Graphic */}
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border-primary/40 shadow-inner">
                  <OrbitalVerifiedGraphic />
                </div>

                {/* Card Title & Denoised Description */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground-primary sm:text-2xl font-display">
                    Proven governance
                  </h3>
                  <p className="mt-2 text-sm text-foreground-secondary/85 leading-relaxed">
                    Over fifteen years of securing critical infrastructure, performing rigorous audits, and advising executive leadership.
                  </p>
                </div>
              </div>

              {/* Clean Metric Rows (exact style as card 3 in reference image) */}
              <div className="mt-8 border-t border-border-primary/60 pt-5">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-normal text-foreground-secondary">
                      IS/IT audits completed
                    </span>
                    <span className="font-mono text-base font-semibold text-foreground-primary tracking-tight">
                      100+
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-normal text-foreground-secondary">
                      Years of security practice
                    </span>
                    <span className="font-mono text-base font-semibold text-foreground-primary tracking-tight">
                      15+
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-normal text-foreground-secondary">
                      System uptime & reliability
                    </span>
                    <span className="font-mono text-base font-semibold text-foreground-primary tracking-tight">
                      99.9%
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* ========================================================= */}
          {/* SLIDE 4: Community & Advisory (Waveform UI)                 */}
          {/* ========================================================= */}
          {community.length > 0 && (
            <div className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
              <article className="group/card flex h-full flex-col justify-between rounded-3xl border border-border-primary/80 bg-background-secondary p-5 sm:p-6 transition-all duration-300 hover:border-border-secondary hover:shadow-xl hover:shadow-cyan-950/5">
                <div>
                  {/* Visual Header Graphic */}
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border-primary/40 shadow-inner">
                    <WaveformGraphic />
                  </div>

                  {/* Card Title & Denoised Description */}
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground-primary sm:text-2xl font-display">
                      Community & advisory
                    </h3>
                    <p className="mt-2 text-sm text-foreground-secondary/85 leading-relaxed">
                      Driving national incident response readiness, open digital governance, and technology consultancy across sectors.
                    </p>
                  </div>
                </div>

                {/* Clean Minimalist List */}
                <div className="mt-8 border-t border-border-primary/60 pt-5">
                  <ul className="space-y-3.5">
                    {community.slice(0, 3).map((item) => (
                      <li
                        key={item.org}
                        className="group/item flex items-center justify-between gap-3 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Users className="size-4 text-foreground-tertiary group-hover/item:text-cyan-500 transition-colors shrink-0" />
                          <span className="truncate font-medium text-foreground-secondary group-hover/item:text-foreground-primary transition-colors">
                            {item.role} <span className="text-foreground-tertiary font-normal">· {item.org}</span>
                          </span>
                        </div>
                        <ArrowUpRight className="size-4 text-foreground-muted group-hover/item:text-foreground-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0" />
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Dots indicator */}
      {scrollSnaps.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === selectedIndex
                  ? "w-7 bg-brand-base"
                  : "w-1.5 bg-border-secondary hover:bg-foreground-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
