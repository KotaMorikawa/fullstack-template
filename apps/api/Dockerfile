FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json turbo.json biome.json ./

RUN npm ci
RUN npm run build --workspace api

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json turbo.json biome.json ./

RUN npm ci --omit=dev --workspace api

COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/api/drizzle /app/apps/api/drizzle

CMD ["node", "apps/api/dist/index.js"]
