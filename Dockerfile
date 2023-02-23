FROM node:8.10.0-alpine
RUN mkdir /app
WORKDIR "/app"
COPY . .
RUN yarn global add pm2@3
RUN yarn
RUN yarn run build
CMD ["pm2-runtime","start","./dist/app.js"]