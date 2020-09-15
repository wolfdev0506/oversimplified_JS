import React from 'react'
import { Client } from 'boardgame.io/react'
import { Oversimplified } from '../../game/game'
import { OversimplifiedBoard } from '../../game/board'
import {API} from '../../game/api'
import { SocketIO } from 'boardgame.io/multiplayer'
import Cookies from 'universal-cookie'


export function JoinPage_({ serverURL }) {
    const [matchID, playerID] = serverURL.split('/').slice(-2, 0)


}

export class MatchPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {MultiplayerClient: null}
        this.matchAPI = new API(props.serverURL)
        this.cookies = new Cookies()
        this.matchID = props.match.match.params.matchID

        this.MultiplayerClient = Client({
            game: Oversimplified,
            numPlayers: 2,
            board: OversimplifiedBoard,
            multiplayer: SocketIO({server: this.matchAPI.url}),
            debug: false,
        });

        if (this.cookies.get(this.matchID)) {
            this.playerID = this.cookies.get(this.matchID).playerID
            this.credentials = this.cookies.get(this.matchID).credentials
            this.state = {MultiplayerClient: <this.MultiplayerClient matchID={this.matchID} playerID={this.playerID} credentials={this.credentials}/>}
        } else {
            this.matchAPI.getMatch(this.matchID)
                .then(({players}) => this.playerID = this.getIDFromPlayers(players))
                .then(() => 
                    this.matchAPI.joinMatch(this.matchID, {playerID: this.playerID, playerName: "bob"})
                        .then(({playerCredentials}) => this.setState({MultiplayerClient: <this.MultiplayerClient matchID={this.matchID} playerID={this.playerID} credentials={playerCredentials}/>}) )
                        .catch(reason => {console.error(reason); this.setState({MultiplayerClient: "Error"})})
                )
                .then(() => this.cookies.set(this.matchID, {playerID: this.playerID, credentials: this.credentials}), {path: '/'})
        }


    }

    getIDFromPlayers(players) {
        let numPlayers = 0
        for (let player of players) {
            if (player.name) numPlayers++
        }
        return `${numPlayers}`
    }

    render() {
        if (this.state.MultiplayerClient === null) {
            return (  
                <div className="row flex-center height100">
                    <div className="col top-space">
                        <h2>Loading...</h2>
                        <div className="loader"/>
                    </div>
                </div>
            )
        } else if (this.state.MultiplayerClient === "Error") {
            return <div className="row flex-center"><h2>Error: Game Not Found</h2></div>
        } else {
            return this.state.MultiplayerClient
        }
    }
}