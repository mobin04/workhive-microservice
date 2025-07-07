FROM node:22-alpine

WORKDIR /usr/src/appication-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8004

CMD ["npm", "start"]