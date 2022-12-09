// External
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const id = req.query["id"] as string | undefined;

  if (id) {
    const firstData = await prisma.collection.findFirst({
      where: {
        id,
      },
      include: {
        Page: {
          include: {
            Snapshot: {
              where: {
                OR: [{ approval: 0 }, { approval: 1 }],
              },
              orderBy: {
                approval: "desc",
              },
              take: 2,
              select: {
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    logger.success({
      data: firstData,
    });

    return res.status(200).json({
      data: firstData,
      error: null,
    });
  } else {
    const allData = await prisma.collection.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        Page: true,
      },
    });

    logger.success({
      data: allData,
    });

    return res.status(200).json({
      data: allData,
      error: null,
    });
  }
});

handler.post("/api/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const name = req.body?.name;
  const desc = req.body?.desc;

  if (!name) {
    const error = "'name' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const newPage = await prisma.collection.create({
    data: {
      name,
      desc,
    },
  });

  logger.success({
    data: newPage,
  });

  return res.status(200).json({
    data: newPage,
    error: null,
  });
});

export default handler;
