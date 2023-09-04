import { PrismaClient } from "@prisma/client";
import { formatDistance } from "date-fns";

const prisma = new PrismaClient();

export const getDetailedPage =  async (teamID: string, id: string) => {

const firstData = await prisma.page.findFirst({
    where: {
      id,
    },
    include: {
      Collection: {
        select: {
          teamID: true,
          name: true,
          id: true,
        },
      },
      Snapshot: {
        where: {
          OR: [{ approval: 0 }, { approval: 1 }],
        },
        orderBy: {
          approval: "desc",
        },
        take: 2,
      },
    },
  });

  firstData?.Snapshot.forEach((ss) => {
    // @ts-ignore
    ss["capturedAt"] = formatDistance(ss.updatedAt, new Date(), {
            addSuffix: true,
        });
  })

  const isEligible = firstData?.Collection?.teamID === teamID;

  return {
    data: firstData,
    isEligible,
    error: null,
  };
} 