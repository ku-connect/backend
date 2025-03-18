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

async function getProfiles(page: number, size: number, userId: string) {
	const profile = await findProfile(db, userId);
	const profiles = await findProfilesSimilarityPaginated(db, page, size, profile);

	const interests = await findInterestsByUserIds(
		db,
		profiles.map((t) => t.userId)
	);

	const interact = await findInteractionsFromUserId(db, userId, false);

	const dislikedUserIds = interact.map((t) => t.toUserId);

	return {
		profiles: profiles
			.filter((profile) => !dislikedUserIds.includes(profile.id))
			.map(tryOmitContactInfo)
			.map((profile) => ({
				...profile,
				interests: interests
					.filter((interest) => interest.userId === profile.userId)
					.map((interest) => omit(interest, ["userId"])),
			})),
	};
}

function tryOmitContactInfo(profile: any) {
	if (profile.settings) {
		if (profile.settings.contactInfoVisibility != "public") {
			return omit(profile, ["facebook", "instagram", "line", "other"]);
		}
	}
	return profile;
}

async function getProfileByUserId(userId: string, me: string) {
	let profile = await findProfileWithSettings(db, userId);

	if (!profile) {
		return null;
	}

	// If the profile is private or connected and not connected to the user then omit contact info
	const connected = await isConnected(me, userId);

	if (
		userId != me &&
		(profile.settings?.contactInfoVisibility == "private" ||
			(profile.settings?.contactInfoVisibility == "connected" && !connected))
	) {
		return omit(profile, ["facebook", "instagram", "line", "other"]);
	}

	return profile;
}

async function getProfileWithInterestsByUserId(userId: string, me: string) {
	const profile = await getProfileByUserId(userId, me);
	if (!profile) {
		return null;
	}

	const interests = await findInterestsByUserId(db, userId);

	return {
		...profile,
		interests,
	};
}

async function createProfile(profile: CreateProfileRequest, userId: string) {
	const interests = profile.interests;
	let insertedId: string | undefined;

	const existedProfile = await findProfile(db, userId);
	if (existedProfile) {
		throw new Error("Profile already created");
	}

	await db.transaction(async (tx) => {
		const user = await getUserById(userId);
		const userMetaData = user.rawUserMetaData as any;

		// Generate embeddings
		const existingInterests = await findInterestsByIds(tx, interests);
		const embeddings = await generateEmbeddings(generatePrompt(existingInterests.map((interest) => interest.name)));

		if (!profile.displayName) {
			profile.displayName = userMetaData["name"];
		}
		if (!profile.image) {
			profile.image = userMetaData["avatar_url"];
		}

		const result = await createProfileRepo(tx, profile, userId, embeddings);
		insertedId = result.insertedId;

		if (interests.length > 0) {
			await createUserInterests(tx, userId, interests);
		}

		await settingsService.createDefaultUserSettings(userId);
	});

	return insertedId;
}

function generatePrompt(interests: string[]) {
	return `I interested in ${interests.join(", ")}`;
}

async function updateProfile(profile: UpdateProfileRequest, userId: string) {
	await updateProfileRepo(db, profile, userId);

	return getProfileWithInterestsByUserId(userId, userId);
}

async function getUserInterests(userId: string) {
	const interests = await findInterestsByUserId(db, userId);
	return interests.map((interest) => omit(interest, ["userId"]));
}

async function updateUserInterest(userId: string, interestIds: string[]) {
	await db.transaction(async (tx) => {
		// clean up user interests
		await deleteUserInterests(tx, userId);

		// update user interests (if < 0 mean user remove all their interests)
		if (interestIds.length > 0) {
			await createUserInterests(tx, userId, interestIds);

			// generate embeddings
			const existingInterests = await findInterestsByIds(tx, interestIds);
			const embeddings = await generateEmbeddings(generatePrompt(existingInterests.map((interest) => interest.name)));

			await updateProfileEmbedding(tx, userId, embeddings);
		}
	});

	return getUserInterests(userId);
}

async function getInterests() {
	return findInterests(db);
}

export default {
	getProfiles,
	getProfileByUserId,
	getProfileWithInterestsByUserId,
	createProfile,
	updateProfile,
	getUserInterests,
	updateUserInterest,
	getInterests,
};
