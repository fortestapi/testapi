import express from "express";
import { queryDatabase } from "../utils/functions.js";

const questionsRouter = express.Router();

questionsRouter.get("/active", async (req, res) => {
  const { userid } = req.body;
  const getActiveQuestionQuerry = `SELECT * FROM questions`;
  const userInfoQuerry = `SELECT seenquestions FROM users WHERE id=?`;
  const seenQuerry = `UPDATE users SET seenquestions=? WHERE id = ?`;
  const result = await queryDatabase(getActiveQuestionQuerry);
  const seenquestions = await queryDatabase(userInfoQuerry, [userid]);
  const userSeenQuestions = seenquestions[0].seenquestions.split(",");
  const filteredResult = result.filter(
    (question) => !userSeenQuestions.includes(question.id.toString())
  );
  const randomElement =
    filteredResult.length > 0
      ? filteredResult[Math.floor(Math.random() * filteredResult.length)]
      : null;
  if (randomElement) {
    await queryDatabase(seenQuerry, [
      `${userSeenQuestions},${randomElement.id}`,
      userid,
    ]);
  }
   const answersQuerry = `SELECT answer_1, answer_2, answer_3,answer_4
FROM answers
INNER JOIN questions ON answers.question_id = ?`;
const answers = await queryDatabase(answersQuerry, [randomElement.id]);
randomElement.answers=answers
  res.send(randomElement);
});


questionsRouter.get('/test',async(req,res)=>{
  const testquerry = `SELECT answer_1, answer_2, answer_3,answer_4
FROM answers
INNER JOIN questions ON answers.question_id = questions.id`;
const result = await queryDatabase(testquerry)
res.send(result)
})

export default questionsRouter;
