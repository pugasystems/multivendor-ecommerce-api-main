# GetBizUSA — Multivendor Ecommerce API

The backend API for **GetBizUSA**, a B2B multivendor ecommerce and business directory platform. Built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: NestJS 10
- **ORM**: Prisma + TypeORM
- **Database**: PostgreSQL
- **Auth**: JWT (NestJS JWT)
- **Real-time**: Socket.io (WebSockets)
- **Queue**: Bull (Redis-backed job queues)
- **Storage**: AWS S3
- **Email**: NestJS Mailer (Nodemailer + Handlebars templates)
- **API Docs**: Swagger (OpenAPI)
- **Containerization**: Docker + Docker Compose
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (for Bull queues)
- AWS S3 bucket (for file uploads)

### Installation

```bash
npm install
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Docker

```bash
docker-compose up --build
```

## API Documentation

Once running, Swagger docs are available at:

```
http://localhost:3001/api
```

## Project Structure

```
src/
├── authentications/    # Auth module (login, register, JWT)
├── users/              # User management
├── vendors/            # Vendor/seller accounts
├── products/           # Product listings
├── categories/         # Product categories
├── business-categories/# Business directory categories
├── leads/              # Lead management
├── messages/           # Messaging system
├── subscriptions/      # Subscription plans
├── upload-service/     # AWS S3 file upload
├── guards/             # Auth & role guards
├── helpers/            # Shared helpers
├── interfaces/         # TypeScript interfaces
├── roles/              # Role-based access control
├── countries/          # Country data
├── states/             # State/province data
├── cities/             # City data
├── districts/          # District data
├── shipping-addresses/ # Shipping address management
└── templates/          # Email templates (Handlebars)
prisma/
└── schema.prisma       # Database schema
```

## Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/getbizusa
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

Private — All rights reserved © GetBizUSA
