import React from 'react'
import {API} from '../../game/api'
import boards from '../../game/boards'

const MapSelect = ({onChange }) => (
    // stop the page from refreshing upon hitting Enter
    <form onSubmit={(e) => e.preventDefault()}>
        <label>Game Map:</label>
        <select style={{width: '200px'}} onChange={onChange}>
            <option value={-1}>Random</option>
            {boards.map(({name}, i) => <option value={i}>{name}</option>)}
        </select>
    </form>
)

export class CreatePage extends React.Component {
    constructor(props) {
        super(props)

        this.options = {
            map: -1,
        }

        this.mapSelectChange = this.mapSelectChange.bind(this)
        this.generateBoard = this.generateBoard.bind(this)
    }

    generateBoard() {
        const setupData = {boardID: this.options.map === -1? Math.floor(Math.random() * boards.length) : this.options.map}

        const lobbyAPI = new API(this.props.serverURL)
        lobbyAPI.createMatch({numPlayers: 2, setupData})
            .then(({matchID}) => window.location.href = `/match/${matchID}${this.props.indirect? "/" + this.props.serverURL : ""}`)
            .catch(error => console.error(error))
    }

    mapSelectChange(event) {
        this.options.map = event.target.value
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
            </div>
        </div>
        )
    }
}