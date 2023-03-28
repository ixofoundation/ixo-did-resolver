# Base image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn --pure-lockfile

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# Port to use and expose
ENV PORT=8080
EXPOSE 8080

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
