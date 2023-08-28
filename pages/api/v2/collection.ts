// External
import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/v2/collection", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const id = req.query["id"] as string | undefined;
  const token = (await getToken({ req })) as any;

  if (!token) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const teamID = token.user?.teamID;

  const firstData = await prisma.collection.findFirst({
    where: {
      id,
    },
    include: {
      Page: {
        include: {
          Snapshot: {
            where: {
              OR: [{ approval: 0 }, { approval: 1 }],
            },
            orderBy: {
              approval: "desc",
            },
            take: 2,
            select: {
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  firstData?.Page.forEach((page) => {
    // @ts-ignore
    page["diffEasy"] = page.diff !== null ? page.diff?.toFixed(2) + "%" : "-";

    // @ts-ignore
    page["lastReviewed"] =
      page.Snapshot.length >= 1
        ? formatDistance(page.Snapshot[0]?.updatedAt, new Date(), {
            addSuffix: true,
          })
        : "-";

    // @ts-ignore
    page["lastCheckAtEasy"] = page.lastCheckAt
      ? formatDistance(page.lastCheckAt, new Date(), {
          addSuffix: true,
        })
      : "-";

    // @ts-ignore
    page["status"] =
      page.diff === null
        ? {
            message: "Auto-Passed",
            color: "green",
          }
        : page.diff === 0
        ? {
            message: "Passed",
            color: "green",
          }
        : page.diff < 0
        ? {
            message: "Error - Different Image Size",
            color: "red",
          }
        : {
            message: "Failed",
            color: "red",
          };
  });

  const isEligible = firstData?.teamID === teamID;

  logger.success({
    data: firstData,
    isEligible,
  });

  return res.status(200).json({
    data: firstData,
    isEligible,
    error: null,
  });
});

export default handler;
