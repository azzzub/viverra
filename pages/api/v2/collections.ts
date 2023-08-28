// External
import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.get("/api/v2/collections", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const token = (await getToken({ req })) as any;

  // Get the url query
  const mtcm = req.query["mtcm"] as string | undefined;
  const name = req.query["name"] as string | undefined;

  // Get collection data
  const allData = await prisma.collection.findMany({
    include: {
      Team: {
        select: {
          name: true,
        },
      },
      Page: {
        select: {
          diff: true,
          createdAt: true,
          lastCheckAt: true,
        },
      },
    },
    where: {
      teamID: token?.user?.role === 2 ? undefined : token?.user?.teamID,
      id: {
        contains: mtcm,
      },
      name: {
        contains: name,
      },
    },
  });

  let lastCheckAt: Date = new Date(0);

  // Add result object to the collection data
  allData.forEach((collection) => {
    let failed = 0;
    let passed = 0;
    let error = 0;

    collection.Page.forEach((page, i) => {
      if (page.diff === null || page.diff === 0) {
        passed++;
      }

      if (page.diff && page.diff > 0) {
        failed++;
      }

      if (page.diff && page.diff < 0) {
        error++;
      }

      const time = page.lastCheckAt || page.createdAt;
      if (i === 0) {
        lastCheckAt = time;
      }

      if (lastCheckAt.getTime() > time.getTime()) {
        lastCheckAt = time;
      }
    });

    // @ts-ignore
    collection["result"] = {
      passed,
      failed,
      error,
      unreviewed: failed + error,
      total: collection.Page.length,
    };

    // @ts-ignore
    collection["lastCheckAt"] =
      lastCheckAt &&
      formatDistance(lastCheckAt, new Date(), {
        addSuffix: true,
      });

    // @ts-ignore
    collection["status"] =
      failed + error === 0
        ? {
            message: "Approved",
            color: "green",
          }
        : {
            message: "Unreviewed",
            color: "orange",
          };
  });

  logger.success({
    data: allData,
  });

  return res.status(200).json({
    data: allData,
    error: null,
  });
});

export default handler;
