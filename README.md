# API Gateway Management System

A full-stack **API Gateway Management System** developed as a database management system project. The application provides centralized management of APIs, API versions, routes, users, permissions, API keys, usage logs, and audit logs.

## 🚀 Features

### Authentication

* User login using JWT authentication
* Protected API endpoints
* Role-based access control
* Separate developer and admin portals on the same Vite app

## 🔐 Demo accounts and portals

Developer portal:

- URL: http://localhost:5173
- Login: http://localhost:5173/login
- Email: priya.dev@apigw.local
- Password: Dev@123

Admin panel:

- URL: http://localhost:5173/admin
- Login: http://localhost:5173/admin/login
- Email: arjun.admin@apigw.local
- Password: Admin@123

The seed data includes both an ADMIN and a DEVELOPER account for the default demo flow.

### User Management

* Get all users
* Get user details
* Create users
* Update users
* Delete users

### API Management

* Create and manage APIs
* Update API information
* Activate or deactivate APIs
* Delete APIs

### Version Management

* Create API versions
* View versions associated with an API
* Update versions
* Delete versions
* Track active and deprecated versions

### Route Management

* Create API routes
* View routes by API version
* Update routes
* Delete routes
* Support for different HTTP methods

### Permission Management

* View all available permissions
* View permissions assigned to a user
* Grant permissions to users
* Revoke user permissions

### API Key Management

* Generate API keys
* View all API keys
* View API keys belonging to a user
* Revoke API keys
* Support API key expiration

### API Usage Monitoring

* Simulate API Gateway requests
* Validate APIs, versions, routes, and API keys
* Record request status codes
* Track response time
* View all usage logs
* View usage logs for the authenticated user

### Audit Logging

* View system audit logs
* View audit logs for specific users
* Track important system activities

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* Axios

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* CORS

## Database

* MySQL
* MySQL Workbench

## API Testing

* Postman

## Version Control

* Git
* GitHub

---

# 📁 Project Structure

```text
API-Gateway-DBMS/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── database/
│   └── database files and SQL scripts
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── postman/
│   └── API Gateway Management System.postman_collection.json
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation and Setup

## 1. Clone the Repository

```bash
git clone https://github.com/abhinaya2126/API-Gateway-DBMS.git
cd API-Gateway-DBMS
```

## Fresh database setup

From PowerShell, set the database variables from `backend/.env`, then run the
scripts with MySQL Shell so stored procedures and triggers honor `DELIMITER`:

```powershell
$env:MYSQL_PWD = "your_mysql_password"
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/schema.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/seed.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/indexes.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/views.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/procedures.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/triggers.sql
mysqlsh --sql --host=localhost --port=3306 --user=root --file=database/migrations/001_api_gateway_configuration.sql
Remove-Item Env:MYSQL_PWD
```

For repeatable Windows QA setup, run `powershell -ExecutionPolicy Bypass -File
qa-tests/reset-test-db.ps1`; it recreates the isolated `api_gateway_test`
database and never changes `api_gateway_mgmt`.

---

# 🗄️ Database Setup

1. Open **MySQL Workbench**.
2. Create the required database or import the SQL file available in the `database` folder.
3. Ensure the database name matches your environment configuration.

Example:

```sql
CREATE DATABASE api_gateway_mgmt;
```

---

# 🔧 Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=api_gateway_mgmt

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

⚠️ **Do not upload the `.env` file to GitHub.**

Start the backend server:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will provide a local URL, typically:

```text
http://localhost:5173
```

---

# 🧪 API Testing with Postman

The project includes a Postman collection located in:

```text
postman/API Gateway Management System.postman_collection.json
```

## Import the Collection

1. Open Postman.
2. Click **Import**.
3. Select the Postman collection JSON file.
4. Run the Login request first.
5. Use the JWT token for authenticated requests.

---

# 🔐 Authentication and Authorization

The backend uses JWT authentication.

After successful login, the backend returns a JWT token.

Protected routes require:

```text
Authorization: Bearer <JWT_TOKEN>
```

Role-based authorization is used to restrict certain operations.

Examples of roles include:

* ADMIN
* DEVELOPER
* USER

---

# 📊 Main System Modules

| Module         | Description                              |
| -------------- | ---------------------------------------- |
| Authentication | JWT-based user login                     |
| Users          | User management                          |
| APIs           | API creation and management              |
| Versions       | API version management                   |
| Routes         | API route management                     |
| Permissions    | User permission management               |
| API Keys       | API key generation and revocation        |
| Usage          | API request simulation and usage logging |
| Audit Logs     | System activity tracking                 |

---

# 🔄 Typical System Flow

```text
User
  ↓
Login
  ↓
JWT Token Generated
  ↓
Frontend Dashboard
  ↓
API Gateway Management Backend
  ↓
Authentication Middleware
  ↓
Role & Permission Validation
  ↓
Controllers
  ↓
MySQL Database
```

For API request simulation:

```text
Authenticated User
        ↓
Select API
        ↓
Select API Version
        ↓
Select Route
        ↓
Validate API Key (if provided)
        ↓
Simulate Request
        ↓
Record Usage Log
        ↓
Return Response Details
```

---

# 👥 Collaboration Workflow

This project uses Git and GitHub for collaboration.

Recommended workflow:

```bash
git checkout -b feature/your-feature-name
```

Make changes and then:

```bash
git add .
git commit -m "Describe your changes"
git push origin feature/your-feature-name
```

Create a **Pull Request** on GitHub to merge changes into the `main` branch.

This helps keep the main branch stable.

---

# 🔒 Security Notes

The following files should not be uploaded to GitHub:

```text
.env
node_modules/
*.log
```

Sensitive information such as database passwords and JWT secrets should always be stored in environment variables.

---

# 🎯 Project Purpose

The purpose of this project is to demonstrate the design and implementation of a complete database-driven API management system.

The project integrates:

* Relational database design
* MySQL relationships and constraints
* Backend API development
* Authentication and authorization
* Role-based access control
* API key management
* Request usage tracking
* Audit logging
* Frontend-backend integration
* API testing using Postman
* Collaborative development using GitHub

---

# 👩‍💻 Team

API Gateway Management System
Academic / College Project

---

## 📌 Future Enhancements

* API analytics dashboard with charts
* Rate limiting
* Real API request proxying
* API documentation generation
* Advanced search and filtering
* API key rotation
* Email notifications
* Deployment to cloud infrastructure
* CI/CD integration

---

## 📄 License

This project is developed for educational purposes.
