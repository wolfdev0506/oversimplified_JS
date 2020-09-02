import React from 'react'
import { Prompt } from "react-router-dom";
import { Client } from 'boardgame.io/react';
import * as Buttons from '../Buttons/'
import { Oversimplified } from '../../game/game';
import { OversimplifiedBoard } from '../../game/board'
import '../../css/shared.css'

const SandboxClient = Client({
    game: Oversimplified,
    board: OversimplifiedBoard,
    debug: false
});

const SandboxPage = () => (
    <div className="vert-col">
        <SandboxClient />
        <Buttons.HelpButton />
        <Buttons.HomeButton />
        <Prompt message="Are you sure you want to leave?" />
    </div>
)

export default SandboxPage;