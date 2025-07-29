// const { v4: uuidv4 } = require('uuid');
const rabbitMQ = require('./rabbitMqConnection');
const { application_exchange } = require('../rabbitMqConfig');
const { AppError } = require('../utils');
const { v4: uuidv4 } = require('uuid');

// 🔹Retry function if it's fail
async function providerWithRetry(
  message,
  routingKey,
  timeoutMs = 10000,
  maxRetries = 3,
  delayMs = 500
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await provider(message, routingKey, timeoutMs, false); // false => To avoid loop
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      console.warn(`Retrying RabbitMQ request (${attempt}/${maxRetries})...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

//  Cancels
function safeCancel(channel, tag) {
  if (tag) {
    channel.cancel(tag).catch((err) => {
      console.warn(`Cancel failed for tag ${tag}:`, err.message);
    });
  }
}

// 🔹RPC
async function provider(
  message,
  routingKey,
  timeoutMs = 10000,
  useRetry = true
) {
  if (useRetry) return providerWithRetry(message, routingKey, timeoutMs);

  const channel = await rabbitMQ.connect();
  const correlationId = uuidv4();

  try {
    await channel.assertExchange(application_exchange, 'direct', {
      durable: true,
    });

    const { queue } = await channel.assertQueue('', {
      exclusive: true,
      autoDelete: true,
    });

    return await new Promise(async (resolve, reject) => {
      let timer;

      try {
        const { consumerTag } = await channel.consume(
          queue,
          (msg) => {
            if (msg.properties.correlationId === correlationId) {
              clearTimeout(timer);
              safeCancel(channel, consumerTag);
              resolve(JSON.parse(msg.content.toString()));
            }
          },
          { noAck: true }
        );

        timer = setTimeout(() => {
          console.error(`Timeout: No response received for ${routingKey}`);
          safeCancel(channel, consumerTag);
          reject(new AppError('RabbitMQ response timeout', 504));
        }, timeoutMs);

        channel.publish(
          application_exchange,
          routingKey,
          Buffer.from(JSON.stringify(message)),
          {
            replyTo: queue,
            correlationId,
          }
        );
      } catch (err) {
        clearTimeout(timer);
        reject(new AppError(err.message, err.statusCode || 500));
      }
    });
  } catch (err) {
    console.error('❌ RabbitMQ Connection Error:', err);
    throw new AppError(err.message, err.statusCode || 500);
  }
}

// 🔹RPC
// async function provider(
//   message,
//   routingKey,
//   timeoutMs = 10000,
//   useRetry = true
// ) {
//   if (useRetry) { // calling retry
//     return providerWithRetry(message, routingKey, timeoutMs);
//   }

//   const channel = await rabbitMQ.connect();
//   const correlationId = uuidv4();

//   try {

//     await channel.assertExchange(application_exchange, 'direct', {
//       durable: true,
//     });

//     const { queue } = await channel.assertQueue('', { exclusive: true });

//     return await new Promise((resolve, reject) => {
//       let consumerTag;

//       const timer = setTimeout(() => {
//         console.error(`Timeout: No response received for ${routingKey}`);
//         if (consumerTag) channel.cancel(consumerTag);
//         reject(new AppError('RabbitMQ response timeout', 504));
//       }, timeoutMs);

//       channel
//         .consume(
//           queue,
//           (msg) => {
//             if (msg.properties.correlationId === correlationId) {
//               clearTimeout(timer);
//               channel.cancel(consumerTag);
//               resolve(JSON.parse(msg.content.toString()));
//             }
//           },
//           { noAck: true }
//         )
//         .then(({ consumerTag: tag }) => {
//           consumerTag = tag;
//         })
//         .catch((err) => {
//           clearTimeout(timer);
//           reject(new AppError(err.message, err.statusCode || 500));
//         });

//       try {
//         channel.publish(
//           application_exchange,
//           routingKey,
//           Buffer.from(JSON.stringify(message)),
//           {
//             replyTo: queue,
//             correlationId,
//           }
//         );
//       } catch (pubError) {
//         clearTimeout(timer);
//         if (consumerTag) channel.cancel(consumerTag);
//         console.log(pubError)
//         reject(new AppError(pubError.message, pubError.statusCode || 500));
//       }
//     });
//   } catch (err) {
//     console.error('❌ RabbitMQ Connection Error:', err);
//     throw new AppError(err.message, err.statusCode || 500);
//   }
// }

module.exports = provider;
