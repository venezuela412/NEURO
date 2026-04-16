FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @neuro/miniapp build

FROM nginx:1.29-alpine

COPY apps/miniapp/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/miniapp/dist /usr/share/nginx/html

EXPOSE 80
