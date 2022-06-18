import "dotenv/config";
import cluster from "cluster";
import { cpus } from "os";
import { createServer } from "http";
import { app } from "./app";

if (cluster.isPrimary) {
  console.log(`Total number of cpu is ${cpus().length}`);
  for (const _ of cpus()) {
    cluster.fork();
  }
  cluster.on("online", (worker) => {
    console.log(`Worker Id is ${worker.id} and PID is ${worker.process.pid}`);
  });
  cluster.on("exit", () => {
    cluster.fork();
  });
} else {
  const host = process.env.HOST;
  const port = process.env.PORT;
  createServer(app).listen(port, () => {
    console.log(`Server is running on ${host}:${port}`);
  });
}
