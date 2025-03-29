import type { Server } from "socket.io";
import { db } from "../../db";
import notificationRepository from "./repository";
import { notificationType } from "./type";
import { getUserById } from "../user/service";
import { findProfile } from "../profile/repository";
export class NotificationService {
	private io: Server;
	private key = "notification";

	constructor(io: Server) {
		this.io = io;
	}

	getMyNotification = async (userId: string, page: number, size: number) => {
		return notificationRepository.findMyNotificationPaginated(db, userId, page, size);
	};

	readNotifications = async (notificationIds: string[]) => {
		return notificationRepository.readNotifications(db, notificationIds);
	};

	sendNewInteractionNotification = async (fromUserId: string, toUserId: string) => {
		const notification = {
			userId: toUserId,
			type: notificationType.INTERACTION,
			data: {
				title: "Someone Likes You! 💌",
				message: "Explore your connections to find out who.",
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("New interaction notification");
		const result = await notificationRepository.createNotification(db, notification);

		this.sendNotificationToClient(result);
	};

	sendNewConnectionNotification = async (fromUserId: string, toUserId: string) => {
		const fromUser = await findProfile(db, fromUserId);

		const notification = {
			userId: toUserId,
			type: notificationType.NEW_CONNECTION,
			data: {
				title: "New Connection! 🎉",
				message: `You are now connected with <span style="color: green;">${fromUser.displayName}</span>. Say hello and start your journey together!`,
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("New connection notification");
		const result = await notificationRepository.createNotification(db, notification);

		this.sendNotificationToClient(result);
	};

	sendWelcomeNotification = async (toUserId: string) => {
		const notification = {
			userId: toUserId,
			type: notificationType.WELCOME,
			data: {
				title: "Welcome to KU Connect",
				message: `Add more details to your profile and connect faster!`,
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("Welcome notification");
		const result = await notificationRepository.createNotification(db, notification);

		this.sendNotificationToClient(result);
	};

	private sendNotificationToClient = async (data: any) => {
		this.io.emit(this.key, data);
	};
}
