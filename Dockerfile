FROM node:24-slim

COPY . /usr/src

WORKDIR /usr/src

RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN npm install

RUN touch .env

RUN npm run buildReact

ENTRYPOINT ["/bin/sh", "-c" , "npm start"]