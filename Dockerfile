FROM node:22-slim

# Install ffmpeg which is required for audio processing
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Create volume mount points
VOLUME ["/app/auth_info_baileys"]

# Set environment variables
ENV NODE_ENV=production
ENV SERVER_ENV=true

# Run the application
CMD ["node", "index.js"]
