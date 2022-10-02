// react
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// index components
import Home from './components/Home'
import Difficulty from './components/Difficulty'
import Footer from './components/Footer'
import Game from './components/Game'
import GameEnd from './components/GameEnd'

// style
import './App.css';

// get CSV data
import {getSpreadsheetInfo} from './CSVData.js'

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
          if(questionsData[number_to_try][3].toLowerCase() === difficulty){
            questionNumbers.push(number_to_try);
          }
        }
      }
      console.log(questionNumbers)
      questionStartNumber = questionNumbers[0];
    }

    if(gameState.gameType === "freestyle"){
      questionStartNumber = getRandomQuestionNumber();
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
    console.log(questionsData);
  }


  const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  const deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
  // This function was provided by Tibos on stack overflow https://stackoverflow.com/questions/20425771/how-to-replace-1-with-first-2-with-second-3-with-third-etc
  function stringifyNumber(n) {
    if (n < 20) return special[n];
    if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
    return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
  }

  const questionSubmitted = (player_guess) => {

    let correct = false;

    if(gameState.questionInfo.type === "Traditional"){
    let guess = player_guess.toLowerCase();
    let answer = gameState.questionInfo.correctAnswer.toLowerCase();
    if(answer.includes(guess)){
      correct = true;
    }else{
      guess.replace(/[^a-zA-Z0-9 ]/g, "");
      guess.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');
      answer.replace(/[^a-zA-Z0-9 ]/g, "");
      answer.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');
      for(let word of guess.split(" ")){
        if(answer.split(" ").includes(word)){
          correct = true;
        }
      }

      if(!correct){
        let defaultcorrect = true;
        let guessNumbers = guess.match(/[-+]?[0-9]*\.?[0-9]+/g);
        if(guessNumbers == null){
          defaultcorrect = false;
        }else{
          if(guessNumbers.length === 0){
            defaultcorrect = false;
          }
        }
        if(defaultcorrect){
          for(let number of guessNumbers){
            if(!answer.includes(stringifyNumber(number))){
              defaultcorrect = false;
            }
          }
        }
    
        if(defaultcorrect === true){
          correct = true;
        }else{
          let guess_letters = guess.split("");
          let answer_letters = answer.split("");
          let min_required_match_letters = 1;
          if(answer_letters.length <=2 ){
            min_required_match_letters = answer_letters.length;
          }else{
            min_required_match_letters = Math.round(answer_letters.length * 0.80);
          }
          if(min_required_match_letters < Math.round(guess_letters.length * 0.80) ){
            min_required_match_letters = Math.round(guess_letters.length * 0.80);
          }
          let matching_letters = 0;
          for(let letter of guess_letters){
            let lookIndex = answer_letters.findIndex((item) => item === letter);
            if(lookIndex !== -1){
              matching_letters += 1;
              answer_letters.slice(lookIndex, 1);
            }
          }
          if(matching_letters >= min_required_match_letters){
            correct = true;
          }
        }
      }
    }
    }

    if(gameState.questionInfo.type === "Multiple Choice"){
      correct = (player_guess.toLowerCase().replace(/\s/g, '') === gameState.questionInfo.correctAnswer.toLowerCase().replace(/\s/g, ''))
    }
    
    let newScore = ((gameState.questionsAnsweredCorrectly + (correct ? 1 : 0)) / gameState.questionNum) * 100
    setGameState( {
      ...gameState,
      questionAnswered: true,
      questionCorrect: correct,
      questionsAnsweredCorrectly: gameState.questionsAnsweredCorrectly + (correct ? 1 : 0),
      score: +newScore.toFixed(2) + "%"
    })
  }

  const loadQuestionInfo = (questionNumber) => {

    console.log(questionNumber);

    let choices = []
    // if there are more entries in the array after the correct answer
    if(questionsData[questionNumber].length > 8){
      choices = questionsData[questionNumber].slice(8,-1);
      choices.push(questionsData[questionNumber][7]);
      choices = choices
        .filter((a) => a.trim() !== '')
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    }

    setGameState( (g) => ({
      ...g,

      questionInfo: {
        title: questionsData[questionNumber][0],
        year: questionsData[questionNumber][1],
        category: questionsData[questionNumber][2],
        difficulty: questionsData[questionNumber][3],
        type: questionsData[questionNumber][4],
        points: questionsData[questionNumber][5],
        text: questionsData[questionNumber][6],
        correctAnswer: questionsData[questionNumber][7],
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
      let nextQuestionNum = getRandomQuestionNumber();

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
      <header className="App-header">
        <h1>Library Quiz App</h1>
      </header>
      <Router>
        <Routes>
          <Route path='/' element={ <Home updateGameType={updateGameType}/> }/>
          <Route path='/library-quiz' element={ <Home updateGameType={updateGameType}/> }/>
          <Route path='/difficulty' element={ <Difficulty updateGamePlaying={updateGamePlaying}/> }/>
          <Route path='/gameplay' element={ <Game gameState={gameState} submitQuestion={questionSubmitted} nextQuestion={nextQuestion} /> }/>
          <Route path='/gameend'  element={ <GameEnd gameState={gameState} resetGame={resetGame} /> } />
        
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
