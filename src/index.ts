import "dotenv/config";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { profileRoute } from "./profile";
import { NotificationService } from "./notification/service";
import { NotificationEvent } from "./notification/event";
import { getNotificationRoute } from "./notification";
import { getInteractionRoute } from "./interactions";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Initialize service provider
const notiService = new NotificationService(io);
const notificationEvent = new NotificationEvent(notiService);

const PORT = process.env.PORT || "4000";

// Middleware to parse JSON data
app.use(express.json());
app.use(cors());

// Global Error Handling
// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

// Define routes
app.use("/api/profiles", profileRoute);
app.use("/api/interactions", getInteractionRoute(notificationEvent));
app.use("/api/notifications", getNotificationRoute(notiService));

app.get("/healthz", (_, res) => res.sendStatus(200));

// Route for test purpose
app.post("/test/noti", async (req, res) => {
  console.log("Sending Notification...");

  notificationEvent.sendNewInteractionEvent(
    "2f740ed7-b90d-45ac-9a59-85ebd669391a",
    "2f740ed7-b90d-45ac-9a59-85ebd669391a"
  );

  console.log("Finish");
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("Client connected");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
