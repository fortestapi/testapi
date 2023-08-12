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
} = process.env;

export {
  MONGODB_URI,
  PORT,
  VALIDATION_PASSWORD,
  saltrounds,
  user,
  password,
  database,
};