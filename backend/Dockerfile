# Use the official Node.js 16 image as a parent image
FROM node:16

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json (if available) into the container at /app
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of your application's code into the container at /app
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["node", "app.js"]
