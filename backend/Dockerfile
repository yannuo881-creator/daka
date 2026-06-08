FROM node:20-alpine

WORKDIR /app

# Install native build tools so sqlite3 can compile correctly for this OS
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
