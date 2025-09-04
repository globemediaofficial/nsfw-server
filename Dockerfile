FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else after installing dependencies
COPY . .

# Expose port
EXPOSE 9090

# Start the server
CMD ["npm", "start"]
