const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

export class API {
    constructor(address, port=8000) {
        [this.address, this.port] = [address, port]
        this.url = `http://${address}:${port}`
    }

    listGames() {
        return fetch(this.url + "/games").then(response => response.json())
    }

    listMatches() {
        return fetch(this.url + "/games/Oversimplified").then(response => response.json())
    }

    createMatch(body) {
        return fetch(this.url + "/games/Oversimplified/create", {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        }).then(response => response.json())
    }

    joinMatch(matchID, body) {
        return fetch(`${this.url}/games/Oversimplified/${matchID}/join`, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        }).then(response => response.json())
    }

    getMatch(matchID) {
        return fetch(`${this.url}/games/Oversimplified/${matchID}`).then(response => response.json())
    }
}