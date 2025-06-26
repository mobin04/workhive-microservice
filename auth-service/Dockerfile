FROM node:22

WORKDIR /usr/src/auth-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm", "start"]