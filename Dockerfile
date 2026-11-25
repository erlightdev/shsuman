# Multi-stage Dockerfile for shsuman Turborepo monorepo
FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json tsconfig.json biome.json bts.jsonc ./
COPY packages ./packages
COPY apps ./apps

# Install all workspace dependencies
RUN npm ci

# Production build environment
ENV NODE_ENV=production
ENV PUBLIC_SERVER_URL=https://api.shsuman.com.np

# Build all packages and applications via Turbo
RUN npm run build

# Runner stage for backend API server
FROM node:24-alpine AS server
WORKDIR /app/apps/server
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/server /app/apps/server
EXPOSE 3000
CMD ["node", "dist/index.mjs"]

# Runner stage for Astro SSR frontend
FROM node:24-alpine AS web
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV PUBLIC_SERVER_URL=https://api.shsuman.com.np
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/web /app/apps/web
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
