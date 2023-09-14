/* eslint-disable require-jsdoc */
// External
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

// Local
import { LoggerAPI } from "utils/logger";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = new LoggerAPI(req, res);
  try {
    const _path = req.query?.["path"] as string[];
    const target = _path.join("/");
    const filePath = path.join(process.cwd(), "/public", target);
    const imageBuffer = fs.readFileSync(filePath);
    res.setHeader("Content-Type", "image/jpg");
    return res.send(imageBuffer);
  } catch (error) {
    logger.error(error);
    return res.status(404).send("404 not found");
  }
}
