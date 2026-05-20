import dotenv from "dotenv";
dotenv.config({ override: true });

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  geminiApiKey1: process.env.GEMINI_API_KEY_1 ?? "",
  geminiApiKey2: process.env.GEMINI_API_KEY_2 ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
};
