import React from 'react'
import boards from './boards/'
import { polygon, booleanPointInPolygon, point } from "@turf/turf"


function FieldContent({ field, content, empty }) {
    return <h3><span className="bold">{field + ":"}</span>{" " + (content ? content : empty)}</h3>
}

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
            activeOnHover: true
        }

        this.hoverColor = "red"
        this.activeColor = "purple"
        
        this.board = boards[this.props.G.boardID]
        this.canvasScale = 2
        this.canvasXY = [this.board.width * this.canvasScale, this.board.height * this.canvasScale]
        this.lastHover = 0
        this.handleScroll = this.handleScroll.bind(this)
        this.mapRef = React.createRef()
        this.mapOverlayRef = React.createRef()
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
        const scale = clamp(.5, 10, this.state.scale - ((e.deltaY/100) * (this.state.scale/10)))
        if (scale !== .1 && scale !== 10) {
            this.setState({
                scale,
                x: this.state.x - ((e.deltaY/100) * this.state.x/10),
                y: this.state.y - ((e.deltaY/100) * this.state.y/10),
            })
        }
    }

    componentDidMount() {
        window.addEventListener('wheel', this.handleScroll, {passive: true});

        this.drawMap()
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

        if (!this.state.activeOnHover)
        this.renderTile(ctx2, this.board.mapTiles[this.state.activeTile], this.activeColor)
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

    renderTile(ctx, tile, color, mul=1) {
        ctx.beginPath()
        tile.polygon.forEach((v, i) => {
            if (i === 0) 
                ctx.moveTo(v[0]*this.canvasScale * mul, v[1]*this.canvasScale * mul) 
            else 
                ctx.lineTo(v[0]*this.canvasScale * mul, v[1]*this.canvasScale * mul)
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
            </>)
    }

    render() {
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
                        <FieldContent field="Name" content={activeTile.data.name} />
                        <FieldContent field="Empire" content={activeTile.data.region} empty="Independent" />
                        <FieldContent field="Empire" content={activeTile.data.biome} />
                        <FieldContent field="Color" content={activeTile.data.color} />
                    </div>

                    <div className="ui-box" style={{ gridArea: "bottom" }} onMouseMove={e => this.handleMouseMove(e)} onMouseUp={() => this.setDragging(false)}>
                    </div>
                </div>

                <div id="mapContainer" onMouseMove={e => this.handleMouseMove(e)} onMouseDown={e => this.setDragging(true, e)} onMouseUp={() => this.setDragging(false)}>
                    <canvas ref={this.mapRef} width={this.canvasXY[0]} height={this.canvasXY[1]} style={{ transform }}/>
                    <canvas ref={this.mapOverlayRef} width={this.canvasXY[0]} height={this.canvasXY[1]} onMouseMove={e => this.handleMouseMove(e, true)} onClick={() => this.setActiveTile(this.lastHover)} style={{ transform, cursor: "pointer" }}/>
                </div>
            </>
        )
    }

}

function clamp(min, max, num) {
    return Math.min(max, Math.max(num, min))
}