// External
import { PrismaClient, Snapshot } from "@prisma/client";
import multiparty from "multiparty";
import path from "path";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";
import { compare } from "odiff-bin";

// File upload middleware
handler.use((req, _res, next) => {
  const form = new multiparty.Form({
    uploadDir: path.join(process.cwd(), "/public/snapshots"),
  });
  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err);
    }
    req.fields = fields;
    req.file = files.file[0];
    next();
  });
});

const prisma = new PrismaClient();

handler.post("/api/snapshot", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  const pageID = req.fields.pageID?.[0] as string | undefined;
  const note = req.fields.note?.[0] as string | undefined;
  const threshold = req.fields.threshold?.[0] as string | undefined;

  if (!pageID) {
    const error = "'pageID' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  // Search for existing snapshot
  const existingSnapshot = await prisma.snapshot.findFirst({
    where: {
      pageID,
    },
  });

  // Search for pending snapshot
  const pendingSnapshot = await prisma.snapshot.findFirst({
    where: {
      pageID,
      approval: 0,
    },
  });

  // Auto approve if the snapshot was the first data
  const newSnapshot: Snapshot = await prisma.snapshot.create({
    data: {
      filename: path.basename(req.file.path),
      pageID,
      note,
      approval: existingSnapshot ? 0 : 1,
    },
  });

  if (!existingSnapshot) {
    logger.success({
      data: newSnapshot,
    });

    return res.status(200).json({
      data: newSnapshot,
      error: null,
    });
  }

  if (pendingSnapshot) {
    // If new data created, update the approved snapshot before to the expired status
    await prisma.snapshot.update({
      data: {
        approval: 2,
      },
      where: {
        id: pendingSnapshot.id,
      },
    });
  }

  // Search for the approved snapshot
  const approvedSnapshot = await prisma.snapshot.findMany({
    where: {
      pageID: pageID,
      approval: 1,
    },
  });

  // Throw error message if approved messages more than 1 file
  if (approvedSnapshot.length > 1) {
    const error = "approved snapshot is more than 1 file";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  // Compare the approved snapshot with the uploaded snapshot
  const snapshotPath = path.join(process.cwd(), "/public/snapshots") + "/";

  const comparison = await compare(
    snapshotPath + approvedSnapshot[0].filename,
    snapshotPath + newSnapshot.filename,
    snapshotPath + "diff/" + pageID + ".png",
    {
      // antialiasing: true,
      // failOnLayoutDiff: true,
      // outputDiffMask: true,
      ignoreRegions: [
        {
          x1: 100,
          y1: 0,
          x2: 1900,
          y2: 900,
        },
      ],
    }
  );

  if (comparison.match) {
    await prisma.snapshot.update({
      data: {
        approval: 2,
      },
      where: {
        id: newSnapshot.id,
      },
    });
  } else {
    if (comparison?.reason === "pixel-diff") {
      await prisma.page.update({
        where: {
          id: pageID,
        },
        data: {
          diff: comparison.diffPercentage,
        },
      });
    }
  }

  logger.success({
    data: newSnapshot,
    result: comparison,
  });

  return res.status(200).json({
    data: newSnapshot,
    result: comparison,
    isEqual: comparison.match,
    error: null,
  });
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
