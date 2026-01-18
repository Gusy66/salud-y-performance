import Redis from "ioredis";
import { env } from "../env.js";

// Redis é opcional - só inicializa se a URL estiver configurada
export const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;
