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
        console.log(props)
        this.state = {error: false, renderBoard:false}
        this.matchAPI = new API(props.serverURL)
        this.cookies = new Cookies()
        this.matchID = props.match.params.matchID

        this.MultiplayerClient = Client({
            game: Oversimplified,
            numPlayers: 2,
            board: BoardWrapper({leaveMatch: () => this.leaveMatch()}),
            multiplayer: SocketIO({server: this.matchAPI.url}),
            debug: false,
        });

        if (this.cookies.get(this.matchID)) {
            let cookie = this.cookies.get(this.matchID)
            this.playerID = cookie.playerID
            this.credentials = cookie.credentials
            this.state.renderBoard = true
        } else {
            this.matchAPI.getMatch(this.matchID)
                .then(({players}) => this.playerID = this.getIDFromPlayers(players))
                .then(() => 
                    this.matchAPI.joinMatch(this.matchID, {playerID: this.playerID, playerName: "bob"})
                        .then(({playerCredentials}) => {this.credentials = playerCredentials; this.setState({renderBoard: true})})
                        .catch(reason => {console.error(reason); this.setState({error: true})})
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
        if (this.state.error) {
            return <div className="row flex-center"><h2>Error: Game Not Found</h2></div>
        } else if (this.state.renderBoard) {
            return <this.MultiplayerClient matchID={this.matchID} playerID={this.playerID} credentials={this.credentials}/>
        } else {
            return (
                <div className="row flex-center height100">
                    <div className="col top-space">
                        <h2>Loading...</h2>
                        <div className="loader"/>
                    </div>
                </div>
            )
        }
    }
}


function BoardWrapper(extraProps) {
    return props => <OversimplifiedBoard {...props} {...extraProps}/>
}