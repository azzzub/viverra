// External
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/page", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const id = req.query["id"] as string | undefined;

  if (id) {
    const firstData = await prisma.page.findFirst({
      where: {
        id,
      },
      include: {
        Collection: {},
        Snapshot: {
          where: {
            OR: [{ approval: 0 }, { approval: 1 }],
          },
          orderBy: {
            approval: "desc",
          },
          take: 2,
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
    const allData = await prisma.page.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        Snapshot: {
          where: {
            OR: [{ approval: 0 }, { approval: 1 }],
          },
          orderBy: {
            approval: "desc",
          },
          take: 2,
        },
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

handler.post("/api/page", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const name = req.body?.name;
  const desc = req.body?.desc;
  const collectionID = req.body?.collectionID;

  if (!name) {
    const error = "'name' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const newPage = await prisma.page.create({
    data: {
      name,
      desc,
      collectionID: collectionID || null,
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
