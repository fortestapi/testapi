import express from "express";
import { queryDatabase } from "../utils/functions.js";

const questionsRouter = express.Router();

questionsRouter.get("/active", async (req, res) => {
  try {
    const { userid } = req.body;

    const getActiveQuestionQuery = `SELECT * FROM questions`;
    const activeQuestions = await queryDatabase(getActiveQuestionQuery);

    const getUserInfoQuery = `SELECT seenquestions FROM users WHERE id = ?`;
    const seenQuestionsResult = await queryDatabase(getUserInfoQuery, [userid]);
    const userSeenQuestions =
      seenQuestionsResult.length > 0
        ? seenQuestionsResult[0].seenquestions.split(",")
        : [];

    const filteredQuestions = activeQuestions.filter(
      (question) => !userSeenQuestions.includes(question.id.toString())
    );

    const randomQuestion =
      filteredQuestions.length > 0
        ? filteredQuestions[
            Math.floor(Math.random() * filteredQuestions.length)
          ]
        : null;

    if (randomQuestion) {
      const updateUserSeenQuestionsQuery = `UPDATE users SET seenquestions = ? WHERE id = ?`;
      const updatedSeenQuestions = userSeenQuestions.concat(randomQuestion.id);
      await queryDatabase(updateUserSeenQuestionsQuery, [
        updatedSeenQuestions.join(","),
        userid,
      ]);

      const getAnswersQuery = `SELECT answer_1, answer_2, answer_3, answer_4 FROM answers WHERE question_id = ?`;
      const answers = await queryDatabase(getAnswersQuery, [randomQuestion.id]);
      randomQuestion.answers = answers;
    }

    res.send(randomQuestion);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

questionsRouter.post("/answer", async (req, res) => {
  const { question_id, answer ,time ,user_id} = req.body;
  const questionQuerry = `SELECT right_answer FROM questions where id =?`;
  const coinAddQuerry= `UPDATE users SET coin = coin+? WHERE id =?`
  const question = await queryDatabase(questionQuerry, [question_id]);
  if (question[0].right_answer == answer) {
    res.send("your answer is correct");
await queryDatabase(coinAddQuerry, [time, user_id]);
  } else {
    res.send(`Your answer is not correct`);
  }
});


export default questionsRouter;
