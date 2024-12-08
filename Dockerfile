FROM node:18-bullseye as builder

WORKDIR /app

ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Create app non-interactively
RUN printf 'backstage-app\n' | npx @backstage/create-app@latest

WORKDIR /app/backstage-app

# Copy configuration files
COPY app-config.yaml app-config.production.yaml ./

# Build backend
RUN cd packages/backend && \
    yarn build

FROM node:18-bullseye-slim as runner

WORKDIR /app/backstage-app

# Copy the entire backstage-app directory
COPY --from=builder /app/backstage-app .

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    make \
    g++ \
    git \
    sqlite3 \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm get-docker.sh && \
    pip3 install mkdocs-techdocs-core && \
    # Cleanup
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV BACKSTAGE_CONFIG_PATH=/app/backstage-app/app-config.yaml

WORKDIR /app/backstage-app/packages/backend

CMD ["yarn", "start"]