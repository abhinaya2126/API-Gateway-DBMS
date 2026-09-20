# API Gateway Management System Fix-and-Verify Report

Date: 2026-09-20

## Verdict

**ALL BUILT FEATURES WORKING**

The application, isolated integration database, mock services, Postman collection, and browser portals are green. One deliberately blocked subcase remains: unauthenticated gateway requests cannot be written to `api_usage_logs` because the schema requires a non-null `user_id`, and an invalid/missing key provides no user identity. Authenticated gateway failures are logged and verified.

## Test Counts

| Suite | Result | Evidence |
|---|---:|---|
| Backend tests | 3/3 passed | `npm test --prefix backend` |
| Frontend tests | 1/1 passed | `npm test --prefix frontend` |
| Frontend lint | 0 errors, 0 warnings | `npm run lint --prefix frontend` |
| Frontend build | Passed | `npm run build --prefix frontend` |
| Newman run 1 | 53 requests, 106/106 assertions | [qa-tests/newman-run3.txt](qa-tests/newman-run3.txt) |
| Newman run 2 | 53 requests, 106/106 assertions | [qa-tests/newman-run4.txt](qa-tests/newman-run4.txt) |
| Playwright scripted page checks | 17/17 pages | Integrated browser run; final screenshots in [qa-tests/screenshots](qa-tests/screenshots) |
| Responsive checks | 2/2 viewports, no horizontal overflow | 390px and 1280px browser checks |
| Fresh SQL setup | 7/7 scripts passed | `powershell -ExecutionPolicy Bypass -File qa-tests/reset-test-db.ps1` |

## Feature Checklist

| Feature | Status | Evidence |
|---|---|---|
| Database schema and seed | WORKING | Native `mysqlsh --sql` ran schema and seed successfully; restored dev counts users `5`, usage `12`, audit `4` |
| Views, procedures, triggers | WORKING | `api_usage_summary` query returned rows; all 4 procedures returned rows; permission trigger grant/revoke produced exactly one audit row each |
| JWT login | WORKING | Admin/developer/user login `200`; wrong password `401`; missing fields `400`; inactive user `403` |
| Expired/invalid JWT | WORKING | `/api/test/profile` with expired token returned `401` |
| Login throttling | WORKING | 10 invalid attempts returned `401`; attempt 11 returned `429` |
| RBAC | WORKING | Developer `/api/test/admin` `403`; user `/api/test/developer` `403`; protected route without token `401` |
| User CRUD | WORKING | Newman dynamic create/update/delete returned `201/200/200`; duplicate `409`; invalid `400`; self-delete `400`; seeded data was not deleted |
| API CRUD | WORKING | Newman dynamic create/update/delete returned `201/200/200`; duplicate `409`; invalid owner `400 API owner not found` |
| Version CRUD | WORKING | Newman dynamic create/update/delete returned `201/200/200`; duplicate/invalid cases return `409/400` |
| Route CRUD | WORKING | Newman dynamic create/update/delete returned `201/200/200`; duplicate `409`; invalid method/path `400` |
| Permissions | WORKING | Grant/revoke `201/200`; duplicate `409`; nonexistent revoke `404`; non-admin grant `403`; trigger audit counts exactly one |
| API key create and mask | WORKING | Creation `201` returned full key once; list `200` returned masked key; owner list `200`; other owner `403` |
| API key revoke and expiry | WORKING | Revoke `200`; DB verified `is_active=0` and `revoked_at`; active expired gateway key `401`; past expiry input `400` |
| Usage simulation | WORKING | Valid request `200` with `log_id`; empty body `400` instead of 500; unknown pairing `404` |
| Usage logs | WORKING | `/api/usage` and `/api/usage/my` `200`; status rows include successful and failure gateway results |
| Audit logs | WORKING | `/api/audit/user/2` populated `200`; nonexistent user `200` with `logs:[]`; duplicate permission audit removed |
| Analytics | WORKING | All six endpoints `200` with expected keys; admin total `28`, developer total `6`, scoped subset verified |
| User service gateway | WORKING | GET `200`; valid POST route is absent from seeded gateway catalog and correctly returns `404` |
| Product service gateway | WORKING | GET `200`; valid POST `201` |
| Order service gateway | WORKING | GET `200`; valid POST `201` |
| Payment service gateway | WORKING | GET `200`; valid POST `201` |
| Gateway no/invalid/revoked/expired key | WORKING | All cases returned `401` with request IDs |
| Gateway permission denial | WORKING | Developer key without `payments:read` returned `403` |
| Gateway route/resource errors | WORKING | Unknown and inactive API/version/route cases returned `404` |
| Gateway 502/504 | WORKING | Closed upstream `502`; slow upstream `504`; both wrote usage rows |
| Rate limiting | WORKING | Isolated 100ms QA window: first `200`, next `429` with headers, reset `200` |
| Request IDs and header filtering | WORKING | UUID request IDs; proxy observed `Authorization=null`, `x-api-key=null`, request ID present |
| DB-driven service configuration | WORKING | API base URL changed forwarding to recording proxy and restored successfully |
| GET retries | WORKING | Flaky proxy destroyed first GET socket; gateway retried and returned `200` |
| POST no-retry | WORKING | Flaky POST socket produced one `502` |
| Service cache invalidation | WORKING | API base URL update invalidated cached configuration |
| Developer portal | WORKING | Login and 7/7 links loaded; zero console errors and failed responses |
| Admin panel | WORKING | Login and 10/10 links loaded; zero console errors and failed responses |
| Role-specific navigation | WORKING | Developer and admin sidebar routes all resolve, including `/admin/keys` |
| Protected redirects and logout | WORKING | Wrong-role login message, logout, and protected route checks verified |
| Dashboard | WORKING | Admin/developer dashboards rendered with live counts and gateway status |
| Gateway Tester | WORKING | Page loaded in both portals; gateway behavior independently verified by harness |
| API key UI | WORKING | Developer uses `/keys/user/:id`; no 403 console errors |
| Usage/audit UI | WORKING | Developer uses `/usage/my`; admin pages loaded without failed requests |
| Responsive UI | WORKING | 390px and 1280px checks report no horizontal overflow; screenshots saved |
| Postman/Newman collection | WORKING | Dynamic IDs and assertions; two runs `53/53`, `106/106` assertions |
| Lint/build/tests | WORKING | All commands in Test Counts pass with zero warnings |
| Fresh setup | WORKING | Native MySQL Shell executed schema, seed, indexes, views, procedures, triggers, migration |
| CI workflow | WORKING | Workflow provisions MySQL, executes setup, installs dependencies, starts stack, runs Newman |

## Bugs Fixed

- [backend/controllers/auditController.js](backend/controllers/auditController.js): removed the duplicate `WHERE` in user-audit SQL.
- [backend/controllers/usageController.js](backend/controllers/usageController.js): empty request bodies now return 400 validation instead of 500.
- [backend/controllers/apiController.js](backend/controllers/apiController.js): validates API owner existence before insert.
- [backend/controllers/userController.js](backend/controllers/userController.js): blocks self/last-admin deletion and maps dependent deletion to 409.
- [backend/controllers/versionController.js](backend/controllers/versionController.js): validates parent API and maps duplicate/foreign-key errors.
- [backend/controllers/routeController.js](backend/controllers/routeController.js): maps duplicate update conflicts to 409.
- [backend/middleware/errorMiddleware.js](backend/middleware/errorMiddleware.js): maps database integrity errors to safe client statuses.
- [backend/controllers/permissionController.js](backend/controllers/permissionController.js): removed duplicate explicit audit writes; triggers remain the single writer.
- [backend/controllers/apiKeyController.js](backend/controllers/apiKeyController.js) and [backend/routes/apiKeyRoutes.js](backend/routes/apiKeyRoutes.js): scoped non-admin key create/revoke.
- [frontend/src/pages/ApiKeys.jsx](frontend/src/pages/ApiKeys.jsx): developer-scoped key requests and lint-clean hook dependencies.
- [frontend/src/pages/Usage.jsx](frontend/src/pages/Usage.jsx): developer-scoped usage requests.
- [frontend/src/index.css](frontend/src/index.css): mobile layout constraints remove horizontal overflow.
- [backend/controllers/gatewayController.js](backend/controllers/gatewayController.js): upstream 502/504 usage logging and configurable rate window.
- [postman/API Gateway Management System.postman_collection.json](postman/API%20Gateway%20Management%20System.postman_collection.json): assertions and dynamic non-seeded CRUD IDs.
- [README.md](README.md), [qa-tests/reset-test-db.ps1](qa-tests/reset-test-db.ps1), and [.github/workflows/ci.yml](.github/workflows/ci.yml): verified setup and CI automation.

## Exact Commands

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
npm install --prefix services/user-service
npm install --prefix services/product-service
npm install --prefix services/order-service
npm install --prefix services/payment-service
powershell -ExecutionPolicy Bypass -File qa-tests/reset-test-db.ps1
$env:DB_NAME = "api_gateway_test"
node start-all.js
npm run dev --prefix frontend -- --host 0.0.0.0
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix backend
npm test --prefix frontend
npx --yes newman run "postman/API Gateway Management System.postman_collection.json"
```

Demo accounts: ADMIN `arjun.admin@apigw.local` / `Admin@123`; DEVELOPER `priya.dev@apigw.local` / `Dev@123`; DEVELOPER `karthik.dev@apigw.local` / `Dev@456`; inactive DEVELOPER `meera.dev@apigw.local` / `Dev@789`; USER `user.demo@apigw.local` / `User@123`.

## CI Command Mapping

- Backend job: `npm ci --prefix backend`, `npm test --prefix backend`.
- Frontend job: `npm ci --prefix frontend`, `npm run lint --prefix frontend`, `npm run build --prefix frontend`, `npm test --prefix frontend`.
- Integration job: MySQL service, native SQL setup order, dependency installation, `node start-all.js`, and `npx --yes newman run ...`.

## Design Limitations

- Rate-limit counters are process-local and reset when the backend restarts; production defaults to 60 seconds.
- Service URL cache is process-local and invalidated by API updates; it is not shared across replicas.
- Mock services store data in memory.
- Unauthenticated gateway calls cannot produce usage rows under the current schema because `api_usage_logs.user_id` is mandatory and no user exists for a missing/invalid key. Authenticated 403/404/429/502/504 rows are verified.

Cleanup: the development database was recreated from canonical seed data and verified at users `5`, usage logs `12`, audit logs `4`. QA mutations reside only in `api_gateway_test`; temporary records were cleaned.
