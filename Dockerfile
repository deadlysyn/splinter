FROM node:8.11-alpine

ENV NODE_OPTIONS="--max-old-space-size=16"

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install
RUN npm install -g nodemon

EXPOSE 3000

CMD [ "npm", "start" ]
