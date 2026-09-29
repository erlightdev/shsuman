"use client";

import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
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
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uDistortion;
uniform sampler2D uTexture;
uniform float uHasSource;
uniform float uSourceAspect;
uniform float uGenerator;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPixelate;
uniform float uDither;
uniform float uRgbSplit;
uniform float uGlitch;
uniform float uScanlines;
uniform float uGrain;
uniform float uDuotone;
uniform float uEffectsVisible;
uniform float uBrightness;
uniform float uContrast;
uniform float uSaturation;
uniform float uHue;
uniform float uGrayscale;
uniform float uSepia;
uniform float uInvert;
uniform float uVignette;
uniform float uGlow;
uniform float uPosterize;
uniform float uEdgeGlow;
uniform float uPixelSort;
uniform float uLed;
uniform float uPixelSize;
uniform float uDensity;
uniform float uExposure;
uniform float uScatter;
uniform float uPixelOpacity;
uniform float uDitherAlgorithm;
uniform float uAnimationPreset;
uniform float uAnimationPace;
uniform float uAnimationIntensity;

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

float bayer8(vec2 p) {
  vec2 cell = mod(floor(p), 8.0);
  float x = cell.x;
  float y = cell.y;
  float value = mod(x, 2.0) * 32.0 + mod(y, 2.0) * 16.0;
  value += mod(floor(x / 2.0), 2.0) * 8.0;
  value += mod(floor(y / 2.0), 2.0) * 4.0;
  value += mod(floor(x / 4.0), 2.0) * 2.0;
  value += mod(floor(y / 4.0), 2.0);
  return (value + 0.5) / 64.0;
}

float bayer4(vec2 p) {
  vec2 cell = mod(floor(p), 4.0);
  float x = cell.x;
  float y = cell.y;
  float value = mod(x, 2.0) * 8.0 + mod(y, 2.0) * 4.0;
  value += mod(floor(x / 2.0), 2.0) * 2.0;
  value += mod(floor(y / 2.0), 2.0);
  return (value + 0.5) / 16.0;
}

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

vec2 coverUv(vec2 uv, float sourceAspect, float canvasAspect) {
  vec2 result = uv;
  if (sourceAspect > canvasAspect) {
    float scale = canvasAspect / sourceAspect;
    result.x = (uv.x - 0.5) * scale + 0.5;
  } else {
    float scale = sourceAspect / canvasAspect;
    result.y = (uv.y - 0.5) * scale + 0.5;
  }
  return result;
}

vec3 generatedSource(vec2 uv) {
  float aspect = max(0.001, uResolution.x / max(1.0, uResolution.y));
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  p *= mix(0.72, 1.52, uScale) * mix(0.86, 1.18, uDetail);
  float t = uTime * mix(0.2, 0.9, uSpeed);
  p += vec2(sin(p.y * 2.1 + t), cos(p.x * 1.7 - t)) * uDistortion * 0.15;
  vec3 color;

  vec2 smokeWarp = vec2(
    fbm(p * 1.25 + vec2(0.0, -t * 0.5)),
    fbm(p * 1.4 + vec2(t * 0.25, -t * 0.4))
  ) - 0.5;
  vec2 smokeUv = p + smokeWarp * 0.85 + vec2(0.0, -t * 0.25);
  float cloud = fbm(smokeUv * 2.0);
  cloud += fbm(smokeUv * 4.4 + smokeWarp) * 0.42;

  color = mix(uColorA, uColorB, smoothstep(0.18, 0.85, cloud));
  color = mix(color, uColorC, smoothstep(0.55, 1.1, cloud) * 0.7);

  return clamp(color, 0.0, 1.0);
}

vec3 sourceAt(vec2 uv) {
  if (uHasSource > 0.5) {
    float canvasAspect = max(0.001, uResolution.x / max(1.0, uResolution.y));
    return texture(uTexture, coverUv(uv, uSourceAspect, canvasAspect)).rgb;
  }
  return generatedSource(uv);
}

vec3 hueShift(vec3 color, float angle) {
  const mat3 toYiq = mat3(
    0.299, 0.587, 0.114,
    0.596, -0.275, -0.321,
    0.212, -0.523, 0.311
  );
  const mat3 toRgb = mat3(
    1.0, 0.956, 0.621,
    1.0, -0.272, -0.647,
    1.0, -1.107, 1.705
  );
  vec3 yiq = toYiq * color;
  float hue = atan(yiq.z, yiq.y) + angle;
  float chroma = length(yiq.yz);
  return clamp(toRgb * vec3(yiq.x, chroma * cos(hue), chroma * sin(hue)), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 treatedUv = uv;
  float visible = uEffectsVisible;
  float animated = 0.0;
  if (uAnimationPreset > 0.5) {
    float phase = uTime * mix(0.3, 3.2, uAnimationPace);
    animated = sin(phase);
    vec2 centeredUv = treatedUv - 0.5;
    if (uAnimationPreset < 1.5) {
      treatedUv = centeredUv * (1.0 + animated * 0.035 * uAnimationIntensity) + 0.5;
    } else if (uAnimationPreset < 2.5) {
      treatedUv += vec2(phase * 0.012, phase * -0.006) * uAnimationIntensity;
    } else if (uAnimationPreset < 3.5) {
      treatedUv.y += sin(uv.x * 7.0 - phase) * 0.035 * uAnimationIntensity;
    } else if (uAnimationPreset < 4.5) {
      float ring = sin(length(centeredUv) * 24.0 - phase * 2.0);
      treatedUv += normalize(centeredUv + vec2(0.0001)) * ring * 0.018 * uAnimationIntensity;
    } else if (uAnimationPreset < 5.5) {
      treatedUv = rotate2d(phase * 0.08 * uAnimationIntensity) * centeredUv + 0.5;
    } else if (uAnimationPreset < 6.5) {
      float twist = length(centeredUv) * animated * 0.8 * uAnimationIntensity;
      treatedUv = rotate2d(twist) * centeredUv + 0.5;
    } else {
      treatedUv += vec2(
        sin(uv.y * 6.0 + phase),
        cos(uv.x * 5.0 - phase * 0.8)
      ) * 0.022 * uAnimationIntensity;
    }
  }

  if (uGlitch * visible > 0.001) {
    float band = floor(uv.y * mix(18.0, 62.0, uGlitch));
    float jump = hash21(vec2(band, floor(uTime * 10.0)));
    float activation = step(0.72 - uGlitch * 0.22, jump);
    treatedUv.x += (jump - 0.5) * 0.13 * uGlitch * activation;
  }

  if (uPixelate * visible > 0.001) {
    float blockSize = mix(2.0, 42.0, uPixelSize) * mix(0.9, 1.1, animated * uAnimationIntensity + 0.5);
    vec2 cells = max(vec2(1.0), floor(uResolution / blockSize));
    treatedUv = (floor(treatedUv * cells) + 0.5) / cells;
  }

  vec3 color;
  if (uRgbSplit * visible > 0.001) {
    float offset = mix(0.001, 0.018, uRgbSplit);
    float red = sourceAt(treatedUv + vec2(offset, 0.0)).r;
    float green = sourceAt(treatedUv).g;
    float blue = sourceAt(treatedUv - vec2(offset, 0.0)).b;
    color = vec3(red, green, blue);
  } else {
    color = sourceAt(treatedUv);
  }

  if (abs(uBrightness - 1.0) > 0.001) color *= uBrightness;
  if (abs(uContrast - 1.0) > 0.001) color = (color - 0.5) * uContrast + 0.5;
  float baseLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  if (abs(uSaturation - 1.0) > 0.001) color = mix(vec3(baseLuma), color, uSaturation);
  if (abs(uHue) > 0.001) color = hueShift(color, uHue);
  if (uGrayscale > 0.001) color = mix(color, vec3(baseLuma), uGrayscale);
  if (uSepia > 0.001) {
    vec3 sepiaColor = vec3(
      dot(color, vec3(0.393, 0.769, 0.189)),
      dot(color, vec3(0.349, 0.686, 0.168)),
      dot(color, vec3(0.272, 0.534, 0.131))
    );
    color = mix(color, sepiaColor, uSepia);
  }
  if (uInvert > 0.001) color = mix(color, 1.0 - color, uInvert);

  if (uPixelSort * visible > 0.001) {
    float sortAmount = uPixelSort * visible;
    float row = floor(uv.y * mix(48.0, 220.0, uDensity));
    float rowSeed = hash21(vec2(row, floor(uTime * 1.8)));
    float sourceLight = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float sortGate = smoothstep(0.24, 0.78, sourceLight) * step(0.22, rowSeed);
    float direction = rowSeed > 0.5 ? 1.0 : -1.0;
    vec2 sortUv = treatedUv + vec2(
      direction * mix(0.006, 0.19, sortAmount) * sortGate,
      0.0
    );
    vec3 sorted = sourceAt(clamp(sortUv, 0.0, 1.0));
    float streak = smoothstep(0.08, 0.92, hash21(vec2(floor(uv.x * 9.0), row)));
    color = mix(color, sorted, sortAmount * sortGate * mix(0.45, 1.0, streak));
  }

  if (uPosterize * visible > 0.001) {
    float posterizeAmount = uPosterize * visible;
    float levels = floor(mix(10.0, 2.0, posterizeAmount) + 0.5);
    vec3 posterized = floor(color * levels + 0.5) / levels;
    color = mix(color, posterized, smoothstep(0.08, 0.4, posterizeAmount));
  }

  if (uGlow > 0.001) {
    vec2 texel = 2.5 / uResolution;
    vec3 bloom = sourceAt(treatedUv + vec2(texel.x, 0.0));
    bloom += sourceAt(treatedUv - vec2(texel.x, 0.0));
    bloom += sourceAt(treatedUv + vec2(0.0, texel.y));
    bloom += sourceAt(treatedUv - vec2(0.0, texel.y));
    color = mix(color, bloom * 0.25 + color * 0.2, uGlow * 0.55);
  }

  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));

  if (uDuotone * visible > 0.001) {
    vec3 mapped = luminance < 0.5
      ? mix(uColorA, uColorB, luminance * 2.0)
      : mix(uColorB, uColorC, (luminance - 0.5) * 2.0);
    color = mix(color, mapped, uDuotone);
    luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  if (uEdgeGlow * visible > 0.001) {
    vec2 edgeTexel = mix(1.0, 3.2, uEdgeGlow) / uResolution;
    vec3 leftSample = sourceAt(clamp(treatedUv - vec2(edgeTexel.x, 0.0), 0.0, 1.0));
    vec3 rightSample = sourceAt(clamp(treatedUv + vec2(edgeTexel.x, 0.0), 0.0, 1.0));
    vec3 downSample = sourceAt(clamp(treatedUv - vec2(0.0, edgeTexel.y), 0.0, 1.0));
    vec3 upSample = sourceAt(clamp(treatedUv + vec2(0.0, edgeTexel.y), 0.0, 1.0));
    float horizontalEdge = length(rightSample - leftSample);
    float verticalEdge = length(upSample - downSample);
    float edgeStrength = smoothstep(0.08, 0.72, horizontalEdge + verticalEdge);
    vec3 edgeColor = mix(uColorB, uColorC, clamp(luminance + 0.2, 0.0, 1.0));
    color += edgeColor * edgeStrength * uEdgeGlow * 1.35;
    color *= 1.0 - edgeStrength * uEdgeGlow * 0.16;
  }

  if (uDither * visible > 0.001) {
    vec2 matrixPoint = gl_FragCoord.xy / mix(1.0, 4.2, uPixelSize);
    float threshold = uDitherAlgorithm < 0.5
      ? bayer4(matrixPoint)
      : uDitherAlgorithm < 1.5
        ? bayer8(matrixPoint)
        : hash21(floor(matrixPoint));
    float value = luminance + uExposure + (threshold - 0.5) * mix(0.12, 0.82, uDensity);
    vec3 dithered = value < 0.34 ? uColorA : value < 0.68 ? uColorB : uColorC;
    color = mix(color, dithered, uPixelOpacity * smoothstep(0.05, 0.32, uDither));
  }

  if (uLed * visible > 0.001) {
    float cellSize = mix(5.0, 44.0, uPixelSize);
    vec2 cell = floor(gl_FragCoord.xy / cellSize);
    vec2 point = fract(gl_FragCoord.xy / cellSize) - 0.5;
    point += (hash21(cell) - 0.5) * uScatter * 0.38;
    float radius = mix(0.08, 0.48, clamp(luminance + uExposure, 0.0, 1.0));
    float ring = abs(length(point) - radius * 0.7);
    float mask = 1.0 - smoothstep(0.035, 0.09, ring);
    vec3 ink = mix(uColorA, uColorC, luminance);
    color = mix(color, mix(uColorA, ink, mask), uPixelOpacity * uLed);
  }

  if (uScanlines * visible > 0.001) {
    float line = 0.5 + 0.5 * sin(gl_FragCoord.y * 3.14159);
    color *= 1.0 - line * uScanlines * 0.34;
  }

  if (uGrain * visible > 0.001) {
    float grain = hash21(gl_FragCoord.xy + floor(uTime * 24.0)) - 0.5;
    color += grain * uGrain * 0.22;
  }

  if (uVignette > 0.001) {
    float edge = smoothstep(0.82, 0.18, length((uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0)));
    color *= mix(1.0, edge, uVignette * 0.72);
  }

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const PRESET = {
	generator: 6,
	colors: ["#030c07", "#095837", "#1fc87a"],
	settings: {
		speed: 75,
		scale: 55,
		detail: 65,
		distortion: 45,
		glow: 40,
		grain: 10,
		vignette: 25,
		brightness: 95,
		contrast: 112,
		saturation: 100,
		hue: 0,
	},
	effectUniforms: {
		uPixelate: 0,
		uDither: 0,
		uPosterize: 0,
		uEdgeGlow: 0,
		uPixelSort: 0,
		uLed: 0,
		uRgbSplit: 0,
		uGlitch: 0,
		uScanlines: 0,
		uDuotone: 0,
	},
	grain: 0.1,
	pixelSettings: {
		size: 34,
		density: 56,
		exposure: 50,
		scatter: 0,
		opacity: 100,
	},
	ditherAlgorithm: 0,
	animation: {
		preset: 1,
		pace: 0.45,
		intensity: 0.35,
	},
} as const;

type Uniform = { value: unknown };

function hexToRgb(hex: string) {
	const value = Number.parseInt(hex.replace("#", ""), 16);
	return new Float32Array([
		((value >> 16) & 255) / 255,
		((value >> 8) & 255) / 255,
		(value & 255) / 255,
	]);
}

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

		let renderer: Renderer;
		try {
			renderer = new Renderer({
				webgl: 2,
				alpha: true,
				antialias: false,
				dpr: Math.min(window.devicePixelRatio || 1, 2),
			});
		} catch (e) {
			console.error("WebGL 2 error:", e);
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

		const texture = new Texture(gl, {
			image: new Uint8Array([8, 8, 8, 255]),
			width: 1,
			height: 1,
			generateMipmaps: false,
		});
		const geometry = new Triangle(gl);
		const program = new Program(gl, {
			vertex: VERTEX_SHADER,
			fragment: FRAGMENT_SHADER,
			uniforms: {
				uResolution: {
					value: new Float32Array([
						container.clientWidth || window.innerWidth,
						container.clientHeight || window.innerHeight,
					]),
				},
				uTime: { value: 0 },
				uTexture: { value: texture },
				uHasSource: { value: 0 },
				uSourceAspect: { value: 1 },
				uGenerator: { value: PRESET.generator },
				uColorA: { value: hexToRgb(PRESET.colors[0]) },
				uColorB: { value: hexToRgb(PRESET.colors[1]) },
				uColorC: { value: hexToRgb(PRESET.colors[2]) },
				uSpeed: { value: PRESET.settings.speed / 100 },
				uScale: { value: PRESET.settings.scale / 100 },
				uDetail: { value: PRESET.settings.detail / 100 },
				uDistortion: { value: PRESET.settings.distortion / 100 },
				uGlow: { value: PRESET.settings.glow / 100 },
				uGrain: { value: PRESET.grain },
				uVignette: { value: PRESET.settings.vignette / 100 },
				uBrightness: { value: PRESET.settings.brightness / 100 },
				uContrast: { value: PRESET.settings.contrast / 100 },
				uSaturation: { value: PRESET.settings.saturation / 100 },
				uHue: { value: (PRESET.settings.hue / 180) * Math.PI },
				uGrayscale: { value: 0 },
				uSepia: { value: 0 },
				uInvert: { value: 0 },
				uPixelate: { value: PRESET.effectUniforms.uPixelate },
				uDither: { value: PRESET.effectUniforms.uDither },
				uPosterize: { value: PRESET.effectUniforms.uPosterize },
				uEdgeGlow: { value: PRESET.effectUniforms.uEdgeGlow },
				uPixelSort: { value: PRESET.effectUniforms.uPixelSort },
				uLed: { value: PRESET.effectUniforms.uLed },
				uRgbSplit: { value: PRESET.effectUniforms.uRgbSplit },
				uGlitch: { value: PRESET.effectUniforms.uGlitch },
				uScanlines: { value: PRESET.effectUniforms.uScanlines },
				uDuotone: { value: PRESET.effectUniforms.uDuotone },
				uPixelSize: { value: PRESET.pixelSettings.size / 100 },
				uDensity: { value: PRESET.pixelSettings.density / 100 },
				uExposure: { value: (PRESET.pixelSettings.exposure - 50) / 100 },
				uScatter: { value: PRESET.pixelSettings.scatter / 100 },
				uPixelOpacity: { value: PRESET.pixelSettings.opacity / 100 },
				uDitherAlgorithm: { value: PRESET.ditherAlgorithm },
				uAnimationPreset: { value: PRESET.animation.preset },
				uAnimationPace: { value: PRESET.animation.pace },
				uAnimationIntensity: { value: PRESET.animation.intensity },
				uEffectsVisible: { value: 1 },
			},
		});
		const mesh = new Mesh(gl, { geometry, program });

		const resize = () => {
			if (!container || !renderer) return;
			const width = Math.max(10, container.clientWidth || 800);
			const height = Math.max(10, container.clientHeight || 400);
			renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
			renderer.setSize(width, height);
			const resolution = (program.uniforms.uResolution as Uniform)
				.value as Float32Array;
			resolution[0] = gl.drawingBufferWidth || width;
			resolution[1] = gl.drawingBufferHeight || height;
		};

		const observer = new ResizeObserver(resize);
		observer.observe(container);
		window.addEventListener("resize", resize);
		resize();

		let frame = 0;
		let elapsed = 0;
		let previous = performance.now();

		const render = (now: number) => {
			const delta = Math.min(100, Math.max(0, now - previous));
			previous = now;

			if (!pausedRef.current && !document.hidden) {
				elapsed += delta;
				(program.uniforms.uTime as Uniform).value = elapsed / 1000;
				renderer.render({ scene: mesh });
			}
			frame = requestAnimationFrame(render);
		};

		resize();
		renderer.render({ scene: mesh });
		frame = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
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
			className={`absolute inset-0 size-full overflow-hidden bg-[#04100c] ${className}`}
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
