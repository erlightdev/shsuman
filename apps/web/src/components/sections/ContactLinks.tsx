import { ArrowUpRight } from "lucide-react";
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

function WhatsAppIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.501.101-.2.05-.376-.025-.526-.075-.15-.678-1.635-.93-2.241-.244-.59-.493-.51-.678-.52-.176-.008-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.512c0 1.482 1.08 2.914 1.23 3.115.15.2 2.126 3.246 5.152 4.551.72.31 1.282.496 1.72.635.723.23 1.38.198 1.9.12.58-.088 1.78-.727 2.03-1.43.25-.703.25-1.305.175-1.43-.075-.125-.276-.225-.577-.375z" />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.397A9.958 9.958 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.16 8.16 0 0 1-4.32-1.23l-.31-.18-2.96.83.84-2.88-.2-.32A8.162 8.162 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2c0 4.52-3.68 8.2-8.2 8.2z"
			/>
		</svg>
	);
}

export function ContactLinks({ email, links, darkTheme = false }: Props) {
	const whatsappLink =
		links.find((l) => l.href.includes("wa.me") || l.href.includes("whatsapp.com"))
			?.href ?? "https://wa.me/97798541538467";

	return (
		<div>
			<Magnetic strength={0.25} className="inline-block">
				<a
					href={whatsappLink}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Hire me on WhatsApp"
					className={
						darkTheme
							? "inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 font-medium text-black text-sm shadow-md transition-transform hover:scale-105 hover:bg-emerald-300 active:scale-[0.97]"
							: "inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground text-sm transition-transform active:scale-[0.97]"
					}
				>
					<WhatsAppIcon className="size-4 text-emerald-600" />
					Hire me
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
