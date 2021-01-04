import { polygon, union, area } from "@turf/turf"


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


export function getPerimeterToAreaRatio(poly1, poly2) {
    assertNot(poly1, undefined); assertNot(poly2, undefined)
    try {
        var poly = combine(poly1, poly2)
        return assertNot((perimeter(poly) ** 2) / area(polygon([poly])), undefined)
    } catch (e) {
        if (e instanceof IsEnclaveError || e instanceof OnlyOneConnectingPointError) {
            return Number.MAX_VALUE
        } else {
            throw e
        }
    }
}

export function combine(poly1, poly2) {
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

export function perimeter(poly) {
    var currentDistance = 0
    for (var i = 0; i < poly.length - 1; i++) {
        currentDistance += distance(poly[i], poly[i + 1])
    }
    return currentDistance
}

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

