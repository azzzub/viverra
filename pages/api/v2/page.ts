// External
import { getToken } from "next-auth/jwt";

// Local
import { handler } from "utils/nextConnect";
import { getDetailedPage } from "./page.handler";

handler.get("/api/v2/page", async (req, res) => {
  const id = req.query["id"] as string | undefined;

  const token = (await getToken({ req })) as any;

  if (!token) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  const teamID = token.user?.teamID;

  if (id) {
    return res.status(200).json(await getDetailedPage(teamID, id))
  }
});

export default handler;
