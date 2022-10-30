import { Link } from 'react-router-dom'

const Difficulty = ({updateGamePlaying}) => {

  const startGame = (difficulty) => {
    updateGamePlaying(true, difficulty)
  }

  return (
    <div className="App-home">
      <h2>Select a difficulty to start!</h2>
      <div>
        {/* <button onClick={ () => startGame("children") }> test</button> */}
        <Link className='difficulty-btn df-children' to="/gameplay" onClick={ () => startGame("children") }>CHILDREN</Link>
        <Link className='difficulty-btn df-easy' to="/gameplay" onClick={ () => startGame("easy") }>EASY</Link>
        <Link className='difficulty-btn df-medium' to="/gameplay" onClick={ () => startGame("medium") }>MEDIUM</Link>
        <Link className='difficulty-btn df-hard' to="/gameplay" onClick={ () => startGame("hard") }>HARD</Link>
      </div>
    </div>
  )
}

export default Difficulty