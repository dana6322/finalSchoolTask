import dotEnv from "dotenv";
dotEnv.config({ path: process.env.ENV_FILE || ".env.test" });
