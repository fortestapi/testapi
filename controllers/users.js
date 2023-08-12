import express from "express";
import { VALIDATION_PASSWORD, saltrounds } from "../utils/config.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { conection } from "../index.js";
import jwt from "jsonwebtoken";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `SELECT * FROM users`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.get("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `SELECT * FROM users WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/login", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { username, password } = req.body;
    const findUser = `SELECT * FROM users WHERE username = "${username}"`;
    conection.query(findUser, async (err, result) => {
      if (err) res.send(err.message);
      if (result.length) {
        const passwordCorrect = await bcrypt.compare(
          password,
          result[0]?.password
        );
        if (passwordCorrect) {
          res.send(result[0]);
        } else {
          res.send("username or password incorrect");
        }
      } else {
        res.send("username or password incorrect");
      }
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/verify", async (req, res) => {
  
  const random = Math.floor(100000 + Math.random() * 900000).toString()
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { email } = req.body;
  const sql_query = `SELECT * FROM users WHERE email = "${email}"`;
  conection.query(sql_query, (err, result) => {
    if(result[0]){
      const sql_query = `UPDATE users SET verificationnumber = "${random}" WHERE email = '${email}'`;
      conection.query(sql_query, (err, result) => {
        if (err) res.send(err.message);
        res.send(result);
      });
    }
  })
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "forverifyemailfromnode@gmail.com",
        pass: "irtednvaqwoilawb",
      },
    });
    const MailOptions = {
      from: "forverifyemailfromnode@gmail.com",
      to:email,
      subject: "verify your email",
      text: random,
    };
    transporter.sendMail(MailOptions, () => {
      res.send("email sent");
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});
usersRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const {
      username,
      password,
      email,
      balance,
      manID,
      phone,
      referralCode,
      referredBy,
      referrer,
      verificationnumber,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, Number(saltrounds));
    const find = `SELECT * FROM users WHERE verificationnumber=${verificationnumber}`;
    conection.query(find, (err, result) => {
      if (result[0]) {
        const sql_query = `INSERT INTO users
 (username, password, email,
   balance,manID,phone,referralCode,
   referredBy,referrer,verificationnumber)
    VALUES ('${username}',
     '${passwordHash}', 
     '${email}', 
     '${balance}',
     '${manID}',
     '${phone}',
     '${referralCode}',
     '${referredBy}',
     '${referrer}',NULL);`;
        const existingUserName = `SELECT *  FROM users WHERE username ="${username}" `;
        const existingUserEmail = `SELECT *  FROM users WHERE email ="${email}" `;
        conection.query(existingUserName, (err, rows, fields) => {
          if (rows.length) {
            res.send("username already taken");
          } else {
            conection.query(existingUserEmail, (err, rows, fields) => {
              if (rows.length) {
                res.send("email already taken");
              } else {
                conection.query(sql_query, (err, result) => {
                  if (err) res.send(err.message);
                  res.send(result);
                });
              }
            });
          }
        });
      } else {
        res.send("verification failed");
      }
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});
usersRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const id = req.params.id;
    const {
      username,
      password,
      email,
      balance,
      manID,
      phone,
      referralCode,
      referredBy,
      referrer,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, Number(saltrounds));
    const existingUserName = `SELECT *  FROM users WHERE id!="${id}" AND username ="${username}" OR email ="${email}" AND id!="${id}"`;
    const sql_query = `UPDATE users
   set username="${username}",
    password="${passwordHash}",
     email="${email}", 
     balance="${balance}",
     manID="${manID}",
     phone="${phone}",
     referralCode="${referralCode}"
     ,referredBy="${referredBy}"
     ,referrer="${referrer}"
     WHERE id = ${req.params.id}`;
    conection.query(existingUserName, (err, result) => {
      if (result.length !== 0 && result[0]?.username == username) {
        res.send("username already taken");
      } else if (result.length !== 0 && result[0]?.email == email) {
        res.send("email already taken");
      } else {
        conection.query(sql_query, (err, result) => {
          if (err) res.send(err.message);
          res.send(result);
        });
      }
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `DELETE FROM users WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/forgotpassword", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { email } = req.body;
    const random = Math.floor(100000 + Math.random() * 900000).toString()
    const sql_query = `SELECT * FROM users WHERE email = "${email}"`;
    conection.query(sql_query, (err, result) => {
      if (result[0]) {
        const update = `UPDATE users set verificationnumber="${random}" WHERE email = "${email}"`;
        conection.query(update, (err, result) => {
          if (err) throw err;
          res.send(result);
        });
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "forverifyemailfromnode@gmail.com",
            pass: "irtednvaqwoilawb",
          },
        });
        const MailOptions = {
          from: "forverifyemailfromnode@gmail.com",
          to: req.body.email,
          subject: "verify your email",
          text: random,
        };
        transporter.sendMail(MailOptions, () => {
          res.send("email sent");
        });
      } else {
        res.send("email not found");
      }
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.put("/forgotpassword/verify", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { verificationnumber, password } = req.body;
    const passwordHash = await bcrypt.hash(password, Number(saltrounds));
    const sql_query = `SELECT * FROM users WHERE verificationnumber=${verificationnumber}`;
    const update = `UPDATE users set password="${passwordHash}",verificationnumber=NULL where verificationnumber=${verificationnumber}`;
    conection.query(sql_query, (err, result) => {
      if (result[0]) {
        conection.query(update, (err, result) => {
          if (err) throw err;
          res.send(result);
        });
      } else {
        res.send("incorect verification code");
      }
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default usersRouter;
