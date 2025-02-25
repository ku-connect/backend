import express, { type Request, type Response } from "express";
import { authorize, valdiateReq } from "../middleware";
import { createInteractions, getInteraction } from "./service";
import { interactionRequestSchema } from "./type";
import { getUserById } from "../user/service";
import { asyncHandler } from "../utils";
import type { NotificationEvent } from "../notification/event";

export function getInteractionRoute(notificationEvent: NotificationEvent) {
  const interactionsRoute = express.Router();

  interactionsRoute.use(authorize);

  /**
   * @swagger
   * /api/interactions:
   *   post:
   *     description: Interact with a user
   *     tags: [Interactions]
   *     responses:
   *       200:
   *         description: OK
   */
  interactionsRoute.post(
    "/",
    valdiateReq(interactionRequestSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const fromUserId = req.user?.sub;
      const { toUserId, liked } = req.body;

      // Check if the user exists
      const toUser = await getUserById(toUserId);
      if (!toUser) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      // Check if the user liked themselves
      if (fromUserId === toUserId) {
        res.status(400).json({
          message: "You cannot like yourself",
        });
        return;
      }

      // Check if the interaction already exists
      const interaction = await getInteraction(fromUserId, toUserId);
      if (interaction) {
        res.status(400).json({
          message: "Already interacted",
        });
        return;
      }

      await createInteractions(fromUserId, toUserId, liked);
      if (liked) {
        notificationEvent.sendNewInteractionEvent(fromUserId, toUserId);
      }

      res.sendStatus(200);
    })
  );

  return interactionsRoute;
}
