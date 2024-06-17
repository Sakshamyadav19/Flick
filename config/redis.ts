import Redis from 'ioredis';

const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  username:process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD || undefined,
});

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  username:process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisPublisher.on('connect', () => {
  console.log('Connected to Redis Publisher');
});

redisPublisher.on('error', (err) => {
  console.error('Redis Publisher error', err);
});

redisSubscriber.on('connect', () => {
  console.log('Connected to Redis Subscriber');
});

redisSubscriber.on('error', (err) => {
  console.error('Redis Subscriber error', err);
});

export { redisPublisher, redisSubscriber };
