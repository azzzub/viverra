import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import pino from "pino";

const logger = pino(
  {
    level: "debug",
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  },
  pino.destination({
    dest: path.join(process.cwd(), "/logs/logs.log"),
  })
);

export class LoggerAPI {
  private req!: NextApiRequest;
  private res!: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.req = req;
    this.res = res;
  }

  error(err: any) {
    return logger.error(
      {
        error: err?.toString(),
        message: err?.message,
        body: this.req.body,
        headers: this.req.headers,
      },
      `ERR - ${this.req.method} ${this.req.url}`
    );
  }

  success(meta?: {}) {
    return logger.info(
      {
        meta,
        body: this.req.body,
        query: this.req.query,
        headers: this.req.headers,
      },
      `OK - ${this.req.method} ${this.req.url}`
    );
  }

  debug(meta?: {}) {
    return logger.debug(
      { meta, req: this.req },
      `DEB - ${this.req.method} ${this.req.url}`
    );
  }
}
