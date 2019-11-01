FROM node:lts-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
