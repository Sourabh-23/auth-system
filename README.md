# Auth System

A Node.js, Express, PostgreSQL authentication system with JWT access tokens, refresh tokens, password reset flow, and basic security middleware.

## Features

- Register -> bcrypt password hashing
- Login -> JWT Access Token + Refresh Token
- Protected Routes -> Middleware (JWT verify)
- Role Authorization -> Admin and Superadmin access control
- Refresh Token -> New access token without login
- Logout -> Token revocation
- Forgot Password -> Reset token + Actual Email (Mailtrap)
- Reset Password -> Single use token
- Rate Limiting -> Brute force protection
- Helmet.js -> Secure headers

## Tech Stack

| Technology | Use |
| --- | --- |
| Node.js | JavaScript runtime for running the backend server |
| Express.js | API routing, middleware handling, and HTTP server setup |
| PostgreSQL | Database for users, refresh tokens, and password reset tokens |
| Knex.js | Query builder and database migrations |
| bcryptjs | Password hashing before storing passwords in the database |
| jsonwebtoken | Creating and verifying JWT access tokens |
| nodemailer | Sending forgot-password reset emails through Mailtrap |
| express-rate-limit | Limiting repeated requests to reduce brute force attacks |
| Helmet.js | Adding secure HTTP headers |

## API Routes

Base URL:

```txt
http://localhost:3000/api/auth
```

Routes:

```txt
POST /register
POST /login
POST /refresh
POST /logout
POST /forgot-password
POST /reset-password
GET  /me
GET  /admin
GET  /superadmin
```

`/me`, `/logout`, `/admin`, and `/superadmin` require a JWT access token in the `Authorization` header:

```txt
Authorization: Bearer <access_token>
```

Role access:

```txt
GET /admin       -> admin, superadmin
GET /superadmin  -> superadmin only
```

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and add your database, JWT, and Mailtrap values.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=auth_system

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_password
MAIL_FROM=no-reply@auth-system.com
```

Run database migrations:

```bash
npx knex migrate:latest --env development
```

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

## Project Structure

```txt
src/
  config/
    db.js
    mailer.js
  migrations/
  modules/
    auth/
      auth.controller.js
      auth.middleware.js
      auth.routes.js
      auth.service.js
  index.js
```

## Notes

- API hits are logged in the terminal.
- Refresh tokens are stored in the database and can be revoked during logout.
- Password reset tokens are single-use and expire after a short time.
- Users have a `role` value: `user`, `admin`, or `superadmin`.
