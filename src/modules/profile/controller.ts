import { type Request, type Response } from "express";
import ProfileService from "./service";
class ProfileController {
	private profileService: ProfileService;

	constructor(profileService: ProfileService) {
		this.profileService = profileService;
	}

	getProfilesPaginated = async (req: Request, res: Response) => {
		const { page = 1, size = 10 } = req.query;
		const userId = req.user?.sub;

		const _page = parseInt(page.toString());
		const _size = parseInt(size.toString());

		const profiles = await this.profileService.getProfiles(_page, _size, userId);
		res.json(profiles);
	};

	getMyProfile = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const profileWithInterests = await this.profileService.getProfileWithInterestsByUserId(userId, userId);
		res.json(profileWithInterests);
	};

	getProfileByUserId = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const { id } = req.params;
		const profileWithInterests = await this.profileService.getProfileWithInterestsByUserId(id, userId);
		res.json(profileWithInterests);
	};

	createProfile = async (req: Request, res: Response) => {
		const profile = req.body;
		const userId = req.user.sub;
		const insertedId = await this.profileService.createProfile(profile, userId);
		res.json({ id: insertedId });
	};

	updateProfile = async (req: Request, res: Response) => {
		const profile = req.body;
		const userId = req.user.sub;
		const updatedProfile = await this.profileService.updateProfile(profile, userId);
		res.json(updatedProfile);
	};

	getMyInterests = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const result = await this.profileService.getUserInterests(userId);
		res.json({ interests: result });
	};

	updateMyInterests = async (req: Request, res: Response) => {
		const userId = req.user?.sub;
		const { interests } = req.body;
		const updatedInterests = await this.profileService.updateUserInterest(userId, interests);
		res.json({ interests: updatedInterests });
	};

	getSystemInterests = async (req: Request, res: Response) => {
		const result = await this.profileService.getInterests();
		res.json(result);
	};
}

export default ProfileController;
