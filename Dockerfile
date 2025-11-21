# Use Node.js 18
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the project
COPY . .

# Expose port (Fly.io uses this)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
