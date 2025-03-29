import { type Request, type Response } from "express";
import { NotificationService } from "./service";
import { StatusCodes } from "http-status-codes";
import type { ReadNotificationRequest } from "./type";

export class NotificationController {
	private notificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	/**
	 * Allow clients to subscribe to this application server for notifications
	 * via web-push
	 */
	subscribe = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const subscription = req.body.subscription;

		console.log(userId, subscription);

		await this.notificationService.subscribe(userId, subscription);

		res.json({ success: true });
	};

	getMyNotifications = async (req: Request, res: Response) => {
		const { page = 1, size = 10 } = req.query;
		const userId = req.user?.sub;

		const _page = parseInt(page.toString());
		const _size = parseInt(size.toString());

		const myNotifications = await this.notificationService.getMyNotification(userId, _page, _size);

		res.json(myNotifications.map((n) => ({ ...n, id: n.id.toString() })));
	};

	readNotifications = async (req: Request, res: Response) => {
		const { notificationIds } = req.body as ReadNotificationRequest;

		await this.notificationService.readNotifications(notificationIds);

		res.sendStatus(StatusCodes.OK);
	};
}
