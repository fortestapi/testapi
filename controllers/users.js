import express from "express";
import { VALIDATION_PASSWORD, saltrounds } from "../utils/config.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { conection } from "../index.js";
import jwt from "jsonwebtoken";
import stripePackage from "stripe";
const stripe = stripePackage(
  "sk_test_51O1uF3E7glB9R79nKVmFX2DhmuBIdx16CsioyZ0AQd1VTWNgskqNGU5pft2qBa8DbYusMhf5nAQ4gI7y8t2zj3hw00LvocZb8Z"
);

const usersRouter = express.Router();



usersRouter.get("/answers", (req, res) => {


  const sql_query = "SELECT * FROM users";
  conection.query(sql_query, (err, result) => {


function arrSort(arr) {
  arr.sort((a, b) => a.rightanswerscount - b.rightanswerscount);
  arr.reverse();
  return arr;
}

function arrSort2(arr) {
  arr.sort((a, b) => a.answerstime - b.answerstime);
  return arr;
}

const test=arrSort(result)

res.send(arrSort2(test)); 

  });
});

usersRouter.post("/deposit", async (req, res) => {
  try {
    (async () => {
      const priceId = "price_1O5a5aE7glB9R79n1j19xmq4";
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
      });
      res.send(paymentLink.url);
    })();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRouter.post("/withdrawal", async (req, res) => {
  try {
    const withdrawal = await stripe.transfers.create({
      amount: 2000,
      currency: "usd",
      source_transaction: "",
    });

    res.send(withdrawal);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRouter.post("/create-customer", async (req, res) => {
  const { email, name } = req.body;
  try {
    const createCustomer = async (email, name) => {
      return await stripe.customers.create({ email: email, name: name });
    };
    const customer = await createCustomer(email, name);
    res.send(customer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

usersRouter.get("/levels", (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    try {
      const sql_query = "SELECT * FROM users";
      conection.query(sql_query, (err, result) => {
        const filteredResult = result.filter(
          (response) => response.level !== 0
        );
        const groupedResult = {};
        filteredResult.forEach((item) => {
          if (!groupedResult[item.level]) {
            groupedResult[item.level] = { paydonlevel0: [], paydonlevel1: [] };
          }
          if (item.paydonlevel === 0) {
            groupedResult[item.level].paydonlevel0.push(item);
          } else if (item.paydonlevel === 1) {
            groupedResult[item.level].paydonlevel1.push(item);
          }
        });
        const simplifiedResponse = Object.keys(groupedResult).map((level) => ({
          paydonlevel0: groupedResult[level].paydonlevel0,
          paydonlevel1: groupedResult[level].paydonlevel1,
        }));
        simplifiedResponse.map((response) => {
          if (response.paydonlevel0.length == 3) {
            const array1 = [];
            response.paydonlevel0.map((item) => {
              array1.push(Number(item.balancetobecollected));
              const initialValue = 0;
              const sumWithInitial = array1.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                initialValue
              );
              const balancetobecollectedonlevel =
                sumWithInitial - sumWithInitial / 4;
              const forbalancetobecollected =
                balancetobecollectedonlevel -
                balancetobecollectedonlevel * (0.45).toString();
              let forbalance = balancetobecollectedonlevel * (0.45).toString();

              const updatepaydonlevel = `UPDATE users set  balancetobecollected=${0}, paydonlevel=${Number(
                1
              )} WHERE id = ${item.id}`;
              const levelup = `UPDATE users set balance=${
                response.paydonlevel0[0].balance + forbalance
              }, balancetobecollected=${forbalancetobecollected},paydonlevel=${0}, level=${
                response.paydonlevel0[0].level + 1
              } WHERE id = ${response.paydonlevel0[0].id}`;
              conection.query(updatepaydonlevel);
              conection.query(levelup);
            });
          }
        });
        res.send(groupedResult);
      });
    } catch (error) {
      res.send(error.message);
    }
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

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
          host: "mail.golden-strategy.com",
          port: 465,
          secure: true,
          auth: {
            user: "team@golden-strategy.com",
            pass: "yEr,+jE!^?aL",
          },
        });
        const MailOptions = {
          from: "team@golden-strategy.com",
          to: email,
          subject: "verify your email",
          text: random,
        };
        conection.query(sql_query, async () => {
          await transporter.sendMail(MailOptions);
          res.send("email sent successfully");
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
      let { username, password, email, name, surname } = req.body;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const sql_query = `INSERT INTO users
 (username, password, email,name,surname)
    VALUES ('${username}',
     '${passwordHash}', 
     '${email}', 
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
              conection.query(sql_query, async (err, result) => {
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
        reward,
        name,
        surname,
        balancetobecollected,
        rightanswerscount,
        answer,
        answerstime,
        Correct,
      } = req.body;
      const passwordHash = await bcrypt.hash(password, Number(saltrounds));
      const existingUserName = `SELECT *  FROM users WHERE id!="${id}"
     AND username ="${username}" OR email ="${email}" AND id!="${id}"`;
      const sql_query = `UPDATE users
   set username="${username}",
    password="${passwordHash}",
     email="${email}", 
     balance=${Number(balance)},
      name="${name}",
     surname="${surname}",
     reward="${reward}",
     balancetobecollected=${Number(balancetobecollected)},
      rightanswerscount="${Number(rightanswerscount)}",
      answer="${answer}",
      answerstime="${Number(answerstime)}",
      Correct="${Correct}",
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
            host: "mail.golden-strategy.com",
            port: 465,
            secure: true,
            auth: {
              user: "team@golden-strategy.com",
              pass: "yEr,+jE!^?aL",
            },
          });
          const MailOptions = {
            from: "team@golden-strategy.com",
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
