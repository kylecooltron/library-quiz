import { Link } from 'react-router-dom'



const GameEnd = ( { gameState, resetGame} ) => {

  return (
    <div className='final-score'>
      <h1>Quiz Complete</h1>
      <p>Final score:  { gameState.questionsAnsweredCorrectly + "/" + gameState.totalQuestions }</p>
      
      <h2>{gameState.score}</h2>

      <Link className='return-btn' to="/library-quiz" onClick={resetGame}>Return to Home</Link>
    </div>

  )
}

export default GameEnd