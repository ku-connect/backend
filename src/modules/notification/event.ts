import { EventEmitter } from "events";
import { NotificationService } from "./service";
import { notificationType } from "./type";

export class NotificationEvent {
	private event = new EventEmitter();
	private notificationService: NotificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;

		this.event.on(notificationType.INTERACTION, async (fromUserId, toUserId) => {
			await this.notificationService.sendNewInteractionNotification(fromUserId, toUserId);
		});

		this.event.on(notificationType.NEW_CONNECTION, async (fromUserId, toUserId) => {
			await this.notificationService.sendNewConnectionNotification(fromUserId, toUserId);
		});

		this.event.on(notificationType.WELCOME, async (userId) => {
			await this.notificationService.sendWelcomeNotification(userId);
		});
	}

	sendNewInteractionEvent = (fromUserId: string, toUserId: string) => {
		this.event.emit(notificationType.INTERACTION, fromUserId, toUserId);
	};

	sendNewConnectionEvent = (fromUserId: string, toUserId: string) => {
		this.event.emit(notificationType.NEW_CONNECTION, fromUserId, toUserId);
	};

	sendWelcomeEvent = (userId: string) => {
		this.event.emit(notificationType.WELCOME, userId);
	};
}
