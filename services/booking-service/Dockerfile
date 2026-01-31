# 1. Base image
FROM node:18-alpine

# 2. Working directory trong container
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Cài dependencies
RUN npm install --only=production

# 5. Copy source code
COPY src ./src

# 6. Expose port
EXPOSE 3001

# 7. Start service
CMD ["npm", "start"]