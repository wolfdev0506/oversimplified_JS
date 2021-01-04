import React from 'react'
import {getTileWorker, generateTouchMap, merge1PolyTiles, assignBiomes, mapToObject} from '../../game/generation';
import {WIDTH, HEIGHT} from '../../constants'
import * as Buttons from '../Buttons/'

export class GeneratePage extends React.Component {
    constructor(props) {
        super(props)
        this.canvasScale = 1
        this.nTiles = 2000 
        this.tileType = "relaxed"
        this.state = {data: "", tilesLeft: 1, tiles: 1, message: "Starting", done: false}
        this.data = {width: WIDTH, height: HEIGHT}
        this.mapRef = React.createRef()
        this.showData = this.showData.bind(this)
        this.completionUpdater = this.completionUpdater.bind(this)
        this.worker = null
    }

    componentDidMount() {
        this.generateBoard()
    }

    componentWillUnmount() {
        if (this.worker) {
            this.worker.terminate()
        }
    }

    generateBoard() {
        this.worker = getTileWorker(this.nTiles, this.tileType)
        this.worker.onmessage = ({data}) => {
            this.data = {...data, done: undefined}
            this.drawMap(this.data)
            if (data.done) {
                this.createMap()
            } else {
                this.completionUpdater(data.numPolysLeft, data.numPolys, "Generating Tiles")
            }
        }
        this.worker.onerror = (e) => console.log("ERROR", e)
    }

    completionUpdater(tilesLeft, tiles, message, done=false) {
        this.setState({tiles, tilesLeft, message, done})
    }

    createMap() {    
        this.completionUpdater(0, 1, "Generating Touch Map")
        this.data.neighborMap = generateTouchMap(this.data.mapTiles)

        this.completionUpdater(0, 1, "Cleaning up Tiles");
        [this.data.mapTiles, this.data.neighborMap] = merge1PolyTiles(this.data.mapTiles, this.data.neighborMap)
        this.drawMap(this.data)

        this.completionUpdater(0, 1, "Assigning Biomes")
        this.data.mapTiles = assignBiomes(this.data.mapTiles, this.data.neighborMap)
        this.drawMap(this.data)

        this.completionUpdater(0, 1, "Finishing")
        this.data.neighborMap = mapToObject(this.data.neighborMap)

        this.completionUpdater(0, 1, "Done!", true)
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

    downloadDataButton() {
        if (this.state.done) {
            const url = window.URL.createObjectURL(new Blob([JSON.stringify(this.data)]))
            return <a className="btn btn-primary" href={url} download={"board.json"}>Download Board</a>
        }
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
            <div className="row flex-center">
                <div className="vert-col btn-container">
                    <h1 className="title">Generate Game Board</h1>
                    <canvas style={{position: "relative", width: "80%"}} ref={this.mapRef} width={this.data.width} height={this.data.height}/>
                    <hr/>
                    <p>{this.state.message}</p>
                    <div className="loading-bar">
                        <div style={{width: `${100 - (100*this.state.tilesLeft/this.state.tiles)}%`}}></div>
                    </div>
                    <hr/>
                    {this.downloadDataButton()}
                    <Buttons.HomeButton />
                </div>
            </div>
        )
    }
}