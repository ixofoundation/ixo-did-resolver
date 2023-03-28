# Base image
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn --pure-lockfile

# Copying app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# Start the server using the production build
CMD [ "node", "dist/main.js" ]