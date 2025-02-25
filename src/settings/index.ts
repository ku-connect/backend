import express, { type Request, type Response } from "express";
import { authorize, valdiateReq } from "../middleware";
import { getUserSettings, updateUserSettings } from "./service";
import { settingsRequestSchema } from "./type";
import { asyncHandler } from "../utils";

export const settingsRoute = express.Router();

settingsRoute.use(authorize);

/**
 * @swagger
 * /api/settings/me:
 *   get:
 *     description: Get my settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Returns settings
 */
settingsRoute.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    const settings = await getUserSettings(userId);

    res.json(settings);
  })
);

/**
 * @swagger
 * /api/settings/me:
 *   put:
 *     description: Update settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Returns updated settings
 */
settingsRoute.put(
  "/",
  valdiateReq(settingsRequestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = req.body;
    const userId = req.user.sub;

    const result = await updateUserSettings(settings, userId);

    res.json(result);
  })
);
