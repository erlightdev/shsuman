import { Timeline } from "@/components/ui/timeline";

interface Job {
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  points: string[];
}

function Point({ text }: { text: string }) {
  const [lead, ...rest] = text.split(": ");
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-border" />
      <span>
        {rest.length ? (
          <>
            <strong className="font-medium text-foreground">{lead}:</strong> {rest.join(": ")}
          </>
        ) : (
          text
        )}
      </span>
    </li>
  );
}

export function ExperienceTimeline({ jobs }: { jobs: Job[] }) {
  const data = jobs.map((job) => ({
    title: job.period,
    content: (
      <article className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-foreground">{job.role}</h3>
          {job.current && <span className="brand-badge">Current</span>}
        </div>
        <p className="mt-1 text-foreground-secondary">
          {job.company}
          <span className="text-muted-foreground"> · {job.location}</span>
        </p>
        <ul className="mt-4 space-y-2 leading-7 text-foreground-secondary">
          {job.points.map((point) => (
            <Point key={point} text={point} />
          ))}
        </ul>
      </article>
    ),
  }));

  return <Timeline data={data} />;
}
