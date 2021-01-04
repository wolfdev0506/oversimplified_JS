import { Delaunay } from "d3-delaunay";
console.log("CHECK PRINTING");

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
            postMessage({done: false, numPolysLeft: polygonsIndex.length, numPolys: points.length})
        } 
        // [polygonsIndex, touching, oceanCounter] = nextTile(polygons, polygonsIndex, touching, mapTiles, oceanCounter, points, voronoi)
    }

    return mapTiles
}


console.log("STARTED");

onmessage = (e) => {
    console.log("RUNNING" + e);
    postMessage("TESTING");
};