export const config = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NOMIC_API_KEY: process.env.NOMIC_API_KEY as string,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: process.env.PORT || "4000",
};
