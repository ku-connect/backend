import { z } from "zod";

export const createProfileRequestSchema = z.object({
	displayName: z.string().max(255),
	bio: z.string().max(255).optional(),
	birthdate: z.coerce.date().optional(),
	faculty: z.string().max(255),
	department: z.string().max(255),
	year: z.string().max(255),
	line: z.string().max(255).optional(),
	facebook: z.string().max(255).optional(),
	instagram: z.string().max(255).optional(),
	other: z.string().max(255).optional(),
	interests: z.array(z.string()).optional().default([]),
});

export const updateProfileRequestSchema = z.object({
	displayName: z.string().max(255),
	bio: z.string().max(255).optional(),
	birthdate: z.coerce.date().optional(),
	faculty: z.string().max(255),
	department: z.string().max(255),
	year: z.string().max(255),
	line: z.string().max(255).optional(),
	facebook: z.string().max(255).optional(),
	instagram: z.string().max(255).optional(),
	other: z.string().max(255).optional(),
});

export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
