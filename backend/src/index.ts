import { buildServer } from "./server.js";
import { env } from "./env.js";

const port = Number(env.PORT ?? 3333);

async function start() {
  const app = await buildServer();
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
