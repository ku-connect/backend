import { type Request, type Response } from "express";
import profileService from "./service";

async function getProfilesPaginated(req: Request, res: Response) {
	const { page = 1, size = 10 } = req.query;
	const userId = req.user?.sub;

	const _page = parseInt(page.toString());
	const _size = parseInt(size.toString());

	const profiles = await profileService.getProfiles(_page, _size, userId);

	res.json(profiles);
}

async function getMyProflie(req: Request, res: Response) {
	const userId = req.user?.sub;

	const profileWithInterests = await profileService.getProfileWithInterestsByUserId(userId, userId);

	res.json(profileWithInterests);
}

async function getProfileByUserId(req: Request, res: Response) {
	const userId = req.user?.sub;
	const { id } = req.params;

	const profileWithInterests = await profileService.getProfileWithInterestsByUserId(id, userId);

	res.json(profileWithInterests);
}

async function createProfile(req: Request, res: Response) {
	const profile = req.body;
	const userId = req.user.sub;

	const insertedId = await profileService.createProfile(profile, userId);

	res.json({ id: insertedId });
}

async function updateProfile(req: Request, res: Response) {
	const profile = req.body;
	const userId = req.user.sub;

	await profileService.updateProfile(profile, userId);

	res.sendStatus(200);
}

async function getMyInterests(req: Request, res: Response) {
	const userId = req.user?.sub;

	const result = await profileService.getUserInterests(userId);

	res.json({ interests: result });
}

async function updateMyInterests(req: Request, res: Response) {
	const userId = req.user?.sub;
	const { interests } = req.body;

	const updatedInterests = await profileService.updateUserInterest(userId, interests);

	res.json({ interests: updatedInterests });
}

async function getSystemInterests(req: Request, res: Response) {
	const result = await profileService.getInterests();
	res.json(result);
}

export default {
	getProfilesPaginated,
	getMyProflie,
	getProfileByUserId,
	createProfile,
	updateProfile,
	getMyInterests,
	updateMyInterests,
	getSystemInterests,
};
