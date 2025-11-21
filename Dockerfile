# Use Node.js 18
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the project
COPY . .

# Expose port (Fly.io needs this)
EXPOSE 3000

# Start the bot
CMD ["node", "server.js"]
