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


const test=async()=>{
 await pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }

  console.log("Connected to MySQL database");
});
}

test()


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);

app.listen(3000, () => {
  console.log(`started on port ${PORT}`);
});
