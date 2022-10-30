// react
import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

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
      questionLookups: [],
      totalQuestions: 1,


      // default error values
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

      questionAnswered: false,
      questionCorrect: null,
      questionsAnsweredCorrectly: 0,
      score: "100%"
    })
  
  // each row in .tsv file should have at least this many columns:
  const CHECK_FOR_COLUMNS = 7;
  // used for turning difficulty string into index number
  const DIFFICULTY_IDX = {
    "children": 0,
    "easy": 1,
    "medium": 2,
    "hard": 3,
  }
  // identify each used column index for questions
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



  useEffect(() => {
    
    // if user refreshes page, redirect them to home page so they don't see 
    // page without proper data loaded for questions and difficulty
    if(window.location.href.toString().split("/").filter(n => n).at(-1) !== "library-quiz"){
      window.location.href = 'https://kylecooltron.github.io/library-quiz/';
    }

    // parse questions data from .tsv file
    getSpreadsheetInfo(setQuestionsData, CHECK_FOR_COLUMNS); }, []
  );

  
  const getRandomQuestionLookup = (difficulty) => {
    /*
    * randomly chooses a question number of a given difficulty and returns both
    * Returns [int, int]: (question number, difficulty index)
    */
    function getRandomInt(min, max) {
      // get a random integer within range
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let random_question_num = getRandomInt(0, questionsData[DIFFICULTY_IDX[difficulty]].length - 1);
    // return the random number and the difficulty used
    return [random_question_num, DIFFICULTY_IDX[difficulty]];
  }


  const updateGamePlaying = (playing, difficulty="easy") => {
    /*
    * updates the game state to playing or not
    * if playing is true, gather starting questions
    */

    // default empty arrays
    let questionLookups = [];
    let questionStartLookup = [];

    // if playing mode has been set
    if(playing){
      // set up ten random question lookups if type is challenge
      if(gameState.gameType === "challenge"){
        // keep looking until we have found ten
        while(questionLookups.length <  10){
          let number_to_try = getRandomQuestionLookup(difficulty);
          // make sure this question hasn't already been selected (avoid duplicates)
          if( !questionLookups.includes(number_to_try)){
            questionLookups.push(number_to_try);
          }
        }
        // start with the first one
        questionStartLookup = questionLookups[0];
      }
      if(gameState.gameType === "freestyle"){
          questionStartLookup = getRandomQuestionLookup(difficulty);
      }
    }

    // set game state
    setGameState( (g) => ({
      ...g,
      gamePlaying: playing,
      difficulty: difficulty,
      questionNum: 0,
      questionLookups: questionLookups,
      totalQuestions: questionLookups.length - 1,
      questionAnswered: false,
      questionCorrect: null,
      questionsAnsweredCorrectly: 0,
      score: "100%"
    }))

    // load the starting question
    if(playing){
      loadQuestionInfo(questionStartLookup)
    }
  }

  const updateGameType = (game_type) => {
    // either "challenge" or "freestyle"
    setGameState( (g) => ({
      ...g,
      gameType: game_type,
    }))
  }


  const questionSubmitted = (player_guess) => {

    // check if the players answer was correct
    let correct = checkAnswer(
      player_guess,
      gameState.questionInfo.correctAnswer,
      gameState.questionInfo.type,
      );

    // update the score
    let newScore = ((gameState.questionsAnsweredCorrectly + (correct ? 1 : 0)) / (gameState.questionNum + 1)) * 100
    setGameState( {
      ...gameState,
      questionAnswered: true,
      questionCorrect: correct,
      questionsAnsweredCorrectly: gameState.questionsAnsweredCorrectly + (correct ? 1 : 0),
      score: +newScore.toFixed(2) + "%"
    })
  }

  const loadQuestionInfo = (questionLookup) => {
    /*
    * Loads question information from questionsData
    */

    // set to defaults
    let choices = []
    let questionDataRow = questionsData[questionLookup[1]][questionLookup[0]];

    // make sure this question has all the columns we expect
    // (multiple choice have more than eight)
    if(questionDataRow.length > 8){
      // get all the other answers
      choices = questionDataRow.slice(8,-1);
      // get the correct answer
      choices.push(questionDataRow[COLUMN_IDX.question_correct_answer]);
      // filter the choices
      choices = choices
        // get rid of empty values
        .filter((a) => a.trim() !== '')
        // randomize order
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    }

    setGameState( (g) => ({
      ...g,

      questionInfo: {
        title: questionDataRow[COLUMN_IDX.game_title],
        year: questionDataRow[COLUMN_IDX.year_published],
        category: questionDataRow[COLUMN_IDX.question_category],
        difficulty: questionDataRow[COLUMN_IDX.question_difficulty],
        type: questionDataRow[COLUMN_IDX.question_type],
        points: questionDataRow[COLUMN_IDX.question_points],
        text: questionDataRow[COLUMN_IDX.question_text],
        correctAnswer: questionDataRow[COLUMN_IDX.question_correct_answer],
        choices: choices,
      },
      
    }))
  }


  const nextQuestion = () => {
    /*
    * set up the next question
    */

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
        loadQuestionInfo(gameState.questionLookups[nextQuestionNum])
      }
    }
    if (gameState.gameType === "freestyle"){
      // make sure we find a question that is the right difficulty
      let tries = 1;
      let nextQuestionLookup = [[0],[0]];
      while(true){
        tries += 1;
        if(tries > 100){
          break;
        }
        nextQuestionLookup = getRandomQuestionLookup(gameState.difficulty);
        let questionDataRow = questionsData[nextQuestionLookup[1]][nextQuestionLookup[0]];
          // make sure it's not the same question we just answered
          if(questionDataRow[COLUMN_IDX.question_text] !== gameState.questionInfo.text){
            break;
          }
      }

        // update state to next question
        setGameState( (g) => ({
          ...g,
          questionAnswered: false,
          questionCorrect: null,
          questionNum: 0,
        }))
        // update the question display info
        loadQuestionInfo(nextQuestionLookup)
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
