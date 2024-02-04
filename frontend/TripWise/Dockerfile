# Use a Node base image to install dependencies and build the project
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build your React Native app for the web
RUN npm run build-web

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/web-build /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 19006

# No need for CMD as the default command for nginx base image starts the server
