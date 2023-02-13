// External
import { PrismaClient, Snapshot } from "@prisma/client";
import multiparty from "multiparty";
import pixelmatch from "pixelmatch";
import path from "path";
import fs from "fs";
const PNG = require("pngjs").PNG;

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";
import { applyIgnoreAreas } from "utils/comparison";
import { getTeamNamePrefix } from "utils/tools";

const prisma = new PrismaClient();

// File upload middleware
handler.use("/api/snapshot", (req, res, next) => {
  const snapshotPath = path.join(process.cwd(), "/public/snapshots");

  const form = new multiparty.Form({
    uploadDir: snapshotPath,
  });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      return next(err);
    }

    try {
      const collectionID = fields.collectionID?.[0] as string | undefined;

      if (!collectionID) {
        const error = "'collectionID' value needed";
        return res.status(400).json({
          data: null,
          error,
        });
      }

      const collection = await prisma.collection.findFirst({
        where: {
          id: collectionID,
        },
        select: {
          Team: {
            select: {
              name: true,
            },
          },
        },
      });

      const teamNamePrefix = getTeamNamePrefix(collection?.Team?.name);

      const defPath = path.join(
        snapshotPath,
        path.basename(files.file[0].path)
      );

      const newPath = path.join(
        snapshotPath,
        teamNamePrefix,
        path.basename(files.file[0].path)
      );

      fs.rename(defPath, newPath, (err) => {
        if (err) return next(err);
      });

      req.fields = fields;
      req.file = files.file[0];
      req.teamNamePrefix = teamNamePrefix;

      next();
    } catch (error) {
      next(error);
    }
  });
});

handler.post("/api/snapshot", async (req, res) => {
  const logger = new LoggerAPI(req, res);
  let pageID = req.fields.pageID?.[0] as string | undefined;
  const note = req.fields.note?.[0] as string | undefined;
  const threshold = req.fields.threshold?.[0] as string | undefined;

  const name = req.fields.name?.[0] as string | undefined;
  const collectionID = req.fields.collectionID?.[0] as string | undefined;

  let teamName = req.teamNamePrefix;

  if (name && pageID) {
    const error = "'pageID' and 'name' cannot be passed together";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!pageID && !name) {
    const error = "'pageID' or 'name' value needed";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (name) {
    if (!collectionID) {
      const error = "'collectionID' value needed";
      logger.error(error);
      return res.status(400).json({
        data: null,
        error,
      });
    }

    const page = await prisma.page.findFirst({
      where: {
        name,
        collectionID,
      },
    });

    pageID = page?.id;

    if (!pageID) {
      const newPage = await prisma.page.create({
        data: {
          name,
          collectionID,
        },
      });

      pageID = newPage.id;
    }
  }

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
  const snapshotPath =
    path.join(process.cwd(), "/public/snapshots", teamName) + "/";

  const approvedSnapshotImg = PNG.sync.read(
    fs.readFileSync(snapshotPath + approvedSnapshot[0].filename)
  );
  const newSnapshotImg = PNG.sync.read(
    fs.readFileSync(snapshotPath + newSnapshot.filename)
  );

  const { width, height } = approvedSnapshotImg;
  const diff = new PNG({ width, height });

  const page = await prisma.page.findFirst({
    where: {
      id: pageID,
    },
    select: {
      masking: true,
    },
  });

  let ignoreArea = [];

  if (page?.masking) {
    ignoreArea = JSON.parse(page.masking);
  }

  const img1 = applyIgnoreAreas(approvedSnapshotImg, ignoreArea);
  const img2 = applyIgnoreAreas(newSnapshotImg, ignoreArea);

  const comparison = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  const diffPercentage = +((comparison * 100) / (width * height)).toFixed(2);

  fs.writeFileSync(
    snapshotPath + "diff/" + pageID + ".png",
    PNG.sync.write(diff)
  );

  const isEqual = diffPercentage === 0;

  if (isEqual) {
    await prisma.snapshot.update({
      data: {
        approval: 2,
      },
      where: {
        id: newSnapshot.id,
      },
    });
  }

  await prisma.page.update({
    where: {
      id: pageID,
    },
    data: {
      diff: diffPercentage,
      lastCheckAt: new Date(),
    },
  });

  logger.success({
    data: newSnapshot,
    result: comparison,
  });

  return res.status(200).json({
    data: newSnapshot,
    result: comparison,
    isEqual,
    error: null,
  });
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
