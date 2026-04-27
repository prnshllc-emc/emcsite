# ============================================================
# Stage 1: Build the SPA
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the SPA (output goes to /app/dist)
RUN pnpm build

# ============================================================
# Stage 2: Serve with nginx
# ============================================================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built SPA from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Railway provides PORT env var; default to 8080
ENV PORT=8080

# Expose the port (informational)
EXPOSE 8080

# nginx docker image automatically runs envsubst on templates in /etc/nginx/templates/
# and outputs to /etc/nginx/conf.d/ before starting nginx
CMD ["nginx", "-g", "daemon off;"]
