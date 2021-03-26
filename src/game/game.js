/* eslint-disable no-loop-func */
// import { INVALID_MOVE } from 'boardgame.io/core';
import {ResourcePieces, ResourceFactoryPieces, TroopFactoryPieces, TroopPieces, StoragePieces} from './gamePieces.js'

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
        },

        placeBuildings: {
            next: 'play',

        },
        play: {
            moves: {
                moveTo: (G, ctx, fromID, toID, troops) => {
                
                },
                attackTile: (G, ctx, fromID, toID, troops) => {

                },
                buildBuilding: (G, ctx, tileID, buildingType) => {

                },
                makeTroops: (G, ctx, buildingID, troopType) => {

                },
                trade: (G, ctx, toPlayerID, give, receive) => {

                }
            }

        }

    },

    turn: {
        moveLimit: 6
    },

    endIf: (G, ctx) => {
        return false
    },

    disableUndo: true,
}


function makeHands(playerIDs) {
    var hands = {}

    for (const id of playerIDs) {
        hands[id] = {
            resources: Object.keys(ResourcePieces).map(v => v === "gold" ? [v, 100] : [v, 0]),
            territory: [],  // list of tile IDs
            buildings: [],  // list of each building,  {...piece, location, level (possibly)}
            troops: [],     // list of each group of troops,  {...piece, location, amount, level (possibly)}
            hand: [[TroopFactoryPieces.factory, 1], [StoragePieces.warehouse, 1]]
        }
    }
    return hands
}