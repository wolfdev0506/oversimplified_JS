import React from 'react'
import './Board.css'
import { Delaunay } from "d3-delaunay";
import { polygon, union} from "@turf/turf"
import { noise } from '@chriscourses/perlin-noise'
import {randomInt} from "mathjs"


class OnlyOneConnectingPointError extends Error { }
class IsEnclaveError extends Error { }


class MapTile {
    constructor(polygon, points, touchPoints, data, id) {
        this.polygon = polygon
        this.id = id
        this.points = points
        this.touchPoints = touchPoints

        this.isOcean = data.isOcean
        this.name = data.name
        this.numCities = data.numCities
        this.region = data.region

        // this.color = this.region.getSimilarColor()
        this.color = this.isOcean? "blue" : "green"
        this.path = this.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"
    }

    toPath() {
        return (
            <>
                <path id={this.id} key={this.id} clipPath={"url(#c" + this.id + ")"} fill={this.color} d={this.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"} />
                <clipPath id={"c" + this.id}>
                    <use xlinkHref={"#" + this.id} />
                </clipPath>
            </>)
    }
}


class Region {
    constructor(color) {
        this.color = color
    }

    getSimilarColor() {
        let color = []
        for (let c of this.color) {
            color.push(Math.min(0, Math.max(255, Math.floor((Math.random * 10) - 5) + c)))
        }
        return color
    }

    getColor() {
        let color = "#"
        for (let c of this.color) {
            color += c.toString(16)
        }
        return color
    }
}


export class OversimplifiedBoard extends React.Component {
    constructor(props) {
        console.log("------")
        super(props)
        const width = window.innerWidth
        const height = window.innerHeight
        
        
        this.points = getRandPoints(width, height, 2000)
        this.delaunay = Delaunay.from(this.points)
        this.voronoi = this.delaunay.voronoi([0, 0, width, height])
        
        this.ellipses = []
        for (var p of this.points) {
            this.ellipses.push(
                <circle cx={p[0]} cy={p[1]} r={5} fill={isLandPoint(p)? "red" : "black"}/>
            )
        }
        this.mapTiles = []

        var polygons = [...this.voronoi.cellPolygons()]
        var polygonsIndex = [...range(0, polygons.length)]
        var touching = []

        this.state = {
            polygonsIndex: polygonsIndex,
            polygons: polygons,
            touching: touching
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        var touching = this.state.touching.slice()
        var polygonsIndex = this.state.polygonsIndex.slice()
        var polygons = this.state.polygons.slice()

        while (polygonsIndex.length > 0) {
            console.log(polygonsIndex.length)
            if (touching.length > 0) {
                var baseI = randChoice(touching)
                polygonsIndex = polygonsIndex.filter((v) => v !== baseI)
            } else {
                var baseI = randChoice(polygonsIndex)
            }

            let base = polygons[baseI]
            let isLand = isLandPoint(this.points[baseI])
            let numPolys = Math.floor(Math.random() * (isLand ? 15 : 30)) + 8

            touching = [...this.voronoi.neighbors(baseI)].filter((value) => { return contains(polygonsIndex, value) })

            for (let nPoly = 0; nPoly < numPolys; nPoly++) {
                if (touching.length < 1) {break}

                var newI = randChoice(touching)
                var newPoly = polygons[newI]
                if (touching.length > 0) {
                    var perimeter = getPerimeterFromPolys(base, newPoly)


                    for (let i of range(0, 4)) {
                        let tmpI = randChoice(touching)
                        if (polygons[tmpI] === undefined) {
                            console.log(tmpI, polygons)
                        }
                        let tmpPerimeter = getPerimeterFromPolys(base, polygons[tmpI])
                        if (tmpPerimeter < perimeter) {
                            perimeter = tmpPerimeter
                            newPoly = polygons[tmpI]
                            touching.push(newI)
                            newI = tmpI
                        }
                        touching.push(tmpI)
                    }
                }
                if (isLand !== isLandPoint(this.points[newI])) {
                    touching = touching.filter((v) => v !== newI)
                    nPoly--
                    continue
                }

                touching = touching.filter((v) => v !== newI)
                
                try {
                    if (newPoly === undefined) {
                        console.log(polygons, newI)
                    }
                    base = combine(base, newPoly)
                } catch (e) {
                    if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
                        nPoly--
                        continue
                    } else {
                        throw e
                    }
                }
                polygonsIndex.splice(polygonsIndex.indexOf(newI), 1)

            }
            this.mapTiles.push(new MapTile(base, [], [], {isOcean:!isLand}, polygonsIndex.length))

            this.setState({
                polygonsIndex: polygonsIndex,
                polygons: polygons,
                touching: touching
            }
            )
        }
    }


    render() {
        return (
            <div>
                <svg width={window.innerWidth} height={window.innerHeight} onClick={this.handleClick}>
                    {this.mapTiles.map((tile) => { return tile.toPath() })}
                    {this.ellipses}
                </svg>
            </div>
        );
    }
}

function getRandPoints(maxX, maxY, num) {
    var points = new Set()
    while (points.size < num) {
        points.add(
            [randomInt(0, maxX),
            randomInt(0, maxY)]
        )
    }
    // for (let i = 0; i < num; i++) {
    //     // let x = randomInt(0, maxX)
    //     // let y = randomInt(0, maxY)
    //     let x = Math.floor(Math.random() * maxX)
    //     let y = Math.floor(Math.random() * maxY)
    //     while (contains(points, [x, y])) {
    //         // x = randomInt(0, maxX)
    //         // y = randomInt(0, maxY)
    //         x = Math.floor(Math.random() * maxX)
    //         y = Math.floor(Math.random() * maxY)
    //     }
    //     points.push([x, y])
    // }
    points = [...points]
    for (var p of points) {
        if (p.length !== 2)
        console.log(p)
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
    if (poly1.slice().filter((v) => { return contains(poly2, v) }).length < 2) {
        throw new OnlyOneConnectingPointError()
    }

    var realPoly1 = polygon([poly1])
    var realPoly2 = polygon([poly2])
    var uPoly = union(realPoly1, realPoly2)
    if (uPoly.geometry.coordinates.length > 1) {
        throw new IsEnclaveError()
    }
    return uPoly.geometry.coordinates[0]
}

function contains(arr, value) {
    try {
        for (var v of arr) {
            if (JSON.stringify(value) === JSON.stringify(v)) { return true }
        }
        return false
    } catch (e) {
        console.log(arr, value)
        throw e
    }
}

function distance(xy1, xy2) {
    return Math.sqrt(Math.pow(xy1[0] - xy2[0], 2) + Math.pow(xy1[1] - xy2[1], 2))
}

function perimeter(poly) {
    var currentDistance = 0
    for (var i = 0; i < poly.length - 1; i++) {
        currentDistance += distance(poly[i], poly[i + 1])
    }
    return currentDistance
}

function getPerimeterFromPolys(poly1, poly2) {
    try {
        return perimeter(combine(poly1, poly2))
    } catch (e) {
        if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
            return Number.MAX_VALUE
        } else {
            throw e
        }
    }
}

function isLandPoint(point) {
    return noise(point[0]/100, point[1]/100, 0) > 0.5
}