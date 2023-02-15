// External
import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";
import sendSlack from "utils/slack";

const prisma = new PrismaClient();

handler.get("/api/report", async (req, res) => {
  const logger = new LoggerAPI(req, res);

  const collectionID = req.query?.["collectionID"] as string;

  // check if the endpoint user-agest is Java (Katalon) then skip the validation
  if (!req.headers["user-agent"]?.includes("Java")) {
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

    const isEligible = await prisma.collection.findFirst({
      where: {
        teamID,
        id: collectionID,
      },
    });

    if (!isEligible) {
      return res.status(401).json({
        data: null,
        error: "unauthorized, different team!",
      });
    }
  }

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
      Team: {
        select: {
          name: true,
          slackMention: true,
          webhook: true,
        },
      },
    },
  });

  if (!collection) {
    throw new Error("no collection");
  }

  if (!collection.Team?.webhook) {
    const error = "webhook is empty";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
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
    teamMention: collection.Team?.slackMention || "",
    listOfFailedSS,
    webhook: collection.Team?.webhook,
    teamName: collection.Team.name,
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
