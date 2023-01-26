// External
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/admin/team/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const collectionID = req.body?.collectionID as string;
  const teamID = req.body?.teamID;

  if (!collectionID) {
    const error = "'collectionID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!teamID) {
    const error = "'teamID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionID,
    },
  });

  if (!collection) {
    return res.status(400).json({
      data: null,
      error: "collection doesn't exist",
    });
  }

  const checkingTeamID = await prisma.team.findFirst({
    where: {
      id: teamID,
    },
  });

  if (!checkingTeamID) {
    return res.status(400).json({
      data: null,
      error: "team id doesn't exist",
    });
  }

  const updateCollection = await prisma.collection.update({
    where: {
      id: collection.id,
    },
    data: {
      teamID,
    },
  });

  logger.success({
    data: updateCollection,
  });

  return res.status(200).json({
    data: updateCollection,
    error: null,
  });
});

export default handler;
