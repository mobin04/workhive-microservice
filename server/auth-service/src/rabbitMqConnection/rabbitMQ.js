const amqp = require('amqplib');
const {MESSAGE_BROKER_URL} = require('../rabbitMqConfig')
// require('dotenv').config();

class RabbitMQ {
  
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = await amqp.connect(MESSAGE_BROKER_URL);
            this.channel = await this.connection.createChannel();
            console.log("🐰 RabbitMQ Connected");
        }
        return this.channel;
    }

    async close() {
        if (this.connection) {
            await this.connection.close();
            console.log("RabbitMQ Connection Closed");
        }
    }
}

module.exports = new RabbitMQ()