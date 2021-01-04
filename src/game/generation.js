import { Delaunay } from "d3-delaunay";
import { polygon, union, area } from "@turf/turf"
import { noise } from '@chriscourses/perlin-noise'
import names from '../../src/names.json'
import {WIDTH, HEIGHT} from '../../src/constants'

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./tileWorker'


class OnlyOneConnectingPointError extends Error {
    constructor(message) {
        super(message)
        this.name = "OnlyOneConnectingPointError"
    }
}
class IsEnclaveError extends Error {
    constructor(message) {
        super(message)
        this.name = "IsEnclaveError"
    }
}
class AssertionError extends Error {
    constructor(message) {
        super(message)
        this.name = "AssertionError"
    }
}

export function getTileWorker(num, type="relaxed") {    
    var points
    if (type === "hex") {
        points = makeHexVoronoiPoints(num, WIDTH, HEIGHT)
    } else if (type === "random") {
        points = makeRandomPoints(num, WIDTH, HEIGHT)
    } else if (type === "relaxed") {
        points = relaxedRandomPoints(num, WIDTH, HEIGHT)
    } else {
        throw new Error(`type of ${type} is invalid`)
    }

    return runTilesWorker(points, WIDTH, HEIGHT)

}

export function makeBoardFromTiles(mapTiles) {
    var neighborMap = generateTouchMap(mapTiles);  // this semicolon is needed bc javascript is stupid
    [mapTiles, neighborMap] = merge1PolyTiles(mapTiles, neighborMap)
    mapTiles = assignBiomes(mapTiles, neighborMap)
    return {width: WIDTH, height: HEIGHT, mapTiles, neighborMap: mapToObject(neighborMap)};
}

// export function generateGameBoard(num = 100, type="relaxed", donenessCbkFn=(_) => null) {
//     var [mapTiles, neighborMap] = createGameBoard(num, HEIGHT, WIDTH, type, donenessCbkFn)
//     return {width: WIDTH, height: HEIGHT, mapTiles, Points: num, neighborMap: mapToObject(neighborMap)}
// }

// export function createGameBoard(numPoints, height, width, type, donenessCbkFn) {
//     var points
//     if (type === "hex") {
//         points = makeHexVoronoiPoints(numPoints, width, height)
//     } else if (type === "random") {
//         points = makeRandomPoints(numPoints, width, height)
//     } else if (type === "relaxed") {
//         points = relaxedRandomPoints(numPoints, width, height)
//     } else {
//         throw new Error(`type of ${type} is invalid`)
//     }

//     var mapTilesWorker = runTilesWorker(points, width, height, donenessCbkFn)

//     mapTilesWorker.onmessage
//     // var mapTiles = makeAndMergeTiles(points, width, height, donenessCbkFn)
//     var neighborMap = generateTouchMap(mapTiles);  // this semicolon is need bc javascript is stupid
//     [mapTiles, neighborMap] = merge1PolyTiles(mapTiles, neighborMap)
//     mapTiles = assignBiomes(mapTiles, neighborMap)
//     return [mapTiles, neighborMap];

// }

function runTilesWorker(points, width, height) {
    // const worker = new Worker("workers/tileWorker.js", {type: "module"})
    const worker = new Worker()
    worker.postMessage({points, width, height})
    console.log("POSTED MESSAGE")
    // console.log()
    return worker
}

function assignBiomes(mapTiles, neighborMap) {
    // const resources = ["coal", "iron", "lumber", "stone", "food", "oil"]
    const colorVariation = 30

    const oceanBiomes = {ocean: {chance: 100, moveability: 10, color: [30, 144, 255]}}
    const landBiomes = {
        grassland: {chance: 25, moveability: 10, color: [107, 142, 35]},
        forest: {chance: 25, moveability: 6, color: [0, 100, 0]},
        desert: {chance: 25, moveability: 7, color: [225, 169, 95]},
        mountain: {chance: 25, moveability: 3, color: [112, 128, 144]}
    }

    const tiles = mapTiles.map((_, i) => i)
    const landTiles = tiles.filter(v => !mapTiles[v].data.isOcean)
    const oceanTiles = tiles.filter(v => mapTiles[v].data.isOcean)

    while (landTiles.length > 0) {
        let current = landTiles[Math.floor(Math.random() * landTiles.length)]
        let group = neighborMap.get(current).filter(v => landTiles.includes(v))

        let baseBiome = pickBiome(landBiomes)
        let groupBiomes = group.map(v => [v, pickBiome(landBiomes, baseBiome)]).filter(v => v[1] === baseBiome)
        groupBiomes = groupBiomes.concat([[current, baseBiome]])

        for (let [i, b] of groupBiomes) {
            mapTiles[i].data = {...landBiomes[b], ...mapTiles[i].data, biome: b, color: numToHexColor(landBiomes[b].color, false, colorVariation)}
            landTiles.splice(landTiles.indexOf(i), 1)
        }
    }

    while (oceanTiles.length > 0) {
        let current = oceanTiles[Math.floor(Math.random() * oceanTiles.length)]
        let group = neighborMap.get(current).filter(v => oceanTiles.includes(v))

        let baseBiome = pickBiome(oceanBiomes)
        let groupBiomes = group.map(v => [v, pickBiome(oceanBiomes, baseBiome)]).filter(v => v[1] === baseBiome)
        groupBiomes = groupBiomes.concat([[current, baseBiome]])

        for (let [i, b] of groupBiomes) {
            mapTiles[i].data = {...oceanBiomes[b], ...mapTiles[i].data, biome: b, color: numToHexColor(oceanBiomes[b].color, false, colorVariation)};
            oceanTiles.splice(oceanTiles.indexOf(i), 1)
        }
    }

    return mapTiles
}

function pickBiome(biomes, biome50) {
    if (biome50 && biomes.length > 1) {
        biomes[biome50].chance = [...Object.entries(biomes)].filter(v => v[0] !== biome50).reduce((prev, curr) => prev +  curr[1].chance, 0)  // gives this biome a 50% chance of being picked
    }

    const maxPick = [...Object.entries(biomes)].reduce((prev, curr) => prev + curr[1].chance, 0)
    const r = Math.ceil(Math.random() * maxPick)
    var num = 0
    for (let [name, data] of Object.entries(biomes)) {
        if (num < r && r <= num + data.chance) {
            return name
        }
        num += data.chance
    }
    throw Error("pickBiome didn't pick a biome")
}

function merge1PolyTiles(mapTiles, neighborMap) {
    var onePolyTilesIndexes = [...neighborMap.keys()].filter(v => [1, 2, 3].includes(mapTiles[v].points.length))
    var validOnePolyTiles = onePolyTilesIndexes.filter(v => neighborMap.get(v).filter(v2 => mapTiles[v2].data.isOcean === mapTiles[v].data.isOcean).length > 0)
    var dontFit = []

    for (let polyI of validOnePolyTiles) {
        let validTouching = neighborMap.get(polyI).filter(v => ![1, 2, 3].includes(mapTiles[v].points.length)).filter(v => mapTiles[v].data.isOcean === mapTiles[polyI].data.isOcean)
        let perimeters = validTouching.map(v => getPerimeterToAreaRatio(mapTiles[polyI].polygon, mapTiles[v].polygon))
        let perimeterDiffs = perimeters.map((v, i) => v - perimeter(mapTiles[validTouching[i]].polygon))
        let bestFitI = perimeterDiffs.indexOf(Math.min(...perimeterDiffs))

        if (perimeters[bestFitI] !== Number.MAX_VALUE) {
            let baseTile = mapTiles[validTouching[bestFitI]]
            let mergeTile = mapTiles[polyI]
            mapTiles[validTouching[bestFitI]] = {
                polygon: combine(baseTile.polygon, mergeTile.polygon),
                points: baseTile.points.concat(mergeTile.points),
                cellsIndex: baseTile.cellsIndex.concat(mergeTile.cellsIndex),
                touchCellsIndex: baseTile.touchCellsIndex.concat(mergeTile.touchCellsIndex),
                data: baseTile.data,
                id: baseTile.id
            }
        } else {
            dontFit.push(polyI)
        }
    }
    validOnePolyTiles = validOnePolyTiles.filter(v => !dontFit.includes(v))
    validOnePolyTiles.sort((a, b) => b - a)

    for (let removeTile of validOnePolyTiles) {
        mapTiles.splice(removeTile, 1)
    }

    for (let removeTile of validOnePolyTiles) {
        let keys = [...neighborMap.keys()]
        keys.sort((a, b) => a - b)

        for (let key of keys) {
            if (key > removeTile) {
                neighborMap.set(key - 1, stepDown(neighborMap.get(key), removeTile))
                neighborMap.delete(key)

            } else if (key < removeTile) {
                neighborMap.set(key, stepDown(neighborMap.get(key), removeTile))
            }
        }
    }
    for (let key of neighborMap.keys()) { // clean up neighborMap
        neighborMap.set(key, [...new Set(neighborMap.get(key))])
    }
    
    mapTiles = mapTiles.map(v => ({...v, touchCellsIndex: undefined, cellsIndex: undefined}))

    return [mapTiles, neighborMap]

}

function generateTouchMap(mapTiles) {
    var neighborMap = new Map()
    var smallNeighborMap = new Map()
    for (var i = 0; i < mapTiles.length; i++) {
        for (let polyI of mapTiles[i].cellsIndex) {
            smallNeighborMap.set(polyI, i)
        }
    }

    for (i = 0; i < mapTiles.length; i++) {
        let touching = []
        for (let polyI of mapTiles[i].touchCellsIndex) {
            touching.push(smallNeighborMap.get(polyI))
        }
        neighborMap.set(i, touching)
    }
    return neighborMap
}

function makeHexVoronoiPoints(hexes, width, height) {
    var sideLength = Math.ceil(width / (2 * Math.sqrt(width * hexes / height)))
    var verticalHexes = Math.ceil(height / (sideLength * Math.sqrt(3)))
    var horizontalHexes = Math.ceil(width / (sideLength * 1.5))
    
    var points = []
    var start = [sideLength / 2, (.1 * sideLength) + (sideLength * Math.sqrt(3) / 2) ]
    var current = [...start]

    for (let col = 0; col < horizontalHexes; col++) {
        if (current[0] > width) {
            break
        }

        for (let row = 0; row < verticalHexes; row++) {
            if (current[1] > height) {
                break
            }

            points.push(current)
            current = [current[0], current[1] + (2 * sideLength)]
        }

        var mul = col % 2 === 0 ? -1 : 0
        current = [start[0] + (1.5 * sideLength * (col + 1)), start[1] + (mul * sideLength * Math.sqrt(3) / 2)]
    }
    return points
}

function makeRandomPoints(numPoints, width, height) {
    var points = Array(numPoints)
        .fill(0)
        .map(() => [Math.floor(Math.random() * width), Math.floor(Math.random() * height)])
        .map(JSON.stringify)
        .reverse()
        .filter((e, i, a) => a.indexOf(e, i + 1) === -1)
        .reverse()
        .map(JSON.parse)

    return points
}

function relaxedRandomPoints(numPoints, width, height, lloydRelax=5) {
    var points = makeRandomPoints(numPoints, width, height)
    
    var delaunay = Delaunay.from(points)
    for (let _ = 0; _ < lloydRelax; _++) {
        points = [...delaunay.voronoi([0, 0, width, height]).cellPolygons()].map((v, i) => {
            let big = v.reduce((last, next) => [last[0] + next[0], last[1] + next[1]])
            return [big[0]/v.length, big[1]/v.length]
        })
        delaunay = Delaunay.from(points)
    }
    return points
}

function makeAndMergeTiles(points, width, height, donenessCbkFn) {
    var voronoi = Delaunay.from(points).voronoi([0, 0, width, height])

    var polygons = [...voronoi.cellPolygons()]
    var polygonsIndex = polygons.map((_, i) => i)
    var touching = []
    var mapTiles = []
    var oceanCounter = 0

    while (polygonsIndex.length > 0) {
        if (polygonsIndex.length % 10 === 0) {
            console.log(polygonsIndex.length)
            donenessCbkFn(polygonsIndex.length, points.length)
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

function allIsolatedTiles(tiles, neighborMap) {   // May be used later for spawn points
    for (let tile of tiles) {
        if (neighborMap.get(tile).filter((v) => tiles.includes(v)).length > 0) return false
    }
    return true
}

function isLandPoint(point) {
    return noise(point[0] / 100, point[1] / 100, 0) > 0.5
}

function getPerimeterToAreaRatio(poly1, poly2) {
    assertNot(poly1, undefined); assertNot(poly2, undefined)
    try {
        var poly = combine(poly1, poly2)
        return assertNot((perimeter(poly) ** 2) / area(polygon([poly])), undefined)
        // return assertNot(perimeter(poly), undefined)
    } catch (e) {
        if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
            return Number.MAX_VALUE
        } else {
            throw e
        }
    }
}

function assertNot(val1, val2) {
    if (JSON.stringify(val1) === JSON.stringify(val2)) {
        throw new AssertionError(val1 + " == " + val2)
    } else {
        return val1
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
    try {
        var realPoly1 = polygon([poly1])
        var realPoly2 = polygon([poly2])
    } catch (e) {
        throw e
    }
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
        throw e
    }
}

function stepDown(nums, stepAt) {
    return nums.filter((v) => v !== stepAt).map((v) => v > stepAt ? --v : v)
}

function getMiddlestPoint(points) {
    points = [...points]
    let averageX = points.map((v) => v[0]).reduce((p, v) => p + v) / points.length
    let averageY = points.map((v) => v[1]).reduce((p, v) => p + v) / points.length

    points.sort((a, b) => (Math.abs(a[0] - averageX) - Math.abs(b[0] - averageX)) + (Math.abs(a[1] - averageY) - Math.abs(b[1] - averageY)))
    return points[0]
}

function numToHexColor(arr, random=false, wiggle=0) {
    if (random) {
        arr = (new Array(3)).map(Math.floor(Math.random() * 256))
    }

    arr = arr.map(v =>  clamp(v + Math.ceil((Math.random() * wiggle) - wiggle / 2), 0, 255))

    return '#' + arr.map(zeroPadHex).join("")
}

function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num))
}

function zeroPadHex(num) {
    var s = num.toString(16)
    return s.length === 1? '0' + s : s 
}

export function mapToObject(map) {
    var keys = [...map.keys()]
    var obj = {}
    for (let key of keys) {
        obj[key] = map.get(key)
    }
    return obj
}

export function objectToMap(obj) {
    var keys = [...obj.keys()]
    var map = new Map()
    for (let key of keys) {
        map.set(parseInt(key), obj[key])
    }
    return map
}

function sendMessage(tilesLeft, tiles) {
    postMessage({tilesLeft, tiles})
}
