FROM node:22-alpine

WORKDIR /usr/src/job-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8002

CMD ["npm", "start"]