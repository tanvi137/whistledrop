import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/auth.js";

const email = "moderator@whistledrop.local";
async function main() {
  const password = process.env.MODERATOR_PASSWORD;

  if (!password) {
    throw new Error("MODERATOR_PASSWORD environment variable is required");
  }
  const passwordHash = await hashPassword(password);

  const moderator = await prisma.moderator.upsert({
    where: {
      email,
    },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
    },
  });

  console.log("Moderator created successfully");
  console.log("Email:", moderator.email);
  console.log("Password:", password);
}

main()
  .catch((error) => {
    console.error("Failed to create moderator:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
