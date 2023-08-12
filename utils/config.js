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
};
