import { Link } from 'react-router-dom'

const Home = ({updateGamePlaying}) => {

  const startGame = (difficulty) => {
    updateGamePlaying(true, difficulty)
  }

  return (
    <div className="App-home">
      <p>Test your whatever skills blah blah blah...</p>
      <h2>Select a difficulty to start!</h2>
      <div>
        <Link className='difficulty-btn' to="/gameplay" onClick={ () => startGame("easy") }>EASY</Link>
        <Link className='difficulty-btn' to="/gameplay" onClick={ () => startGame("medium") }>MEDIUM</Link>
        <Link className='difficulty-btn' to="/gameplay" onClick={ () => startGame("hard") }>HARD</Link>
      </div>

    </div>
  )
}

export default Home