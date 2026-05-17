FROM node:22-alpine

RUN apk add --no-cache build-base python3

COPY . ./app

WORKDIR /app

RUN npm install

CMD ["npm", "run", "start:dev"]
