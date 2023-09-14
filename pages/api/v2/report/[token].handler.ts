import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get team ID by team token
 * @param {string} teamToken team token
 */
export const getTeamID = async (teamToken: string) => {
  const team = await prisma.team.findFirst({
    where: {
      token: teamToken,
    },
  });

  return team?.id;
};
