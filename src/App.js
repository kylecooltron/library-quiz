// react
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

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
  
  // each row in .tsv file should have at least this many columns:
  const CHECK_FOR_COLUMNS = 7;
  const DIFFICULTY_IDX = {
    "children": 0,
    "easy": 1,
    "medium": 2,
    "hard": 3,
  }
  // identify each used column index
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
    
    if(window.location.href.toString().split("/").at(-1) !== "library-quiz"){
      //window.location.href = '/library-quiz';
      console.log(window.location.href.toString().split("/").at(-1));
      console.log(window.location.href.toString().split("/"));
      console.log(window.location.href.toString());
    }

    getSpreadsheetInfo(setQuestionsData, CHECK_FOR_COLUMNS); }, []
  );

  const getRandomQuestionLookup = (difficulty) => {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let random_question_num = getRandomInt(0, questionsData[DIFFICULTY_IDX[difficulty]].length - 1);


    // return the random number and the difficulty used
    return [random_question_num, DIFFICULTY_IDX[difficulty]];
  }


  const updateGamePlaying = (playing, difficulty="easy") => {

    // define
    let questionLookups = [];
    let questionStartLookup = [];
    // set up ten random question lookups if type is challenge
    if(gameState.gameType === "challenge"){
      while(questionLookups.length <  10){
        let number_to_try = getRandomQuestionLookup(difficulty);
        if( !questionLookups.includes(number_to_try)){
          questionLookups.push(number_to_try);
        }
      }
      // start with the first one
      questionStartLookup = questionLookups[0];
    }

    if(gameState.gameType === "freestyle"){
      // find a random question that is the right difficulty
      // let tries = 1;
      // while(true){
      //   tries += 1;
        questionStartLookup = getRandomQuestionLookup(difficulty);
          //if(questionsData[questionStartLookup[1]][questionStartLookup[0]][COLUMN_IDX.question_type].toLowerCase() === "traditional"){
            // break;
          //}
      //   if(tries > 100){
      //     break;
      //   }
      // }
    }

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

    if(playing){
      loadQuestionInfo(questionStartLookup)
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
    let correct = checkAnswer(
      player_guess,
      gameState.questionInfo.correctAnswer,
      gameState.questionInfo.type,
      );

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

    let choices = []
    let questionDataRow = questionsData[questionLookup[1]][questionLookup[0]];

    // if there are more entries in the array after the correct answer
    if(questionDataRow.length > 8){
      // get all the other answers
      choices = questionDataRow.slice(8,-1);
      // get the correct answer
      choices.push(questionDataRow[COLUMN_IDX.question_correct_answer]);
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

        // ERROR HAPPENING HERE
        //if(questionDataRow[COLUMN_IDX.question_type].toLowerCase() === "traditional"){
          if(questionDataRow[COLUMN_IDX.question_text] !== gameState.questionInfo.text){
            break;
          }
        //}

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
          <Route path={"/library-quiz"} element={ 
            <>
            <HeaderHome/> 
            <Home boardGamesImg={boardGamesImg} updateGameType={updateGameType}/>
            </>
          }/>
          <Route path={"/library-quiz/difficulty"} element={ 
            <>
            <HeaderBack/> 
            <Difficulty updateGamePlaying={updateGamePlaying}/>
            </>
          }/>
          <Route path={"/library-quiz/gameplay"} element={ 
            <>
            <HeaderBack/> 
            <Game gameState={gameState} submitQuestion={questionSubmitted} nextQuestion={nextQuestion} />
            </>
          }/>
          <Route path={"/library-quiz/gameend"} element={ 
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
