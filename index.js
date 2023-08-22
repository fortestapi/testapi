import express from "express";
import cors from "cors";
import { PORT, database, host, password, user } from "./utils/config.js";
import usersRouter from "./controllers/users.js";
import giftsRouter from "./controllers/gifts.js";
import casesRouter from "./controllers/cases.js"
import transactionsRouter from "./controllers/transactions.js";
import mysql2 from 'mysql2'

export const conection = mysql2.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
});

conection.connect((err,) =>{
  if(err) console.log(err.message)
  console.log("Connected to database");
})

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/users", usersRouter);
app.use("/api/gifts", giftsRouter);
app.use("/api/cases", casesRouter);
app.use("/api/transactions", transactionsRouter);

app.listen(PORT, () => {
  console.log(`started on port ${PORT}`);
});
