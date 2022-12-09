import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { LoggerAPI } from "./logger";

// Types and interfaces
interface NextApiRequestWithFile extends NextApiRequest {
  file: any;
  fields: any;
}

// Next connect middleware handler
const handler = nextConnect({
  onNoMatch(req: NextApiRequestWithFile, res: NextApiResponse) {
    const logger = new LoggerAPI(req, res);
    logger.error("method not allowed");
    return res
      .status(405)
      .end(JSON.stringify({ error: `method '${req.method}' not allowed` }));
  },
  onError(err, req, res) {
    const logger = new LoggerAPI(req, res);
    logger.error(err);
    return res
      .status(500)
      .end(JSON.stringify({ error: "something broke", stack: err.message }));
  },
});

export { handler };
