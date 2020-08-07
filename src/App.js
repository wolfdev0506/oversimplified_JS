import { Client } from 'boardgame.io/react';
import { TicTacToe } from './Game';
import { OversimplifiedBoard } from './Board'
import { GameBoard } from './Board2'

const App = Client({
  game: TicTacToe,
  board: GameBoard
});

export default App;