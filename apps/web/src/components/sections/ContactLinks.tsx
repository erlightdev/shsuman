import { ArrowUpRight, Mail } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { TextRoll } from "@/components/ui/skiper-ui/skiper58";

interface Link {
	label: string;
	detail: string;
	href: string;
	external?: boolean;
}

interface Props {
	email: string;
	links: Link[];
	darkTheme?: boolean;
}

export function ContactLinks({ email, links, darkTheme = false }: Props) {
	return (
		<div>
			<Magnetic strength={0.25} className="inline-block">
				<a
					href={`mailto:${email}`}
					className={
						darkTheme
							? "inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 font-medium text-black text-sm shadow-md transition-transform hover:scale-105 hover:bg-emerald-300 active:scale-[0.97]"
							: "inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground text-sm transition-transform active:scale-[0.97]"
					}
				>
					<Mail className="size-4" aria-hidden="true" />
					Email me
				</a>
			</Magnetic>

			{/* Skiper UI text-roll navigation */}
			<ul
				className={
					darkTheme
						? "mt-8 border-white/10 border-t"
						: "mt-8 border-border border-t"
				}
			>
				{links.map((link) => (
					<li
						key={link.href}
						className={
							darkTheme ? "border-white/10 border-b" : "border-border border-b"
						}
					>
						<a
							href={link.href}
							aria-label={`${link.label}: ${link.detail}`}
							{...(link.external
								? { target: "_blank", rel: "noopener me" }
								: {})}
							className="group flex items-center justify-between gap-4 py-4 sm:py-5"
						>
							<span aria-hidden="true">
								<TextRoll
									className={
										darkTheme
											? "font-semibold text-white text-xl uppercase tracking-tight transition-colors group-hover:text-emerald-300 sm:text-2xl lg:text-3xl"
											: "font-semibold text-foreground text-xl uppercase tracking-tight sm:text-2xl lg:text-3xl"
									}
								>
									{link.label}
								</TextRoll>
								<span
									className={
										darkTheme
											? "mt-1 block text-emerald-100/70 text-xs group-hover:text-emerald-100 sm:text-sm"
											: "mt-1 block text-muted-foreground text-xs sm:text-sm"
									}
								>
									{link.detail}
								</span>
							</span>
							<ArrowUpRight
								aria-hidden="true"
								className={
									darkTheme
										? "size-5 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
										: "size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
								}
							/>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
