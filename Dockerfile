# Use official lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy application code
COPY . .

# Fly.io provides PORT variable
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
