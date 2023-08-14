import dotenv from "dotenv";

dotenv.config();

const {
  MONGODB_URI,
  PORT,
  VALIDATION_PASSWORD,
  saltrounds,
  user,
  password,
  database,
  host,
  TW_ID,
  TW_TOKEN,
} = process.env;

export {
  MONGODB_URI,
  host,
  PORT,
  VALIDATION_PASSWORD,
  saltrounds,
  user,
  password,
  database,
  TW_ID,
  TW_TOKEN,
};
