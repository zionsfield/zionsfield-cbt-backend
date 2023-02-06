FROM node:16-alpine

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile --production=true

COPY ./ ./

EXPOSE 8080

CMD ["yarn", "start"]