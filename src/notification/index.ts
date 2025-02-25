import express, { type Request, type Response } from "express";
import { authorize } from "../middleware";
import { NotificationService } from "./service";
import { asyncHandler } from "../utils";

export function getNotificationRoute(notificationService: NotificationService) {
  const notificationRoute = express.Router();

  notificationRoute.use(authorize);

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
    asyncHandler(async (req: Request, res: Response) => {
      const { page = 1, size = 10 } = req.query;
      const userId = req.user?.sub;

      const _page = parseInt(page.toString());
      const _size = parseInt(size.toString());

      const myNotifications = await notificationService.getMyNotification(
        userId,
        _page,
        _size
      );

      res.json(myNotifications.map((n) => ({ ...n, id: n.id.toString() })));
    })
  );

  return notificationRoute;
}
