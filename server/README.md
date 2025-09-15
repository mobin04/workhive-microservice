# WorkHive Microservices Project

WorkHive is a scalable, production-ready job platform built with Node.js, Express, MongoDB, and Docker, following a microservices architecture.  
This project includes services for authentication, job management, applications, notifications, and an NGINX reverse proxy.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Development](#development)

---

## Architecture

```
.
├── application-service
├── auth-service
├── job-service
├── notification-service
├── proxy (NGINX)
└── docker-compose.yml
```

Each service is isolated, communicates via RabbitMQ Message Broker, and can be scaled independently.

---

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Messaging:** RabbitMQ (AMQP protocol)
- **Proxy / API Gateway:** Nginx
- **Authentication:** JWT (JSON Web Tokens), cookies, sessions
- **Email Services:** Mailtrap (development), MailJet (production)
- **Cloud Services:** Firebase (storage), IPInfo API (location detection)
- **Containerization:** Docker, Docker Compose
- **Testing:** Jest (unit testing)
- **Documentation:** Swagger
- **Scheduling:** Cron Jobs (automatic unsuspension)

---

### Services

1. **Auth Service**

   - Manages users, authentication, employers, and admins
   - Handles login, signup, OTP, magic login, JWT, sessions
   - Suspensions, email notifications, password reset

2. **Job Service**

   - CRUD operations for jobs
   - Job renewals, closures, and employer statistics
   - Admin-level job management

3. **Application Service**

   - CRUD operations for job applications
   - Application status updates by employers
   - Employer-employee application interactions

4. **Notification Service**

   - CRUD for notifications
   - Real-time updates (application accepted/rejected, new application)
   - Mail notification (login, signup, request OTP, magic login, account suspend and unsuspend, forgot password, reset passsword and status update for job applications)

5. **Proxy Service (Nginx)**
   - Acts as an API Gateway
   - Routes requests to the correct microservice
   - Handles load balancing, SSL, and CORS

---

## Features

### Authentication and User Management

- JWT-based authentication and authorization
- OTP-based login and signup
- Magic login (passwordless authentication)
- Password reset with token expiration
- Login notification emails with location, browser, and timestamp
- Signup confirmation emails
- Session and cookie-based authentication support

### Job Management

- Employers can create, update, close, and renew jobs
- Job seekers can like and save jobs
- Admins can update, renew, or close jobs
- Employer-level job statistics (applications, overall jobs insights)

### Applications

- Job seekers can apply with resumes
- Employers can update application status (accept, reject, shortlist)
- CRUD operations for applications
- Real-time application status updates

### Notifications

- Real-time notifications for users
- Employers notified when job applications are submitted
- Job seekers notified when application status is updated
- CRUD operations for notifications

### Admin Controls

- Suspend or unsuspend users with reason and duration
- Automatic unsuspension using scheduled node cron jobs
- Reset password tokens for user recovery
- Global platform statistics (users, jobs, applications, activity)

### Statistics

- Employer statistics: job applications and category per job
- Admin statistics: overall platform usage

---

## Getting Started

## Prerequisites

Before running the WorkHive backend, ensure you have the following installed and configured:

### 1. Node.js

- Version: **>= 22.x**
- Required to run the microservices (Auth, Job, Application, Notification)

Download: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

### 2. npm

- npm comes with Node.js

### 3. MongoDB

- Version: **>= 6.x**
- Each service (Auth, Job, Application, Notification) requires its own database connection
- Can be a **local MongoDB instance** or **MongoDB Atlas**

Docs: [https://www.mongodb.com/docs/manual/](https://www.mongodb.com/docs/manual/)

### 4. RabbitMQ

- Used as the **message broker** for inter-service communication
- Version: **>= 3.13.x**
- Can be run locally or in Docker

Docs: [https://www.rabbitmq.com/download.html](https://www.rabbitmq.com/download.html)

### 5. Nginx

- Acts as the **API Gateway / Reverse Proxy**
- Required for routing traffic to microservices and handling SSL, CORS, load balancing

Docs: [https://nginx.org/en/download.html](https://nginx.org/en/download.html)

### 6. Docker & Docker Compose (Recommended)

- Version: **Docker >= 24.x**, **Docker Compose >= 2.x**
- Used for containerized development and production deployment
- Makes it easier to run all services together

Docs:

- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

### 7. Git

- Version: **>= 2.40**
- Required for cloning the repository and contributing

Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

### 8. Mail Services (for Email Notifications)

- **Mailtrap** account for development/testing emails
- **MailJet** account for production-ready emails

### 9. Firebase Project

- For storing resumes, profile pictures, or other user-uploaded files
- Requires a Firebase **service account JSON**

Docs: [https://firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)

### 10. IPInfo API

- Required to fetch user login location details
- Sign up at [https://ipinfo.io/](https://ipinfo.io/) for a free API key

### Clone the Repository

```sh
git clone https://github.com/mobin04/workhive-microservice.git
cd workhive-microservice/server

```

### Environment Variables

Each service has its own `.env` file.  
Copy this variables in to `.env` in each service and fill in the required values.

Example for `auth-service/.env`:

```sh
# APP SETUPS
PORT_AUTH=8001
NODE_ENV=development
API_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

# DATABASE SETUPS
MONGO_URI_AUTH=<your-mongodb-uri>

# JSONWEBTOKEN
JWT_SECRET=<your-strong-secret>
JWT_COOKIE_EXPIRES_IN=60
JWT_EXPIRES_IN=60d
JWT_SIGNUP_EXPIRE=10m
JWT_LOGIN_EXPIRE=10m
STORAGE_BUCKET_NAME=<your-bucket-name>

# FIREBASE
TYPE=service_account
PROJECT_ID=<your-project-id>
PRIVATE_KEY_ID=<your-private-key-id>
PRIVATE_KEY=<your-private-key>

# MAIL-TRAP (Development Only)
MAILTRAP_USER_NAME=<your-username>
MAILTRAP_PASSWORD=<your-password>
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525

# MAIL-JET EMAIL SERVICE (Production)
MAIL_JET_PRIVATE_KEY=<your-private-key>
MAIL_JET_PUBLIC_KEY=<your-public-key>
EMAIL_FROM_ME=example@email.com
MAIL_JET_HOST=in-v3.mailjet.com
MAIL_JET_PORT=587

# IPINFO_API
IPINFO_API_KEY=<your-api-key>

# API_BASE_PATH
API_BASE_URL_AUTH=/api/v2/auth

# MESSAGE-BROKER (RabbitMQ)
MESSAGE_BROKER_URL=<your-rabbitmq-url>
APPLICATION_EXCHANGE_NAME=application.exchange

# SWAGGER
SWAGGER_URL_AUTH=http://localhost/api/v2/auth

```

### Build and Run All Services

```sh
docker-compose up --build
```

## API Gateway

All requests to microservices are routed through the **Nginx Proxy (proxy-service)**.  
The following endpoints are exposed:

- **Auth Service** → [http://localhost/api/v2/auth](http://localhost/api/v2/auth)
- **Job Service** → [http://localhost/api/v2/jobs](http://localhost/api/v2/jobs)
- **Application Service** → [http://localhost/api/v2/applications](http://localhost/api/v2/applications)
- **Notification Service** → [http://localhost/api/v2/notifications](http://localhost/api/v2/notifications)

---

## API Documentation

Each service exposes Swagger UI for interactive API docs:

| Service              | Swagger URL                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| Auth Service         | https://workhive-auth-service.onrender.com/api/v2/auth/api-docs                  |
| Job Service          | https://workhive-job-service.onrender.com/api/v2/jobs/api-docs                   |
| Application Service  | https://workhive-application-service.onrender.com/api/v2/applications/api-docs   |
| Notification Service | https://workhive-notification-service.onrender.com/api/v2/notifications/api-docs |

- All endpoints are documented with request/response schemas and security requirements.

---

## Testing

Each service uses **Jest** for unit testing.

To run tests for a service (example: auth-service):

```sh
cd auth-service
npm install
npm run test
```

Coverage reports are generated in the `coverage/` folder.

---

## Development

- All code changes are hot-reloaded in Docker via volume mounts.
- Use `npm run start` or `npm run dev` in each service for local development outside Docker.

---

---

## Contributors

- [Mobin Mathew](https://github.com/mobin04)

---

## Support

For issues, open a GitHub issue.

---

---

## ✦ Happy Building ✦

---
