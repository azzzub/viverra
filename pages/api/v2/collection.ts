// External
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

// Local
import { handler } from "utils/nextConnect";
import * as methodHandler from "./collection.handler";

const prisma = new PrismaClient();

// ===================================================
// Handler
// ===================================================
handler.get("/api/v2/collection", async (req, res) => {
  const token = (await getToken({ req })) as any;

  // Check user token
  if (!token) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  // Team ID
  const teamID = token.user?.teamID;

  // Request query
  const id = req.query["id"] as string | undefined;
  const mtcm = req.query["mtcm"] as string | undefined;
  const name = req.query["name"] as string | undefined;
  const tags = req.query["tags"] as string | undefined;

  if (id && !mtcm && !name) {
    return res.status(200).json(await methodHandler.getDetailedCollection(teamID, id))
  }

  if (!id) {
    return res.status(200).json(await methodHandler.getAllCollections(token, mtcm, name, tags))
  }
});

handler.post("/api/v2/collection", async (req, res) => {
  const name = req.body?.name;
  const collectionID = req.body?.collectionID as any;
  const tags = req.body?.tags as any;

  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  if (!name) {
    const error = "'name' value needed";
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!collectionID) {
    const error = "'collectionID' value needed";
    return res.status(400).json({
      data: null,
      error,
    });
  }

  return res.json(await methodHandler.postNewCollection(token, collectionID, name, tags))
});

handler.put("/api/v2/collection", async (req, res) => {
  const name = req.body?.name;
  const collectionID = req.body?.collectionID as any;
  const tags = req.body?.tags as any;

  const token = (await getToken({ req })) as any;

  if (!token || (token && token.user?.role < 1)) {
    return res.status(401).json({
      data: null,
      error: "unauthorized",
    });
  }

  if (!name) {
    const error = "'name' value needed";
    return res.status(400).json({
      data: null,
      error,
    });
  }

  if (!collectionID) {
    const error = "'collectionID' value needed";
    return res.status(400).json({
      data: null,
      error,
    });
  }

  return res.json(await methodHandler.putEditCollection(collectionID, name, tags))
});

export default handler;
