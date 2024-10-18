#!/bin/bash

echo "Updating master branch..."
git pull origin master

# Build Docker image
echo "Building Docker image..."
docker build -t voucher-promo-be .

# Stop and remove existing Docker container (if exists)
echo "Stopping and removing existing Docker container..."
docker stop voucher-promo-be-container || true  # Ignore error if container does not exist
docker rm voucher-promo-be-container || true    # Ignore error if container does not exist

# Run Docker container with updated image
echo "Running Docker container..."
docker run -d -p 3001:3001 --name voucher-promo-be-container voucher-promo-be

echo "Deployment completed successfully."