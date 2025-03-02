import { faker } from "@faker-js/faker";
import {
  interestInPrivate,
  profileInPrivate,
  settingsInPrivate,
  userInterestInPrivate,
  usersInAuth,
} from "../drizzle/schema";
import { db } from "./db";
import { generateEmbeddings } from "./utils/embeddings";

type User = {
  id: string;
  email: string;
  emailConfirmedAt: string;
  interests: { name: string }[];
  profile: {
    displayName: string;
  };
  settings: {
    profileVisibility: "public" | "private" | "connected";
    contactInfoVisibility: "public" | "private" | "connected";
    notiNewMessage: boolean;
    notiNewConnectionRequest: boolean;
    notiNewConnectionRequestAccept: boolean;
  };
};

const users: User[] = [
  {
    id: "160004d1-3f39-4ba4-8a41-db70eb0c3142",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "📚 Study Groups",
      },
      {
        name: "🎮 Gaming",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "69a13e43-40dc-4529-9622-a5535a76a794",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🎮 Gaming",
      },
      {
        name: "💻 Coding",
      },
      {
        name: "🏆 Competitions",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "e60d93c9-cf98-42bc-9278-eb667be41a66",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🎮 Gaming",
      },
      {
        name: "📚 Study Groups",
      },
      {
        name: "🎶 Music",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "296a8061-2a64-49df-a6c1-aab4fe84b44c",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🌾 Gardening",
      },
      {
        name: "🍹 Mixology",
      },
      {
        name: "🎤 Singing",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "86a5da07-b0af-4ecf-91ab-22b99de85de7",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🎤 Singing",
      },
      {
        name: "🎥 Filmmaking",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "c013059a-4155-41fd-8ae7-77d73d867eed",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🧘‍♂️ Meditation",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "7b78c037-175d-4589-8641-092d78de691e",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🐾 Pet Care",
      },
      {
        name: "🧘‍♂️ Meditation",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "d903a23d-8257-4651-825a-0f7d96547380",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "🤖 Robotics",
      },
      {
        name: "💻 Coding",
      },
      {
        name: "🏆 Competitions",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "da1a0b93-2035-4328-8ce3-18f136dc2464",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "⚽ Sports",
      },
      {
        name: "🏆 Competitions",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
  {
    id: "8e7d34a1-bdc1-4dcc-b651-e0a05b388117",
    email: faker.internet.email(),
    emailConfirmedAt: new Date().toISOString(),
    interests: [
      {
        name: "💼 Part-time Jobs",
      },
    ],
    profile: {
      displayName: faker.internet.username(),
    },
    settings: {
      profileVisibility: "public",
      contactInfoVisibility: "public",
      notiNewMessage: true,
      notiNewConnectionRequest: true,
      notiNewConnectionRequestAccept: true,
    },
  },
];

// WIP
async function seed() {
  // generate mock users
  for (const user of users) {
    await db
      .insert(usersInAuth)
      .values({
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.emailConfirmedAt,
      })
      .onConflictDoNothing();
  }

  // get ku connect interests
  const interests = await db.select().from(interestInPrivate);
  const interestMap = interests.reduce((acc: any, interest) => {
    acc[interest.name] = interest;
    return acc;
  }, {});

  // generate profiles
  const profiles: any = [];
  for (const user of users) {
    // const interests = mockInterests[userId];
    const embedding = await generateEmbeddings(
      `I interested in ${interests
        .map((interest: any) => interest.name)
        .join(", ")}`
    );
    profiles.push({
      userId: user.id,
      displayName: user.profile.displayName,
      embedding: embedding,
    });
  }

  await db.transaction(async (tx) => {
    // save profiles
    await tx.insert(profileInPrivate).values(profiles);

    // save interests
    await tx.insert(userInterestInPrivate).values(
      users.flatMap((user) =>
        user.interests.map((interest: any) => ({
          userId: user.id,
          interestId: interestMap[interest.name].id,
        }))
      )
    );

    // save settings
    await tx.insert(settingsInPrivate).values(
      users.map((user) => ({
        userId: user.id,
        ...user.settings,
      }))
    );
  });
}

seed().then(() => {
  console.log("Seed completed");
  process.exit(0);
});
