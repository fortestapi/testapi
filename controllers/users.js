import express from "express";
import { VALIDATION_PASSWORD, saltrounds } from "../utils/config.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { conection } from "../index.js";
import jwt from "jsonwebtoken";
import seedrandom from "seedrandom";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const sql_query = `SELECT * FROM users`;
      conection.query(sql_query, (err, result) => {
        res.send(result);
      });
    } catch (err) {
      res.send(err.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.get("/:token", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const sql_query = `SELECT * FROM users WHERE token = "${req.params.token}"`;
      conection.query(sql_query, async (err, result) => {
        if (result[0]) {
          res.send(result[0]);
        } else {
          res.send("user not found");
        }
      });
    } catch (err) {
      res.send(err.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/login", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { username, password } = req.body;
      const findUser = `SELECT * FROM users WHERE username = "${username}"`;
      conection.query(findUser, async (err, result) => {
        if (result?.length) {
          const passwordCorrect = await bcrypt.compare(
            password,
            result[0]?.password
          );
          if (passwordCorrect) {
            const userForToken = { password, username };
            const token = jwt.sign(userForToken, saltrounds).toString();
            const whriteToken = `UPDATE users set token="${token}" WHERE username ="${username}"`;
            conection.query(whriteToken);
            res.json(token);
          } else {
            res.status(401).send("username_or_password_incorrect");
          }
        } else {
          res.status(401).send("username_or_password_incorrect");
        }
      });
    } catch (err) {
      res.send(err.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/verify", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { email } = req.body;
      const FINDsql_query = `SELECT * FROM users WHERE email = "${email}"`;
      conection.query(FINDsql_query, (err, result) => {
        const random =
          Math.floor(100000 + Math.random() * 900000) + result[0].id.toString();
        const sql_query = `UPDATE users SET verificationnumber = "${random}" WHERE email = "${email}"`;
        const timeoutsql_query = `UPDATE users SET verificationnumber = NULL WHERE email = "${email}"`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "forverifyemailfromnode@gmail.com",
            pass: "irtednvaqwoilawb",
          },
        });
        const MailOptions = {
          from: "forverifyemailfromnode@gmail.com",
          to: email,
          subject: "verify your email",
          text: random,
        };
        conection.query(sql_query, async () => {
          await transporter.sendMail(MailOptions);
          res.send("email_sent_successfully");
          setTimeout(() => {
            conection.query(timeoutsql_query);
          }, 120000);
        });
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.put("/verify", (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { verificationnumber } = req.body;
      const find = `SELECT * FROM users WHERE verificationnumber = ${verificationnumber}`;
      conection.query(find, (err, result) => {
        if (result[0]) {
          const sql_query = `UPDATE users set verifyed="true",verificationnumber = NULL WHERE verificationnumber = ${verificationnumber}`;
          conection.query(sql_query, () => {
            res.send("verifyed success");
          });
        } else {
          res.send("verification_code - incorect_verification_code");
        }
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      let referalscount = [];
      let referredBy = "";
      let { username, password, email, referralCode, name, surname } = req.body;
      const test = username + email + password;
      const testt = seedrandom(test).quick().toString().slice(2);
      const userreferalcode = testt.replace(".", "");
      const findreferredBy = `SELECT * FROM users WHERE  userreferalcode = "${referralCode}"`;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const sql_query = `INSERT INTO users
 (username, password, email,
   referralCode,
   referredBy,userreferalcode,name,surname)
    VALUES ('${username}',
     '${passwordHash}', 
     '${email}', 
     '${referralCode}',
     '${referredBy}',
     '${userreferalcode}',
     '${name}',
     '${surname}');`;
      const existingUserName = `SELECT *  FROM users WHERE username ="${username}" `;
      const existingUserEmail = `SELECT *  FROM users WHERE email ="${email}" `;
      conection.query(existingUserName, (err, rows, fields) => {
        if (rows?.length) {
          res.send("username - username_already_taken");
        } else {
          conection.query(existingUserEmail, (err, rows, fields) => {
            if (rows?.length) {
              res.send("email - email_already_taken");
            } else {
              conection.query(findreferredBy, (err, result) => {
                if (result[0]) {
                  let ttg = [];
                  if ((result[0].referalscount !== null) | "null") {
                    ttg = result[0].referalscount.split(",");
                  }
                  ttg.push(username);
                  referalscount = ttg;
                  referredBy = result[0].username;
                  const updatequerry = `UPDATE users SET referalscount="${referalscount}" WHERE userreferalcode="${referralCode}"`;
                  const newsql_query = `INSERT INTO users
 (username, password, email,
   referralCode,
   referredBy,userreferalcode,name,surname)
    VALUES ('${username}',
     '${passwordHash}', 
     '${email}', 
     '${referralCode}',
     '${referredBy}',
     '${userreferalcode}',
     '${name}',
     '${surname}');`;
                  conection.query(newsql_query, async () => {
                    conection.query(updatequerry, (err, result) => {
                      res.status(201).send(result);
                    });
                  });
                } else {
                 
                    conection.query(sql_query, async (err, result) => {
                      res.status(201).send(result);
                    });
                 
                }
              });
            }
          });
        }
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const id = req.params.id;
      const { username, password, email, balance, reward, name, surname } =
        req.body;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const existingUserName = `SELECT *  FROM users WHERE id!="${id}"
     AND username ="${username}" OR email ="${email}" AND id!="${id}"`;
      const sql_query = `UPDATE users
   set username="${username}",
    password="${passwordHash}",
     email="${email}", 
     balance="${balance}",
      name="${name}",
     surname="${surname}",
     reward="${reward}"
     WHERE id = ${req.params.id}`;
      conection.query(existingUserName, (err, result) => {
        if (result.length !== 0 && result[0]?.username == username) {
          res.send("username - username already taken");
        } else if (result.length !== 0 && result[0]?.email == email) {
          res.send("email - email already taken");
        } else {
          conection.query(sql_query, (err, result) => {
            res.send(result);
          });
        }
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const sql_query = `DELETE FROM users WHERE id = ${req.params.id}`;
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

usersRouter.post("/forgotpassword", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { email } = req.body;
      const sql_query = `SELECT * FROM users WHERE email = "${email}"`;
      conection.query(sql_query, (err, result) => {
        if (result[0]) {
          const random =
            Math.floor(100000 + Math.random() * 900000) +
            result[0].id.toString();
          const update = `UPDATE users set passverificationnumber="${random}" WHERE email = "${email}"`;
          const timeupdate = `UPDATE users set passverificationnumber=NULL WHERE email = "${email}"`;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "forverifyemailfromnode@gmail.com",
              pass: "irtednvaqwoilawb",
            },
          });
          const MailOptions = {
            from: "forverifyemailfromnode@gmail.com",
            to: email,
            subject: "verify your email",
            text: random,
          };
          conection.query(update, async (err, result) => {
            await transporter.sendMail(MailOptions);
            setTimeout(() => {
              conection.query(timeupdate);
            }, 120000);
            res.send("email sent successfully");
          });
        } else {
          res.send("email - email_not_found");
        }
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

usersRouter.put("/forgotpassword/verify", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const { verificationCode, newPassword } = req.body;
      const passwordHash = await bcrypt.hash(newPassword, Number(saltrounds));
      const sql_query = `SELECT * FROM users WHERE passverificationnumber=${verificationCode}`;
      const update = `UPDATE users set
     password="${passwordHash}",
     passverificationnumber=NULL where passverificationnumber=${verificationCode}`;
      conection.query(sql_query, (err, result) => {
        if (result[0]) {
          conection.query(update, (err, result) => {
            res.send("successfully updated");
          });
        } else {
          res.send("verification_code - incorect_verification_code");
        }
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default usersRouter;
