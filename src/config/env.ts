import dotenv from "dotenv";

dotenv.config();

interface IEnvConfig {
  DB_URL: string;
  PORT: string;
  NODE_ENV: "development" | "production";
}

const loadEnvVariable = (): IEnvConfig => {
  const requiredEnvVariables: string[] = ["DB_URL", "PORT", "NODE_ENV"];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  return {
    DB_URL: process.env.DB_URL as string,
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
  };
};

export const envVariables = loadEnvVariable();
