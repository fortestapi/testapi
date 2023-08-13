import express from "express";
import { conection } from "../index.js";
import { VALIDATION_PASSWORD } from "../utils/config.js";

const giftsRouter = express.Router();

giftsRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try{
         const sql_query = `SELECT * FROM gifts`;
    conection.query(sql_query, (err, result) => {
      res.send(result);
    }); 
    }catch(error){
      res.send(error.message);
    }

  } else {
    res.status(401).send("you have no permission to this address");
  }
});

giftsRouter.get("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try{
          const sql_query = `SELECT * FROM gifts WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      res.send(result);
    });
    }catch(error){
      res.send(error.message);
    }

  } else {
    res.status(401).send("you have no permission to this address");
  }
});

giftsRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try{
        const { name, description, value, imageUrl } = req.body;
    const sql_query = `INSERT INTO gifts (name, description, value, imageUrl) VALUES ('${name}', '${description}', '${value}', '${imageUrl}');`;
    conection.query(sql_query, (err, result) => {
      res.send(result);
    });
    }catch(error){
      res.send(error.message);
    }
  
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

giftsRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try{
         const { name, description, value, imageUrl } = req.body;
    const sql_query = `UPDATE gifts set name="${name}", description="${description}", value="${value}", imageUrl="${imageUrl}"  WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      res.send(result);
    });
    }catch(error){
      res.send(error.message);
    }
 
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

giftsRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try{
         const sql_query = `DELETE FROM gifts WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      res.send(result);
    });
    }catch(error){
      res.send(error.message);
    }
 
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default giftsRouter;
