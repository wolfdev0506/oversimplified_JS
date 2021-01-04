import React from 'react'
import {getTileWorker, makeBoardFromTiles} from '../../game/generation';
import {WIDTH, HEIGHT} from '../../constants'

export class GeneratePage extends React.Component {
    constructor(props) {
        super(props)
        this.canvasScale = 1
        this.nTiles = 2000 
        this.tileType = "hex"
        this.state = {data: "", tilesLeft: 1, tiles: 1}
        this.data = {width: WIDTH, height: HEIGHT}
        // this.state = {display:"loading", data: {mapTiles: []}}
        this.mapRef = React.createRef()
        this.showData = this.showData.bind(this)
        this.completionUpdater = this.completionUpdater.bind(this)
        // this.worker = 
    }

    componentDidMount() {
        setTimeout(() => {console.log("start");this.generateBoard();console.log("end")}, 1000)

        // this.worker.postMessage([this.nTiles, this.tileType])
        // this.worker.onmessage = (e) => {
        //     this.setState(e.data)
        // }
    }

    // componentWillUnmount() {
    //     this.worker.terminate()
    // }

    generateBoard() {
        // this.data = generateGameBoard(this.nTiles, this.tileType, this.completionUpdater)
        const generatorWorker = getTileWorker(this.nTiles, this.tileType)
        generatorWorker.onmessage = ({data}) => {
            console.log("MESSAGE RECEIVED", data)
            if (data.done) {
                this.data = {...data, done: undefined}
                this.completionUpdater(1, 1)
                this.drawMap(this.data)
            } else {
                this.completionUpdater(data.numPolysLeft, data.numPolys)
            }
        }
        generatorWorker.onerror = (e) => console.log("ERROR", e)
    }

    completionUpdater(tiles, tilesLeft) {
        this.setState({tiles, tilesLeft})
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

    showData() {
        this.setState({data: JSON.stringify(this.data)})
    }

    renderTile(ctx, tile, color) {
        ctx.beginPath()
        tile.polygon.forEach((v, i) => {
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
        return (
            <div className="vert-col btn-container">
                <canvas style={{position: "relative"}} ref={this.mapRef} width={this.data.width} height={this.data.height}/>
                <hr/>
                <p>Done {100 - (100*this.state.tilesLeft/this.state.tiles)}%</p>
                <hr/>
                <button className="btn btn-primary" onClick={this.showData}>
                    Copy Data
                </button>
                <p style={{width: "100%"}}>{this.state.data}</p>
            </div>
        )
    }
}