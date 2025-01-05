import express, { type Request, type Response } from "express";
import { authorize } from "../middleware";
import { createInteractions } from "./service";
import { interactionRequestSchema } from "./type";
import { getUserById } from "../user/service";
import { asyncHandler } from "../utils";
import { events, notificationEvent } from "../notification/event";

export const interactionsRoute = express.Router();

interactionsRoute.use(authorize);

interactionsRoute.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const fromUserId = req.user?.sub;
    const { data, error } = interactionRequestSchema.safeParse(req.body);
    if (!data || error) {
      res.status(400).json(error);
      return;
    }
    const { toUserId, liked } = data;

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
    //   const interaction = await getInteraction(fromUserId, toUserId);
    //   if (interaction) {
    //     res.status(400).json({
    //       message: "Already interacted",
    //     });
    //     return;
    //   }

    try {
      await createInteractions(fromUserId, toUserId, liked);
      notificationEvent.emit(events.INTERACTION, {
        fromUserId,
        toUserId,
        liked,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong",
      });
      return;
    }

    res.sendStatus(200);
  })
);
