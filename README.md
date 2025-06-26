# WorkHive Microservices Project

WorkHive is a scalable, production-ready job platform built with Node.js, Express, MongoDB, and Docker, following a microservices architecture.  
This project includes services for authentication, job management, applications, notifications, and an NGINX reverse proxy.

---

## Table of Contents

- [Architecture](#architecture)
- [Services](#services)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

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

Each service is isolated, communicates via HTTP and RabbitMQ, and can be scaled independently.

---

## Services

- **auth-service**: User authentication, registration, OTP/magic link, and profile management.
- **job-service**: Job CRUD, filtering, employer management.
- **application-service**: Job application management, status updates, applicant tracking.
- **notification-service**: User notifications (email, in-app, etc).
- **proxy**: NGINX reverse proxy for unified API gateway.

---

## Features

- JWT authentication and role-based access control
- File uploads (profile images, resumes, company logos)
- Pagination, filtering, and sorting for jobs and applications
- Email notifications (OTP, magic link, welcome, etc)
- Swagger/OpenAPI documentation for every service
- Graceful shutdown and Dockerized deployment
- Jest unit tests for core business logic

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (for local development/testing)

### Clone the Repository

```sh
git clone https://github.com/yourusername/workhive-microservices.git
cd workhive-microservices
```

### Environment Variables

Each service has its own `.env` file.  
Copy `.env.example` to `.env` in each service and fill in the required values.

Example for `auth-service/.env`:

```
PORT=8001
MONGO_URI=mongodb://mongo:27017/auth
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
...
```

### Build and Run All Services

```sh
docker-compose up --build
```

- The API gateway will be available at: [http://localhost](http://localhost)
- Each service is also available on its own port (e.g., `8001`, `8002`, ...).

---

## API Documentation

Each service exposes Swagger UI for interactive API docs:

| Service              | Swagger URL                                    |
| -------------------- | ---------------------------------------------- |
| Auth Service         | http://localhost/api/v2/auth/api-docs          |
| Job Service          | http://localhost/api/v2/jobs/api-docs          |
| Application Service  | http://localhost/api/v2/applications/api-docs  |
| Notification Service | http://localhost/api/v2/notifications/api-docs |

- All endpoints are documented with request/response schemas and security requirements.

---

## Testing

Each service uses **Jest** for unit testing.

To run tests for a service (example: auth-service):

```sh
cd auth-service
npm install
npm test
```

Coverage reports are generated in the `coverage/` folder.

---

## Development

- All code changes are hot-reloaded in Docker via volume mounts.
- Use `npm run start` or `npm run dev` in each service for local development outside Docker.

---

---

## Contributors

- [mobin Mathew](https://github.com/mobin04)
- [Other Contributors]

---

## Support

For issues, open a GitHub issue or contact the maintainer.

---

\*\*Happy building with
