import React from 'react'
import {API} from '../../game/api'
import * as Buttons from '../Buttons/'
import BoardFetcher from '../../game/BoardFetcher'


export class CreatePage extends React.Component {
    constructor(props) {
        super(props)

        this.options = {
            board: -1,
        }

        this.state = {boardsLoaded: false}

        this.mapSelectChange = this.mapSelectChange.bind(this)
        this.generateBoard = this.generateBoard.bind(this)
        this.boardFetcher = new BoardFetcher()
        this.boardFetcher.fetchNames().then(() => this.setState({boardsLoaded: true}))
    }

    getRandBoard() {
        const [boardType, boardName] = this.boardFetcher.getTypeNamePairs()[Math.floor(Math.random() * this.boardFetcher.size())]
        return {boardType, boardName}
    }

    generateBoard() {
        const setupData = {...(this.options.board === -1? this.getRandBoard() : this.options.board)}

        const lobbyAPI = new API(this.props.serverURL)
        lobbyAPI.createMatch({numPlayers: 2, setupData})
            .then(({matchID}) => window.location.href = `/match/${matchID}${this.props.indirect? "/" + this.props.serverURL : ""}`)
            .catch(error => console.error(error))
    }

    mapSelectChange(event) {
        this.options.board = JSON.parse(event.target.value)
    }

    render() {
        return (
        <div className="row flex-center">
            <div className="vert-col">
                <h1 className="title">Customize Game</h1>
                <div className="row">
                    {
                        this.state.boardsLoaded? // Shows loader while fetching boards
                            <MapSelect boards={this.boardFetcher.boards} onChange={this.mapSelectChange}/>
                            : <div className="loader"/>
                    }
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

const MapSelect = ({boards, onChange }) => (
    <>
        <label>Game Map:</label>
        <select style={{width: '200px'}} onChange={onChange}>
            <option value={-1}>Random Pick</option>
            {Object.keys(boards).map(t => 
                <optgroup label={t}>
                    {boards[t].map((name) => <option value={JSON.stringify({boardType: t, boardName: name})}>{name}</option>)}
                </optgroup>
            )}
        </select>
    </>
)