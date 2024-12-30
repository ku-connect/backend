import express, { type Request, type Response } from "express";
import {
  interestInPrivate,
  profileInPrivate,
  userInterestInPrivate,
} from "../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../db";
import { eq } from "drizzle-orm";

import { z } from "zod";
import { authorize } from "../middleware";

export const profileRoute = express.Router();

const profileRequestSchema = z.object({
  faculty: z.string().min(1, "Faculty should not be empty"),
  department: z.string().min(1, "Department should not be empty"),
  year: z.string().min(1, "Year should not be empty"),
  name: z.string().optional(),
  bio: z.string().optional(),
  birthday: z.coerce.date().optional(),
  line: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  other: z.string().optional(),
  interests: z.array(z.number()).default([]),
});

type ProfileRequest = z.infer<typeof profileRequestSchema>;

profileRoute.get("/api/profiles", async (req: Request, res: Response) => {
  const { page = 1, size = 10 } = req.query;

  const _page = parseInt(page.toString());
  const _size = parseInt(size.toString());
  const offset = (_page - 1) * _size;

  const profiles = await db
    .select()
    .from(profileInPrivate)
    .limit(_size)
    .offset(offset);

  // TODO: Recommendation

  res.json(profiles);
});

// Get my profile
profileRoute.get(
  "/api/profiles/me",
  authorize,
  async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    const profile = await db
      .select()
      .from(profileInPrivate)
      .where(eq(profileInPrivate.userId, userId))
      .then(takeUniqueOrThrow);

    const interests = await db
      .select({ id: interestInPrivate.id, name: interestInPrivate.name })
      .from(userInterestInPrivate)
      .innerJoin(
        interestInPrivate,
        eq(userInterestInPrivate.interestId, interestInPrivate.id)
      )
      .where(eq(userInterestInPrivate.userId, userId));

    res.json({
      ...profile,
      interests,
    });
  }
);

profileRoute.post(
  "/api/profiles",
  authorize,
  async (req: Request, res: Response) => {
    const profile: ProfileRequest = req.body;

    const { data, error } = profileRequestSchema.safeParse(profile);
    if (!data || error) {
      res.status(400).json(error);
      return;
    }

    const interests = data.interests;
    const userId = req.user.sub;

    // Check if profile already created
    const existedProfile = await db
      .select()
      .from(profileInPrivate)
      .where(eq(profileInPrivate.userId, userId))
      .then(takeUniqueOrThrow);

    if (existedProfile) {
      res.status(400).json({
        message: "Profile already created",
      });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.insert(profileInPrivate).values({
        ...data,
        userId,
      });

      if (interests.length > 0) {
        await tx.insert(userInterestInPrivate).values(
          interests.map((interestId) => ({
            userId,
            interestId,
          }))
        );
      }
    });

    res.sendStatus(200);
  }
);

profileRoute.put(
  "/api/profiles",
  authorize,
  async (req: Request, res: Response) => {
    const profile: ProfileRequest = req.body;

    const { data, error } = profileRequestSchema.safeParse(profile);
    if (!data || error) {
      res.status(400).json(error);
      return;
    }
    const userId = req.user.sub;

    await db.transaction(async (tx) => {
      await tx
        .update(profileInPrivate)
        .set({
          ...data,
          userId,
        })
        .where(eq(profileInPrivate.userId, userId));
    });

    res.sendStatus(200);
  }
);
