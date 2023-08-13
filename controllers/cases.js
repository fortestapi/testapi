import express from "express";
import { conection } from "../index.js";
import { VALIDATION_PASSWORD } from "../utils/config.js";

const casesRouter = express.Router();

casesRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      conection.query("SELECT * FROM cases", (err, result) => {
        res.send(result);
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.get("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      conection.query(
        `SELECT * FROM cases WHERE id = ${req.params.id}`,
        (err, result) => {
          res.send(result);
        }
      );
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { name, description, cost, items } = req.body;
      const sql_query = `INSERT INTO cases (name, description, cost, items) VALUES ('${name}', '${description}', '${cost}', '${items}');`;
      conection.query(sql_query, (err, result) => {
        res.send(result);
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { name, description, cost, items } = req.body;
      const sql_query = `UPDATE cases set name="${name}", description="${description}", cost="${cost}", items="${items}"  WHERE id = ${req.params.id}`;
      conection.query(sql_query, (err, result) => {
        res.send(result);
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const sql_query = `DELETE FROM cases WHERE id = ${req.params.id}`;
      conection.query(sql_query, (err, result) => {
        res.send(result);
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default casesRouter;
