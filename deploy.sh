#!/bin/bash

# Exit on any error
set -e

# Variables
GIT_BRANCH="master"  # Change this if you use a different branch for deployment
DOCKER_COMPOSE_FILE="docker-compose.yml"  # Path to your Docker Compose file

echo "Starting deployment..."

# Pull latest changes from the master branch
echo "Updating $GIT_BRANCH branch..."
git checkout $GIT_BRANCH
git pull origin $GIT_BRANCH

# Build Docker images (if there are any changes)
echo "Building Docker images..."
docker-compose -f $DOCKER_COMPOSE_FILE build

# Restart the services with the latest changes
echo "Deploying containers..."
docker-compose -f $DOCKER_COMPOSE_FILE down  # Stop any existing containers
docker-compose -f $DOCKER_COMPOSE_FILE up -d  # Start the new containers in detached mode

echo "Deployment complete!"
