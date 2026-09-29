import type { SiteContent } from "@shsuman/api/content/schema";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { contentIcons } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Props {
  content: SiteContent["services"];
}

function Cell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative rounded-[1.25rem] border border-border p-1.5", className)}>
      <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      {children}
    </div>
  );
}

function Points({ points }: { points: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {points.map((point) => (
        <li key={point} className="badge">
          {point}
        </li>
      ))}
    </ul>
  );
}

export function ServicesBento({ content }: Props) {
  const { items: services, clients } = content;
  return (
    <BentoGrid className="max-w-none md:grid-cols-3">
      {services.map((service, i) => {
        const Icon = contentIcons[service.icon];
        return (
          <Cell key={service.title} className={cn(i === 0 && "md:col-span-2")}>
            <BentoGridItem
              className="h-full border-0"
              icon={
                <span className="grid size-10 place-items-center rounded-xl border border-border bg-background text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              }
              title={<h3>{service.title}</h3>}
              description={
                <>
                  <p className="max-w-prose">{service.description}</p>
                  <Points points={service.points} />
                </>
              }
            />
          </Cell>
        );
      })}

      <Cell className="md:col-span-2">
        <BentoGridItem
          className="h-full overflow-hidden border-0"
          title={<h3>{content.clientsTitle}</h3>}
          description={
            <p className="max-w-prose">{content.clientsDescription}</p>
          }
          header={<InfiniteMovingCards items={clients.map((client) => ({ name: client.name, title: client.sector }))} speed="slow" className="-mx-6 max-w-none" />}
        />
      </Cell>
    </BentoGrid>
  );
}
