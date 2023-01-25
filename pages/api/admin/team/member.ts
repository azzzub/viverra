// External
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/admin/team/member", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const username = req.body?.username as string;
  const teamID = req.body?.teamID;

  if (!username) {
    const error = "'username' value needed";
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

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(400).json({
      data: null,
      error: "username doesn't exist",
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

  const updateUser = await prisma.user.update({
    where: {
      username: user.username,
    },
    data: {
      teamID,
    },
  });

  logger.success({
    data: updateUser,
  });

  return res.status(200).json({
    data: updateUser,
    error: null,
  });
});

export default handler;
