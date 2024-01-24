// APPROVAL STATUS:
// 0  - PENDING
// 1  - APPROVED
// 10 - APPROVE_EXPIRED
// 2  - PENDING_EXPIRED
// 3  - REJECTED

// External
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

/**
 * Flush approve expired, pending expired, rejected file
 */
async function main() {
  const snapshot = await prisma.snapshot.findMany({
    where: {
      OR: [
        {
          approval: 10,
        },
        {
          approval: 2,
        },
        {
          approval: 3,
        },
      ],
    },
  });
  snapshot.forEach((v) => {
    const filename = __dirname + "/../public/snapshots/" + v.filename;
    fs.unlink(filename, (err) => {
      if (err) {
        // Handle specific error if any
        if (err.code === "ENOENT") {
          console.error("File does not exist.");
        } else {
          throw err;
        }
      } else {
        console.log("File deleted!" + v.filename);
      }
    });
  });
}

main();
