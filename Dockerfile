# Portable packaging scaffold. Container execution has not been verified in the
# restricted development environment. Pin image digests before public release.
FROM node:24-bookworm-slim AS workspace
WORKDIR /app
RUN npm install -g pnpm@12.15.0
COPY . .
# The inherited lockfile is incomplete. Regenerate/review it with registry access
# before replacing this with --frozen-lockfile in release CI.
RUN pnpm install --no-frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1

FROM workspace AS api
USER node
CMD ["node", "--import", "tsx", "apps/api/src/server.ts"]

FROM workspace AS web-build
ARG API_URL=http://api:3001
ENV API_URL=$API_URL
RUN pnpm --filter @fyx/web build

FROM web-build AS web
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "apps/web", "-p", "3000"]
