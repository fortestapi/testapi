import express from "express";
import { VALIDATION_PASSWORD, saltrounds } from "../utils/config.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { conection } from "../index.js";
import jwt from "jsonwebtoken";

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
      conection.query(sql_query, (err, result) => {
        if(result[0]){
           res.send(result);
        }else{
           res.send("user not found")
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
            res.status(401).send("username or password incorrect");
          }
        } else {
          res.status(401).send("username or password incorrect");
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
      const random = Math.floor(100000 + Math.random() * 900000).toString();
      const sql_query = `UPDATE users SET verificationnumber = "${random}" WHERE email = "${email}"`;
      conection.query(sql_query, (err, result) => {
        res.send("email sent successfully");
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
        to: email,
        subject: "verify your email",
        text: random,
      };
      transporter.sendMail(MailOptions, () => {
        res.send("email sent");
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
          const sql_query = `UPDATE users SET verificationnumber = NULL WHERE verificationnumber = ${verificationnumber}`;
          conection.query(sql_query, () => {
            res.send("success");
          });
        } else {
          res.send("verification code incorrect");
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
      const {
        username,
        password,
        email,
        manID,
        phone,
        referralCode,
        referredBy,
        referrer,
      } = req.body;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const sql_query = `INSERT INTO users
 (username, password, email,
   manID,phone,referralCode,
   referredBy,referrer)
    VALUES ('${username}',
     '${passwordHash}', 
     '${email}', 
     '${manID}',
     '${phone}',
     '${referralCode}',
     '${referredBy}',
     '${referrer}');`;
      const existingUserName = `SELECT *  FROM users WHERE username ="${username}" `;
      const existingUserEmail = `SELECT *  FROM users WHERE email ="${email}" `;
      conection.query(existingUserName, (err, rows, fields) => {
        if (rows?.length) {
          res.send("username already taken");
        } else {
          conection.query(existingUserEmail, (err, rows, fields) => {
            if (rows?.length) {
              res.send("email already taken");
            } else {
              conection.query(sql_query, (err, result) => {
                res.status(201).send(result);
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
      const existingUserName = `SELECT *  FROM users WHERE id!="${id}"
     AND username ="${username}" OR email ="${email}" AND id!="${id}"`;
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
      const { email ,token} = req.body;
      const random = Math.floor(100000 + Math.random() * 900000).toString();


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
            text:random,
          };
          transporter.sendMail(MailOptions);
  res.send('email verified')

      // const sql_query = `SELECT * FROM users WHERE email = "${email}" AND token="${token}"`;
      // conection.query(sql_query, (err, result) => {
      //   if (result[0]) {
      //     const update = `UPDATE users set verificationnumber="${random}" WHERE email = "${email}"`;
      //     const transporter = nodemailer.createTransport({
      //       service: "gmail",
      //       auth: {
      //         user: "forverifyemailfromnode@gmail.com",
      //         pass: "irtednvaqwoilawb",
      //       },
      //     });
      //     const MailOptions = {
      //       from: "forverifyemailfromnode@gmail.com",
      //       to: email,
      //       subject: "verify your email",
      //       text:random,
      //     };
      //     transporter.sendMail(MailOptions);
      //     conection.query(update, (err, result) => {
      //       res.send("email sent successfully");
      //     });
      //   } else {
      //     res.send("email not found");
      //   }
      // });
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
      const { verificationnumber, password } = req.body;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const sql_query = `SELECT * FROM users WHERE verificationnumber=${verificationnumber}`;
      const update = `UPDATE users set
     password="${passwordHash}",
     verificationnumber=NULL where verificationnumber=${verificationnumber}`;
      conection.query(sql_query, (err, result) => {
        if (result[0]) {
          conection.query(update, (err, result) => {
            res.send(result);
          });
        } else {
          res.send("incorect verification code");
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
