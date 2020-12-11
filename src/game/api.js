const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

export class API {
    constructor(address, port=(process.env.PORT || 8000)) {
        [this.address, this.port] = [address, port]
        this.url = `http${address === "localhost"? "" : "s"}://${address}:${port}`
        this.credentials = address === "localhost"? {} : {credentials: 'include'}
        console.log("URL: " + this.url, process.env.PORT)
    }

    listGames() {
        return fetch(this.url + "/games", this.credentials).then(response => response.json())
    }

    listMatches() {
        return fetch(this.url + "/games/Oversimplified", this.credentials).then(response => response.json())
    }

    getMatch(matchID) {
        return fetch(`${this.url}/games/Oversimplified/${matchID}`, this.credentials).then(response => response.json())
    }

    createMatch(body) {
        return fetch(this.url + "/games/Oversimplified/create", {...{
                method: "POST",
                headers,
                body: JSON.stringify(body)
            },
            ...this.credentials
        }).then(response => response.json())
    }

    joinMatch(matchID, body) {
        return fetch(`${this.url}/games/Oversimplified/${matchID}/join`, {...{
                method: "POST",
                headers,
                body: JSON.stringify(body)
            },
            ...this.credentials
        }).then(response => response.json())
    }

    leaveMatch(matchID, body) {
        return fetch(`${this.url}/games/Oversimplified/${matchID}/leave`, {...{
                method: "POST",
                headers,
                body: JSON.stringify(body)
            },
            ...this.credentials
        }).then(response => response.json())
    }
}