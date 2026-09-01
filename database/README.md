# API Gateway Management & Access Control System — Stage 1 (Database)

## Project Objective

This database models how a company manages APIs through a centralized
gateway: registering APIs and their versions, exposing routes,
controlling who can call what via role-based permissions, issuing
API keys, and logging every request plus every security-relevant
change (audit trail). Stage 1 delivers just this MySQL layer; a
React + Node/Express + JWT/RBAC application will sit on top of it in
later stages.

## Database Architecture

- `roles` and `users` form the identity/RBAC base.
- `apis` → `api_versions` → `routes` form the gateway's catalog of
  what can be called.
- `permissions` + `user_permissions` form a many-to-many RBAC layer
  independent of `roles`, so access can be tuned per user, not just
  per role.
- `api_keys` are credentials issued to a user for calling the
  gateway.
- `api_usage_logs` is the fact table: every simulated request,
  linking user, api, version, route and (optionally) the key used.
- `audit_logs` is the security trail, populated both manually and
  automatically via triggers.

## Table Description

| Table | Purpose |
|---|---|
| roles | Defines system roles (ADMIN, DEVELOPER) |
| users | Application accounts, each tied to one role |
| apis | Top-level registered API products |
| api_versions | Versions of an API (v1, v2, ...), active or deprecated |
| routes | Individual endpoints under a specific API version |
| permissions | Master list of grantable permission scopes |
| user_permissions | Many-to-many grants of permissions to users |
| api_keys | Credentials a user uses to call the gateway |
| api_usage_logs | Log of every simulated gateway request |
| audit_logs | Audit trail of security-relevant changes |

## Relationships

- `roles (1) ── (N) users`
- `users (1) ── (N) apis` (owner)
- `apis (1) ── (N) api_versions`
- `api_versions (1) ── (N) routes`
- `users (N) ── (N) permissions` through `user_permissions`
- `users (1) ── (N) api_keys`
- `users (1) ── (N) api_usage_logs`, `apis (1) ── (N) api_usage_logs`,
  `routes (1) ── (N) api_usage_logs`, `api_keys (1) ── (N) api_usage_logs`
- `users (1) ── (N) audit_logs`

## ER Model (text diagram)