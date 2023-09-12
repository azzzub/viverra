const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Createing local admin for development purpose
 */
async function localAdmin() {
  const hash = await bcrypt.hash("admin", 10);

  try {
    const team = await prisma.team.create({
      data: {
        name: "Team Admin",
      },
    });

    const res = await prisma.user.create({
      data: {
        username: "admin",
        password: hash,
        role: 2,
        teamID: team.id,
      },
    });

    console.log(JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
  }

  prisma.$disconnect();
}

localAdmin();
