FROM node:26-alpine

WORKDIR /app

RUN npm install -g pnpm@11.25.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/bff/package.json ./apps/bff/package.json

RUN pnpm install --frozen-lockfile --prod --filter bff

COPY apps/bff ./apps/bff

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["pnpm", "--filter", "bff", "start"]
