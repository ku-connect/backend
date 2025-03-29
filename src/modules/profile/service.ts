import { db } from "../../db";
import type { CreateProfileRequest, UpdateProfileRequest } from "./type";
import settingsService from "../settings/service";
import { generateEmbeddings } from "../../utils/embeddings";
import { omit } from "lodash";
import { isConnected } from "../interactions/service";
import {
	findInterestsByUserId,
	findInterestsByUserIds,
	findProfile,
	findProfilesSimilarityPaginated,
	findProfileWithSettings,
	createProfile as createProfileRepo,
	updateProfile as updateProfileRepo,
	createUserInterests,
	findInterestsByIds,
	deleteUserInterests,
	updateProfileEmbedding,
	findInterests,
} from "./repository";
import { findInteractionsFromUserId } from "../interactions/repository";
import { getUserById } from "../user/service";
import type { NotificationEvent } from "../notification/event";

class ProfileService {
	private notificationEvent: NotificationEvent;

	constructor(notificationEvent: NotificationEvent) {
		this.notificationEvent = notificationEvent;
	}

	getProfiles = async (page: number, size: number, userId: string) => {
		const profile = await findProfile(db, userId);
		const interact = await findInteractionsFromUserId(db, userId);
		const excludeIds = interact.map((t) => t.toUserId);

		const profiles = await findProfilesSimilarityPaginated(db, page, size, profile, excludeIds);
		const interests = await findInterestsByUserIds(
			db,
			profiles.map((t) => t.userId)
		);

		return {
			profiles: profiles.map(this.tryOmitContactInfo).map((profile) => ({
				...profile,
				interests: interests
					.filter((interest) => interest.userId === profile.userId)
					.map((interest) => omit(interest, ["userId"])),
			})),
		};
	};

	tryOmitContactInfo = (profile: any) => {
		if (profile.settings?.contactInfoVisibility !== "public") {
			return omit(profile, ["facebook", "instagram", "line", "other"]);
		}
		return profile;
	};

	getProfileByUserId = async (userId: string, me: string) => {
		let profile = await findProfileWithSettings(db, userId);
		if (!profile) return null;

		const connected = await isConnected(me, userId);
		if (
			userId !== me &&
			(profile.settings?.contactInfoVisibility === "private" ||
				(profile.settings?.contactInfoVisibility === "connected" && !connected))
		) {
			return omit(profile, ["facebook", "instagram", "line", "other"]);
		}

		return profile;
	};

	getProfileWithInterestsByUserId = async (userId: string, me: string) => {
		const profile = await this.getProfileByUserId(userId, me);
		if (!profile) return null;
		const interests = await findInterestsByUserId(db, userId);
		return { ...profile, interests };
	};

	createProfile = async (profile: CreateProfileRequest, userId: string) => {
		const interests = profile.interests;
		let insertedId: string | undefined;

		const existedProfile = await findProfile(db, userId);
		if (existedProfile) throw new Error("Profile already created");

		await db.transaction(async (tx) => {
			const user = await getUserById(userId);
			const userMetaData = user.rawUserMetaData as any;

			const existingInterests = await findInterestsByIds(tx, interests);
			const embeddings = await generateEmbeddings(
				this.generatePrompt(existingInterests.map((interest) => interest.name))
			);

			profile.displayName ||= userMetaData["name"];
			profile.image ||= userMetaData["avatar_url"];

			const result = await createProfileRepo(tx, profile, userId, embeddings);
			insertedId = result.insertedId;

			if (interests.length > 0) await createUserInterests(tx, userId, interests);
			await settingsService.createDefaultUserSettings(userId);
		});

		this.notificationEvent.sendWelcomeEvent(userId);

		return insertedId;
	};

	generatePrompt = (interests: string[]) => {
		return `I am interested in ${interests.join(", ")}`;
	};

	updateProfile = async (profile: UpdateProfileRequest, userId: string) => {
		await updateProfileRepo(db, profile, userId);
		return this.getProfileWithInterestsByUserId(userId, userId);
	};

	getUserInterests = async (userId: string) => {
		const interests = await findInterestsByUserId(db, userId);
		return interests.map((interest) => omit(interest, ["userId"]));
	};

	updateUserInterest = async (userId: string, interestIds: string[]) => {
		await db.transaction(async (tx) => {
			await deleteUserInterests(tx, userId);
			if (interestIds.length > 0) {
				await createUserInterests(tx, userId, interestIds);
				const existingInterests = await findInterestsByIds(tx, interestIds);
				const embeddings = await generateEmbeddings(
					this.generatePrompt(existingInterests.map((interest) => interest.name))
				);
				await updateProfileEmbedding(tx, userId, embeddings);
			}
		});

		return this.getUserInterests(userId);
	};

	getInterests = async () => {
		return findInterests(db);
	};
}

export default ProfileService;
