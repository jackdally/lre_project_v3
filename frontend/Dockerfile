# # Use official Node.js image
# FROM node:18-alpine

# # Set working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json first for better caching
# COPY frontend/package.json frontend/package-lock.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application
# COPY frontend/ .

# # Expose the frontend port
# EXPOSE 3000

# # Start the React development server
# CMD ["npm", "start"]


# Dockerfile for Frontend (React)

# Step 1: Use Node.js as a base image
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the frontend package files
COPY package.json package-lock.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the frontend files
COPY . .  

# Step 6: Build the React app
RUN npm run build

# Step 7: Install a lightweight web server to serve the app (e.g., serve)
RUN npm install -g serve

# Step 8: Expose the React app port
EXPOSE 5000

# Step 9: Command to serve the built app
CMD ["serve", "-s", "build", "-l", "5000"]
