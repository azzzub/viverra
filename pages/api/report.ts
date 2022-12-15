// External
import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";
import sendSlack from "utils/slack";

const prisma = new PrismaClient();

handler.get("/api/report", async (req, res) => {
  const logger = new LoggerAPI(req, res);

  const collectionID = req.query?.["collectionID"] as string;

  if (!collectionID) {
    const error = "'collectionID' value needed";
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
    include: {
      Page: {
        select: {
          name: true,
          diff: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!collection) {
    throw new Error("no collection");
  }

  let countFailed = 0;
  let countPassed = 0;
  let listOfFailedSS = "";

  collection?.Page.map((v) => {
    if (v.diff && v.diff > 0.0) {
      countFailed++;
      listOfFailedSS += `- ${v.name} | ${formatDistance(
        Date.parse(v?.updatedAt.toString()),
        new Date(),
        {
          addSuffix: true,
        }
      )}\n`;
    }
    if (!v.diff || v.diff === 0.0) countPassed++;
  });

  const slackResponse = await sendSlack({
    ctaURL: `${process.env.NEXT_PUBLIC_BASE_URL}/collection/${collectionID}`,
    title: `${collection?.name}`,
    failed: countFailed,
    passed: countPassed,
    teamMention: process.env.NEXT_PUBLIC_TEAM_MENTION || "",
    listOfFailedSS,
  });

  logger.success({
    data: {
      collection,
      slackResponse,
    },
  });

  return res.status(200).json({
    data: collection,
    slackResponse,
    error: null,
  });
});

export default handler;
