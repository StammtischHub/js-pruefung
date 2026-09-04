FROM node:26-alpine

WORKDIR /app

RUN npm install -g pnpm@11.25.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --frozen-lockfile --filter frontend

COPY apps/frontend ./apps/frontend

EXPOSE 5173

CMD ["pnpm", "dev:frontend"]
