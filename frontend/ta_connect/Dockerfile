FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy the rest of the application
COPY . .

EXPOSE 3000
ENV VITE_API_URL=http://backend:8000

# Install any missing packages on startup and then run dev server
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"
