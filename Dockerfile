FROM node:lts

WORKDIR /usr/src/gulagbot

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "start:prod"]
