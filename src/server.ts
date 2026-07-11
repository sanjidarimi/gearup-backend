import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
const port = config.port;
async function main() {
  try {
    app.listen(port, () => {
      
        console.log(`server is running ${port}` )
    });
  } catch (error) {}
}
main();
