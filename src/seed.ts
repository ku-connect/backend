import { profileInPrivate, userInterestInPrivate } from "../drizzle/schema";
import { db } from "./db";
import { generateEmbeddings } from "./utils/embeddings";

async function seed() {
  const mockUserIds = [
    "160004d1-3f39-4ba4-8a41-db70eb0c3142",
    "69a13e43-40dc-4529-9622-a5535a76a794",
    "e60d93c9-cf98-42bc-9278-eb667be41a66",
    "296a8061-2a64-49df-a6c1-aab4fe84b44c",
    "86a5da07-b0af-4ecf-91ab-22b99de85de7",
    "c013059a-4155-41fd-8ae7-77d73d867eed",
    "7b78c037-175d-4589-8641-092d78de691e",
    "d903a23d-8257-4651-825a-0f7d96547380",
    "da1a0b93-2035-4328-8ce3-18f136dc2464",
    "8e7d34a1-bdc1-4dcc-b651-e0a05b388117",
  ];

  const mockInterests = {
    "160004d1-3f39-4ba4-8a41-db70eb0c3142": [
      {
        id: "8563b06c-81fb-4858-b305-60a8c2881028",
        name: "📚 Study Groups",
      },
      {
        id: "1f280ec0-2ce4-4ddb-8f6a-07f79efe1cce",
        name: "🎮 Gaming",
      },
    ],
    "69a13e43-40dc-4529-9622-a5535a76a794": [
      {
        id: "1f280ec0-2ce4-4ddb-8f6a-07f79efe1cce",
        name: "🎮 Gaming",
      },
      {
        id: "319346a1-d2f6-4d84-b6c8-6a856c4f95c0",
        name: "💻 Coding",
      },
      {
        id: "8d2cb28e-7b4b-4397-94b1-e2b0c75c8745",
        name: "🏆 Competitions",
      },
    ],
    "e60d93c9-cf98-42bc-9278-eb667be41a66": [
      {
        id: "1f280ec0-2ce4-4ddb-8f6a-07f79efe1cce",
        name: "🎮 Gaming",
      },
      {
        id: "8563b06c-81fb-4858-b305-60a8c2881028",
        name: "📚 Study Groups",
      },
      {
        id: "4a868edb-7314-4801-b8df-1efd60fd7ff6",
        name: "🎶 Music",
      },
    ],
    "296a8061-2a64-49df-a6c1-aab4fe84b44c": [
      {
        id: "da72f82a-f679-47d6-b0c7-33ff3ea1e3bf",
        name: "🌾 Gardening",
      },
      {
        id: "13f1c955-bcc7-4f3f-8f7e-ddf43cd56c24",
        name: "🍹 Mixology",
      },
      {
        id: "0ce188cb-baff-4843-931e-c6489feb0225",
        name: "🎤 Singing",
      },
    ],
    "86a5da07-b0af-4ecf-91ab-22b99de85de7": [
      {
        id: "0ce188cb-baff-4843-931e-c6489feb0225",
        name: "🎤 Singing",
      },
      {
        id: "e24dfc99-e2fb-4edf-b03c-522191782595",
        name: "🎥 Filmmaking",
      },
    ],
    "c013059a-4155-41fd-8ae7-77d73d867eed": [
      {
        id: "31d2d594-48c4-463a-8495-f1fe84d4d840",
        name: "🧘‍♂️ Meditation",
      },
    ],
    "7b78c037-175d-4589-8641-092d78de691e": [
      {
        id: "db822200-ae51-448a-9198-24fde4e9e357",
        name: "🐾 Pet Care",
      },
      {
        id: "31d2d594-48c4-463a-8495-f1fe84d4d840",
        name: "🧘‍♂️ Meditation",
      },
    ],
    "d903a23d-8257-4651-825a-0f7d96547380": [
      {
        id: "dc18947b-25bf-40ca-bb3e-7d22fd5ad8fd",
        name: "🤖 Robotics",
      },
      {
        id: "319346a1-d2f6-4d84-b6c8-6a856c4f95c0",
        name: "💻 Coding",
      },
      {
        id: "8d2cb28e-7b4b-4397-94b1-e2b0c75c8745",
        name: "🏆 Competitions",
      },
    ],
    "da1a0b93-2035-4328-8ce3-18f136dc2464": [
      {
        id: "6c827f6f-d2c4-448f-8fe3-0aab01109342",
        name: "⚽ Sports",
      },
      {
        id: "8d2cb28e-7b4b-4397-94b1-e2b0c75c8745",
        name: "🏆 Competitions",
      },
    ],
    "8e7d34a1-bdc1-4dcc-b651-e0a05b388117": [
      {
        id: "4a0706c2-f98b-4906-bd81-3cbd8cd1cde6",
        name: "💼 Part-time Jobs",
      },
    ],
  } as any;

  const profiles = [];

  for (const userId of mockUserIds) {
    const interests = mockInterests[userId];
    const embedding = await generateEmbeddings(
      `I interested in ${interests
        .map((interest: any) => interest.name)
        .join(", ")}`
    );
    profiles.push({
      userId: userId,
      displayName: "User " + userId,
      embedding: embedding,
    });
  }

  await db.insert(profileInPrivate).values(profiles);

  await db.insert(userInterestInPrivate).values(
    mockUserIds.flatMap((userId) =>
      mockInterests[userId].map((interest: any) => ({
        userId,
        interestId: interest.id,
      }))
    )
  );
}

seed().then(() => {
  console.log("Seed completed");
});
