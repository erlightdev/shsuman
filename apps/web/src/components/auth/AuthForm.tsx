import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const copy = {
	"sign-in": {
		eyebrow: "Admin workspace",
		title: "Welcome back",
		// description: "Manage portfolio content, blog posts, and site settings.",
		submit: "Sign in",
		pending: "Signing in…",
		switchText: "Don't have an account?",
		switchLabel: "Create one",
		switchHref: "/signup",
	},
	"sign-up": {
		eyebrow: "Admin workspace",
		title: "Create your account",
		// description:
		// 	"Set up admin access to manage your portfolio and publish articles.",
		submit: "Create account",
		pending: "Creating account…",
		switchText: "Already have an account?",
		switchLabel: "Sign in",
		switchHref: "/login",
	},
} as const;

const fieldClass = "h-10 rounded-xl px-3.5 text-sm";

export function AuthForm({ mode }: { mode: Mode }) {
	const text = copy[mode];
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const email = String(data.get("email"));
		const password = String(data.get("password"));

		setPending(true);
		setError(null);

		const callbacks = {
			onSuccess: () => {
				window.location.href = "/dashboard";
			},
			onError: (ctx: { error: { message?: string } }) => {
				setError(
					ctx.error.message || "Something went wrong. Please try again.",
				);
			},
		};

		try {
			if (mode === "sign-in") {
				await authClient.signIn.email({ email, password }, callbacks);
			} else {
				await authClient.signUp.email(
					{ name: String(data.get("name")), email, password },
					callbacks,
				);
			}
		} catch {
			setError("Could not reach the server. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="w-full max-w-sm">
			<p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
				{text.eyebrow}
			</p>
			<h1 className="mt-2 text-balance font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
				{text.title}
			</h1>

			<form method="post" onSubmit={onSubmit} className="mt-6 space-y-3.5">
				{mode === "sign-up" && (
					<div className="space-y-1.5">
						<Label htmlFor="name" className="font-medium text-xs">
							Full name
						</Label>
						<Input
							id="name"
							name="name"
							autoComplete="name"
							required
							className={fieldClass}
						/>
					</div>
				)}

				<div className="space-y-1.5">
					<Label htmlFor="email" className="font-medium text-xs">
						Email address
					</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						autoCapitalize="none"
						placeholder="you@example.com"
						required
						aria-invalid={error ? true : undefined}
						className={fieldClass}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password" className="font-medium text-xs">
						Password
					</Label>
					<div className="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							autoComplete={
								mode === "sign-in" ? "current-password" : "new-password"
							}
							minLength={8}
							required
							aria-invalid={error ? true : undefined}
							aria-describedby={mode === "sign-up" ? "password-hint" : undefined}
							className={`${fieldClass} pr-11`}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((value) => !value)}
							aria-label={showPassword ? "Hide password" : "Show password"}
							aria-pressed={showPassword}
							aria-controls="password"
							className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="size-4" aria-hidden="true" />
							) : (
								<Eye className="size-4" aria-hidden="true" />
							)}
						</button>
					</div>
					{mode === "sign-up" && (
						<p
							id="password-hint"
							className="px-1 text-[11px] text-muted-foreground"
						>
							At least 8 characters.
						</p>
					)}
				</div>

				{error && (
					<p
						role="alert"
						className="rounded-xl bg-destructive/10 px-3.5 py-2 text-destructive text-xs"
					>
						{error}
					</p>
				)}

				<Button
					type="submit"
					disabled={pending}
					className="h-10 w-full rounded-xl font-medium text-sm"
				>
					{pending && (
						<Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
					)}
					{pending ? text.pending : text.submit}
				</Button>
			</form>

			<p className="mt-4 text-center text-muted-foreground text-xs">
				{text.switchText}{" "}
				<a
					href={text.switchHref}
					className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
				>
					{mode === "sign-up" && (
						<ArrowLeft className="size-3" aria-hidden="true" />
					)}
					{text.switchLabel}
				</a>
			</p>
		</div>
	);
}
