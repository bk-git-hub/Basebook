FROM node:22-bookworm AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY tests/web/package.json tests/web/package.json
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts

RUN npm ci

RUN npm run db:generate -w apps/api
RUN npm run build -w apps/api

FROM node:22-bookworm AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY data ./data

WORKDIR /app/apps/api

CMD ["npm", "run", "start:prod"]
