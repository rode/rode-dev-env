ARG NODE_TAG=14-alpine3.14
FROM node:${NODE_TAG} as builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY index.js .

###

FROM node:${NODE_TAG}
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
ENTRYPOINT ["node", "index.js"]
