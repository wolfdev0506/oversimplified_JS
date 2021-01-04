import { Delaunay } from "d3-delaunay";
import { noise } from '@chriscourses/perlin-noise'
import names from '../../src/names.json'
import { getPerimeterToAreaRatio, combine, IsEnclaveError, OnlyOneConnectingPointError } from'./generationUtils'


function makeAndMergeTiles(points, width, height) {
    var voronoi = Delaunay.from(points).voronoi([0, 0, width, height])

    var polygons = [...voronoi.cellPolygons()]
    var polygonsIndex = polygons.map((_, i) => i)
    var touching = []
    var mapTiles = []
    var oceanCounter = 0

    while (polygonsIndex.length > 0) {
        if (polygonsIndex.length % 2 === 0) {
            console.log(polygonsIndex.length)
            postMessage({done: false, numPolysLeft: polygonsIndex.length, numPolys: points.length, width, height, mapTiles})
        } 
        [polygonsIndex, touching, oceanCounter] = nextTile(polygons, polygonsIndex, touching, mapTiles, oceanCounter, points, voronoi)
    }

    return mapTiles
}

function nextTile(polygons, polygonsIndex, touching, mapTiles, oceanCounter, points, voronoi) {
    let baseIndex;
    if (touching.length > 0) {
        baseIndex = touching[Math.floor(Math.random() * touching.length)]
        polygonsIndex = polygonsIndex.filter(v => v !== baseIndex)
    } else {
        baseIndex = polygonsIndex.splice(Math.floor(Math.random() * polygonsIndex.length), 1)[0]
    }

    let polygonIndexes = [baseIndex]
    let basePolygon = polygons[baseIndex]
    let isLand = isLandPoint(points[baseIndex])
    let numPolys
    if (isLand) {
        numPolys = Math.floor(Math.random() * 15) + 8
    } else {
        numPolys = Math.floor(Math.random() * 30) + 8
    }

    touching = [...voronoi.neighbors(baseIndex)].filter(v => contains(polygonsIndex, v))

    for (let nPoly = 0; nPoly < numPolys; nPoly++) {
        if (touching.length < 1) break

        let nextIndex = touching[0]
        if (touching.length > 1) {
            let nextPerimeter = getPerimeterToAreaRatio(basePolygon, polygons[nextIndex])
            for (let i = 1; i < Math.min(touching.length, isLand ? 3 : touching.length); i++) {
                let tmpI = touching[i]
                let tmpPerimeter = getPerimeterToAreaRatio(basePolygon, polygons[tmpI])

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

        if (isLand !== isLandPoint(points[nextIndex])) {
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
        touching.push(...[...voronoi.neighbors(nextIndex)].filter((value) => { return contains(polygonsIndex, value) }))
    }

    mapTiles.push({
        polygon: basePolygon,
        points: polygonIndexes.map((v) => points[v]),
        cellsIndex: polygonIndexes,
        touchCellsIndex: [...new Set(polygonIndexes.map((v) => [...voronoi.neighbors(v)]).flat().filter((v) => !(polygonIndexes.includes(v))))],
        data: { 
            isOcean: !isLand, 
            color: (!isLand ? "blue" : "green"), 
            center: getMiddlestPoint(polygonIndexes.map((v) => points[v])),
            name: isLand? names.splice(Math.floor(Math.random() * names.length), 1)[0] : ("Ocean " + (oceanCounter+= 1))
        },
        id: polygonsIndex.length
    })

    return [polygonsIndex, touching, oceanCounter]
}

function getMiddlestPoint(points) {
    points = [...points]
    let averageX = points.map((v) => v[0]).reduce((p, v) => p + v) / points.length
    let averageY = points.map((v) => v[1]).reduce((p, v) => p + v) / points.length

    points.sort((a, b) => (Math.abs(a[0] - averageX) - Math.abs(b[0] - averageX)) + (Math.abs(a[1] - averageY) - Math.abs(b[1] - averageY)))
    return points[0]
}

function isLandPoint(point) {
    return noise(point[0] / 100, point[1] / 100, 0) > 0.5
}

function contains(arr, value) {
    try {
        for (var v of arr) {
            if (JSON.stringify(value) === JSON.stringify(v)) { return true }
        }
        return false
    } catch (e) {
        throw e
    }
}

onmessage = (e) => {
    const {points, height, width} = e.data;
    const mapTiles = makeAndMergeTiles(points, width, height);
    postMessage({done: true, mapTiles, height, width});
};