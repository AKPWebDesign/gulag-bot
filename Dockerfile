FROM node:lts

WORKDIR /usr/src/gulagbot

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["yarn", "start:prod"]
