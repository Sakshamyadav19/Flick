require('dotenv').config();
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { Redis } = require('ioredis');

const dev = process.env.NODE_ENV !== 'production';
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

const CHANNEL_NAME = 'fileTransfer';

const redisPublisher = new Redis({
  host: process.env.REDIS_HOST ,
  port: process.env.REDIS_PORT ,
  username:process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD || undefined,
});

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST ,
  port: process.env.REDIS_PORT ,
  username:process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD || undefined,
});

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  redisSubscriber.subscribe(CHANNEL_NAME, (err, count) => {
    if (err) {
      console.error('Failed to subscribe: %s', err.message);
    } else {
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
  });

  // redisSubscriber.on('message', (channel, message) => {
  //   if (channel === CHANNEL_NAME) {
  //     const parsedMessage = JSON.parse(message);
  //     const { event, data, roomId } = parsedMessage;
  //     io.to(roomId).emit(event, data);
  //   }
  // });

  io.on('connection', (socket) => {
    console.log('user connected', socket.id);

    socket.on('joinRoom', (roomId) => {
      console.log("user joined roomId: ", roomId);
      socket.join(roomId);
    });
    redisSubscriber.on('message', (channel, message) => {
      if (channel === CHANNEL_NAME) {
        const parsedMessage = JSON.parse(message);
        const { event, data, roomId } = parsedMessage;
        socket.to(roomId).emit(event, data);
      }
    });

    socket.on('send-file-chunk', ({ chunk, roomId }) => {
      console.log('Chunk received on server in roomId:', roomId);
      const message = JSON.stringify({ event: 'receive-file-chunk', data: chunk, roomId });
      redisPublisher.publish(CHANNEL_NAME, message);
    });

    socket.on('file-transfer-complete', ({ roomId }) => {
      const message = JSON.stringify({ event: 'file-transfer-complete', data: null, roomId });
      redisPublisher.publish(CHANNEL_NAME, message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
