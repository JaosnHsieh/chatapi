FROM node:8.11.4-alpine AS dev
WORKDIR /usr/src/app
ENV NODE_ENV development
COPY . .
# You could use `yarn install` if you prefer.
RUN npm install