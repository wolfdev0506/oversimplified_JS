/* eslint-disable no-loop-func */
// import { INVALID_MOVE } from 'boardgame.io/core';
import {ResourcePieces, TroopFactoryPieces, StoragePieces} from './gamePieces.js'

// TODO: Make a second game that acts as the lobby, so that the game "master" can decide when to start the game (assuming it doesn't fill up)


export const Oversimplified = {
    name: "Oversimplified",

    setup: (ctx, setupData) => {
        return { ...setupData, hands: makeHands(ctx.playOrder) }
    },

    phases: {
        pickTiles: {
            start: true,
            next: 'placeBuildings',
            moves: {pickTile},
            moveLimit: 1,
            endIf: endIfPickTiles
        },

        placeBuildings: {
            next: 'play',
            moves: {buyBuilding},
            moveLimit: 1,
            endIf: endIfPlaceBuildings
        },

        build: {
            next: "train",
            moves: {
                buyBuilding,
                buildBuilding,
                offerTrade,
            }
        },

        train: {
            next: "fight1",
            moves: {
                trainTroops,
                placeTroops,
            }
        },

        fight1: {
            next: "fight2",
            moves: {moveTroops}
        },

        fight2: {
            next: "fight3",
            moves: {moveTroops}
        },
        
        fight3: {
            next: "build",
            moves: {moveTroops}
        },
    },

    // turn: {
    //     moveLimit: 6
    // },

    endIf: (G, ctx) => {
        return false
    },

    disableUndo: true,
}

function pickTile(G, ctx, tileID) {
    G.hands[ctx.currentPlayer].tiles.push(tileID)
}

function moveTroops(G, ctx, fromTileID, toTileID, amount, troopType) {

}

function trainTroops(G, ctx, amount, troopType) {
    
}

function placeTroops(G, ctx, tileID, amount, troopType) {
    // TODO: troops can only be placed on tiles with a troop factory and for ocean troops, only ocean tiles adjacent to the factory
}

function offerTrade(G, ctx, offerGive, offerReceive, toPlayerID) {

}

function buyBuilding(G, ctx, buildingType) {

}

function buildBuilding(G, ctx, tileID, buildingType) {

}


function endIfPickTiles(G, ctx) {  // checks if everyone has picked 4 tiles
    return Object.values(G.hands).map(v => v.tiles.length === 4).reduce((prev, curr) => prev && curr)
}

function endIfPlaceBuildings(G, ctx) {  // checks if everyone has place their 2 buildings
    return Object.values(G.hands).map(v => v.buildings.length === 2).reduce((prev, curr) => prev && curr)
}


function makeHands(playerIDs) {
    var hands = {}

    for (const id of playerIDs) {
        hands[id] = {
            resources: Object.keys(ResourcePieces).map(v => ["gold", "oil"].includes(v) ? [v, 100] : [v, 0]),
            tiles: [],  // list of tile IDs
            buildings: [],  // list of each building,  {...piece, location, level (possibly)}
            troops: [],     // list of each group of troops,  {...piece, location, amount, level (possibly)}
            hand: [[TroopFactoryPieces.factory, 1], [StoragePieces.warehouse, 1]]
        }
    }
    return hands
}