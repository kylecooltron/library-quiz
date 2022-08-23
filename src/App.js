// react
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// index components
import Home from './components/Home'
import Footer from './components/Footer'
import Game from './components/Game'
import GameEnd from './components/GameEnd'

// style
import './App.css';

// get google sheets data
import {getSpreadsheetInfo} from './SheetsData.js'

function App() {

  const [questionsData, setQuestionsData] = useState(null)
  const [gameState, setGameState] = useState({
      gamePlaying: false,
      difficulty: 'easy',
      questionNum: 1,
      totalQuestions: 1,
      questionText: "error",
      questionType: 'choice',
      questionCorrectAnswer: null,
      questionChoices: [],
      questionAnswered: false,
      questionCorrect: null,
      questionInfo: "",
      questionsAnsweredCorrectly: 0,
      score: "100%"
    })
  
  useEffect(() => { getSpreadsheetInfo(setQuestionsData) }, []);

  const updateGamePlaying = (playing, difficulty="easy") => {
    setGameState( (g) => ({
      ...g,
      gamePlaying: playing,
      difficulty: difficulty,
      questionNum: 1,
      totalQuestions: questionsData.values.length - 1,
      questionAnswered: false,
      questionCorrect: null,
      questionsAnsweredCorrectly: 0,
      score: "100%"
    }))

    if(playing){
      loadQuestionInfo(gameState.questionNum)
    }
  }

  const questionSubmitted = (answer) => {
    let correct = (answer.toLowerCase().replace(/\s/g, '') === gameState.questionCorrectAnswer.toLowerCase().replace(/\s/g, ''))
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
    setGameState( (g) => ({
      ...g,
      questionText: questionsData.values[questionNumber][0],
      questionType: questionsData.values[questionNumber][1],
      questionCorrectAnswer: questionsData.values[questionNumber][2],
      questionChoices: [
        questionsData.values[questionNumber][3],
        questionsData.values[questionNumber][4],
        questionsData.values[questionNumber][5],
        questionsData.values[questionNumber][6]
      ],
      questionInfo: questionsData.values[questionNumber][7]
      
    }))
  }


  const nextQuestion = () => {

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
          <Route path='/' element={ <Home updateGamePlaying={updateGamePlaying}/> }/>
          <Route path='/library-quiz' element={ <Home updateGamePlaying={updateGamePlaying}/> }/>
          <Route path='/gameplay' element={ <Game gameState={gameState} submitQuestion={questionSubmitted} nextQuestion={nextQuestion} /> }/>
          <Route path='/gameend'  element={ <GameEnd gameState={gameState} resetGame={resetGame} /> } />
        
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
