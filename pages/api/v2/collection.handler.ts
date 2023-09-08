// External
import { Prisma, PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";

// Local

const prisma = new PrismaClient();

/**
 * Get Detailed Collection based on ID
 * @param {any} teamID team ID
 * @param {string} id collection ID
 * @return {any} JSON
 */
export const getDetailedCollection = async (teamID: any, id: string) => {
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

  let counterAvg = 0;
  let totalDiff = 0;
  let totalReviewed = 0;

  firstData?.Page.forEach((page) => {
    if (page?.diff === null || page?.diff >= 0) {
      totalDiff = totalDiff + (page.diff || 0);
      counterAvg++;
    }

    if (page?.diff === null || page?.diff === 0) {
      totalReviewed++;
    }

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

  // @ts-ignore(
  firstData["matchingRate"] =
    counterAvg === 0 ? "-" : (100 - totalDiff / counterAvg).toFixed(2);

  // @ts-ignore
  firstData["reviewedSnapshot"] =
    firstData?.Page.length === 0
      ? "-/-"
      : totalReviewed + "/" + firstData?.Page.length;

  const isEligible = firstData?.teamID === teamID;

  return {
    data: firstData,
    isEligible,
    error: null,
  };
};

/**
 * Get All Collections
 * @param {any} token token
 * @param {string} mtcm mtcm
 * @param {string} name name
 * @param {string} tags tags
 * @return {any} JSON
 */
export const getAllCollections = async (
  token: any,
  mtcm: string | undefined,
  name: string | undefined,
  tags: string | undefined
) => {
  const _tags: any[] = [];
  if (tags && tags !== "") {
    const _ = tags?.split(",");
    if (_.length !== 0) {
      _.map((v: any) => {
        _tags.push({
          tags: {
            contains: v,
          },
        });
      });
    }
  }

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
      AND: _tags,
    },
  });

  let lastCheckAt: Date;

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
      (lastCheckAt &&
        formatDistance(lastCheckAt, new Date(), {
          addSuffix: true,
        })) ||
      "-";

    // @ts-ignore
    collection["status"] =
      collection.Page.length === 0
        ? {
            message: "No Screenshot",
            color: "green",
          }
        : failed + error === 0
        ? {
            message: "Approved",
            color: "green",
          }
        : {
            message:
              failed + error + "/" + collection.Page.length + " Unreviewed",
            color: "orange",
          };
  });

  return {
    data: allData,
    error: null,
  };
};

export const postNewCollection = async (
  token: any,
  collectionID: any,
  name: any,
  tags: string
) => {
  const myTeam = await prisma.user.findFirst({
    where: {
      id: token.user.id,
    },
    include: {
      Team: {
        select: {
          id: true,
        },
      },
    },
  });

  const teamID = myTeam?.Team?.id || null;

  try {
    const collection = await prisma.collection.create({
      data: {
        id: collectionID,
        name,
        teamID,
        tags: tags || null,
      },
    });

    return {
      data: collection,
      error: null,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error(
          JSON.stringify({
            message: "Collection ID already exist!",
            stack: error.stack,
          })
        );
      }
    }
  }
};

export const putEditCollection = async (
  collectionID: any,
  name: any,
  tags: string
) => {
  const collection = await prisma.collection.update({
    data: {
      name,
      tags: tags || null,
    },
    where: {
      id: collectionID,
    },
  });

  return {
    data: collection,
    error: null,
  };
};
