import "dotenv/config";

import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import { StatusCodes } from "http-status-codes";
import { config } from "./config";
import { NotificationEvent } from "./modules/notification/event";
import { NotificationService } from "./modules/notification/service";
import { registerRoute } from "./routes";
import { swaggerDocs } from "./swagger";

import jwt, { type JwtPayload } from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: config.FRONTEND_URL,
		methods: ["GET", "POST"],
	},
});

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
	// Initialize service provider
	const notiService = new NotificationService(io);
	const notificationEvent = new NotificationEvent(notiService);

	console.log("[Test] Sending Notification...");

	notificationEvent.sendNewInteractionEvent(
		"2f740ed7-b90d-45ac-9a59-85ebd669391a",
		"2f740ed7-b90d-45ac-9a59-85ebd669391a"
	);

	// notificationEvent.sendNewConnectionEvent(
	// 	"2f740ed7-b90d-45ac-9a59-85ebd669391a",
	// 	"2f740ed7-b90d-45ac-9a59-85ebd669391a"
	// );

	// notificationEvent.sendWelcomeEvent("2f740ed7-b90d-45ac-9a59-85ebd669391a");

	console.log("[Test] Finish");
	res.sendStatus(StatusCodes.OK);
});

io.on("connection", (socket) => {
	const token = socket.handshake.auth.token;

	// @ts-ignore
	jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
		if (err) {
			console.error(err);
			throw new Error("unauthorized");
		}

		const userId = decoded.sub;
		socket.join(decoded.sub);
		console.log(`user id = ${userId} joined socket`);
	});

	console.log("Client connected");
});

swaggerDocs(app, PORT);

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
