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
    backstage-cli package build && \
    ls -la dist/ && \
    find . -name "index.js"

FROM node:18-bullseye-slim as runner

WORKDIR /app

COPY --from=builder /app/backstage-app .

RUN apt-get update && \
    apt-get install -y python3 python3-pip make g++ git && \
    yarn install

WORKDIR /app/packages/backend
CMD ["yarn", "start"]