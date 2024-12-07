# Backstage App

## Overview

This repository contains a Backstage application built using the Backstage CLI. Backstage is an open platform for building developer portals, enabling teams to manage their services, documentation, and tools in one place.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Building the Application](#building-the-application)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Modular Architecture**: Built with a modular approach, allowing easy integration of plugins and services.
- **Customizable**: Easily customize the look and feel of your developer portal.
- **Scalable**: Designed to scale with your organization as it grows.
- **Rich Plugin Ecosystem**: Leverage existing plugins or create your own to extend functionality.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 18.x or later
- **Yarn**: Version 1.x or later
- **Docker**: Version 20.x or later (for containerization)
- **Git**: Version 2.x or later

# Backstage Docker Deployment

This template provides a production-ready Docker setup for Backstage.

## Quick Start
```bash
git clone <this-repo>
cd backstage-docker
docker-compose up --build
```

## Project Structure
```
backstage-docker/
├── docker-compose.yml
├── Dockerfile
├── app-config.yaml
└── app-config.production.yaml
```

## Configuration Files

`docker-compose.yml`:
```yaml
services:
  backstage-builder:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    volumes:
      - ./app:/app

  backstage:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "7007:7007"
    environment:
      - NODE_ENV=production
      - BACKSTAGE_APP_NAME=backstage
    depends_on:
      - backstage-builder
```

`Dockerfile`:
```dockerfile
FROM node:18-bullseye as builder

RUN apt-get update && \
    apt-get install -y python3 python3-pip make g++ git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install -g @backstage/cli && \
    printf 'backstage-app\n' | npx @backstage/create-app@latest --skip-install && \
    cd backstage-app && \
    yarn config set nodeLinker node-modules && \
    yarn install --no-immutable && \
    cd packages/backend && \
    backstage-cli package build

FROM node:18-bullseye-slim as runner

WORKDIR /app

COPY --from=builder /app/backstage-app .

RUN apt-get update && \
    apt-get install -y python3 python3-pip make g++ git && \
    yarn install

WORKDIR /app/packages/backend
CMD ["yarn", "start"]
```

`app-config.yaml`:
```yaml
app:
  title: Backstage
  baseUrl: http://localhost:7007

organization:
  name: My Company

backend:
  baseUrl: http://localhost:7007
  listen:
    port: 7007
  database:
    client: sqlite3
    connection: ':memory:'
  cors:
    origin: http://localhost:7007
    methods: [GET, HEAD, POST, PUT, DELETE]

catalog:
  import:
    entityFilename: catalog-info.yaml
  rules:
    - allow: [Component, System, API, Resource, Location]
```

## Notes

1. **Production Use**
   - Replace SQLite with PostgreSQL for production
   - Configure proper authentication
   - Add SSL/TLS for security

2. **Configuration**
   - Customize `app-config.yaml` for your organization
   - Add environment-specific configs in `app-config.production.yaml`

3. **Build Arguments**
   - Adjust `NODE_OPTIONS` if more memory is needed
   - Modify dependencies in the Dockerfile as needed

4. **Healthcheck**
   - Add Docker healthcheck to monitor service
   - Configure monitoring for production use

## Common Issues

1. **Memory Issues**
```bash
# Increase Node memory
ENV NODE_OPTIONS="--max-old-space-size=8192"
```

2. **Build Failures**
```bash
# Clear Docker build cache
docker-compose build --no-cache
```