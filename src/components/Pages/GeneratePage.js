import React from 'react'
import {generateGameBoard} from '../../game/game'

export class GeneratePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {display:"loading"}
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
        const setupData = generateGameBoard(20000)
        this.setState({display: JSON.stringify(setupData)})
    }

    render() {
        return this.state.display
    }
}