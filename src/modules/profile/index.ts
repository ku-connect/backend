import express, { type Request, type Response } from "express";
import { authorize, valdiateReq } from "../../middleware";
import {
  createProfile,
  getInterests,
  getProfiles,
  getProfileWithInterestsByUserId,
  getUserInterests,
  updateProfile,
  updateUserInterest,
} from "./service";
import { profileRequestSchema } from "./type";
import { asyncHandler } from "../../utils/utils";

export const profileRoute = express.Router();
export const interestRoute = express.Router();

// route for getting current user info
export const meRoute = express.Router();

profileRoute.use(authorize);
meRoute.use(authorize);

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
profileRoute.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, size = 10 } = req.query;
    const userId = req.user?.sub;

    const _page = parseInt(page.toString());
    const _size = parseInt(size.toString());

    const profiles = await getProfiles(_page, _size, userId);

    res.json(profiles);
  })
);

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
meRoute.get(
  "/profile",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    console.log(userId);
    const profileWithInterests = await getProfileWithInterestsByUserId(
      userId,
      userId
    );

    res.json(profileWithInterests);
  })
);

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
profileRoute.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;
    const { id } = req.params;

    const profileWithInterests = await getProfileWithInterestsByUserId(
      id,
      userId
    );

    res.json(profileWithInterests);
  })
);

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
  asyncHandler(async (req: Request, res: Response) => {
    const profile = req.body;
    const userId = req.user.sub;

    const insertedId = await createProfile(profile, userId);

    res.json({ id: insertedId });
  })
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
  asyncHandler(async (req: Request, res: Response) => {
    const profile = req.body;
    const userId = req.user.sub;

    await updateProfile(profile, userId);

    res.sendStatus(200);
  })
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
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    const result = await getUserInterests(userId);

    res.json({ interests: result });
  })
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
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;
    const { interests } = req.body;

    await updateUserInterest(userId, interests);

    res.sendStatus(200);
  })
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
interestRoute.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await getInterests();
    res.json(result);
  })
);
