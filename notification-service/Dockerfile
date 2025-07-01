FROM node:22-alpine

WORKDIR /usr/src/notification-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8003

CMD ["npm", "start"]