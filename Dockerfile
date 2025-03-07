FROM node:19-alpine

# Set Node options for increased memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port 4000
EXPOSE 4000

# Set default command
CMD ["npm", "start"] 
