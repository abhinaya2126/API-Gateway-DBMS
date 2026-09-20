# API Reference

Base URL: `http://localhost:5000/api`

## Authentication and management

| Method | Path | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| GET | `/health` | Public |
| GET/POST/PUT/DELETE | `/users` and `/users/:id` | ADMIN |
| GET/POST/PUT/DELETE | `/apis` and `/apis/:id` | Authenticated; writes ADMIN/DEVELOPER |
| GET/POST/PUT/DELETE | `/versions/api/:apiId`, `/versions/:id` | Authenticated; writes ADMIN/DEVELOPER |
| GET/POST/PUT/DELETE | `/routes/version/:versionId`, `/routes/:id` | Authenticated; writes ADMIN/DEVELOPER |
| GET/POST/DELETE | `/permissions`, `/permissions/user/:userId` | Reads authenticated; writes ADMIN |
| GET/POST/PUT | `/keys`, `/keys/user/:userId`, `/keys/:id/revoke` | ADMIN or owner read |
| GET | `/usage`, `/usage/my` | ADMIN or own usage |
| GET | `/audit`, `/audit/user/:userId` | ADMIN |

## Analytics

Authenticated users can call `/analytics/summary`, `/analytics/by-api`, `/analytics/by-status`, `/analytics/timeseries?range=24h|7d`, `/analytics/top-routes`, and `/analytics/slowest-routes`. ADMIN sees all usage; other roles see only their own usage.

## Gateway

`ALL /gateway/apis/:apiId/:version/*path` requires `x-api-key`. Route permissions derive from the first path segment and HTTP method, for example `GET /users/:id` requires `users:read`. ADMIN bypasses permission checks. Rate-limit and request metadata are returned in `X-Request-ID`, `X-Response-Time`, `X-RateLimit-*`, and `Retry-After` headers.
