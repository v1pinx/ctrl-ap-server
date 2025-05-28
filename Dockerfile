# Use official Node.js LTS runtime as the base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Expose application port
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
