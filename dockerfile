FROM node:24.3-alpine AS builder

WORKDIR /app

# Copy package.json files first to leverage Docker cache
COPY package.json ./ 
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

# Install build tools for native modules (e.g., better-sqlite3)
RUN apk add --no-cache python3 make g++

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build client and server
WORKDIR /app/packages/client
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN node /app/node_modules/react-scripts/bin/react-scripts.js build

WORKDIR /app/packages/server
RUN node /app/node_modules/typescript/bin/tsc

FROM node:24.3-alpine

WORKDIR /app

# Install build tools for native modules (e.g., better-sqlite3) in the final stage
RUN apk add --no-cache python3 make g++

# Copy only necessary runtime files from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/build ./packages/client/build

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json

# Set working directory to the server application
WORKDIR /app/packages/server
RUN npm install --production

# Command to run the server
CMD ["node", "dist/app.js"]
