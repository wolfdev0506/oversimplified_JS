import React from 'react'
import {API} from '../../game/api'
import {createGameBoard, generateGameBoard} from '../../game/game'

export class CreatePage extends React.Component {

    componentDidMount() {
        // Start after DOM is rendered
        setTimeout(() => {
            console.log("start")
            this.generateBoard()
            console.log("done")
        }, 500)
    }

    generateBoard() {
        const setupData = generateGameBoard()

        const lobbyAPI = new API(this.props.serverURL)
        lobbyAPI.createMatch({numPlayers: 2, setupData})
            .then(({gameID}) => window.location.href = `/match/${gameID}`)


    }

    render() {
        console.log("render")
        return (
        <div className="row flex-center height100">
            <div className="col top-space">
                <h2>Generating Map...</h2>
                <div className="loader"/>
            </div>
        </div>
        )
    }
}