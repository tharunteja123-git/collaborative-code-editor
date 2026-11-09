
FROM node:20-slim AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .


ENV VITE_API_URL=/api
ENV VITE_SYNC_URL=/sync
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
