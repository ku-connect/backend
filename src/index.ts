import "dotenv/config";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { NotificationService } from "./modules/notification/service";
import { NotificationEvent } from "./modules/notification/event";
import { StatusCodes } from "http-status-codes";
import { swaggerDocs } from "./swagger";
import { config } from "./config";
import { registerRoute } from "./routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Initialize service provider
const notiService = new NotificationService(io);
const notificationEvent = new NotificationEvent(notiService);

const PORT = config.PORT;

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

registerRoute(app, io);

// Route for test purpose
app.post("/test/noti", async (req, res) => {
  console.log("Sending Notification...");

  notificationEvent.sendNewInteractionEvent(
    "2f740ed7-b90d-45ac-9a59-85ebd669391a",
    "2f740ed7-b90d-45ac-9a59-85ebd669391a"
  );

  console.log("Finish");
  res.sendStatus(StatusCodes.OK);
});

io.on("connection", (socket) => {
  console.log("Client connected");
});

swaggerDocs(app, PORT);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
