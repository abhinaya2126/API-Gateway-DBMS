# API Gateway Management System Verification Report

Date: 2026-09-20

## Scope

Phase 1 and the fresh setup path were completed. The clean seed intentionally contains only roles and permissions; no demo users, hashes, API keys, APIs, routes, or user-linked sample rows remain.

## Root Causes And Fixes

- Login pages prefilled removed demo credentials in [frontend/src/pages/admin/AdminLogin.jsx](frontend/src/pages/admin/AdminLogin.jsx#L9) and [frontend/src/pages/developer/DeveloperLogin.jsx](frontend/src/pages/developer/DeveloperLogin.jsx#L8). Both now start empty.
- Login lookup used the raw email in [backend/controllers/authController.js](backend/controllers/authController.js#L24). It now trims and lowercases input and performs a case-insensitive lookup.
- CORS used only a bare origin option in [backend/server.js](backend/server.js#L29). It now enforces a comma-separated allow-list, explicit methods and headers, and returns `204` for allowed preflight requests.
- JWT startup validation only checked presence in [backend/server.js](backend/server.js#L23). It now requires at least 32 characters.
- There was no public developer registration route. [backend/controllers/authController.js](backend/controllers/authController.js#L118) and [backend/routes/authRoutes.js](backend/routes/authRoutes.js#L7) now provide role-forced, throttled registration controlled by `ALLOW_SELF_REGISTRATION`.
- Admin bootstrap was absent. [backend/scripts/createAdmin.js](backend/scripts/createAdmin.js#L17) now validates and hashes environment credentials idempotently, generating a password only into the ignored `backend/.admin-credentials.txt` file when needed.
- The seed contained demo users, bcrypt hashes, API keys, user-owned APIs, permissions assignments, usage logs, and audit rows. [database/seed.sql](database/seed.sql#L18) now retains reference roles and permissions only.

## Credential Inventory

Removed from tracked files: demo admin/developer/user emails, plaintext demo passwords, bcrypt hashes, demo API keys, stale JWT-bearing QA results, and the scratch seed copy. The removed result artifacts were `qa-tests/api-results.json`, `qa-tests/api-results.txt`, `qa-tests/api-test-results.txt`, and `qa-tests/scratch-sql/seed.sql`.

A current repository scan for the known demo emails, passwords, bcrypt hash patterns, API-key prefixes, and JWT prefixes returned no matches. `git log -S` confirms the old demo email exists in historical commit `6039bb9`; rotate any credentials that may have been used with that history. History was not rewritten.

## Live Evidence

- `npm --prefix backend run db:setup`: all seven SQL files applied successfully.
- `npm run create-admin --prefix backend`: admin account created idempotently; password was not printed. `git check-ignore -v backend/.admin-credentials.txt` confirmed the file is ignored.
- Backend startup: MySQL connected; server listening on `http://localhost:5000`.
- `GET /api/health`: `200`, database `connected`.
- Allowed preflight from `http://127.0.0.1:5173`: `204`, `Access-Control-Allow-Origin` matched, methods included `GET,POST,PUT,PATCH,DELETE,OPTIONS`.
- Admin login: `200`, `success=true`, role `ADMIN`, token present. Token value was not printed.
- Developer registration: `201`, `success=true`; role is forced server-side to `DEVELOPER`.
- Developer login: `200`, role `DEVELOPER`.
- Wrong password: `401`.
- Playwright opened `/login`, `/register`, and `/admin/login`; console errors and failed requests were zero. Admin screenshot captured during verification: `vscode-chat-response-resource` browser artifact.

## Test Counts

| Check | Result | Evidence |
|---|---:|---|
| Backend tests | 2/2 passed | `npm test` in `backend` |
| Frontend tests | 1/1 passed | `npm test` in `frontend` |
| Frontend lint | 0 errors, 0 warnings | `npm run lint` in `frontend` |
| Frontend build | Passed | `npm run build` in `frontend` |
| Backend syntax checks | Passed | `node --check` for server, auth, and setup scripts |
| Browser portal smoke | 3 pages, 0 console errors, 0 failed requests | Playwright |
| Fresh database setup | 7/7 SQL files | `npm run db:setup --prefix backend` |
| Secret scan | 0 current known-pattern matches | PowerShell repository scan |

## Feature Status

| Feature group | Status | Exact reason/evidence |
|---|---|---|
| Auth, CORS, registration, JWT startup, portal routing | WORKING | Live HTTP and Playwright evidence above |
| Database schema, roles, permissions, setup scripts | WORKING | Fresh setup applied all seven files |
| Admin bootstrap | WORKING | Idempotent command completed and credentials file is ignored |
| Users, APIs, versions, routes, permissions CRUD | BLOCKED | Clean seed has no data and the full CRUD matrix was not executed in this run |
| API keys and gateway calls | BLOCKED | Clean seed has no APIs/routes/keys and the four services were not exercised in this run |
| Usage, audit, analytics | BLOCKED | Clean seed has no user-linked data and these endpoint matrices were not executed |
| Full responsive UI/page matrix | BLOCKED | Only login, registration, and admin login were browser-checked |
| Newman/Postman twice | BLOCKED | Collection still needs a fresh environment file and dynamically created test fixtures |
| CI end-to-end workflow | BLOCKED | CI configuration was adjusted for JWT/CORS but not run in this environment |

## PowerShell Runbook

```powershell
Copy-Item backend/.env.example backend/.env
# Fill DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, and a 32+ character JWT_SECRET.
npm install
npm run setup
npm run create-admin --prefix backend
npm run start:all
npm run dev --prefix frontend -- --host localhost
```

URLs: developer login `http://localhost:5173/login`; developer registration `http://localhost:5173/register`; admin login `http://localhost:5173/admin/login`; backend health `http://localhost:5000/api/health`. The four services use their existing ports `6001` through `6004`.

## Cleanup

Stop the running Node processes, run `npm --prefix backend run db:setup` when a clean development database is required, and remove only local generated files such as `backend/.admin-credentials.txt` after rotating the admin password. Test accounts created during the live registration probe should be removed through the admin Users API before a shared environment is handed back.

This report does not claim the complete feature matrix is working; therefore the required phrase `ALL EXISTING FEATURES WORKING` is intentionally not asserted.
