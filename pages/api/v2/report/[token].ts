// Local
import { handler } from "utils/nextConnect";
import { getAllCollections } from "../collection.handler";
import { sendSlack } from "./index.handler";
import { getTeamID } from "./[token].handler";

handler.post("/api/v2/report/:token", async (req, res) => {
  const token = req.query?.token as string | undefined;

  const tags = req.body.tags || "";

  const _token = {
    user: {
      role: 1,
    },
  };

  if (!token || token === "") {
    return res.status(400).json({
      message: "Team token can't be empty",
      stack: "empty token",
    });
  }

  const teamID = await getTeamID(token);

  if (!teamID) {
    return res.status(400).json({
      message: "Wrong token!",
      stack: teamID,
    });
  }

  const getCollectionsResponse = await getAllCollections(_token, "", "", tags);

  await sendSlack(teamID, tags, getCollectionsResponse);

  return res.status(200).json({
    data: {
      collection: getCollectionsResponse,
      teamID,
    },
    error: null,
  });
});

export default handler;
