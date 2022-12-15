// External
import { PrismaClient } from "@prisma/client";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";

const prisma = new PrismaClient();

handler.post("/api/approval", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const snapshotID = req.body?.snapshotID;
  const status = req.body?.status;

  if (!snapshotID) {
    const error = "'snapshotID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  // Get snapshot detail
  const snapshotDetail = await prisma.snapshot.findFirst({
    where: {
      id: snapshotID,
    },
  });

  if (!snapshotDetail) {
    const error = "no snapshot found";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!status) {
    const rejectSnapshot = await prisma.snapshot.update({
      where: {
        id: snapshotID,
      },
      data: {
        approval: 3,
      },
    });

    await prisma.page.update({
      where: {
        id: snapshotDetail.pageID,
      },
      data: {
        diff: 0.0,
      },
    });

    logger.success({
      data: rejectSnapshot,
    });

    return res.status(200).json({
      data: rejectSnapshot,
      error: null,
    });
  }

  // Search for approved snapshot
  const approvedSnapshot = await prisma.snapshot.findFirst({
    where: {
      pageID: snapshotDetail.pageID,
      approval: 1,
    },
  });

  if (!approvedSnapshot) {
    const error = "no approved snapshot found";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  // Update the approved snapshot to expired status
  await prisma.snapshot.update({
    where: {
      id: approvedSnapshot.id,
    },
    data: {
      approval: 10,
    },
  });

  // Approve the new snapshot
  const approveSnapshot = await prisma.snapshot.update({
    where: {
      id: snapshotID,
    },
    data: {
      approval: 1,
    },
  });

  await prisma.page.update({
    where: {
      id: snapshotDetail.pageID,
    },
    data: {
      diff: 0.0,
    },
  });

  logger.success({
    data: approveSnapshot,
  });

  return res.status(200).json({
    data: approveSnapshot,
    error: null,
  });
});

export default handler;
