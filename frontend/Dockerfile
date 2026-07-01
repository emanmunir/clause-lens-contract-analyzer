# Clause Lens frontend — multi-stage: build with Node, then serve the static bundle.

# ---- Build stage -----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

# Build the production bundle into /app/dist.
COPY . .
RUN npm run build

# ---- Serve stage -----------------------------------------------------------
FROM node:20-alpine AS serve
WORKDIR /app

# `vite preview` is a tiny static server that serves the built dist/ output.
# We copy only what's needed to run it: the build output and the installed deps.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4173

# Bind to 0.0.0.0 so the port is reachable from outside the container.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
