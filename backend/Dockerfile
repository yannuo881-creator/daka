FROM node:20-alpine

WORKDIR /app

# Install native build tools
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Create the data directory and ensure proper permissions for the node user
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root user for security and to avoid permission issues with volumes
USER node

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
