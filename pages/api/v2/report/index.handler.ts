import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Send slack reporting link
 * @param {string} teamID team ID
 * @param {string} tags tags
 * @param {any} payload collection payload
 */
export const sendSlack = async (teamID: string, tags: string, payload: any) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamID,
    },
  });

  if (!team?.webhook)
    throw new Error(
      JSON.stringify({
        message: "no webhook found!",
        stack: team,
      })
    );

  const ctaURL = `${process.env.NEXT_PUBLIC_BASE_URL}/v2?display=report&tags=${tags}`;
  const visualChanges = payload?.highlight?.failed + payload?.highlight?.error;
  const totalSs = payload?.highlight?.passed + visualChanges;
  const attachmentColor = visualChanges > 0 ? "#FFA500" : "#2EB886";
  let tagsPayload = "";

  payload?.highlight?.tags?.map((v: string) => {
    tagsPayload += `\`${v}\` `;
  });

  const slackPayload = {
    attachments: [
      {
        mrkdwn_in: ["pretext", "text"],
        color: attachmentColor,
        pretext: "*:spiral_note_pad:  Viverra Visual Test Report*",
        title: `${visualChanges} visual changes need review`,
        title_link: ctaURL,
        text:
          "*Team Name:* " +
          team.name +
          "\n*Tags:* " +
          tagsPayload +
          "\n\n*Cc:* " +
          team.slackMention,
        thumb_url:
          "https://raw.githubusercontent.com/azzzub/viverra/master/public/viverra-mascot.png",
        footer: `${totalSs} total snapshots`,
        footer_icon:
          "https://raw.githubusercontent.com/azzzub/viverra/master/public/viverra-mascot.png",
      },
    ],
  };

  const res = await axios.post(team.webhook, slackPayload);

  return res.data;
};
