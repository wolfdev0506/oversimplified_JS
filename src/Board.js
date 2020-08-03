import React from 'react'
import './Board.css'
import { Delaunay } from "d3-delaunay";
import {polygon, union} from "@turf/turf"


class mapTile {
    constructor(polygon, data, id) {
        this.polygon = polygon
        this.id = id

        this.isOcean = data.isOcean
        this.name = data.name
        this.numCities = data.numCities

        this.path = this.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"
    }

    toPath() {
        return (
            <>
                <path id={this.id} key={this.id} clipPath={"url(#c" + this.id + ")"} fill={getRandomColor()} d={this.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"} />
                <clipPath id={"c" + this.id}>
                    <use xlinkHref={"#" + this.id} />
                </clipPath>
            </>)
    }
}


export class OversimplifiedBoard extends React.Component {
    constructor(props) {
        console.log("------")
        super(props)

        this.points = getRandPoints(1920, 1080, 100)
        this.delaunay = Delaunay.from(this.points)
        this.voronoi = this.delaunay.voronoi([0, 0, 1920, 1080])

        this.svgRender = [...this.voronoi.cellPolygons()].map((polygon, i) => {
            var d = polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"
            return (
                <>
                    <path id={i} key={i} d={d} style={{fill: "rgba(0, 0, 0, 0)"}} clipPath={"url(#c" + i + ")"} />
                    <clipPath id={"c" + i}>
                        <use xlinkHref={"#" + i} />
                    </clipPath>
                </> 
            )
        })

        this.mapTiles = []

        var points = [...range(0, this.points.length)]

        var polygons = [...this.voronoi.cellPolygons()]

        while (points.length > 0) {
            let index = randChoice(points)
            let base = polygons[index]
            let touching = [...this.voronoi.neighbors(index)].filter((value) => {return contains(points, value)})
            let numPolys = Math.floor(Math.random() * 6)
            

            for (let _ = 0; _ < numPolys; _++) {
                
                if (touching.length === 0) break
                let newI = randChoice(touching)
                let newPoly = polygons[newI]

                points.splice(points.indexOf(newI))

                base = combine(base, newPoly)

                touching.push(...[...this.voronoi.neighbors(newI)].filter((value) => { return contains(points, value) }))

                touching = Array.from(new Set(touching))
            }
            this.mapTiles.push(new mapTile(base, {}, points.length))
        }
        console.log(this.mapTiles)
    }


    render() {
        return (
            <>
                <svg width={window.innerWidth} height={window.innerHeight}>
                    {this.mapTiles.map((tile) => { return tile.toPath() })}
                </svg>
            </>
        );
    }
}

function getRandPoints(maxX, maxY, num) {
    const points = []
    for (let i = 0; i < num; i++) {
        let x = Math.floor(Math.random() * maxX)
        let y = Math.floor(Math.random() * maxY)
        while (contains(points, [x,y])) {
            x = Math.floor(Math.random() * maxX)
            y = Math.floor(Math.random() * maxY)
        }
        points.push([x, y])
    }
    return points
}

function randChoice(arr) {
    return arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
}

function* range(start, end) {
    let state = start;
    while (state < end) {
        yield state;
        state += 1;
    }
    return;
};

function combine(poly1, poly2) {
    var realPoly1 = polygon([poly1])
    var realPoly2 = polygon([poly2])
    return union(realPoly1, realPoly2).geometry.coordinates[0]
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function contains(arr, value) {
    for (var v of arr) {
        if (JSON.stringify(value) === JSON.stringify(v)) { return true }
    }
    return false
}