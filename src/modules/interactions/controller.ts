import { type Request, type Response } from "express";
import { createInteractions, getInteraction } from "./service";
import { getUserById } from "../user/service";
import { NotificationEvent } from "../notification/event";
import { StatusCodes } from "http-status-codes";

export class InteractionController {
  private notificationEvent: NotificationEvent;

  constructor(notificationEvent: NotificationEvent) {
    this.notificationEvent = notificationEvent;
  }

  createInteraction = async (req: Request, res: Response) => {
    const fromUserId = req.user?.sub;
    const { toUserId, liked } = req.body;

    // Check if the user exists
    const toUser = await getUserById(toUserId);
    if (!toUser) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
      return;
    }

    // Check if the user liked themselves
    if (fromUserId === toUserId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "You cannot like yourself",
      });
      return;
    }

    // Check if the interaction already exists
    const interaction = await getInteraction(fromUserId, toUserId);
    if (interaction) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Already interacted",
      });
      return;
    }

    await createInteractions(fromUserId, toUserId, liked);
    if (liked) {
      this.notificationEvent.sendNewInteractionEvent(fromUserId, toUserId);
    }

    res.sendStatus(StatusCodes.OK);
  };
}
