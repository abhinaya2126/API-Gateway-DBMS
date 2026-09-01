# API Gateway Management System — Database

## Project Objective

This database serves as the persistence layer for the **API Gateway Management System**.

The system models how a company manages APIs through a centralized gateway, including:

* Registering and managing APIs
* Managing API versions
* Creating and managing routes
* Controlling access through authentication and role-based access control (RBAC)
* Assigning user-specific permissions
* Issuing and revoking API keys
* Simulating API gateway requests
* Logging API usage
* Maintaining an audit trail of security-relevant activities

The complete project consists of a **React frontend**, **Node.js/Express backend**, **JWT authentication**, **RBAC**, and a **MySQL database**.

---

## Database Architecture

* `roles` and `users` form the identity and RBAC foundation.

* `apis` → `api_versions` → `routes` form the API gateway catalog.

* `permissions` and `user_permissions` provide a many-to-many permission system, allowing permissions to be assigned directly to individual users.

* `api_keys` stores API credentials issued to users.

* `api_usage_logs` records every simulated API gateway request, linking the user, API, version, route, and optionally the API key used.

* `audit_logs` maintains a security and activity trail of important system changes.

---

## Table Description

| Table              | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `roles`            | Defines system roles such as ADMIN and DEVELOPER              |
| `users`            | Stores application user accounts, each associated with a role |
| `apis`             | Stores registered APIs                                        |
| `api_versions`     | Stores versions of APIs such as v1, v2, etc.                  |
| `routes`           | Stores individual endpoints under a specific API version      |
| `permissions`      | Stores the master list of available permissions               |
| `user_permissions` | Maps permissions to users                                     |
| `api_keys`         | Stores API keys issued to users                               |
| `api_usage_logs`   | Records simulated API gateway requests                        |
| `audit_logs`       | Stores security-relevant activities and changes               |

---

## Relationships

* `roles (1) ── (N) users`

* `users (1) ── (N) apis` as API owners

* `apis (1) ── (N) api_versions`

* `api_versions (1) ── (N) routes`

* `users (N) ── (N) permissions` through `user_permissions`

* `users (1) ── (N) api_keys`

* `users (1) ── (N) api_usage_logs`

* `apis (1) ── (N) api_usage_logs`

* `api_versions (1) ── (N) api_usage_logs`

* `routes (1) ── (N) api_usage_logs`

* `api_keys (1) ── (N) api_usage_logs` where an API key is used

* `users (1) ── (N) audit_logs`

---

## ER Model

```text
roles
  │
  └────< users
           │
           ├────< apis
           │       │
           │       └────< api_versions
           │                │
           │                └────< routes
           │
           ├────< api_keys
           │
           ├────< user_permissions >──── permissions
           │
           ├────< api_usage_logs >──── apis
           │              │
           │              ├──── api_versions
           │              ├──── routes
           │              └──── api_keys
           │
           └────< audit_logs
```

---

## Database Files

The database folder contains the following SQL files:

### `schema.sql`

Creates the database structure, including:

* Tables
* Primary keys
* Foreign keys
* Constraints

### `seed.sql`

Inserts the initial data required for the application, such as:

* Roles
* Users
* Permissions
* Other required sample data

### `indexes.sql`

Creates database indexes to improve query performance.

### `views.sql`

Creates SQL views used for simplified and reusable database queries.

### `procedures.sql`

Contains stored procedures used by the database.

### `triggers.sql`

Contains database triggers for automated database operations and audit-related functionality.

---

## Database Setup Instructions

### Prerequisites

Before setting up the database, install:

* MySQL Server
* MySQL Workbench (recommended)

---

### Step 1: Open MySQL Workbench

Open MySQL Workbench and connect to your local MySQL Server.

---

### Step 2: Execute the SQL Files

Run the SQL files in the following order:

1. `schema.sql`
2. `seed.sql`
3. `indexes.sql`
4. `views.sql`
5. `procedures.sql`
6. `triggers.sql`

This order ensures that the database structure is created before inserting data and creating dependent database objects.

---

### Step 3: Verify the Database

After executing the scripts, verify that the database has been created successfully.

The application database is:

```text
api_gateway_mgmt
```

Check that all required tables, views, procedures, and triggers are available.

---

### Step 4: Configure the Backend

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=api_gateway_mgmt

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

Do not commit the actual `.env` file to GitHub.

Use `backend/.env.example` as a reference for the required environment variables.

---

## Integration with the Application

The MySQL database is connected to the Node.js/Express backend.

The backend:

* Connects to MySQL using the database configuration
* Provides REST APIs for managing users, APIs, versions, routes, permissions, and API keys
* Uses JWT authentication
* Implements role-based access control
* Records simulated API requests in usage logs
* Provides access to audit logs

The React frontend communicates with the backend to provide a user interface for managing the system.

---

## Related Project Components

```text
API-Gateway-DBMS/
│
├── backend/       # Node.js and Express REST API
│
├── database/      # MySQL database scripts
│
├── frontend/      # React frontend
│
├── postman/       # Postman API collection
│
└── README.md      # Complete project documentation
```

---

## Technologies Used

### Database

* MySQL
* MySQL Workbench

### Backend

* Node.js
* Express.js
* JWT Authentication
* Role-Based Access Control (RBAC)

### Frontend

* React
* Vite

### API Testing

* Postman

---

## Setup Summary

To run the complete project:

1. Clone the repository.
2. Set up the MySQL database using the SQL files in this folder.
3. Configure the backend environment variables.
4. Install backend dependencies using `npm install`.
5. Start the backend server.
6. Install frontend dependencies using `npm install`.
7. Start the React frontend.
8. Import the Postman collection to test the APIs.
