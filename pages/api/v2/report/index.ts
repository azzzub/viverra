// External
import { getToken } from "next-auth/jwt";

// Local
import { LoggerAPI } from "utils/logger";
import { handler } from "utils/nextConnect";
import { getAllCollections } from "../collection.handler";
import { sendSlack } from "./index.handler";

handler.post("/api/v2/report", async (req, res) => {
  const logger = new LoggerAPI(req, res);

  const tags = req.body.tags || "";

  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const teamID = token.user?.teamID;

  if (!teamID) {
    const error = "no team map to you";
    logger.error(error);
    return res.status(400).json({
      data: null,
      error,
    });
  }

  const getCollectionsResponse = await getAllCollections(token, "", "", tags);

  await sendSlack(teamID, tags, getCollectionsResponse);

  return res.status(200).json({
    data: getCollectionsResponse,
    error: null,
  });
});

export default handler;
