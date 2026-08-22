import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("Please add your REDIS_URL to .env.local");
}

const redisUrl = process.env.REDIS_URL;

const globalWithRedis = global as typeof globalThis & {
  _redisClient?: Redis;
};

let redisClient: Redis;

if (process.env.NODE_ENV === "development") {
  if (!globalWithRedis._redisClient) {
    globalWithRedis._redisClient = new Redis(redisUrl);
  }
  redisClient = globalWithRedis._redisClient;
} else {
  redisClient = new Redis(redisUrl);
}

export default redisClient;
