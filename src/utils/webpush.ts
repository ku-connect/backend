import webpush from "web-push";
import { config } from "../config";

const vapidKeys = {
	publicKey: config.VAPID_PUBLIC_KEY,
	privateKey: config.VAPID_PRIVATE_KEY,
};

// Tell web push about our application server
webpush.setVapidDetails("mailto:nonzagreanthai@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);

export default webpush;
