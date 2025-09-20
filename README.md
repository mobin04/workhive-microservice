# WorkHive - Job Platform Microservices

[![MongoDB](https://img.shields.io/badge/MongoDB-6.x+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x+-green.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

WorkHive is a comprehensive, production-ready job platform built with modern technologies and microservices architecture. It provides a scalable solution for job seekers, employers, and administrators with real-time features and robust authentication.

---

## Architecture Overview

```
WorkHive/
├── client/                    # React Frontend Application
├── server/                     # Backend Microservices
│   ├── auth-service/          # Authentication & User Management
│   ├── job-service/           # Job CRUD Operations
│   ├── application-service/   # Job Application Management
│   ├── notification-service/  # Real-time Notifications
│   ├── proxy/                 # NGINX API Gateway
│   └── docker-compose.yml     # Container Orchestration
└── README.md                  # This file
```

The platform follows a **microservices architecture** where each service is isolated, scalable, and communicates through RabbitMQ message broker. The NGINX reverse proxy acts as an API gateway, routing requests to appropriate services.

**Each service follows a three-layered architecture, consisting of the API layer (routes and middleware), the Service layer (business logic), and the Repository layer (database models and queries).**

---

##  Features

###  User Management & Authentication

- **Multi-factor Authentication**: JWT, OTP, Magic Login (passwordless)
- **Role-based Access Control**: Job Seekers, Employers, Administrators
- **Security Features**: Login notifications with location/browser detection
- **Account Management**: Password reset, email verification, account suspension

###  Job Management

- **For Employers**: Create, update, close, and renew job postings
- **For Job Seekers**: Browse, like, save, and apply to jobs
- **Advanced Features**: Job statistics, category-based filtering
- **Admin Controls**: Global job management and moderation

###  Application System

- **Application Tracking**: Real-time status updates (pending, shortlisted, accepted, rejected)
- **Resume Management**: File upload with Firebase storage
- **Employer Dashboard**: Manage applications with bulk actions
- **Notification Integration**: Automated alerts for status changes

###  Real-time Notifications

- **Live Updates**: WebSocket-based real-time notifications
- **Email Integration**: Mailtrap (development) and MailJet (production)
- **Smart Alerts**: Application updates, job matches, system notifications
- **Notification Center**: Centralized inbox with read/unread status

###  Analytics & Reporting

- **Employer Insights**: Application statistics per job posting
- **Admin Dashboard**: Platform-wide usage analytics

---

## Technology Stack

### Backend (Server)

- **Runtime**: Node.js 22.x+ with Express.js
- **Database**: MongoDB 6.x+ with Mongoose ODM
- **Message Broker**: RabbitMQ (AMQP protocol)
- **Authentication**: JWT tokens with secure cookie storage
- **API Gateway**: NGINX reverse proxy
- **File Storage**: Firebase Cloud Storage
- **Email Services**: Mailtrap (dev), MailJet (production)
- **Testing**: Jest with comprehensive coverage
- **Documentation**: Swagger
- **Containerization**: Docker & Docker Compose

### Frontend (Client)

- **Framework**: React 18.x+ with Vite build tool
- **State Management**: Redux Toolkit for global state
- **API Layer**: TanStack Query for data fetching and caching
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: Integrated JWT and cookie handling

---

## 📋 Prerequisites

Before setting up WorkHive, ensure you have:

### Required Software

- **Node.js** >= 22.x ([Download](https://nodejs.org/))
- **MongoDB** >= 6.x (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **RabbitMQ** >= 3.13.x ([Download](https://www.rabbitmq.com/download.html))
- **Docker** >= 24.x & Docker Compose >= 2.x ([Get Docker](https://docs.docker.com/get-docker/))
- **Git** >= 2.40 ([Download](https://git-scm.com/downloads))

### External Services

- **Firebase Project** for file storage ([Setup Guide](https://firebase.google.com/docs/admin/setup))
- **Mailtrap Account** for development emails ([Sign up](https://mailtrap.io/))
- **MailJet Account** for production emails ([Sign up](https://www.mailjet.com/))
- **IPInfo API Key** for location services ([Get API Key](https://ipinfo.io/))

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mobin04/workhive-microservice.git
cd workhive-microservice
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Copy environment variables for each service
cp auth-service/.env.example auth-service/.env
cp job-service/.env.example job-service/.env
cp application-service/.env.example application-service/.env
cp notification-service/.env.example notification-service/.env

# Configure your environment variables (see Environment Variables section)
# Then build and start all services
docker-compose up --build
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost (routes to backend services via nginx proxy)
- **API Documentation**:
  - Auth Service: http://localhost/api/v2/auth/api-docs
  - Job Service: http://localhost/api/v2/jobs/api-docs
  - Application Service: http://localhost/api/v2/applications/api-docs
  - Notification Service: http://localhost/api/v2/notifications/api-docs

---

## 🔧 Environment Variables

### Backend Configuration

Each microservice requires its own `.env` file. Here's the template for the auth service `Copy the below env variable and paste this on all services and apply the values` :

```bash
# Application Settings
PORT_AUTH=8001
NODE_ENV=development
API_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI_AUTH=mongodb://localhost:27017/workhive-auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_COOKIE_EXPIRES_IN=60
JWT_EXPIRES_IN=60d
JWT_SIGNUP_EXPIRE=10m
JWT_LOGIN_EXPIRE=10m

# Firebase Storage
TYPE=service_account
PROJECT_ID=your-firebase-project-id
PRIVATE_KEY_ID=your-firebase-private-key-id
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-firebase-private-key\n-----END PRIVATE KEY-----\n"
STORAGE_BUCKET_NAME=your-firebase-bucket-name

# Email Services - Mailtrap (Development)
MAILTRAP_USER_NAME=your-mailtrap-username
MAILTRAP_PASSWORD=your-mailtrap-password
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525

# Email Services - MailJet (Production)
MAIL_JET_PRIVATE_KEY=your-mailjet-private-key
MAIL_JET_PUBLIC_KEY=your-mailjet-public-key
EMAIL_FROM_ME=noreply@workhive.com
MAIL_JET_HOST=in-v3.mailjet.com
MAIL_JET_PORT=587

# External APIs
IPINFO_API_KEY=your-ipinfo-api-key

# Message Broker
MESSAGE_BROKER_URL=amqp://localhost:5672
APPLICATION_EXCHANGE_NAME=application.exchange

# API Configuration
API_BASE_URL_AUTH=/api/v2/auth
SWAGGER_URL_AUTH=http://localhost/api/v2/auth
```

### Frontend Configuration

Create a `.env` file in the client directory:

```bash
# API Base URL
VITE_API_URL=http://localhost/api/v2
# Socket URL for live notification (Give the notification-service URL)
VITE_SOCKET_URL=http://localhost:8004
# Mapbox API key for getting coordinations
VITE_MAPBOX_API_KEY=your-mapbox-api-key
```

---

## 🎯 API Endpoints

The NGINX API Gateway routes requests to the following services:

| Service                  | Base URL                                | Description                                           |
| ------------------------ | --------------------------------------- | ----------------------------------------------------- |
| **Auth Service**         | `http://localhost/api/v2/auth`          | User authentication, registration, profile management |
| **Job Service**          | `http://localhost/api/v2/jobs`          | Job CRUD operations, search, and filtering            |
| **Application Service**  | `http://localhost/api/v2/applications`  | Job application management and tracking               |
| **Notification Service** | `http://localhost/api/v2/notifications` | Real-time notifications and messaging                 |

### Key API Endpoints

#### Authentication

```
POST /api/v2/auth/signup              # User registration
POST /api/v2/auth/login               # User login
POST /api/v2/auth/magic-login         # Passwordless login
POST /api/v2/auth/verify-otp          # OTP verification
GET  /api/v2/auth/profile             # Get user profile
PATCH  /api/v2/auth/profile           # Update user profile
```

#### Jobs

```
GET    /api/v2/jobs                   # List all jobs
POST   /api/v2/jobs                   # Create new job (Employer)
GET    /api/v2/jobs/:id               # Get job details
PATCH    /api/v2/jobs/:id             # Update job (Employer)
DELETE /api/v2/jobs/:id               # Delete job (Employer/Admin)
POST   /api/v2/jobs/:id/like          # Like/Unlike job
```

#### Applications

```
GET  /api/v2/applications               # List applications
POST /api/v2/applications               # Submit job application
PATCH  /api/v2/applications/:id/status  # Update application status (Employer)
```

---

## 🧪 Testing

### Backend Testing

Each microservice includes comprehensive Jest test suites:

```bash
# Test a specific service
cd server/auth-service
npm run test

# Test with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd client
npm run test           # Run all tests
npm run test:coverage  # Run tests with coverage
npm run test:watch     # Run tests in watch mode
```

---

## 🚀 Deployment

### Development Environment

```bash
# Start all services with hot-reload
docker-compose up --build # change npm start to npm run dev in the dockerfile for development environment

# Start frontend development server
cd client
npm run dev
```

### Production Environment

```bash
# Build and deploy backend services
docker-compose up --build -d # # change  npm run dev to npm start in the dockerfile for production environment

# Build and serve frontend
cd client
npm run build # or deploy to your hosting service
```

### Environment-Specific Configurations

- **Development**: Uses Mailtrap for emails, local MongoDB
- **Staging**: Uses MailJet for emails, MongoDB Atlas
- **Production**: Full security hardening, CDN for static assets

---

## 🤝 Contributing

We welcome contributions!

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **Backend**: ESLint + Prettier configuration
- **Frontend**: ESLint + Prettier with React-specific rules
- **Testing**: 146 unit tests conducted
- **Documentation**: README updates for new features

---

## 👨‍💻 Contributors

- **[Mobin Mathew](https://github.com/mobin04)** - Project Creator & Lead Developer

---

## 🙏 Acknowledgments

- **Open Source Libraries**: Thanks to all the maintainers of the libraries used
- **Community**: Special thanks to the Node.js and React communities
- **Testing**: Inspiration from industry best practices

---

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/mobin04/workhive-microservice/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mobin04/workhive-microservice/discussions)
- **Email**: [Contact the maintainer](mailto:your-email@example.com)

---

## ✨ Happy Building!
