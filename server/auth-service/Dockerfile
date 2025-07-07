FROM node:22-alpine

WORKDIR /usr/src/auth-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm", "start"]