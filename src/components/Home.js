import { Link } from 'react-router-dom'

const Home = ({updateGameType}) => {

  const setGameType = (game_type) => {
    updateGameType(game_type)
  }

  return (
    <div className="App-home">
      <p>Test your whatever skills blah blah blah...</p>
      <h2>Select a game type!</h2>
      <div>
        <Link className='game-type-btn' to="/difficulty" onClick={ () => setGameType("freestyle") }>FREESTYLE</Link>
        <Link className='game-type-btn' to="/difficulty" onClick={ () => setGameType("challenge") }>CHALLENGE</Link>
      </div>

    </div>
  )
}

export default Home