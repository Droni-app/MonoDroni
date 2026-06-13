# ---- Build stage ----
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Provide dummy env vars so AdonisJS can boot for swagger generation.
# No DB queries are made (Lucid is lazy), so dummy DB values are safe.
RUN set -e && \
    printf '%s\n' \
      'NODE_ENV=development' \
      'PORT=3333' \
      'HOST=0.0.0.0' \
      'LOG_LEVEL=info' \
      'APP_KEY=zx4-sByv3n9mA2KqT8dPeYfRcWuJhLgN' \
      'APP_URL=http://localhost:3333' \
      'SESSION_DRIVER=cookie' \
      'DB_HOST=localhost' \
      'DB_PORT=3306' \
      'DB_USER=root' \
      'DB_PASSWORD=root' \
      'DB_DATABASE=app' \
      'DRIVE_DISK=spaces' \
      'SPACES_KEY=placeholder' \
      'SPACES_SECRET=placeholder' \
      'SPACES_REGION=nyc3' \
      'SPACES_BUCKET=placeholder' \
      'SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com' \
      'MAIL_MAILER=smtp' \
      'MAIL_FROM_NAME=App' \
      'MAIL_FROM_ADDRESS=app@example.com' \
      'SMTP_HOST=localhost' \
      'SMTP_PORT=1025' \
      'SMTP_USERNAME=placeholder' \
      'SMTP_PASSWORD=placeholder' \
      'GOOGLE_CLIENT_ID=placeholder' \
      'GOOGLE_CLIENT_SECRET=placeholder' \
    > .env && \
    node ace swagger:generate && \
    rm .env

RUN node ace build --ignore-ts-errors

# ---- Production stage ----
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=builder /app/build ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/swagger.yml ./swagger.yml

RUN npm ci --omit=dev

EXPOSE 3333

CMD ["node", "bin/server.js"]
