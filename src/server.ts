import app from "./app";
import config from "./config";
 
import { prisma } from "./lib/prisma";
import "dotenv/config";

const PORT = config.port ;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected To The Database Successfully");
    app.listen(PORT, () => {
      console.log(`Server Listening To Port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server", error);
    await prisma.$disconnect()
    process.exit(1);
  }
}

main();
