FROM node:12

WORKDIR /usr/src/gulagbot

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["yarn", "start:prod"]
