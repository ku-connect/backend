import { z } from "zod";

export const profileRequestSchema = z.object({
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

export type ProfileRequest = z.infer<typeof profileRequestSchema>;
