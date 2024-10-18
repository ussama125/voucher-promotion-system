# NestJS Project with PostgreSQL

## Project Overview

This is a NestJS application that manages vouchers and promotions. It provides a RESTful API for creating, updating, and retrieving voucher and promotion information. The application uses PostgreSQL as its database and is designed for scalability and performance.

### Features

- Create, read, update, and delete promotions and vouchers
- Apply promotions to orders
- Rate limiting for API endpoints
- Logging with Pino

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **PostgreSQL**: An open-source relational database.
- **TypeORM**: An ORM that supports various database systems including PostgreSQL.
- **Docker**: Containerization platform for deploying applications.
- **Jest** For unit tests

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# .env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=myUser
DB_PASSWORD=myPass
DB_NAME=voucher_promotion_db_dev
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Docker Setup

1. **Build and Run the Application with Docker Compose**

   To build and run the application along with PostgreSQL, execute the following command:

   ```bash
    docker-compose up --build
   ```

   This command will create two containers: one for the NestJS application and another for PostgreSQL.

2. **Accessing the Application**

   The NestJS application will be accessible at http://localhost:3001/api.

   You can access the swagger docs at http://localhost:3001/api/docs

### Deployment Instructions

1. Pull the Latest Code from the Repository
   Create a deploy.sh script to automate the deployment process:

   ```bash
   #!/bin/bash

   echo "Updating master branch..."
   git pull origin master

   echo "Building and deploying the application..."
   docker-compose up --build -d

   echo "Deployment completed successfully!"

   ```

2. Run the Deployment Script

   Execute the deployment script to update your application on the server:

   ```bash
   sh ./deploy.sh
   ```

### Logging

Logs are handled using Pino, and can be configured based on your environment settings. Check the logs for any errors or debugging information.

### License

This project is licensed under the MIT License - see the LICENSE file for details.
