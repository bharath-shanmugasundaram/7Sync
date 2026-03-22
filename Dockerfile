FROM node:24-slim

COPY . /usr/src

WORKDIR /usr/src

RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN npm install

RUN touch .env

ENV NODE_ENV=production

RUN npm run buildReact

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/ping').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# Use node directly instead of npm to properly handle signals (SIGTERM, SIGINT)
CMD ["node", "--import", "tsx", "server/server.ts"]
