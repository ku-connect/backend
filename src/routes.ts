import express, { type Express } from "express";
import { authorize, valdiateReq } from "./middleware";
import profileController from "./modules/profile/controller";
import settingsController from "./modules/settings/controller";
import { asyncHandler } from "./utils/utils";
import { profileRequestSchema } from "./modules/profile/type";
import { settingsRequestSchema } from "./modules/settings/type";
import { InteractionController } from "./modules/interactions/controller";
import { NotificationService } from "./modules/notification/service";
import { NotificationEvent } from "./modules/notification/event";
import type { Server } from "socket.io";
import { interactionRequestSchema } from "./modules/interactions/type";
import { NotificationController } from "./modules/notification/controller";
import { StatusCodes } from "http-status-codes";
import { readNotificationSchema } from "./modules/notification/type";

export function registerRoute(app: Express, io: Server) {
  const profileRoute = express.Router();
  const interestRoute = express.Router();
  const settingsRoute = express.Router();
  const meRoute = express.Router();
  const interactionsRoute = express.Router();
  const notificationRoute = express.Router();

  // Initialize service provider
  const notificationService = new NotificationService(io);
  const notificationEvent = new NotificationEvent(notificationService);
  const notificationController = new NotificationController(
    notificationService
  );
  const interactionController = new InteractionController(notificationEvent);

  profileRoute.use(authorize);
  meRoute.use(authorize);
  settingsRoute.use(authorize);
  interactionsRoute.use(authorize);
  notificationRoute.use(authorize);

  /**
   * @swagger
   * /api/profiles:
   *   get:
   *     description: List profile
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: Returns a list of profiles
   *       401:
   *         description: Unauthorized
   */
  profileRoute.get("/", asyncHandler(profileController.getProfilesPaginated));

  /**
   * @swagger
   * /api/me/profile:
   *   get:
   *     description: Get my profile
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: Returns a profile
   *       401:
   *         description: Unauthorized
   */
  meRoute.get("/profile", asyncHandler(profileController.getMyProflie));

  /**
   * @swagger
   * /api/profiles/:id:
   *   get:
   *     description: Get other user profile
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: Returns a profile
   *       401:
   *         description: Unauthorized
   */
  profileRoute.get("/:id", asyncHandler(profileController.getProfileByUserId));

  /**
   * @swagger
   * /api/profiles:
   *   post:
   *     description: Create a profile
   *     tags: [Profile]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               faculty:
   *                 type: string
   *                 example: "Science"
   *               department:
   *                 type: string
   *                 example: "Computer Science"
   *               year:
   *                 type: string
   *                 example: "4"
   *               displayName:
   *                 type: string
   *                 example: "Non Weerawong"
   *               bio:
   *                 type: string
   *                 example: "Passionate about software development and machine learning."
   *               birthdate:
   *                 type: string
   *                 format: date-time
   *                 example: "2000-01-01T00:00:00Z"
   *               line:
   *                 type: string
   *                 example: "@nonzagreanthai"
   *               facebook:
   *                 type: string
   *                 format: uri
   *                 example: "https://facebook.com/non.weerawong"
   *               instagram:
   *                 type: string
   *                 format: uri
   *                 example: "https://instagram.com/nonzagreanthai"
   *               other:
   *                 type: string
   *                 example: ""
   *               interests:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: []
   *     responses:
   *       200:
   *         description: Id of the created profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                   example: "077d63cd-b87c-4ded-8c28-11206d0b6ea1"
   *       401:
   *         description: Unauthorized
   */
  profileRoute.post(
    "/",
    valdiateReq(profileRequestSchema),
    asyncHandler(profileController.createProfile)
  );

  /**
   * @swagger
   * /api/profiles:
   *   put:
   *     description: Update a profile replace all fields
   *     tags: [Profile]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               faculty:
   *                 type: string
   *                 example: "Science"
   *               department:
   *                 type: string
   *                 example: "Computer Science"
   *               year:
   *                 type: string
   *                 example: "4"
   *               displayName:
   *                 type: string
   *                 example: "Non Weerawong"
   *               bio:
   *                 type: string
   *                 example: "Passionate about software development and machine learning."
   *               birthdate:
   *                 type: string
   *                 format: date-time
   *                 example: "2000-01-01T00:00:00Z"
   *               line:
   *                 type: string
   *                 example: "@nonzagreanthai"
   *               facebook:
   *                 type: string
   *                 format: uri
   *                 example: "https://facebook.com/non.weerawong"
   *               instagram:
   *                 type: string
   *                 format: uri
   *                 example: "https://instagram.com/nonzagreanthai"
   *               other:
   *                 type: string
   *                 example: ""
   *               interests:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: []
   *     responses:
   *       200:
   *         description: OK
   *       401:
   *         description: Unauthorized
   */
  profileRoute.put(
    "/",
    valdiateReq(profileRequestSchema),
    asyncHandler(profileController.updateProfile)
  );

  /**
   * @swagger
   * /api/profiles/me/interests:
   *   get:
   *     description: Get user interests
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: OK
   *       401:
   *         description: Unauthorized
   */
  profileRoute.get(
    "/me/interests",
    asyncHandler(profileController.getMyInterests)
  );

  /**
   * @swagger
   * /api/profiles/me/interests:
   *   put:
   *     description: Update user interests replace old interests with new interests
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: OK
   *       401:
   *         description: Unauthorized
   */
  profileRoute.put(
    "/me/interests",
    asyncHandler(profileController.updateMyInterests)
  );

  /**
   * @swagger
   * /api/interests:
   *   get:
   *     description: Get KU Connect interests
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: OK
   *       401:
   *         description: Unauthorized
   */
  interestRoute.get("/", asyncHandler(profileController.getSystemInterests));

  /**
   * @swagger
   * /api/settings/me:
   *   get:
   *     description: Get my settings
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Returns settings
   */
  settingsRoute.get("/me", asyncHandler(settingsController.getMySettings));

  /**
   * @swagger
   * /api/settings/me:
   *   put:
   *     description: Update settings
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Returns updated settings
   */
  settingsRoute.put(
    "/",
    valdiateReq(settingsRequestSchema),
    asyncHandler(settingsController.updateMySettings)
  );

  /**
   * @swagger
   * /api/interactions:
   *   post:
   *     description: Interact with a user
   *     tags: [Interactions]
   *     responses:
   *       200:
   *         description: OK
   */
  interactionsRoute.post(
    "/",
    valdiateReq(interactionRequestSchema),
    asyncHandler(interactionController.createInteraction)
  );

  /**
   * @swagger
   * /api/notifications:
   *   put:
   *     description: Get my notifications
   *     tags: [Notification]
   *     responses:
   *       200:
   *         description: Returns a list of paginated notifications
   */
  notificationRoute.get(
    "/",
    asyncHandler(notificationController.getMyNotifications)
  );

  /**
   * @swagger
   * /api/notifications/read:
   *   patch:
   *     description: Read notifications
   *     tags: [Notification]
   *     responses:
   *       200:
   *         description: OK
   */
  notificationRoute.patch(
    "/read",
    valdiateReq(readNotificationSchema),
    asyncHandler(notificationController.readNotifications)
  );

  // Define routes
  app.use("/api/profiles", profileRoute);
  app.use("/api/me", meRoute);
  app.use("/api/interests", interestRoute);
  app.use("/api/interactions", interactionsRoute);
  app.use("/api/notifications", notificationRoute);
  app.use("/api/settings", settingsRoute);

  app.get("/healthz", (_, res) => res.sendStatus(StatusCodes.OK));
}
