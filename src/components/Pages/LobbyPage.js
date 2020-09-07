import React from 'react';
import { Lobby } from 'boardgame.io/react';
import {Oversimplified} from '../../game/game'
import { OversimplifiedBoard} from '../../game/board'

export const LobbyPage = ({serverURL}) => (
    <Lobby gameServer={`https://${serverURL}`} lobbyServer={`https://${serverURL}`} gameComponents={[{game: Oversimplified, board: OversimplifiedBoard}]}/>
)