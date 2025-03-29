import type { Server } from "socket.io";
import { db } from "../../db";
import notificationRepository from "./repository";
import settingsService from "../settings/service";
import { notificationType } from "./type";
import { findProfile } from "../profile/repository";
import webpush from "../../utils/webPush";

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

	subscribe = async (userId: string, subscription: any) => {
		return notificationRepository.subscribe(db, userId, subscription);
	};

	sendNewInteractionNotification = async (fromUserId: string, toUserId: string) => {
		const settings = await settingsService.getUserSettings(toUserId);
		if (settings.notiNewConnectionRequest === false) {
			console.log(`user id = ${toUserId} disable new connection request noti`);
			return;
		}

		const notification = {
			userId: toUserId,
			type: notificationType.INTERACTION,
			data: {
				title: "Someone Likes You! 💌",
				message: "Explore your connections to find out who.",
				url: "/alert",
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("New interaction notification");
		const result = await notificationRepository.createNotification(db, notification);

		await this.sendNotificationToClient(toUserId, result);
		await this.sendWebpushNotification(toUserId, notification.data);
	};

	sendNewConnectionNotification = async (fromUserId: string, toUserId: string) => {
		const fromUser = await findProfile(db, fromUserId);

		const settings = await settingsService.getUserSettings(toUserId);
		if (settings.notiNewConnectionRequestAccept === false) {
			console.log(`user id = ${toUserId} disable new connection request accept noti`);
			return;
		}

		const notification = {
			userId: toUserId,
			type: notificationType.NEW_CONNECTION,
			data: {
				title: "New Connection! 🎉",
				message: `You are now connected with <span style="color: green;">${fromUser.displayName}</span>. Say hello and start your journey together!`,
				url: "/alert",
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("New connection notification");
		const result = await notificationRepository.createNotification(db, notification);

		await this.sendNotificationToClient(toUserId, result);
		await this.sendWebpushNotification(toUserId, notification.data);
	};

	sendWelcomeNotification = async (toUserId: string) => {
		const notification = {
			userId: toUserId,
			type: notificationType.WELCOME,
			data: {
				title: "Welcome to KU Connect",
				message: `Add more details to your profile and connect faster!`,
				url: "/alert",
			},
			readAt: null,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		};

		console.log("Welcome notification");
		const result = await notificationRepository.createNotification(db, notification);

		await this.sendNotificationToClient(toUserId, result);
		await this.sendWebpushNotification(toUserId, notification.data);
	};

	private sendNotificationToClient = async (userId: string, data: any) => {
		this.io.to(userId).emit(this.key, data);
	};

	private sendWebpushNotification = async (userId: string, payload: any) => {
		const result = await notificationRepository.getSubscriptions(db, userId);
		if (result == null) {
			console.log(`user id = ${userId} not subscribe to web push`);
			return;
		}

		console.log(`start sending web push to user id = ${userId}`);
		for (const data of result) {
			const subscription = {
				endpoint: data.endpoint,
				keys: data.keys,
			};

			await webpush.sendNotification(
				// @ts-ignore
				subscription,
				JSON.stringify({
					title: payload.title,
					body: payload.message,
					// icon: "/icon.png",
					url: payload.url,
				})
			);
		}
		console.log(`finish sending web push to user id = ${userId}`);
	};
}
