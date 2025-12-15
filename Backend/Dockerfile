FROM node:20-alpine AS base

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5001

# Install dependencies based on the lockfile for reproducible builds
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 5001

CMD ["npm", "run", "start"]
