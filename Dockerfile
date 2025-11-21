FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production || npm install --production

# Copy application code
COPY . .

EXPOSE 8080
CMD ["npm","start"]
