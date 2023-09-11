// External
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/team", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1) || !token.user?.id) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const myTeam = await prisma.user.findFirst({
    where: {
      id: token.user?.id,
    },
    include: {
      Team: true,
    },
  });

  if (myTeam?.Team && myTeam.Team.webhook) {
    try {
      const value = myTeam.Team.webhook;
      const _temp = value.split("/");
      _temp[5] = "**********";
      _temp[6] = "***************";
      myTeam.Team.webhook = _temp.join("/");
    } catch (error: any) {
      logger.error(error.message);
      return res.status(500).json({
        data: null,
        error: error.message,
      });
    }
  }

  if (myTeam?.Team) {
    if (myTeam.Team.token === null || myTeam.Team.token === "") {
      myTeam.Team.token = "No token generated yet!";
    } else {
      myTeam.Team.token = "***********************";
    }
  }

  logger.success({
    data: myTeam,
  });

  return res.status(200).json({
    data: myTeam,
    error: null,
  });
});

handler.post("/api/team", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1) || !token.user?.id) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const name = req.body?.name;
  const note = req.body?.note;
  const slackMention = req.body?.slackMention;
  const webhook = req.body?.webhook;

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
      id: token.user?.id,
    },
    include: {
      Team: {
        select: {
          id: true,
          webhook: true,
        },
      },
    },
  });

  if (!myTeam?.Team) {
    const error = "not join a team yet";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const updateMyTeam = await prisma.team.update({
    data: {
      name,
      webhook: webhook === "" ? myTeam.Team.webhook : webhook,
      slackMention,
      note,
    },
    where: {
      id: myTeam.Team.id,
    },
  });

  logger.success({
    data: updateMyTeam,
  });

  return res.status(200).json({
    data: updateMyTeam,
    error: null,
  });
});

export default handler;
