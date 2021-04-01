import React from 'react'
import { polygon, booleanPointInPolygon, point } from "@turf/turf"
import BoardFetcher from './BoardFetcher'
import city from '../assets/icons/city.png'
import GamePieceIcons from './GamePieceIcons'
import '../assets/scss/board.scss'

const cityImg = new Image()
cityImg.src = city



export class OversimplifiedBoard extends React.Component {
    constructor(props) {
        super(props)
        this.dragging = false
        this.origin = [0, 0]
        this.state = {
            activeTile: 0,
            x: 0,
            y: 0,
            scale: 1,
            activeOnHover: true,
            boardLoaded: false,
            divWidth: 0,
            activeMenuItem: null,
        }

        this.hoverColor = "red"
        this.activeColor = "purple"
        
        this.canvasScale = 4
        this.lastHover = 0
        this.boardFetcher = new BoardFetcher()

        this.mapRef = React.createRef()
        this.mapOverlayRef = React.createRef()

        this.handleScroll = this.handleScroll.bind(this)
        this.handleMenuSelect = this.handleMenuSelect.bind(this)
    }

    handleMouseMove(e, isCanvas) {
        if (this.dragging && !isCanvas) {
            this.setState({
                x:this.state.x + (e.clientX - this.origin[0]),
                y:this.state.y + (e.clientY - this.origin[1])
            })
            this.origin = [e.clientX, e.clientY]
        }

        if (isCanvas) {
            this.highlightTile(...this.globalXYtoMapXY(e.clientX, e.clientY))
        }

    }

    setDragging(isDragging, e) {
        this.dragging = isDragging
        if (this.dragging) {
            this.origin = [e.clientX, e.clientY]
        }
    }

    handleScroll(e) {
        const scale = clamp(.3, 10, this.state.scale - ((e.deltaY/100) * (this.state.scale/10)))
        if (scale !== .1 && scale !== 10) {
            this.setState({
                scale,
                x: this.state.x - ((e.deltaY/100) * this.state.x/10),
                y: this.state.y - ((e.deltaY/100) * this.state.y/10),
            })
        }
    }

    componentDidMount() {
        this.boardFetcher.fetchBoard(this.props.G.boardType, this.props.G.boardName)
            .then(board => {
                this.board = board
                this.canvasXY = [board.width * this.canvasScale, board.height * this.canvasScale]
                this.setState({boardLoaded: true})})
            .then(() => this.drawMap())

        window.addEventListener('wheel', this.handleScroll, {passive: true}) // TODO
    }

    componentDidUpdate() {
        if (this.divElement !== undefined) {
            var newWidth = this.divElement.clientHeight/2

            if (newWidth !== this.state.divWidth) {
                this.setState({divWidth: newWidth})
            }
        }
    }

    renderTile(ctx, tile, color) {
        ctx.beginPath()
        tile.polygon.forEach((point, i) => {
            if (i === 0) 
                ctx.moveTo(...this.scaleToMap(point[0], point[1])) 
            else 
                ctx.lineTo(...this.scaleToMap(point[0], point[1]))
            }
        )
        if (color) {
            ctx.strokeStyle = color
            ctx.lineWidth = 5 * (this.canvasScale / 2)
        } else {
            ctx.lineWidth = 5 * (this.canvasScale / 4)
        }
        ctx.fillStyle = tile.data.color
        ctx.fill()
        ctx.stroke()

        for (let [cityX, cityY] of tile.data.cities) {
            let size = 5 * this.canvasScale
            ctx.drawImage(cityImg, ...this.scaleToMap(cityX, cityY, size/2, size/2), size, size)
        }
    }

    scaleToMap(x, y, dx=0, dy=0) {
        return [x * this.canvasScale - dx, y * this.canvasScale - dy]
    }

    drawMap() {
        const ctx1 = this.mapRef.current.getContext("2d")
        for (let tile of this.board.mapTiles) {
            this.renderTile(ctx1, tile)
        }
    }

    highlightTile(x, y) {
        const ctx2 = this.mapOverlayRef.current.getContext("2d")
        const xyPoint = point([x / this.canvasScale, y / this.canvasScale]) 

        if (!booleanPointInPolygon(xyPoint, polygon([this.board.mapTiles[this.lastHover].polygon]))) {
            this.expandOutwardUntilTileFound(xyPoint, this.board.neighborMap[this.lastHover], [this.lastHover])
            this.clearCanvas(ctx2)

            this.renderTile(ctx2, this.board.mapTiles[this.lastHover], this.hoverColor)

            if (this.state.activeOnHover) {
                this.setState({activeTile: this.lastHover})
            }
        }

        if (!this.state.activeOnHover) {
            this.renderTile(ctx2, this.board.mapTiles[this.state.activeTile], this.activeColor)
        }
    }

    expandOutwardUntilTileFound(point, current, last) {
        for (let tileI of current) {
            if (booleanPointInPolygon(point, polygon([this.board.mapTiles[tileI].polygon]))) {
                this.lastHover = tileI
                return
            }
        }
        let next = [...new Set(current.map(v => this.board.neighborMap[v]).flat())]
        next = next.filter(v => !last.includes(v))
        next = next.filter(v => !current.includes(v))
        if (next.length > 0) {
            return this.expandOutwardUntilTileFound(point, next, current)
        }
    }

    clearCanvas(ctx) {
        ctx.clearRect(0, 0, ...this.canvasXY)
    }

    componentWillUnmount() {
        window.removeEventListener('wheel', this.handleScroll);
    }

    globalXYtoMapXY(x, y) {
        const rect = this.mapOverlayRef.current.getBoundingClientRect()
        x = ((x - rect.x) / rect.width) * this.canvasXY[0]
        y = ((y - rect.y) / rect.height) * this.canvasXY[1]
        return [x, y]
    }

    setActiveTile(i) {
        if (this.state.activeTile === i) {
            this.setState({activeOnHover: !this.state.activeOnHover})
        }

        const ctx2 = this.mapOverlayRef.current.getContext("2d")
        this.clearCanvas(ctx2)

        if (!this.state.activeOnHover && this.state.activeTile === i) {
            this.renderTile(ctx2, this.board.mapTiles[i], this.hoverColor)  // sets outline to hoverColor if the tile is being unclicked
        } else {
            this.renderTile(ctx2, this.board.mapTiles[i], this.activeColor)
        }
        this.setState({ activeTile: i })
    }

    getBoundingBox(i) {
        const poly = this.board.mapTiles[i].polygon
        var minX = poly.reduce((prev, current) => prev < current[0] ? prev : current[0])
        var minY = poly.reduce((prev, current) => prev < current[1] ? prev : current[1])
        var maxX = poly.reduce((prev, current) => prev > current[0] ? prev : current[0])
        var maxY = poly.reduce((prev, current) => prev > current[1] ? prev : current[1])
        return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
    }

    toPath(tile, i, delimID = "") {
        let size = 5
        return (
            <>
                <path
                    id={tile.id + delimID}
                    key={tile.id + delimID}
                    clipPath={`url(#c${tile.id + delimID})`}
                    fill={tile.data.color}
                    d={tile.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"}
                    onClick={() => this.setActiveTile(i)}
                    />
                <clipPath id={"c" + tile.id + delimID} key={"c" + tile.id + delimID}>
                    <use xlinkHref={"#" + tile.id + delimID} />
                </clipPath>
                {tile.data.cities.map(([x, y]) => <image x={x-(size/2)} y={y-(size/2)} width={size} height={size} href={city}/>)}
            </>)
    }

    handleMenuSelect(menuItemIdx) {
        if (menuItemIdx !== this.state.activeMenuItem) {
            this.setState({activeMenuItem: menuItemIdx})
        } else {
            this.setState({activeMenuItem: null})
        }
    }

    makeActionButtons() {
        var buttons = []
        for (let i = 0; i < 4; i++) {
            buttons.push(<div className="tile-actions-box"><h3>Move {i}</h3></div>)
        }
        return buttons
    }

    render() {
        if (this.state.boardLoaded) {
            var activeI = this.state.activeTile
            var activeTile = this.board.mapTiles[activeI]
            var transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale}, ${this.state.scale})` 
            
            return (
                <>
                    <div className="ui">
                        <div className="ui-box" style={{ gridArea: "left" }} onMouseMove={e => this.handleMouseMove(e)} onMouseUp={() => this.setDragging(false)}>
                            <div className="btn-container flex-center">
                                <button className="btn btn-primary" onClick={() => this.props.leaveMatch().then(() => window.location.href = "/lobby")}>
                                    Leave Game
                                </button>
                            </div>
                        </div>

                        <div className="ui-box" style={{ gridArea: "topRight" }} onMouseMove={e => this.handleMouseMove(e)} onMouseUp={() => this.setDragging(false)}>
                            <svg viewBox={this.getBoundingBox(activeI)} id="focusBox">
                                {this.toPath(activeTile, activeI, "focus")}
                            </svg>
                        </div>

                        <div className="ui-box" style={{ gridArea: "right" }} onMouseMove={e => this.handleMouseMove(e)} onMouseUp={() => this.setDragging(false)}>
                            <TileInfo tileData={activeTile.data}/>
                            <div className="tile-actions-menu">
                                    {this.makeActionButtons()}
                            </div>
                        </div>

                        <div className="ui-box" style={{ gridArea: "bottom", display:"flex" }} onMouseMove={e => this.handleMouseMove(e)} onMouseUp={() => this.setDragging(false)}>
                            <ResourcesList resources={this.props.G.hands[this.props.playerID].resources}/>
                            <div className="selector-menu" ref={(divElement) => {this.divElement = divElement}}>
                                <SelectorMenu hand={this.props.G.hands[this.props.playerID].hand} width={this.state.divWidth} onClick={this.handleMenuSelect} activeIdx={this.state.activeMenuItem}/>
                            </div>
                        </div>
                    </div>

                    <div id="mapContainer" onMouseMove={e => this.handleMouseMove(e)} onMouseDown={e => this.setDragging(true, e)} onMouseUp={() => this.setDragging(false)}>
                        <canvas ref={this.mapRef} width={this.canvasXY[0]} height={this.canvasXY[1]} style={{ transform }}/>
                        <canvas ref={this.mapOverlayRef} width={this.canvasXY[0]} height={this.canvasXY[1]} onMouseMove={e => this.handleMouseMove(e, true)} onClick={() => this.setActiveTile(this.lastHover)} style={{ transform, cursor: "pointer" }}/>
                    </div>
                </>
            )
        } else {
            return <LoadingBoard/>
        }
    }

}

function SelectorMenu({hand, width, onClick, activeIdx}) {
    hand.sort((a, b) => b[1] - a[1])

    var elements = []

    for (let i = 0; i < 14; i++) {
        if (hand[i] !== undefined) {
            elements.push(
                <div className={`selector-box ${activeIdx === i? "active": ""}`} style={{width: `${width}px`}} onClick={() => onClick(i)}>
                    <img src={GamePieceIcons[hand[i][0].name]} alt="pic"/>
                    <p>{`${capitalize(camelCaseToSpaceCase(hand[i][0].name))}: ${hand[i][1]}`}</p>
                </div>
            )
        } else {
            elements.push(<div className="selector-box" style={{width: `${width}px`}}/>)

        }
    }
    return elements
}

function FieldContent({ field, content, empty }) {
    return <h3><span className="bold">{field + ":"}</span>{" " + (content ? content : empty)}</h3>
}

function ResourcesList({ resources }) {
    return (
        <ul className="resources-list">
            <li className="bold resource-list-item">
                <p>Resource</p>
                <p>Amount</p> 
            </li>
            {resources.map(([v, n], i) => <Resource name={v} amount={n}/>)}
        </ul>
    )
} 

function Resource({name, amount}) {
    return (
        <li className="resource-list-item">
            <p>{capitalize(name)}</p>
            <p>{amount}</p>
        </li>
    )
}

function TileInfo({tileData}) {
    return (<>
        <FieldContent field="Name" content={tileData.name} />
        <FieldContent field="Empire" content={tileData.region} empty="Independent" />
        <FieldContent field="Biome" content={tileData.biome} />
        <FieldContent field="Color" content={tileData.color} />
    </>)
}

function LoadingBoard() {
    return (
        <div className="row flex-center height100">
            <div className="col top-space">
                <h2>Loading Board...</h2>
                <div className="loader"/>
            </div>
        </div>
    )
}

function clamp(min, max, num) {
    return Math.min(max, Math.max(num, min))
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1)
}

function isUpperCase(string) {
    return string === string.toUpperCase()
}

function camelCaseToSpaceCase(string) {
    var finalStr = ""
    for (const c of string) {
        if (isUpperCase(c)) {
            finalStr += ` ${c.toLowerCase()}`
        } else {
            finalStr += c
        }
    }
    return finalStr
}
