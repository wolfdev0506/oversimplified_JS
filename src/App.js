import { Client } from 'boardgame.io/react';
import { TicTacToe } from './Game';
import { GameBoardComponent } from './Board'

const App = Client({
    game: TicTacToe,
    board: GameBoardComponent
});

export default App;