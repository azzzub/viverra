// External
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/admin/team", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const name = req.body?.name;

  if (!name) {
    const error = "'name' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const newTeam = await prisma.team.create({
    data: {
      name,
    },
  });

  logger.success({
    data: newTeam,
  });

  return res.status(201).json({
    data: newTeam,
    error: null,
  });
});

handler.put("/api/admin/team", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const name = req.body?.name;
  const slackMention = req.body?.slackMention;
  const webhook = req.body?.webhook;
  const teamID = req.body?.teamID;

  if (!name) {
    const error = "'name' value needed";
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

  const updateTeam = await prisma.team.update({
    data: {
      name,
      slackMention: slackMention === "" ? null : slackMention,
      webhook: webhook === "" ? null : webhook,
    },
    where: {
      id: teamID,
    },
  });

  logger.success({
    data: updateTeam,
  });

  return res.status(200).json({
    data: updateTeam,
    error: null,
  });
});

handler.get("/api/admin/team", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    logger.error(token?.user);
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  // Get all team
  const teams = await prisma.team.findMany({
    include: {
      User: {
        select: {
          username: true,
        },
      },
      Collection: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  logger.success({
    data: teams,
  });

  return res.status(200).json({
    data: teams,
    error: null,
  });
});

export default handler;
