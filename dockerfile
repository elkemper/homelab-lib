FROM node:24.3-alpine AS builder

WORKDIR /app

COPY package.json ./ 
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

RUN npm install

COPY packages/client ./packages/client
COPY packages/server ./packages/server

WORKDIR /app/packages/client
RUN npm run build

WORKDIR /app/packages/server
RUN npm run build

FROM node:24.3-alpine

WORKDIR /app

COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/client/build ./packages/client/build
COPY packages/server/package.json ./packages/server/
COPY packages/server/node_modules ./packages/server/node_modules

WORKDIR /app/packages/server

CMD ["node", "dist/app.js"]