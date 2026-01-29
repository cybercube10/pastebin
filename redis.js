import Redis from "ioredis";
import "dotenv/config"
 const redis = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: 1
});

redis.on("connect",()=>{console.log("connected")})
export default redis;