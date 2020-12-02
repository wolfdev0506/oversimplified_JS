import React from 'react'
import * as Buttons from '../Buttons/'
import {API} from '../../game/api'

const InputBox = ({ value, onChange }) => (
    // stop the page from refreshing upon hitting Enter
    <form onSubmit={(e) => e.preventDefault()}>
        <label>Game Server:</label>
        <input type="text" placeholder="Web Address" onChange={onChange} value={value}/>
    </form>
)

const MatchList = ({matches, server}) => (
    <ul className="series outline">
        <li className="bold game-list-item" id="header">
            <h3>ID</h3>
            <h3>Players</h3>
            <h3>Status</h3>
            <h3>Action</h3>
        </li>
        {matches === "loading"? 
            <li className="flex-center"><p>Fetching Games...</p></li> : (
                matches.length > 0? 
                    matches.map(match => <Match data={match} server={server}/>) : 
                    <li className="flex-center"><p>No Games Currently Running</p></li>
            )
        }
    </ul>
)

const Match = ({data, server}) => (
    <li className="game-list-item">
        <p>{data.matchID}</p>
        <p>{getPlayerNums(data.players)[0]}</p>
        <p>{getPlayerNums(data.players)[1]? "Full" : "Open"}</p>
        {getPlayerNums(data.players)[1]? 
            <span/>
            :
            <div className="btn-container">
                <a className="join-btn btn-primary" href={`/match/${data.matchID}${server}`}>Join</a>
            </div>
        }
    </li>
)

function getPlayerNums(players) {
    let numPlayers = 0
    for (let player of players) {
        if (player.name) numPlayers++
    }
    return [`${numPlayers}/${players.length}`, numPlayers === players.length? "Full":null]
}

export class LobbyPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            server: props.serverURL,
            matches: "loading"
        }
        this.gamesUpdater = setTimeout(() => this.updateGames(), 1000)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.updateGame = this.updateGames.bind(this)
    }

    handleInputChange(event) {
        clearTimeout(this.gamesUpdater)

        this.setState({server:event.target.value, matches: "loading"})

        this.gamesUpdater = setTimeout(() => this.updateGames(), 1000)
    }

    updateGames() {
        const lobbyAPI = new API(this.state.server)
        lobbyAPI.listMatches()
            .then(({matches}) => this.setState({"matches": matches}))
            .then(() => this.gamesUpdater = setTimeout(() => this.updateGames(), 2000))
            .catch(reason => {console.error(reason); this.setState({matches: false})})
    }

    render() {
        return (
            <div className="row flex-center">
                <div className="vert-col">
                    <h1 className="title">Game Lobby</h1>
                    <div className="row btn-container">
                        <InputBox value={this.state.server} onChange={this.handleInputChange} />
                        <a className="btn btn-primary" href={this.state.server === this.props.serverURL? "/create" : `/create/${this.state.server}`} id="createButton">Create Game</a>
                    </div>
                    {this.state.matches === false? "Error reaching game server" : <MatchList matches={this.state.matches} server={this.state.server === this.props.serverURL? "" : `/${this.state.server}`} />}
                    <Buttons.HelpButton />
                    <Buttons.HomeButton />
                </div>
            </div>
        )
    }
}