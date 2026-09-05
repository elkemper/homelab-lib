FROM node:24-slim AS builder

WORKDIR /app

# Copy package.json files first to leverage Docker cache
COPY package.json ./ 
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

# Build tools for native modules (better-sqlite3, bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build client and server
WORKDIR /app/packages/client
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

WORKDIR /app/packages/server
RUN npm run build

# Strip devDeps (react-scripts, vitest, @types...). Keeps prod deps incl.
# ts-node/typescript/knex needed for runtime migrations.
WORKDIR /app
RUN npm prune --omit=dev

FROM node:24-slim

WORKDIR /app

# No toolchain here: runtime modules are copied from the builder (same base
# image, so native bindings match) and nothing is compiled in this stage.
# curl serves the HEALTHCHECK below.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && apt-get clean 

# Copy only necessary runtime files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/build ./packages/client/build
COPY --from=builder /app/packages/server/migrations ./packages/server/migrations
COPY --from=builder /app/packages/server/knexfile.ts ./packages/server/knexfile.ts

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json

# Set working directory to the server application
WORKDIR /app/packages/server

# Command to run the server (migrations first: the sqlite file lives on a volume
# and is only present at container start; start-server = migrate + run)
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD curl -sf http://127.0.0.1:3214/api/health || exit 1
CMD ["npm", "run", "start-server"]
