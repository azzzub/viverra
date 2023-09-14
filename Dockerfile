# DEPS
FROM node:18.17.1-slim as deps

WORKDIR /app

RUN apt-get update
RUN apt-get install -y openssl

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN touch ./logs/logs.log
RUN touch ./db/data.db
RUN cp ./.env-example ./.env
RUN yarn prisma:migrate
RUN yarn prisma:push
RUN node ./utils/localAdmin.js

RUN yarn build

# BUILDER
FROM node:18.17.1-slim as builder

WORKDIR /app

RUN apt-get update
RUN apt-get install -y openssl

COPY --from=deps /app/package.json .
COPY --from=deps /app/yarn.lock .
COPY --from=deps /app/next.config.js ./
COPY --from=deps /app/public ./public
COPY --from=deps /app/db ./db
COPY --from=deps /app/logs ./logs
COPY --from=deps /app/.next/standalone ./.next/standalone
COPY --from=deps /app/.next/static ./.next/static
ENV DATABASE_URL=file:../../../db/data.db

RUN yarn install --production --frozen-lockfile

# RUNNER
FROM node:18.17.1-slim as runner

WORKDIR /app

RUN apt-get update
RUN apt-get install -y openssl

COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/logs ./logs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV DATABASE_URL=file:../../../db/data.db

EXPOSE 4848
EXPOSE 5555

CMD [ "yarn", "start" ]