# Check for Dockerfile and workflow file
# Then create them

# Dockerfile for Node.js Express/Prisma app
# Multi-stage build to keep the image small

# Stage 1: Build
FROM node:20-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client
RUN npx prisma generate

COPY . .

# Stage 2: Runtime
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/src ./src

EXPOSE 3001

CMD ["npm", "start"]
