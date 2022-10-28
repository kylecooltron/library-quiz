// react
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'

// index components
import Home from './components/Home'
import Difficulty from './components/Difficulty'
import Footer from './components/Footer'
import HeaderBack from './components/HeaderBack'
import HeaderHome from './components/HeaderHome'
import Game from './components/Game'
import GameEnd from './components/GameEnd'

// style
import './App.css';

// get CSV data
import {getSpreadsheetInfo} from './scripts/CSV_data.js'
import {checkAnswer} from './scripts/answer_validation.js'

// images
import boardGamesImg from './images/boardgames.png'
// to deploy to github pages "npm run deploy"

function App() {

  const [questionsData, setQuestionsData] = useState(null)
  const [gameState, setGameState] = useState({
      gamePlaying: false,
      gameType: 'freestyle',
      difficulty: 'easy',
      questionNum: 0,
      questionNumbers: [],
      totalQuestions: 1,

      questionInfo: {
        title: "error title",
        year: "1000",
        category: "category",
        difficulty: "difficulty",
        type: "type",
        points: "points",
        text: "question",
        correctAnswer: "correct",
        choices: [],
      },

      // questionText: "error",
      // questionType: 'choice',
      // questionCorrectAnswer: null,
      // questionChoices: [],

      questionAnswered: false,
      questionCorrect: null,
      questionsAnsweredCorrectly: 0,
      score: "100%"
    })
  
  const COLUMN_IDX = {
    game_title: 0,
    year_published: 1,
    question_category: 2,
    question_difficulty: 3,
    question_type: 4,
    question_points: 5,
    question_text: 6,
    question_correct_answer:7,
  }

  useEffect(() => { getSpreadsheetInfo(setQuestionsData); }, []);

  
  const getRandomQuestionNumber = () => {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return getRandomInt(0, questionsData.length);
  }


  const updateGamePlaying = (playing, difficulty="easy") => {

    // define
    let questionNumbers = [];
    let questionStartNumber = 0;
    // set up ten random questions if type is challenge
    if(gameState.gameType === "challenge"){
      while(questionNumbers.length <  10){
        let number_to_try = getRandomQuestionNumber();
        if( !questionNumbers.includes(number_to_try)){
          if(questionsData[number_to_try][COLUMN_IDX.question_difficulty].toLowerCase() === difficulty){
            questionNumbers.push(number_to_try);
          }
        }
      }
      console.log(questionNumbers)
      questionStartNumber = questionNumbers[0];
    }

    if(gameState.gameType === "freestyle"){
      // find a random question that is the right difficulty
      while(true){
        questionStartNumber = getRandomQuestionNumber();
        if(questionsData[questionStartNumber][COLUMN_IDX.question_difficulty].toLowerCase() === difficulty){
          break;
        }
      }
    }

    setGameState( (g) => ({
      ...g,
      gamePlaying: playing,
      difficulty: difficulty,
      questionNum: 0,
      questionNumbers: questionNumbers,
      totalQuestions: questionNumbers.length - 1,
      questionAnswered: false,
      questionCorrect: null,
      questionsAnsweredCorrectly: 0,
      score: "100%"
    }))

    if(playing){
      loadQuestionInfo(questionStartNumber)
    }
  }

  const updateGameType = (game_type) => {
    setGameState( (g) => ({
      ...g,
      gameType: game_type,
    }))
  }


  const questionSubmitted = (player_guess) => {

    // check if the players answer was correct
    let correct = checkAnswer(player_guess, gameState.questionInfo.correctAnswer, gameState.questionInfo.type);

    let newScore = ((gameState.questionsAnsweredCorrectly + (correct ? 1 : 0)) / (gameState.questionNum + 1)) * 100
    setGameState( {
      ...gameState,
      questionAnswered: true,
      questionCorrect: correct,
      questionsAnsweredCorrectly: gameState.questionsAnsweredCorrectly + (correct ? 1 : 0),
      score: +newScore.toFixed(2) + "%"
    })
  }

  const loadQuestionInfo = (questionNumber) => {

    let choices = []

    // if there are more entries in the array after the correct answer
    if(questionsData[questionNumber].length > 8){
      // get all the other answers
      choices = questionsData[questionNumber].slice(8,-1);
      // get the correct answer
      choices.push(questionsData[questionNumber][COLUMN_IDX.question_correct_answer]);
      choices = choices
        // get rod of empty values
        .filter((a) => a.trim() !== '')
        // randomize order
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    }

    setGameState( (g) => ({
      ...g,

      questionInfo: {
        title: questionsData[questionNumber][COLUMN_IDX.game_title],
        year: questionsData[questionNumber][COLUMN_IDX.game_year],
        category: questionsData[questionNumber][COLUMN_IDX.question_category],
        difficulty: questionsData[questionNumber][COLUMN_IDX.question_difficulty],
        type: questionsData[questionNumber][COLUMN_IDX.question_type],
        points: questionsData[questionNumber][COLUMN_IDX.question_points],
        text: questionsData[questionNumber][COLUMN_IDX.question_text],
        correctAnswer: questionsData[questionNumber][COLUMN_IDX.question_correct_answer],
        choices: choices,
      },
      
    }))
  }


  const nextQuestion = () => {
    if (gameState.gameType === "challenge"){
      if (gameState.questionNum < gameState.totalQuestions){
        let nextQuestionNum = gameState.questionNum + 1
        // update state to next question
        setGameState( (g) => ({
          ...g,
          questionAnswered: false,
          questionCorrect: null,
          questionNum: nextQuestionNum
        }))
  
        // update the question display info
        loadQuestionInfo(gameState.questionNumbers[nextQuestionNum])
      }
    }
    if (gameState.gameType === "freestyle"){

      let nextQuestionNum = gameState.questionNum;
      // make we find a question that is the right difficulty
      while(true){
        nextQuestionNum = getRandomQuestionNumber();
        if(questionsData[nextQuestionNum][COLUMN_IDX.question_difficulty].toLowerCase() === gameState.difficulty){
          if(nextQuestion !== gameState.questionNum){
            break;
          }
        }
      }

        // update state to next question
        setGameState( (g) => ({
          ...g,
          questionAnswered: false,
          questionCorrect: null,
          questionNum: nextQuestionNum
        }))
        // update the question display info
        loadQuestionInfo(nextQuestionNum)
    }
  }

  const resetGame = () => {
    updateGamePlaying(false)
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          
          <Route path={"/"} element={ 
            <>
            <HeaderHome/> 
            <Home boardGamesImg={boardGamesImg} updateGameType={updateGameType}/>
            </>
          }/>
          <Route path={"/library-quiz"} element={ 
            <>
            <HeaderHome/> 
            <Home boardGamesImg={boardGamesImg} updateGameType={updateGameType}/>
            </>
          }/>
          <Route path={"/difficulty"} element={ 
            <>
            <HeaderBack/> 
            <Difficulty updateGamePlaying={updateGamePlaying}/>
            </>
          }/>
          <Route path={"/gameplay"} element={ 
            <>
            <HeaderBack/> 
            <Game gameState={gameState} submitQuestion={questionSubmitted} nextQuestion={nextQuestion} />
            </>
          }/>
          <Route path={"/gameend"} element={ 
            <>
            <HeaderBack/> 
            <GameEnd gameState={gameState} resetGame={resetGame} />
            </>
          }/>
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
