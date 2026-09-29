"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import type React from "react";
import { useEffect, useRef } from "react";

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = max(0.001, uResolution.x / max(1.0, uResolution.y));
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  p *= 1.22;

  float t = uTime * 0.55;
  p += vec2(sin(p.y * 2.1 + t), cos(p.x * 1.7 - t)) * 0.065;

  vec2 smokeWarp = vec2(
    fbm(p * 1.25 + vec2(0.0, -t * 0.45)),
    fbm(p * 1.4 + vec2(t * 0.22, -t * 0.35))
  ) - 0.5;
  vec2 smokeUv = p + smokeWarp * 0.85 + vec2(0.0, -t * 0.22);
  float cloud = fbm(smokeUv * 2.0);
  cloud += fbm(smokeUv * 4.4 + smokeWarp) * 0.42;

  vec3 color = mix(uColorA, uColorB, smoothstep(0.18, 0.85, cloud));
  color = mix(color, uColorC, smoothstep(0.55, 1.1, cloud) * 0.7);

  // Subtle contrast and vignette
  color = (color - 0.5) * 1.12 + 0.5;
  float vig = smoothstep(1.3, 0.3, length((uv - 0.5) * vec2(aspect, 1.0)));
  color *= mix(0.82, 1.0, vig);

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const COLORS = [
	new Float32Array([3 / 255, 12 / 255, 7 / 255]), // #030c07 (Deep dark forest)
	new Float32Array([9 / 255, 88 / 255, 55 / 255]), // #095837 (Emerald core)
	new Float32Array([31 / 255, 200 / 255, 122 / 255]), // #1fc87a (Bright accent)
];

type Uniform = { value: unknown };

export function StudioBackground({
	className = "",
	paused = false,
}: {
	className?: string;
	paused?: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const pausedRef = useRef(paused);

	useEffect(() => {
		pausedRef.current = paused;
	}, [paused]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let renderer: Renderer;
		try {
			renderer = new Renderer({
				webgl: 2,
				alpha: false,
				antialias: false,
				depth: false,
				stencil: false,
				preserveDrawingBuffer: false,
				powerPreference: "low-power",
				dpr: Math.min(window.devicePixelRatio || 1, 1.5),
			});
		} catch (e) {
			console.warn("WebGL 2 unavailable:", e);
			return;
		}

		const gl = renderer.gl;
		const canvas = gl.canvas as HTMLCanvasElement;
		Object.assign(canvas.style, {
			width: "100%",
			height: "100%",
			display: "block",
			position: "absolute",
			top: "0",
			left: "0",
			pointerEvents: "none",
		});
		container.appendChild(canvas);

		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex: VERTEX_SHADER,
			fragment: FRAGMENT_SHADER,
			uniforms: {
				uResolution: {
					value: new Float32Array([
						container.clientWidth || 800,
						container.clientHeight || 400,
					]),
				},
				uTime: { value: 0 },
				uColorA: { value: COLORS[0] },
				uColorB: { value: COLORS[1] },
				uColorC: { value: COLORS[2] },
			},
		});
		const mesh = new Mesh(gl, { geometry, program });

		const resize = () => {
			if (!container || !renderer) return;
			const width = Math.max(10, container.clientWidth || 800);
			const height = Math.max(10, container.clientHeight || 400);

			renderer.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			renderer.setSize(width, height);

			canvas.style.width = "100%";
			canvas.style.height = "100%";

			const resolution = (program.uniforms.uResolution as Uniform)
				.value as Float32Array;
			resolution[0] = gl.drawingBufferWidth || width;
			resolution[1] = gl.drawingBufferHeight || height;
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);
		window.addEventListener("resize", resize);
		resize();

		let isVisible = true;
		let frame = 0;
		let elapsed = 0;
		let previous = performance.now();

		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isVisible = entry.isIntersecting;
				}
			},
			{ rootMargin: "200px" },
		);
		intersectionObserver.observe(container);

		// Initial render
		renderer.render({ scene: mesh });

		if (prefersReducedMotion) {
			return () => {
				resizeObserver.disconnect();
				intersectionObserver.disconnect();
				window.removeEventListener("resize", resize);
				program.remove();
				geometry.remove();
				gl.getExtension("WEBGL_lose_context")?.loseContext();
				canvas.remove();
			};
		}

		const render = (now: number) => {
			frame = requestAnimationFrame(render);

			const delta = Math.min(100, Math.max(0, now - previous));
			previous = now;

			if (!isVisible || pausedRef.current || document.hidden) {
				return;
			}

			elapsed += delta;
			(program.uniforms.uTime as Uniform).value = elapsed / 1000;
			renderer.render({ scene: mesh });
		};

		resize();
		renderer.render({ scene: mesh });
		frame = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			window.removeEventListener("resize", resize);
			program.remove();
			geometry.remove();
			gl.getExtension("WEBGL_lose_context")?.loseContext();
			canvas.remove();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`absolute inset-0 size-full overflow-hidden bg-[#03120a] ${className}`}
			aria-hidden="true"
		/>
	);
}

export function StudioBanner({
	children,
	className = "",
	innerClassName = "",
	paused = false,
}: {
	children?: React.ReactNode;
	className?: string;
	innerClassName?: string;
	paused?: boolean;
}) {
	return (
		<div
			className={`relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#04100c] ${className}`}
		>
			<div aria-hidden="true" className="pointer-events-none absolute inset-0">
				<StudioBackground paused={paused} />
			</div>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10 ring-inset"
			/>
			<div
				className={`relative flex flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-24 ${innerClassName}`}
			>
				{children}
			</div>
		</div>
	);
}
