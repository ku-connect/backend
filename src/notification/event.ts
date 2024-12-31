import { EventEmitter } from "events";

export const notificationEvent = new EventEmitter();

export const events = {
  NEW_MATCH: "NEW_MATCH",
};

notificationEvent.on("NEW_MATCH", async (data) => {
  console.log("Sending notification", data);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Notification received", data);
});
