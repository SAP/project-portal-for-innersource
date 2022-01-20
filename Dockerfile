# Default to the current Long Term Support (TLS) Node image
# Can be overriden via a `docker build` argument at build time
# e.g.: `docker build --build-arg BASE_IMAGE=node:alpine3.15 -t my-image:latest . 
ARG BASE_IMAGE=node:lts-alpine
FROM ${BASE_IMAGE}

# Setup a working directory to copy assets into
WORKDIR /usr/src/app

# Copy everything into the working directory
COPY . ./

# Install all packages
RUN npm install

# Listen on TCP 8080, by default, but can be overridden by a `docker build` 
# argument at build time
# e.g.: `docker build --build-arg PORT=3000 -t my-image:latest . 
ARG PORT=8080
EXPOSE ${PORT}

# Start server
CMD ["npm", "start"]
