import express, { query } from "express";
import { levelup, queryDatabase } from "../utils/functions.js";
import cron from "node-cron";

const fromAdminRouter = express.Router();

fromAdminRouter.post('/gift-cards',async (req,res)=>{
  const {email}=req.body
  const updateQuerry = `UPDATE users SET gift_card_id=0 WHERE email=?`;
  await queryDatabase(updateQuerry,[email])
  res.send('succesfully updated');
})

fromAdminRouter.get("/gift-cards", async (req, res) => {
  const getUsersInfoQuery = `SELECT u.gift_card_id, u.email, m.product_name 
                              FROM users u 
                              INNER JOIN market m ON u.gift_card_id = m.id 
                              WHERE u.gift_card_id != 0`;
  const result = await queryDatabase(getUsersInfoQuery);

  res.send(result);
});

fromAdminRouter.get("/balance", async (req, res) => {
  try {
    const getBalanceQuery = `SELECT balance, balancetobecollected FROM users`;
    const balances = await queryDatabase(getBalanceQuery);

    let totalBalance = 0;
    let totalBalanceToBeCollected = 0;

    // Calculate total balance and total balance to be collected
    balances.forEach((user) => {
      totalBalance += user.balance;
      totalBalanceToBeCollected += user.balancetobecollected;
    });

    // Calculate total sum
    const total = totalBalance + totalBalanceToBeCollected;

    // Format total to have 2 digits after the decimal point
    const formattedTotal = total.toFixed(2);

    // Construct the response object
    const aggregatedBalance = {
      total: parseFloat(formattedTotal),
    };

    // Send the response
    res.send(aggregatedBalance);
  } catch (error) {
    console.error("Error fetching balances:", error);
    res.status(500).send("Internal Server Error");
  }
});

fromAdminRouter.post("/subscription", async (req, res) => {
  var today = new Date();
  var day = today.getDate() + "";
  var month = today.getMonth() + 1 + "";
  var year = today.getFullYear() + "";
  var hour = today.getHours() + "";
  var minutes = today.getMinutes() + "";
  var seconds = today.getSeconds() + "";

  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);

  const date =
    day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;

  function checkZero(data) {
    if (data.length == 1) {
      data = "0" + data;
    }
    return data;
  }
  const { email } = req.body;
  const transactionQuerry = `INSERT INTO transactions (amount, user_email,date,trasaction_info) VALUES (?, ?, ?,?)`;
  const updateQuery = `UPDATE users SET subscription=? WHERE email=?`;
  const afterOneMonthQuerry = `UPDATE users SET subscription=? WHERE email=?`;
  try {
    const result = await queryDatabase(updateQuery, [1, email]);
    if (result.affectedRows === 0) {
      res.status(400).send("No user found or no changes made");
    } else {
      cron.schedule(
        "0 0 1 * *",
        () => {
          queryDatabase(afterOneMonthQuerry, [0, email]);
        },
        {
          scheduled: true,
          timezone: "Asia/Tbilisi",
        }
      );
      await queryDatabase(transactionQuerry, [3, email, date, "subscription"]);
      levelup(req, res);
      res.send("Updated successfully");
    }
  } catch (error) {
    res.status(400).send("Failed to update payment status");
  }
});

fromAdminRouter.post("/registration", async (req, res) => {
  var today = new Date();
  var day = today.getDate() + "";
  var month = today.getMonth() + 1 + "";
  var year = today.getFullYear() + "";
  var hour = today.getHours() + "";
  var minutes = today.getMinutes() + "";
  var seconds = today.getSeconds() + "";

  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);

  const date =
    day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;

  function checkZero(data) {
    if (data.length == 1) {
      data = "0" + data;
    }
    return data;
  }
  const { email } = req.body;
  const transactionQuerry = `INSERT INTO transactions (amount, user_email,date,trasaction_info) VALUES (?, ?, ?,?)`;
  const updateQuery = `UPDATE users SET payment_status=?, subscription=? WHERE email=?`;
  const afterOneMonthQuerry = `UPDATE users SET subscription=? WHERE email=?`;
  try {
    const result = await queryDatabase(updateQuery, [1, 1, email]);
    if (result.affectedRows === 0) {
      res.status(400).send("No user found or no changes made");
    } else {
      cron.schedule(
        "0 0 1 * *",
        () => {
          queryDatabase(afterOneMonthQuerry, [0, email]);
        },
        {
          scheduled: true,
          timezone: "Asia/Tbilisi",
        }
      );
      await queryDatabase(transactionQuerry, [3, email, date, "registration"]);
      levelup(req, res);
      res.send("Updated successfully");
    }
  } catch (error) {
    res.status(400).send("Failed to update payment status");
  }
});

fromAdminRouter.post("/add-question", async (req, res) => {
  const {
    question_GE,
    question_EN,
    answer_1_GE,
    answer_2_GE,
    answer_3_GE,
    answer_4_GE,
    answer_1_EN,
    answer_2_EN,
    answer_3_EN,
    answer_4_EN,
    right_answer_GE,
    right_answer_EN,
  } = req.body;
  const insertQuestionQuery = `INSERT INTO questions (question_GE,question_EN, right_answer_GE,right_answer_EN) VALUES (?, ?,?,?)`;
  const insertAnswersQuery = `INSERT INTO answers (question_id, answer_1_GE, answer_2_GE, answer_3_GE, answer_4_GE,answer_1_EN, answer_2_EN, answer_3_EN, answer_4_EN) VALUES (?, ?, ?, ?, ?,?,?,?,?)`;
  const countActiveQuestionsQuery = `SELECT COUNT(*) AS activeQuestionCount FROM questions WHERE active = 1`;
  try {
    // Check the count of active questions
    const activeQuestionCountResult = await queryDatabase(
      countActiveQuestionsQuery
    );
    const activeQuestionCount =
      activeQuestionCountResult[0].activeQuestionCount;

    // If the count is 50, return a message indicating no more questions can be added
    if (activeQuestionCount >= 50) {
      return res
        .status(400)
        .send(
          "There are already 50 active questions in the database. No more questions can be added."
        );
    }

    // Insert question
    const questionResult = await queryDatabase(insertQuestionQuery, [
      question_GE,
      question_EN,
      right_answer_GE,
      right_answer_EN,
    ]);
    const questionId = questionResult.insertId;

    // Insert answers
    await queryDatabase(insertAnswersQuery, [
      questionId,
      answer_1_GE,
      answer_2_GE,
      answer_3_GE,
      answer_4_GE,
      answer_1_EN,
      answer_2_EN,
      answer_3_EN,
      answer_4_EN,
    ]);

    res.status(200).send("Question added successfully");
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).send("An error occurred while adding the question.");
  }
});

fromAdminRouter.post("/stop-game", async (req, res) => {
  const stopGameQuerry = `UPDATE admin SET started_game =? WHERE id=?`;
  const deactivateQuestionsQuerry = `UPDATE questions SET active =? WHERE active=?`;
  const usersQuerry = `UPDATE users SET health=?, health_with_money=?,health_with_coin,help_with_money=?,help_with_coin=?,x1_25_coin,x1_5_coin,x2_coin,x_card_with_coin,x_card_with_money`;
  await queryDatabase(usersQuerry, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  await queryDatabase(stopGameQuerry, [0, 1]);
  await queryDatabase(deactivateQuestionsQuerry, [0, 1]);
  res.send("stopped succesfully");
});

fromAdminRouter.post("/start-game", async (req, res) => {
  const { amount_to_be_distributed } = req.body;
  try {
    const usersWhichExchangingMoneyQuery = `SELECT coin,id FROM users WHERE exchanging_to_money = ?`;
    const usersWhichExchangingMoney = await queryDatabase(
      usersWhichExchangingMoneyQuery,
      [1]
    );
    const totalUsers = usersWhichExchangingMoney.length;
    if (totalUsers === 0) {
      return res.status(400).send("No users found exchanging money.");
    }

    const amountPerUser = amount_to_be_distributed / totalUsers;

    // Update balance for each user exchanging money
    for (const user of usersWhichExchangingMoney) {
      const updatedCoin = user.coin + amountPerUser;
      await updateUserBalance(user.id, updatedCoin);
    }

    // Other queries remain the same
    const userQuery = `UPDATE users SET health = health+?, help = help+?, coin = ?, seenquestions = ?, exchanging_to_money = ?`;
    const startGameQuery = `UPDATE admin SET started_game = ? WHERE id = ?`;
    const deleteQuestionsQuery = `DELETE FROM questions WHERE active = ?`;
    const deleteAnswersQuery = `DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE active = ?)`;

    await queryDatabase(userQuery, [3, 3, 0, '"', 0]);
    await queryDatabase(deleteAnswersQuery, [0]);
    await queryDatabase(deleteQuestionsQuery, [0]);
    await queryDatabase(startGameQuery, [1, 1]);

    res.send("Game started successfully");
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Function to update user balance
async function updateUserBalance(userId, newBalance) {
  const updateUserQuery = `UPDATE users SET balance = ? WHERE id = ?`;
  await queryDatabase(updateUserQuery, [newBalance, userId]);
}

fromAdminRouter.post("/withdraw", async (req, res) => {
  const { amount, email } = req.body;
  var today = new Date();
  var day = today.getDate() + "";
  var month = today.getMonth() + 1 + "";
  var year = today.getFullYear() + "";
  var hour = today.getHours() + "";
  var minutes = today.getMinutes() + "";
  var seconds = today.getSeconds() + "";

  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);

  const date =
    day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;

  function checkZero(data) {
    if (data.length == 1) {
      data = "0" + data;
    }
    return data;
  }

  // Query user's balance
  const getUserBalanceQuery = `SELECT balance FROM users WHERE email = ?`;
  const transactionQuerry = `INSERT INTO transactions (amount, user_email,date,trasaction_info) VALUES (?, ?, ?,?)`;
  const balanceResult = await queryDatabase(getUserBalanceQuery, [email]);

  if (balanceResult.length === 0) {
    return res.status(404).send("User not found.");
  }

  const userBalance = balanceResult[0].balance;

  // Convert BigInt to number
  const userBalanceNumber = Number(userBalance);

  // Check if user has enough balance to withdraw
  if (userBalanceNumber < amount) {
    return res.status(400).send("Insufficient balance.");
  }

  // Perform withdrawal
  const updateUserBalanceQuery = `UPDATE users SET balance = balance - ? WHERE email = ?`;
  await queryDatabase(updateUserBalanceQuery, [amount, email]);
  await queryDatabase(transactionQuerry, [amount, email, date, "withdraw"]);

  res.send("success");
});

fromAdminRouter.post("/deposit", async (req, res) => {
  const { email, amount } = req.body;
  var today = new Date();
  var day = today.getDate() + "";
  var month = today.getMonth() + 1 + "";
  var year = today.getFullYear() + "";
  var hour = today.getHours() + "";
  var minutes = today.getMinutes() + "";
  var seconds = today.getSeconds() + "";

  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);

  const date =
    day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;

  function checkZero(data) {
    if (data.length == 1) {
      data = "0" + data;
    }
    return data;
  }
  const transactionQuerry = `INSERT INTO transactions (amount, user_email,date,trasaction_info) VALUES (?, ?, ?,?)`;
  const userQuerry = `UPDATE users SET balance=balance+? WHERE email=?`;
  await queryDatabase(userQuerry, [amount, email]);
  await queryDatabase(transactionQuerry, [amount, email, date, "deposit"]);
  res.send("success");
});

export default fromAdminRouter;
