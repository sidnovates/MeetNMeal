# Step 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# Step 2: Serve using lightweight node server
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve

# Copy built dist files from build stage
COPY --from=build /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
