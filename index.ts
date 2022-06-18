import "dotenv/config";
import { createServer } from "http";
import { app } from "./src/app";

const host = process.env.HOST;
const port = process.env.PORT;

createServer(app).listen(port, () => {
  console.log(`Server is running on ${host}:${port}`);
}); 
