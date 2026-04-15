FROM node:22-alpine

COPY . ./app

WORKDIR /app

RUN npm install -g pnpm

RUN pnpm install


EXPOSE 5000

CMD ["pnpm", "run", "start:dev"]