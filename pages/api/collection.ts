// External
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

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
        Team: {
          name: "desc",
        },
      },
      include: {
        Team: {
          select: {
            name: true,
          },
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

handler.post("/api/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const name = req.body?.name;
  const desc = req.body?.desc;
  const collectionID = req.body?.collectionID as any;

  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  if (!name) {
    const error = "'name' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const myTeam = await prisma.user.findFirst({
    where: {
      id: token.user.id,
    },
    include: {
      Team: {
        select: {
          id: true,
        },
      },
    },
  });

  const teamID = myTeam?.Team?.id || null;

  if (
    process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000" ||
    process.env.NEXT_PUBLIC_BASE_URL === "http://127.0.0.1:3000"
  ) {
    let collection;

    if (collectionID === "") {
      collection = await prisma.collection.create({
        data: {
          name,
          desc,
          teamID,
        },
      });
    } else {
      collection = await prisma.collection.create({
        data: {
          id: collectionID,
          name,
          desc,
          teamID,
        },
      });
    }

    logger.success({
      data: collection,
    });

    return res.status(200).json({
      data: collection,
      error: null,
    });
  }

  const newCollection = await prisma.collection.create({
    data: {
      name,
      desc,
      teamID,
    },
  });

  logger.success({
    data: newCollection,
  });

  return res.status(200).json({
    data: newCollection,
    error: null,
  });
});

export default handler;
