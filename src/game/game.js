/* eslint-disable no-loop-func */
// import { INVALID_MOVE } from 'boardgame.io/core';


export const Oversimplified = {
    name: "Oversimplified",

    setup: (ctx, setupData) => {
        return setupData
    },

    moves: {
        moveTo: (G, ctx, fromID, toID, troops) => {

        },
        attackTile: (G, ctx, fromID, toID, troops) => {

        },
        buildBuilding: (G, ctx, locationID, buildingType) => {

        },
        makeTroops: (G, ctx, location, building, troopType) => {

        },
        trade: (G, ctx, withPlayer, give, receive) => {

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

