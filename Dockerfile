FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/control-plane/package.json apps/control-plane/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/adapters/package.json packages/adapters/package.json

RUN pnpm install --frozen-lockfile

COPY apps/control-plane apps/control-plane
COPY packages/shared packages/shared
COPY packages/domain packages/domain
COPY packages/adapters packages/adapters

EXPOSE 8787

WORKDIR /app/apps/control-plane

CMD ["npx", "tsx", "src/index.ts"]
