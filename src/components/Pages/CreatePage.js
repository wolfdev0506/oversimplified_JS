import React from 'react'
import {API} from '../../game/api'
import {generateGameBoard} from '../../game/game'
import testData from '../../testData.json'

export class CreatePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {display:""}
    }

    componentDidMount() {
        // Start after DOM is rendered
        setTimeout(() => {
            console.log("start")
            this.generateBoard()
            console.log("done")
        }, 500)
    }

    generateBoard() {
        // const setupData = generateGameBoard()
        // this.setState({display: JSON.stringify(setupData)})
        const setupData = testData

        const lobbyAPI = new API(this.props.serverURL)
        lobbyAPI.createMatch({numPlayers: 2, setupData})
            .then(({matchID}) => window.location.href = `/match/${matchID}${this.props.indirect? "/" + this.props.serverURL : ""}`)
            .catch(error => console.error(error))


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
        // this.state.display
        )
    }
}