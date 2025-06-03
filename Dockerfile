# Multi-stage build for both apps
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/client-app/package.json ./apps/client-app/
COPY apps/trainer-app/package.json ./apps/trainer-app/

# Install dependencies
RUN npm ci --only=production

# Build client app
FROM base AS client-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client application
RUN npm run client:build

# Build trainer app  
FROM base AS trainer-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build trainer application
RUN npm run trainer:build

# Production image for client app
FROM nginx:alpine AS client-runner
COPY --from=client-builder /app/apps/client-app/build /usr/share/nginx/html

# Copy nginx configuration for SPA
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # PWA files should not be cached
    location = /manifest.json {
        expires 0;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    location = /sw.js {
        expires 0;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Production image for trainer app
FROM nginx:alpine AS trainer-runner
COPY --from=trainer-builder /app/apps/trainer-app/build /usr/share/nginx/html

# Copy same nginx configuration
COPY --from=client-runner /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 