const bcrypt = require("bcrypt")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient();

async function localAdmin() {
  const hash = await bcrypt.hash("admin", 10)

  const res = await prisma.user.create({
    data: {
      username: "admin",
      password: hash,
      role: 2,
    },
  });

  console.log(JSON.stringify(res, null, 2));

  prisma.$disconnect()
}

localAdmin();
