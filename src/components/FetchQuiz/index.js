// Fetching quiz data component
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SocketContext } from "../../socket";
import { convertLevel, convertTopics } from "../../utils/fetchAPI";
import shuffleArray from "../ShuffleArray";
import CleanData from "../CleanData";
import decodeHtml from "../../utils/helpers";
import Timer from "../Timer";
import Modal from "../Modal";
import "./styles.css";

const FetchQuiz = ({ allInfo, handleSubmit }) => {
  console.log(handleSubmit);
  const socket = useContext(SocketContext);
  const [quizData, setQuizData] = useState([]);
  const [round, setRound] = useState(1);

  const getRound = async (apiURL) => {
    await axios
      .get(apiURL)
      .then((response) => {
        socket.emit(
          "send-questions",
          response.data.results,
          allInfo.gameInfo.join_code
        );
      })
      .catch((err) => console.log(err));
  };

  // Getting the round data only for the admin
  useEffect(() => {
    console.log("fetching...");
    // console.log(allInfo);
    if (allInfo.admin) {
      const apiURL1 = `https://opentdb.com/api.php?amount=10&category=${convertTopics(
        allInfo.gameInfo.topics[0]
      )}&difficulty=${convertLevel(allInfo.gameInfo.level)}`;

      const apiURL2 = `https://opentdb.com/api.php?amount=10&category=${convertTopics(
        allInfo.gameInfo.topics[1]
      )}&difficulty=${convertLevel(allInfo.gameInfo.level)}`;

      const apiURL3 = `https://opentdb.com/api.php?amount=10&category=${convertTopics(
        allInfo.gameInfo.topics[2]
      )}&difficulty=${convertLevel(allInfo.gameInfo.level)}`;
      getRound(apiURL1);
    }
  }, [round]);

  useEffect(() => {
    socket.on("receive-questions", (questionsInfo) => {
      setQuizData(questionsInfo);
    });

    // socket.on("wait-for-others", (usersCompleted, totalUsers) => {
    //   console.log(`Waiting for others... ${usersCompleted}/${totalUsers}`);
    //   socket.emit("complete-user-waiting", allInfo.gameInfo.join_code);
    // });
  }, [socket]);

  console.log(quizData);

  return (
    <>
      <form className="question-form" onSubmit={handleSubmit}>
        {quizData.map((data, i) => {
          const choices = data.incorrect_answers.map((answer) =>
            decodeHtml(answer)
          );
          choices.push(decodeHtml(data.correct_answer));

          return (
            <div className="QA" key={i}>
              <h2>{decodeHtml(data.question)}</h2>
              <div className="choices">
                {shuffleArray(choices).map((choice, j) => (
                  <>
                    <input
                      type="radio"
                      value={choice == data.correct_answer ? 1 : 0}
                      key={j}
                      name={data.question}
                    />
                    <label>{choice}</label>
                  </>
                ))}
              </div>
            </div>
          );
        })}
        <button type="submit">Next Round</button>
      </form>
    </>
  );
};

export default FetchQuiz;
