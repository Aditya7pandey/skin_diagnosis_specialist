import Redis from "ioredis";

const redis = new Redis({
  host: "reef-venturesome-spoon-78584.db.redis.io",
  port: 19373,
  username: "default",
  password: "qofIJoEpx7yzf2pEQAtiQxksh3IK7mHN",
  db: 0,
//   tls: {},
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;