import React from 'react'
import {getTileWorker, generateTouchMap, merge1PolyTiles, assignBiomes, mapToObject} from '../../game/generation';
import {WIDTH, HEIGHT} from '../../constants'
import * as Buttons from '../Buttons/'
import city from '../../assets/icons/city.png'
import BoardFetcher from '../../game/BoardFetcher'

const cityImg = new Image()
cityImg.src = city

export class GeneratePage extends React.Component {
    constructor(props) {
        super(props)
        this.canvasScale = 1
        this.state = {data: "", tilesLeft: 1, tiles: 1, message: "Starting", done: false, generating: false, tileType: "relaxed", boardName: "board", nPoints: 2000, boardsLoaded: false}
        this.data = {width: WIDTH, height: HEIGHT}
        this.mapRef = React.createRef()
        this.showData = this.showData.bind(this)
        this.completionUpdater = this.completionUpdater.bind(this)
        this.worker = null
        this.boardFetcher = new BoardFetcher()

        this.nameChange = this.nameChange.bind(this)
        this.mapStyleChange = this.mapStyleChange.bind(this)
        this.nPointsChange = this.nPointsChange.bind(this)
        this.startGeneration = this.startGeneration.bind(this)
    }

    componentWillUnmount() {
        if (this.worker) {
            this.worker.terminate()
        }
    }

    componentDidMount() {
        this.boardFetcher.fetchTypes()
            .then(() => this.setState({boardsLoaded: true}))
    }

    generateBoard() {
        this.worker = getTileWorker(this.state.nPoints, this.state.tileType)
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
        this.data.mapStyle = this.state.tileType
        this.data.nPoints = this.state.nPoints

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
            return <a className="btn btn-primary" href={url} download={this.state.boardName + '.json'}>Download Board</a>
        }
    }

    renderTile(ctx, tile, color) {
        ctx.beginPath()
        tile.polygon.forEach((point, i) => {
            if (i === 0) 
                ctx.moveTo(point[0] * this.canvasScale, point[1] * this.canvasScale) 
            else 
                ctx.lineTo(point[0] * this.canvasScale, point[1] * this.canvasScale)
            }
        )
        if (color) {
            ctx.strokeStyle = color
            ctx.lineWidth = 5
        } 
        ctx.fillStyle = tile.data.color
        ctx.fill()
        ctx.stroke()
    
        for (let [cityX, cityY] of tile.data.cities) {
            let size = 10
            ctx.drawImage(cityImg, cityX - size/2, cityY - size/2, size, size)
        }
    }

    nameChange(event) {
        this.setState({boardName: event.target.value})
    }

    mapStyleChange(event) {
        this.setState({tileType: event.target.value})
    }

    nPointsChange(event) {
        this.setState({nPoints: parseInt(event.target.value)})
    }

    startGeneration() {
        this.setState({generating: true})
        this.generateBoard()
    }

    render() {
        var content = null;
        if (this.state.generating) {
            content =  (
                <>
                    <canvas style={{position: "relative", width: "80%"}} ref={this.mapRef} width={this.data.width} height={this.data.height}/>
                    <hr/>
                    <p>{this.state.message}</p>
                    <div className="loading-bar">
                        <div style={{width: `${100 - (100*this.state.tilesLeft/this.state.tiles)}%`}}></div>
                    </div>
                    <hr/>
                    {this.downloadDataButton()}
                    <hr/>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>New Board</button>
                </>
            )
        } else {
            content = (
                <>
                    <NameInput value={this.state.boardName} onChange={this.nameChange} />
                    {
                        this.state.boardsLoaded? // Shows loader while fetching boards
                            <MapStyleDropdown types={this.boardFetcher.getTypes()} onChange={this.mapStyleChange} />
                            : <div className="loader"/>
                    }
                    <NumPointsInput value={this.state.nPoints} onChange={this.nPointsChange} />
                    <button className="btn btn-primary" onClick={this.startGeneration}>Generate Map</button>
                </>
            )
        }

        return (
            <div className="row flex-center">
                <div className="vert-col btn-container">
                    <h1 className="title">Generate Game Board</h1>
                    {content}
                    <Buttons.HomeButton />
                </div>
            </div>
        )
    }
}

const NameInput = ({ value, onChange }) => (
    <div className="row flex-center">
        <label>Map Name:</label>
        <input type="text" placeholder="Name" value={value} onChange={onChange} style={{width: 250}}/>
    </div>
)

const MapStyleDropdown = ({ types, onChange }) => (
    <div className="row flex-center">
        <label>Map Style:</label>
        <select onChange={onChange} style={{width: 250}}>
            {types.map(v => 
                <option value={v}>{v}</option>
            )}
        </select>
    </div>
)

const NumPointsInput = ({ value, onChange}) => (
    <div className="row flex-center">
        <label>Base Points:</label>
        <input type="number" min="100" onChange={onChange} value={value} style={{width: 250}}/>
    </div>
)