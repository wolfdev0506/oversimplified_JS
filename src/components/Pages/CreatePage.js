import React from 'react'
import {API} from '../../game/api'
import boards from '../../game/boards'
import * as Buttons from '../Buttons/'

const MapSelect = ({onChange }) => (
    // stop the page from refreshing upon hitting Enter
    <form onSubmit={(e) => e.preventDefault()}>
        <label>Game Map:</label>
        <select style={{width: '200px'}} onChange={onChange}>
            <option value={-1}>Random</option>
            {Object.keys(boards).map(v => 
                <optgroup label={v}>
                    {boards[v].map(({name}, i) => <option value={`${[v, i]}`}>{name}</option>)}
                </optgroup>
            )}
        </select>
    </form>
)

export class CreatePage extends React.Component {
    constructor(props) {
        super(props)

        this.options = {
            boardID: -1,
        }

        this.mapSelectChange = this.mapSelectChange.bind(this)
        this.generateBoard = this.generateBoard.bind(this)
    }

    getRandBoard() {
        var boardList = Object.keys(boards).map(v => 
                boards[v].map((_, i) => [v, i])
        ).flat()
        return boardList[Math.floor(Math.random() * boardList.length)]
    }

    generateBoard() {
        const setupData = {boardID: this.options.boardID === -1? this.getRandBoard() : JSON.parse(this.options.boardID)}

        const lobbyAPI = new API(this.props.serverURL)
        lobbyAPI.createMatch({numPlayers: 2, setupData})
            .then(({matchID}) => window.location.href = `/match/${matchID}${this.props.indirect? "/" + this.props.serverURL : ""}`)
            .catch(error => console.error(error))
    }

    mapSelectChange(event) {
        this.options.boardID = event.target.value
    }

    render() {
        return (
        <div className="row flex-center">
            <div className="vert-col">
                <h1 className="title">Customize Game</h1>
                <div className="row">
                    <MapSelect onChange={this.mapSelectChange}/>
                </div>

                <div className="row btn-container">
                    <button className="btn btn-primary" onClick={this.generateBoard}>
                        Create Game
                    </button>
                </div>
                <Buttons.LobbyButton/>
            </div>
        </div>
        )
    }
}