// Local
import { handler } from "utils/nextConnect";
import { getToken } from "next-auth/jwt";
import { generateToken } from "./token.handler";

handler.post("/api/v2/team/token", async (req, res) => {
  const token = (await getToken({ req })) as any;

  if (!token.user?.teamID || token.user?.teamID === "") {
    return res.status(400).json({
      message: "no team map to you",
      stack: token,
    });
  }

  return res.status(200).json(await generateToken(token.user?.teamID));
});

export default handler;
