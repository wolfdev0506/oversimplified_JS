import React from 'react'
import { Client } from 'boardgame.io/react'
import {Oversimplified} from '../../game/game'
import {OversimplifiedBoard} from '../../game/board'

const App = Client({
    // A game object.
    game: Oversimplified,
  
    // The number of players.
    numPlayers: 1,
  
    // Your React component representing the game board.
    // The props that this component receives are listed below.
    board: OversimplifiedBoard,
    multiplayer: true,
  
    // Set to false to disable the Debug UI.
    debug: false
  });

const JoinPage = ({serverURL}) => {
}

export default JoinPage