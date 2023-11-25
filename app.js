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

const connection = mysql.createConnection({
  host: 's684.fra8.mysecurecloudhost.com',
  user: 'goldenst_strategyuser',
  password: 'Tokhliauri123',
  database: 'goldenst_strategydb',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
})

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);

app.listen(3000, () => {
  console.log(`started on port ${PORT}`);
});
