import { EventEmitter } from "events";

export const notificationEvent = new EventEmitter();

export const events = {
  INTERACTION: "INTERACTION",
};

notificationEvent.on(events.INTERACTION, async (data) => {
  console.log("Send new interaction notification");
});
