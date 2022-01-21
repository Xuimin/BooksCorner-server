# FROM node:12-alpine

# # WORKDIR /server

# RUN mkdir -p /server

# COPY . ./server

# # RUN npm install

# CMD ["node", "/server/server.js"]



FROM node:12-alpine

RUN apk add --no-cache python2 g++ make

WORKDIR /server

COPY . .

RUN yarn install --production

CMD node server.js