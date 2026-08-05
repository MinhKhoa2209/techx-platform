# syntax=docker/dockerfile:1.7
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build
WORKDIR /workspace

COPY package.json package-lock.json tsconfig.base.json ./
COPY src/catalog-api/package.json ./src/catalog-api/package.json
COPY src/order-api/package.json ./src/order-api/package.json
COPY src/frontend/package.json src/frontend/tsconfig.json src/frontend/next.config.mjs src/frontend/next-env.d.ts ./src/frontend/
RUN npm ci --ignore-scripts

COPY src/frontend/app ./src/frontend/app
COPY src/frontend/components ./src/frontend/components
COPY src/frontend/lib ./src/frontend/lib
COPY src/frontend/public ./src/frontend/public
RUN npm run build -w @techx/frontend

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=build --chown=10000:10000 /workspace/src/frontend/.next/standalone ./
COPY --from=build --chown=10000:10000 /workspace/src/frontend/.next/static ./src/frontend/.next/static
COPY --from=build --chown=10000:10000 /workspace/src/frontend/public ./src/frontend/public
USER 10000:10000
EXPOSE 3000
CMD ["node", "src/frontend/server.js"]
