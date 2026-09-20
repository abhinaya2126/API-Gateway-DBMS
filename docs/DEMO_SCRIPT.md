# 7-10 Minute Demo Script

1. Run the database scripts in order, then `npm install` in backend, frontend, and each service folder.
2. Start everything with `npm run start:all` and start Vite with `npm run dev --prefix frontend`.
3. Open the developer portal at `http://localhost:5173` and sign in at `http://localhost:5173/login` as DEVELOPER (`priya.dev@apigw.local` / `Dev@123`) to show the developer dashboard and owned APIs.
4. Open the admin panel at `http://localhost:5173/admin` and sign in at `http://localhost:5173/admin/login` as ADMIN (`arjun.admin@apigw.local` / `Admin@123`) to show the dashboard, API registry, masked keys, audit, and analytics.
5. Open Gateway Tester, select User API `v1 /users`, enter the admin key from the seed, and send a request.
6. Show the response status, request ID, rate-limit headers, response time, and JSON gateway metadata.
7. Log in as DEVELOPER and show permitted Product or Order access. Attempt to access a protected admin route to confirm the role guard denies access.
8. Revoke a permission in the admin view, retry the corresponding gateway route, and show `403` plus audit/usage records.
9. Set an API limit to `1`, send two requests, and show `429` with `Retry-After`.
10. Show the route-not-found `404`, then Product, Order, and Payment service responses.
11. Close with the ERD, parameterized SQL, masked API-key policy, and known limitation: automated frontend coverage is a smoke test rather than component-level testing.

## Viva questions

- Why use API keys at the gateway? They identify consuming users independently of the browser JWT and can be revoked or expired.
- How are permissions derived? The first registered route segment becomes the resource and GET/HEAD map to `read`; other supported methods map to `write`.
- Why cache service URLs? It avoids a database read on every request while API updates invalidate the affected entry.
- Why are keys masked? Listing a credential must not disclose a reusable secret; only creation returns the full value.
- What happens when an upstream service is down? GET/HEAD retry bounded network failures and the gateway returns `502`; timeouts return `504`.
