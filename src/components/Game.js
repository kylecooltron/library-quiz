import { useState } from 'react'
import { Link } from 'react-router-dom'


const Game = ({gameState, submitQuestion, nextQuestion}) => {

  const [answerSubmitted, setAnswerSubmitted] = useState(null)

  const displayLetters = ['A', 'B', 'C', 'D']

  const handleSubmit = (event) => {
    if (gameState.questionInfo.type === 'Multiple Choice'){
      // handle multiple choice question
      const answer = Object.fromEntries(new FormData(event.target)).choice;
      setAnswerSubmitted(answer)
      submitQuestion(answer)
    }   
    if (gameState.questionInfo.type === 'Traditional'){
      // handle text input question
      const answer = Object.fromEntries(new FormData(event.target)).text;
      setAnswerSubmitted("text")
      submitQuestion(answer)
    }
    event.preventDefault()
  };

  const nextQuestionClick = () => {
    // reset some variables
    setAnswerSubmitted(null)
    nextQuestion()
    resetForm()
  }

  const resetForm = () => {

    let ele = document.getElementsByName("choice");
    let i = 0;
    for(i=0;i<ele.length;i++)
        ele[i].checked = false;

    ele = document.getElementsByName("text");
    for(i=0;i<ele.length;i++)
        ele[i].value = "";

  }
  
  return (
    <div className="App-game">
      <div className='quiz-info-display'>
      <div className='extra-margin-left'>
        <h2>Difficulty: {gameState.difficulty}</h2>
      </div>

        {
           <div>
              {
                gameState.questionInfo.points !== 'N/A' ?
                <p className='question-info'>
                  {`This question, from the game `}
                  <br />
                  <em className='game-title'>{gameState.questionInfo.title},</em>
                  <br />
                  {`(made in the year ${gameState.questionInfo.year}), is worth ${gameState.questionInfo.points} points.`}
                </p>
                : 
                <p className='question-info'>
                  {`This question is from the game `}
                  <br />
                  <em className='game-title'>{gameState.questionInfo.title},</em>
                  <br />
                  {` made in the year `}
                  {`${gameState.questionInfo.year}.`}
                </p>
              }
            </div>  
        }

      {
        gameState.gameType === 'challenge' ?
          <div  className='extra-margin-right'>
            <p>
              Score: {" " + gameState.score}
            </p>
            <b>Question { (gameState.questionNum + 1) + "/" + (gameState.totalQuestions + 1) }:</b>
          </div>
          :
          <div>
            <p>Freestyle
              <br />
              <small>(infinite questions) </small> 
               </p>
          </div>
      }
      </div>
      <hr />
              <h2>Question</h2>
              <p>
              {gameState.questionInfo.text}
              </p>



      <form onSubmit={handleSubmit}>
        {
          gameState.questionInfo.type === 'Multiple Choice' &&
          gameState.questionInfo.choices.map((choice, index) => (
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
             value={choice}
             style={gameState.questionAnswered ? {visibility:'hidden'} : {visibility:'visible'}}
             required></input>
            <label htmlFor={displayLetters[index]}><small>{displayLetters[index]} </small> {choice}</label>
            </div>
          ))
        }
        {
          gameState.questionInfo.type === 'Traditional' &&
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
          gameState.questionCorrect ? 
            <p>
              CORRECT!
              <br />
              <small>"{gameState.questionInfo.correctAnswer}"</small>
            </p> 
          : <p>
              INCORRECT
              <br />
              <small>Correct answer was: "{gameState.questionInfo.correctAnswer}"</small>
            </p>
        }
        </div>
      }

      {
        gameState.gameType === 'challenge' &&
          (gameState.questionAnswered &&
          (gameState.questionNum < gameState.totalQuestions ?
            <button type='button' onClick={ nextQuestionClick }> Next Question </button>
          :
            <Link className='return-btn' to="/gameend" onClick={ nextQuestionClick }> Finish Quiz </Link>))
      }
      {
        gameState.gameType === 'freestyle' &&
          (gameState.questionAnswered &&
          <button type='button' onClick={ nextQuestionClick }> Next Question </button>)
      }


    </div>
  )
}

export default Game