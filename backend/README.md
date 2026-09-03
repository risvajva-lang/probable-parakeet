# HDOFLIX Production Backend Service

High-performance microservice supporting HDOFLIX Android client with configuration, catalog synchronization, dynamic server resolution, and subtitle indexing.

## Architecture

- **Runtime:** Node.js 20+ / TypeScript
- **Framework:** Express with Helmet and CORS security headers
- **Caching Layer:** In-memory TTL cache with Redis connection capability
- **Endpoints:**
  - `GET /health`: Health status & uptime
  - `GET /v1/config`: Remote Config & feature flags
  - `GET /v1/catalog/home`: Curated home sections & hero content
  - `GET /v1/catalog/search`: Multi-category catalog query
  - `GET /v1/catalog/:id`: Extended media metadata
  - `POST /v1/resolve`: Multi-provider stream resolution
  - `GET /v1/subtitles`: Subtitle indexing
  - `GET /v1/user/profile`, `favorites`, `history`: User state synchronization
  - `GET /v1/notifications`: Broadcast announcements

## Running Locally

```bash
cd backend
npm install
npm run dev
```

## Running with Docker

```bash
docker build -t hdoflix-backend .
docker run -p 8080:8080 hdoflix-backend
```
