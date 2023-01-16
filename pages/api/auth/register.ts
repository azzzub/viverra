// External
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/auth/register", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username) {
    const error = "'username' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!password) {
    const error = "'password' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      logger.error(err);
      return res.status(400).json({
        data: null,
        err,
      });
    }
    bcrypt.hash(password, salt, async function (err, hash) {
      try {
        if (err) throw new Error(err?.message);

        const user = await prisma.user.create({
          data: {
            username,
            password: hash,
          },
        });

        logger.success({
          data: user,
        });

        return res.status(200).json({
          data: {
            id: user.id,
            createdAt: user.createdAt,
          },
          error: null,
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          return res.status(400).json({
            data: null,
            error: "username already registered!",
          });
        }
        logger.error(error);
        return res.status(400).json({
          data: null,
          error,
        });
      }
    });
  });
});

export default handler;
