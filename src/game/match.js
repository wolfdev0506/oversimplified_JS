import { Oversimplified } from './Oversimplified'

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

/** Create a match and return the match ID. */
export const createMatch = async (serverURL, visible) => {
    const resp = await fetch(`${serverURL}/games/${Oversimplified.name}/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            numPlayers: 2,
            unlisted: !visible,
        }),
    });
    if (!resp.ok) {
        throw new Error("failed to create match: " + (await resp.text()));
    }
    const data = await resp.json();
    if (typeof data.gameID !== String) {
        throw new Error("invalid response data: " + JSON.stringify(data));
    } else {
        return data.gameID.toString();
    }
};

/** Join a match and return the player credentials. */
export const joinMatch = async (serverURL, matchID, player) => {
    const resp = await fetch(`${serverURL}/games/${Oversimplified.name}/${matchID}/join`, {
        method: "POST",
        headers,
        body: JSON.stringify({ playerID: player, playerName: "bob" }),
    });
    if (!resp.ok) {
        throw new Error("failed to join match: " + (await resp.text()));
    }
    const data = await resp.json();
    if (typeof data.playerCredentials !== String) {
        throw new Error("invalid response data: " + JSON.stringify(data));
    } else {
        return data.playerCredentials.toString();
    }
};

/** Leave a match. */
export const leaveMatch = async (serverURL, matchID, player, credentials) => {
    const resp = await fetch(`${serverURL}/games/${Oversimplified.name}/${matchID}/leave`, {
        method: "POST",
        headers,
        body: JSON.stringify({ playerID: player, credentials }),
    });
    if (!resp.ok) {
        throw new Error("failed to leave match: " + (await resp.text()));
    }
};