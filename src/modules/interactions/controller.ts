import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../db";
import { createChat, isAlreadyInChat } from "../chat/repository";
import { NotificationEvent } from "../notification/event";
import { getUserById } from "../user/service";
import { createInteractions, getInteraction, getPendingInteractions, isConnected } from "./service";

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
			const connect = await isConnected(fromUserId, toUserId);
			if (connect) {
				// Sending notification to 2 users that there are connected
				this.notificationEvent.sendNewConnectionEvent(fromUserId, toUserId);
				this.notificationEvent.sendNewConnectionEvent(toUserId, fromUserId);

				// Check if the chat already exists
				const isChatExist = await isAlreadyInChat(db, fromUserId, toUserId);
				if (isChatExist && isChatExist.length > 0) {
					res.json({
						connected: true,
						chatId: isChatExist[0].id,
					});
					return;
				}
				// Create chat
				const chatId = await createChat(db, fromUserId, toUserId);
				console.log("create chat", chatId);

				res.json({
					connected: true,
					chatId: chatId[0].chatId,
				});
				return;
			}
			res.json({
				connected: false,
			});
			return;
		}

		res.json({
			connected: false,
		});
	};

	getPendingInteractions = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const interactions = await getPendingInteractions(userId);
		res.json(interactions);
	};
}
