// External
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/v2/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  const mtcm = req.query["mtcm"] as string | undefined;
  const name = req.query["name"] as string | undefined;

  const allData = await prisma.collection.findMany({
    include: {
      Team: {
        select: {
          name: true,
        },
      },
      Page: {
        select: {
          diff: true,
        },
      },
    },
    where: {
      teamID: token?.user?.role === 2 ? undefined : token?.user?.teamID,
      id: {
        contains: mtcm,
      },
      name: {
        contains: name,
      },
    },
  });

  //TODO: looping all data to get failed/pass

  const comparison = allData;

  logger.success({
    data: allData,
  });

  return res.status(200).json({
    data: allData,
    error: null,
  });
});

export default handler;
