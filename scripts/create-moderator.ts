import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/auth.js";

const email = "moderator@whistledrop.local";
const password = "REMOVED_SECRET";

async function main() {
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
