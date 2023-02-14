// External
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/masking", async (req, res) => {
  const logger = new LoggerAPI(req, res);

  const masking = req.body?.masking;
  const pageID = req.body?.pageID;
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const teamID = token.user?.teamID;

  if (!teamID) {
    const error = "no team map to you";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!pageID) {
    const error = "'pageID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!masking) {
    const error = "'masking' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  JSON.parse(masking);

  const isEligible = await prisma.collection.findFirst({
    where: {
      teamID,
      Page: {
        some: {
          id: pageID,
        },
      },
    },
  });

  if (!isEligible) {
    return res.status(401).json({
      data: null,
      error: "unauthorized, different team!",
    });
  }

  const page = await prisma.page.update({
    where: {
      id: pageID,
    },
    data: {
      masking: masking,
    },
  });

  logger.success({
    data: page,
  });

  return res.status(200).json({
    data: page,
    error: null,
  });
});

export default handler;
