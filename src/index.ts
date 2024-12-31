import express from "express";
import { EventEmitter } from "events";

import { profileRoute } from "./profile";
import { events, notificationEvent } from "./notification/event";

const app = express();

const PORT = process.env.PORT || "4000";

// Middleware to parse JSON data
app.use(express.json());

// Define routes
app.use("/api/profiles", profileRoute);

app.get("/healthz", (_, res) => res.sendStatus(200));

app.get("/noti", async (req, res) => {
  notificationEvent.emit(events.NEW_MATCH, { message: "Hello" });
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
