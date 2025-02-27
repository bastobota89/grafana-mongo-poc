# FROM node:19-alpine

# # Set Node options for increased memory
# ENV NODE_OPTIONS="--max-old-space-size=4096"

# WORKDIR /app

# # Install dependencies first (better layer caching)
# COPY package*.json ./
# RUN npm install

# # Copy application code
# COPY . .

# # Expose port 4000
# EXPOSE 4000

# # Set default command
# CMD ["npm", "start"] 

FROM node:19-alpine

# Set Node options for increased memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory inside container
WORKDIR /app

# Install MongoDB dependencies
RUN apk update && apk add --no-cache \
    mongodb

# Install Node.js dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose port 4000 for your app and port 27017 for MongoDB (if you want to connect to it directly)
EXPOSE 4000 27017

# Set default command to start the MongoDB service and your app
CMD ["sh", "-c", "mongod --fork --logpath /var/log/mongodb.log && npm start"]
