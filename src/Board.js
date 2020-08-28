import React from 'react'


export class GameBoardComponent extends React.Component {
    render() {
        return (
            <svg width={this.props.G.width} height={this.props.G.height}>
                {this.props.G.mapTiles.map((v) => this.toPath(v))}
                {/* {this.props.lines? this.props.map.connectLines.map((v) => <line x1={v[0][0]} y1={v[0][1]} x2={v[1][0]} y2={v[1][1]} />): []} */}
                {/* {this.props.circles? this.props.map.circles: []} */}
            </svg>

        )
    }

    toPath(tile) {
        return (
            <>
                <path id={tile.id} key={tile.id} clipPath={"url(#c" + tile.id + ")"} fill={tile.data.color} d={tile.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"} />
                <clipPath id={"c" + tile.id}>
                    <use xlinkHref={"#" + tile.id} />
                </clipPath>
            </>)
    }
}