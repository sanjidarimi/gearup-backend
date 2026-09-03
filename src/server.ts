import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
const port = config.port || 5000;
async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

main();
