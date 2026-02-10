# ---- Builder stage ----
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src/ src/
COPY bin/ bin/
COPY ci-bin/ ci-bin/
COPY config/ config/

RUN yarn build && yarn oclif manifest

ARG GITHUB_TOKEN
RUN GITHUB_TOKEN=${GITHUB_TOKEN} yarn ci:download-web-uis

# ---- Runtime stage ----
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini git ca-certificates && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 bitsocial && \
    useradd --uid 1001 --gid bitsocial --shell /bin/bash --create-home bitsocial

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY --from=builder /app/dist/ dist/
COPY --from=builder /app/oclif.manifest.json ./
COPY bin/ bin/
RUN chmod +x bin/run
RUN ln -s /app/bin/run /usr/local/bin/bitsocial

RUN mkdir -p /data /logs && chown -R bitsocial:bitsocial /data /logs /app

USER bitsocial

ENV XDG_DATA_HOME=/data
ENV XDG_STATE_HOME=/logs
ENV DEBUG="bitsocial*, plebbit*, -plebbit*trace"

EXPOSE 9138

VOLUME ["/data", "/logs"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "const net=require('net');const s=net.connect(9138,'localhost',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),5000)"

ENTRYPOINT ["tini", "--"]
CMD ["bitsocial", "daemon"]
