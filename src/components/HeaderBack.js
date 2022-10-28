
import { Link } from 'react-router-dom'

const HeaderBack = ({resetGame}) => {
  return (
    <header className="App-header">
        <h1>Library Quiz App</h1>
        <Link className='return-menu-btn' to="/library-quiz" onClick={resetGame}>{`< Return to Home`}</Link>
    </header>
  )
}

export default HeaderBack