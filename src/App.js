import { Client } from 'boardgame.io/react';
import { TicTacToe } from './Game';
import { OversimplifiedBoard } from './Board'

const App = Client({
  game: TicTacToe,
  board: OversimplifiedBoard
});

export default App;