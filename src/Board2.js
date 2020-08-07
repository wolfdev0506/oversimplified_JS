import React from 'react'
import './Board.css'
import { Delaunay } from "d3-delaunay";
import { polygon, union } from "@turf/turf"
import { noise } from '@chriscourses/perlin-noise'

class OnlyOneConnectingPointError extends Error { }
class IsEnclaveError extends Error { }
class AssertionError extends Error { }

class MapTile {
    constructor(polygon, points, pointsIndex, touchPointsIndex, data, id) {
        this.polygon = polygon
        this.id = id
        this.points = points
        this.cellsIndex = pointsIndex
        this.touchCellsIndex = touchPointsIndex
        this.neighbors = []

        this.isOcean = data.isOcean
        this.name = data.name
        this.numCities = data.numCities
        this.region = data.region

        // this.color = this.region.getSimilarColor()
        this.color = this.points.length > 1 ? (this.isOcean ? "blue" : "green") : "red"
        this.path = this.polygon.map((point, i) => { if (i > 0) return "L" + point[0] + " " + point[1]; else return "M" + point[0] + " " + point[1] }).join(" ") + "Z"
    }

    addNeighbors(newNeighbors) {
        return this.neighbors.push(...newNeighbors)
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

export class GameBoard extends React.Component {
    constructor(props) {
        super(props)

        this.height = window.innerHeight
        this.width = window.innerWidth
        this.circles = []
        this.mapTiles = []

        this.points = Array(2000).fill(0).map(() =>
            [Math.floor(Math.random() * this.width),
            Math.floor(Math.random() * this.height)])

        this.points = this.points.map(JSON.stringify).reverse().filter(function (e, i, a) {
            return a.indexOf(e, i + 1) === -1;
        }).reverse().map(JSON.parse)

        this.delaunay = Delaunay.from(this.points)
        this.voronoi = this.delaunay.voronoi([0, 0, this.width, this.height])
        
        var polygons = [...this.voronoi.cellPolygons()]
        var polygonsIndex = polygons.map((v, i) => i)
        
        this.state = {
            polygonsIndex: polygonsIndex,
            polygons: polygons,
            touching: []
        }
        this.handleClick = this.handleClick.bind(this)
        // for (var p of this.points) {
        //     this.circles.push(
        //         <circle cx={p[0]} cy={p[1]} r={5} fill={isLandPoint(p) ? "red" : "black"} />
        //     )
        // }
    }

    handleClick() {
        var touching = this.state.touching.slice()
        var polygonsIndex = this.state.polygonsIndex.slice()
        var polygons = this.state.polygons.slice()

        while (polygonsIndex.length > 0) {
            if (polygonsIndex.length % 5 === 0) console.log(polygonsIndex.length)

            if (touching.length > 0) {
                var baseIndex = touching[Math.floor(Math.random() * touching.length)]
                polygonsIndex = polygonsIndex.filter((v) => v !== baseIndex)
            } else {
                var baseIndex = polygonsIndex.splice(Math.floor(Math.random() * polygonsIndex.length), 1)[0]
            }

            let polygonIndexes = [baseIndex]
            let basePolygon = polygons[baseIndex]
            let isLand = isLandPoint(this.points[baseIndex])
            let numPolys = Math.floor(Math.random() * (isLand ? 15 : 30)) + 8

            touching = [...this.voronoi.neighbors(baseIndex)].filter((value) => { return contains(polygonsIndex, value) })

            for (let nPoly = 0; nPoly < numPolys; nPoly++) {
                if (touching.length < 1) break

                let nextIndex = touching[0]
                if (touching.length > 1) {
                    let nextPerimeter = getPerimeterFromPolys(basePolygon, polygons[nextIndex])
                    for (let i = 1; i < Math.min(touching.length, 3); i++) {
                        let tmpI = touching[i]
                        let tmpPerimeter = getPerimeterFromPolys(basePolygon, polygons[tmpI])

                        if (tmpPerimeter === Number.MAX_VALUE) {
                            touching.splice(tmpI, 1)
                            continue
                        } else if (tmpPerimeter < nextPerimeter) {
                            nextPerimeter = tmpPerimeter
                            nextIndex = tmpI
                        }
                    }
                }

                touching = touching.filter((v) => v !== nextIndex)
                let nextPoly = polygons[nextIndex]

                if (isLand !== isLandPoint(this.points[nextIndex])) {
                    nPoly--
                    continue
                }

                try {
                    basePolygon = combine(basePolygon, nextPoly)
                    polygonIndexes.push(nextIndex)
                } catch (e) {
                    if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
                        nPoly--
                        continue
                    } else {
                        throw e
                    }
                }
                polygonsIndex.splice(polygonsIndex.indexOf(nextIndex), 1)
                touching.push(...[...this.voronoi.neighbors(nextIndex)].filter((value) => { return contains(polygonsIndex, value) }))
            }

            this.mapTiles.push(new MapTile(basePolygon, 
                polygonIndexes.map((v) => this.points[v]), 
                polygonIndexes, 
                [...new Set(polygonIndexes.map((v) => [...this.voronoi.neighbors(v)]).flat().filter((v) => !(polygonIndexes.includes(v))))], 
                { isOcean: !isLand }, 
                polygonsIndex.length))

            this.setState({
                polygonsIndex: polygonsIndex,
                polygons: polygons,
                touching: touching
            })
        }
    }


    render() {
        return (
            <svg width={this.width} height={this.height} onClick={this.handleClick}> 
                {this.mapTiles.map((tile) => { return tile.toPath() })}
                {this.circles}
            </svg>
        )
    }
}

function isLandPoint(point) {
    return noise(point[0] / 100, point[1] / 100, 0) > 0.5
}


function getPerimeterFromPolys(poly1, poly2) {
    assertNot(poly1, undefined); assertNot(poly2, undefined)
    try {
        return assertNot(perimeter(combine(poly1, poly2)), undefined)
    } catch (e) {
        if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
            return Number.MAX_VALUE
        } else {
            throw e
        }
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

function assert(val1, val2) {
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        throw AssertionError(val1 + " != " + val2)
    } else {
        return val1
    }
}

function assertNot(val1, val2) {
    if (JSON.stringify(val1) === JSON.stringify(val2)) {
        throw AssertionError(val1 + " == " + val2)
    } else {
        return val1
    }
}