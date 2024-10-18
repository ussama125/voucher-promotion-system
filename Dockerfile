# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only necessary files for running the app
COPY package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm ci --only=production

# Expose port 3001
EXPOSE 3001

# Set the default command to start the application
CMD ["node", "dist/main"]
