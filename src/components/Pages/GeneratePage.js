import { points } from '@turf/turf'
import React from 'react'
import {generateGameBoard, WIDTH, HEIGHT} from '../../game/game'

export class GeneratePage extends React.Component {
    constructor(props) {
        super(props)
        this.canvasScale = 1
        this.data = {width: WIDTH, height: HEIGHT}
        // this.state = {display:"loading", data: {mapTiles: []}}
        this.mapRef = React.createRef()
    }

    componentDidMount() {
        this.generateBoard()
    }

    generateBoard() {
        this.data = generateGameBoard(20000)
        this.drawMap(this.data)
    }

    drawMap(data) {
        const ctx1 = this.mapRef.current.getContext("2d")
        var i = 0
        for (let tile of data.mapTiles) {
            i+=1
            if (i%1000===0) {
                console.log("called")
            }
            this.renderTile(ctx1, tile)
        }
    }

    renderTile(ctx, tile, color) {
        ctx.beginPath()
        tile.polygon.map((v, i) => {
            if (i === 0) 
                ctx.moveTo(v[0], v[1]) 
            else 
                ctx.lineTo(v[0], v[1])
            }
        )
        if (color) {
            ctx.strokeStyle = color
            ctx.lineWidth = 5
        } 
        ctx.fillStyle = tile.data.color
        ctx.fill()
        ctx.stroke()
    }

    render() {
        // return this.state.display
        // {this.state.data.mapTiles.map(this.toPath)}
        return (
            <canvas ref={this.mapRef} width={this.data.width} height={this.data.height}/>
        )
    }
}