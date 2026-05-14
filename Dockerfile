# syntax=docker/dockerfile:1.7

# --- Build stage: install all deps and compile ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile --non-interactive

COPY . .
RUN yarn build

# Prune dev dependencies so we only copy production node_modules to the runtime image.
RUN yarn install --production --ignore-scripts --prefer-offline --pure-lockfile --non-interactive

# --- Runtime stage: minimal image with only production deps and built output ---
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080

CMD ["node", "dist/main"]
