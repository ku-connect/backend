import express, { type Request, type Response } from "express";
import { authorize } from "../middleware";
import {
  createProfile,
  getProfileByUserId,
  getProfiles,
  getProfileWithInterestsByUserId,
  updateProfile,
} from "./service";
import { profileRequestSchema } from "./type";

export const profileRoute = express.Router();

profileRoute.use(authorize);

profileRoute.get("/api/profiles", async (req: Request, res: Response) => {
  const { page = 1, size = 10 } = req.query;

  const _page = parseInt(page.toString());
  const _size = parseInt(size.toString());

  const profiles = await getProfiles(_page, _size);

  // TODO: Recommendation

  res.json(profiles);
});

// Get my profile
profileRoute.get("/api/profiles/me", async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  const profileWithInterests = await getProfileWithInterestsByUserId(userId);

  res.json(profileWithInterests);
});

profileRoute.post("/api/profiles", async (req: Request, res: Response) => {
  const profile = req.body;

  const { data, error } = profileRequestSchema.safeParse(profile);
  if (!data || error) {
    res.status(400).json(error);
    return;
  }

  const userId = req.user.sub;

  // Check if profile already created
  const existedProfile = await getProfileByUserId(userId);
  if (existedProfile) {
    res.status(400).json({
      message: "Profile already created",
    });
    return;
  }

  await createProfile(data, userId);

  res.sendStatus(200);
});

profileRoute.put("/api/profiles", async (req: Request, res: Response) => {
  const profile = req.body;

  const { data, error } = profileRequestSchema.safeParse(profile);
  if (!data || error) {
    res.status(400).json(error);
    return;
  }
  const userId = req.user.sub;

  await updateProfile(data, userId);

  res.sendStatus(200);
});
