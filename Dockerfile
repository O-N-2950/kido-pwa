FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
RUN npm ci --workspaces

FROM deps AS build
COPY shared/ ./shared/
COPY server/ ./server/
RUN npm run build --workspace=shared
RUN npm run build --workspace=server

FROM base AS runner
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server/dist/index.js"]
