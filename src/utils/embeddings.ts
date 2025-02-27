import { embed } from "@nomic-ai/atlas";

export async function generateEmbeddings(text: string) {
  const result = await embed(
    text,
    {
      model: "nomic-embed-text-v1.5",
    },
    process.env.NOMIC_API_KEY!
  );

  return result;
}

// async function getProfiles() {
//   const profile = await getProfileByUserId(
//     "da1a0b93-2035-4328-8ce3-18f136dc2464"
//   );

//   const similarity = sql<number>`1 - (${cosineDistance(
//     profileInPrivate.embedding,
//     profile.embedding!
//   )})`;

//   const profiles = await db
//     .select({
//       id: profileInPrivate.id,
//       displayName: profileInPrivate.displayName,
//       userId: profileInPrivate.userId,
//       similarity,
//     })
//     .from(profileInPrivate)
//     .orderBy((t) => desc(t.similarity));

//   console.log(profiles);

//   return profiles;
// }

// getProfiles();
