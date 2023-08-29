// External
import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";

// Local

const prisma = new PrismaClient();

/**
 * Get Detailed Collection based on ID
 * @param teamID team ID
 * @param id collection ID
 * @returns JSON
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

    return {
        data: firstData,
        isEligible,
        error: null,
    };
}

/**
 * Get All Collections
 * @param token token
 * @param mtcm mtcm
 * @param name name
 * @returns JSON
 */
export const getAllCollections = async (token: any, mtcm: string | undefined, name: string | undefined) => {
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
            lastCheckAt &&
            formatDistance(lastCheckAt, new Date(), {
                addSuffix: true,
            }) || "-";

        // @ts-ignore
        collection["status"] = collection.Page.length === 0 ? {
            message: "No Screenshot",
            color: "green",
        } :
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


    return {
        data: allData,
        error: null,
    };
}

export const postNewCollection = async (token: any, collectionID: any, name: any,) => {
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

    const collection = await prisma.collection.create({
        data: {
            id: collectionID,
            name,
            teamID,
        },
    });

    return {
        data: collection,
        error: null,
    };
}