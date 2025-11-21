# Use Node.js 18
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev

# Copy project files
COPY . .

# Expose port for QR server
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
