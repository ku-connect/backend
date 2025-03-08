import { type Request, type Response } from "express";
import settingsService from "./service";

async function getMySettings(req: Request, res: Response) {
	const userId = req.user?.sub;

	const settings = await settingsService.getUserSettings(userId);

	res.json(settings);
}

async function updateMySettings(req: Request, res: Response) {
	const settings = req.body;
	const userId = req.user.sub;

	const result = await settingsService.updateUserSettings(settings, userId);

	res.json(result);
}

export default {
	getMySettings,
	updateMySettings,
};
