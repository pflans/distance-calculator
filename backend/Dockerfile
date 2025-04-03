FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

COPY ./init.sql /docker-entrypoint-initdb.d/init.sql

# Expose port
EXPOSE 3000


# Use nodemon in development, node in production
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm start; else npm run dev; fi"]