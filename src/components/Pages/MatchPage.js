import React from 'react'
import { Client } from 'boardgame.io/react'
import { Oversimplified } from '../../game/game'
import { OversimplifiedBoard } from '../../game/board'
import {API} from '../../game/api'
import { SocketIO } from 'boardgame.io/multiplayer'
import Cookies from 'universal-cookie'


export class MatchPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {gameClient: "empty"}
        this.matchAPI = new API(props.serverURL)
        this.cookies = new Cookies()
        this.matchID = props.match.match.params.matchID

        this.MultiplayerClient = Client({
            game: Oversimplified,
            numPlayers: 2,
            board: BoardWrapper({leaveMatch: () => this.leaveMatch()}),
            multiplayer: SocketIO({server: this.matchAPI.url}),
            debug: false,
        });

        console.log("CONSTRUCTOR")

        if (this.cookies.get(this.matchID)) {
            console.log("FOUND COOKIE")
            console.log(this.cookies.get(this.matchID))
            this.playerID = this.cookies.get(this.matchID).playerID
            this.credentials = this.cookies.get(this.matchID).credentials
            this.state = {gameClient: <this.MultiplayerClient matchID={this.matchID} playerID={this.playerID} credentials={this.credentials}/>}
        } else {
            this.matchAPI.getMatch(this.matchID)
                .then(({players}) => this.playerID = this.getIDFromPlayers(players))
                .then(() => 
                    this.matchAPI.joinMatch(this.matchID, {playerID: this.playerID, playerName: "bob"})
                        .then(({playerCredentials}) => this.credentials = playerCredentials)
                        .then(playerCredentials => this.setState({gameClient: <this.MultiplayerClient matchID={this.matchID} playerID={this.playerID} credentials={playerCredentials}/>}) )
                        .then(() => console.log("JOINED"))
                        .catch(reason => {console.error(reason); this.setState({gameClient: "Error"})})
                )
                .then(() => this.cookies.set(this.matchID, {playerID: this.playerID, credentials: this.credentials}), {path: '/'})
        }
    }

    leaveMatch() {
        return this.matchAPI.leaveMatch(this.matchID, {playerID: this.playerID, credentials: this.credentials})
            .then(() => this.setState({gameClient: "empty"}))
            .catch(reason => {console.error(reason); console.log({playerID: this.playerID, credentials: this.credentials})})
    }

    getIDFromPlayers(players) {
        let numPlayers = 0
        for (let player of players) {
            if (player.name) numPlayers++
        }
        return `${numPlayers}`
    }

    render() {
        console.log("MatchPage Render", this.state.gameClient)
        if (this.state.gameClient === "empty") {
            return (  
                <div className="row flex-center height100">
                    <div className="col top-space">
                        <h2>Loading...</h2>
                        <div className="loader"/>
                    </div>
                </div>
            )
        } else if (this.state.gameClient === "Error") {
            return <div className="row flex-center"><h2>Error: Game Not Found</h2></div>
        } else {
            console.log("why is this an error")
            return this.state.gameClient
            // return "thing"
        }
    }
}


function BoardWrapper(extraProps) {
    return props => <OversimplifiedBoard {...props} {...extraProps}/>
}