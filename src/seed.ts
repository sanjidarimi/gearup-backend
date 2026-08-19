import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import config from "./config";

async function main() {
  const name = config.SEED_ADMIN_NAME;
  const email = config.SEED_ADMIN_EMAIL;
  const password = config.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "Missing required environment variables: SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD",
    );
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
