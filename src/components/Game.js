import { useState } from 'react'
import { Link } from 'react-router-dom'


const Game = ({gameState, submitQuestion, nextQuestion}) => {

  const [answerSubmitted, setAnswerSubmitted] = useState(null)

  const displayLetters = ['A', 'B', 'C', 'D']

  const handleSubmit = (event) => {
    if (gameState.questionType === 'choice'){
      // handle multiple choice question
      const answer = Object.fromEntries(new FormData(event.target)).choice;
      setAnswerSubmitted(answer)
      submitQuestion(answer)
    }   
    if (gameState.questionType === 'text'){
      // handle text input question
      const answer = Object.fromEntries(new FormData(event.target)).text;
      setAnswerSubmitted("text")
      submitQuestion(answer)
    }
    resetForm()
    event.preventDefault()
  };

  const nextQuestionClick = () => {
    // reset some variables
    setAnswerSubmitted(null)
    nextQuestion()
  }

  const resetForm = () => {

    let ele = document.getElementsByName("choice");
    let i = 0;
    for(i=0;i<ele.length;i++)
        ele[i].checked = false;

    ele = document.getElementsByName("text");
    for(i=0;i<ele.length;i++)
        ele[i].checked = false;

  }
  
  return (
    <div className="App-game">
      <div className='quiz-info-display'>
      <h2>Difficulty: {gameState.difficulty}</h2>
      <p>
        Score: 
        {
          " " + gameState.score
        }
      </p>
      </div>

      <h3>Question { gameState.questionNum + "/" + gameState.totalQuestions }:</h3>
      <p>
        {gameState.questionAnswered 
          ? gameState.questionInfo 
          :gameState.questionText}
      </p>


      <form onSubmit={handleSubmit}>
        {
          gameState.questionType === 'choice' &&
          gameState.questionChoices.map((choice, index) => (
            <div key={displayLetters[index]} 
              style={
                (gameState.questionAnswered ? {color:'gray'}  : {color:'black'})
              }
              className={
              answerSubmitted === displayLetters[index]
              ? (gameState.questionCorrect ? "correct-answer" : 'incorrect-answer')
              : ''}
            >
            <input 
             type="radio"
             name="choice"
             id={displayLetters[index]} 
             value={displayLetters[index]}
             style={gameState.questionAnswered ? {visibility:'hidden'} : {visibility:'visible'}}
             required></input>
            <label htmlFor={displayLetters[index]}><small>{displayLetters[index]}) </small> {choice}</label>
            </div>
          ))
        }
        {
          gameState.questionType === 'text' &&
          <div>
            <div className='text-field-input'>
              <label htmlFor="text">Please input your answer:</label>
              <input
                type = "text"
                name = "text"
                id= "text" required></input>
              </div>
          </div>
        }
        {
          !gameState.questionAnswered &&
          <button type="submit"> Submit </button>
        }
      </form>
      {
        gameState.questionAnswered &&
        <div className="question-answered"
        style={gameState.questionCorrect ? {backgroundColor:'aquamarine'} : {backgroundColor:'pink'}}> 
        {
          gameState.questionCorrect ? <p>CORRECT!</p> : <p>INCORRECT</p>
        }
        </div>
      }
      {
        gameState.questionAnswered &&
        (gameState.questionNum < gameState.totalQuestions ?
          <button type='button' onClick={ nextQuestionClick }> Next Question </button>
        :
          <Link className='return-btn' to="/gameend" onClick={ nextQuestionClick }> Finish Quiz </Link>)
      }

    </div>
  )
}

export default Game