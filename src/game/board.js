import React from 'react'


function FieldContent({field, content}) {
    return <h3><span className="bold">{field + ":"}</span>{" " + content}</h3>
}


export class OversimplifiedBoard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTile: 0
        }
    }

    render() {
        var activeI = this.state.activeTile
        var activeTile = this.props.G.mapTiles[activeI]

        return (
            <div className="game">
                <div className="col left-col">
                    DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA DATA 
                </div>
                <div className="col center-col">
                    <svg viewBox={`0 0 ${this.props.G.width} ${this.props.G.height}`}>
                        {this.props.G.mapTiles.map((v, i) => this.toPath(v, i))}
                        {/* {this.props.lines? this.props.map.connectLines.map((v) => <line x1={v[0][0]} y1={v[0][1]} x2={v[1][0]} y2={v[1][1]} />): []} */}
                        {/* {this.props.circles? this.props.map.circles: []} */}
                    </svg>
                </div>
                <div className="col right-col">
                    <svg viewBox={this.getBoundingBox(activeI)} id="focusBox">
                        {this.toPath(activeTile, activeI, "focus")}
                    </svg>
                    <div className="text-box">
                        <FieldContent field="Name" content={activeTile.data.name}/>
                        <FieldContent field="Empire" content={activeTile.data.region}/>
                    </div>
                </div>

            </div>
        )
    }

    setActiveTile(i) {
        this.setState({ activeTile: i })
    }

    getBoundingBox(i) {
        const poly = this.props.G.mapTiles[i].polygon
        var minX = poly.reduce((prev, current) => prev < current[0] ? prev : current[0])
        var minY = poly.reduce((prev, current) => prev < current[1] ? prev : current[1])
        var maxX = poly.reduce((prev, current) => prev > current[0] ? prev : current[0])
        var maxY = poly.reduce((prev, current) => prev > current[1] ? prev : current[1])
        return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
    }

    toPath(tile, i, delimID="") {
        return (
            <>
                <path 
                    id={tile.id + delimID} 
                    key={tile.id + delimID} 
                    clipPath={ `url(#c${tile.id + delimID})`} 
                    fill={tile.data.color} 
                    d={tile.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"} 
                    onClick={() => this.setActiveTile(i)}
                />
                <clipPath id={"c" + tile.id + delimID}>
                    <use xlinkHref={"#" + tile.id + delimID} />
                </clipPath>
            </>)
    }
}