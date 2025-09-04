FROM node:20

# Set working directory
WORKDIR /

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose port
EXPOSE 2400

# Start the server
CMD ["npm", "start"]
