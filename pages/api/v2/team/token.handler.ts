import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const generateToken = async (teamID: string) => {
  const team = await prisma.team.update({
    data: {
      token: uuidv4(),
    },
    where: {
      id: teamID,
    },
  });

  return {
    data: team,
    error: null,
  };
};
