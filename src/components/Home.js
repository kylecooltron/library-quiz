import { Link } from 'react-router-dom'

const Home = ({updateGameType, boardGamesImg}) => {

  const setGameType = (game_type) => {
    updateGameType(game_type)
  }

  return (
    <div className="App-home">
      <img src={boardGamesImg} alt="Board Games" />
      <p>Test your gospel and church history knowledge!</p>
      <h2>Select a game type...</h2>
      <div>
        <Link className='game-type-btn gm-type-color-1' to="/difficulty" onClick={ () => setGameType("freestyle") }>FREESTYLE</Link>
        <Link className='game-type-btn gm-type-color-2' to="/difficulty" onClick={ () => setGameType("challenge") }>CHALLENGE</Link>
      </div>

    </div>
  )
}

export default Home