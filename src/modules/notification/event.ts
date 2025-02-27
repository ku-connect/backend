import { EventEmitter } from "events";
import { NotificationService } from "./service";

export const events = {
  INTERACTION: "INTERACTION",
};

export class NotificationEvent {
  private event = new EventEmitter();
  private notificationService: NotificationService;

  public constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;

    this.event.on(events.INTERACTION, async (fromUserId, toUserId) => {
      await this.notificationService.sendNewInteractionNotification(
        fromUserId,
        toUserId
      );
    });
  }

  public sendNewInteractionEvent(fromUserId: string, toUserId: string) {
    this.event.emit(events.INTERACTION, fromUserId, toUserId);
  }
}
