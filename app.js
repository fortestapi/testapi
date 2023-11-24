import express from "express";
import cors from "cors";
import { PORT, database, host, password, user } from "./utils/config.js";
import usersRouter from "./controllers/users.js";
import mysql from "mysql2";

// Create a connection pool
export const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
});

const dbConfig = {
  host: "s684.fra8.mysecurecloudhost.com",
  user: "goldenst_strategyuser",
  password: "1d8K[qS$!i&*",
  database: "goldenst_strategydb",
};


const connectToMySQL = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database");

    // Perform database operations using the 'connection' object
    // ...

    // Don't forget to close the connection when done
    await connection.end();
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
  }
};

connectToMySQL()

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);

app.listen(3000, () => {
  console.log(`started on port ${PORT}`);
});
