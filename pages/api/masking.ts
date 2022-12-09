// External
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/masking", async (req, res) => {
  const logger = new LoggerAPI(req, res);

  const masking = req.body?.masking;
  const pageID = req.body?.pageID;

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
