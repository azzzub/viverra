// External
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.put("/api/admin/user", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const userID = req.body?.userID;
  const role = req.body?.role;

  if (!userID) {
    const error = "'userID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!role) {
    const error = "'role' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (role < 0 || role > 2) {
    const error = "'role' value must be between 0-2";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const updateRole = await prisma.user.update({
    data: {
      role: parseInt(role),
    },
    where: {
      id: userID,
    },
  });

  logger.success({
    data: updateRole,
  });

  return res.status(200).json({
    data: updateRole,
    error: null,
  });
});

handler.get("/api/admin/user", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 2)) {
    logger.error(token?.user);
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  // Get all user
  const user = await prisma.user.findMany();

  logger.success({
    data: user,
  });

  return res.status(200).json({
    data: user,
    error: null,
  });
});

export default handler;
