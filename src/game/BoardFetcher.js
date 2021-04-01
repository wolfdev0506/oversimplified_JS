export default class BoardFetcher {
    URL = "https://api.github.com/repos/JohnnyWobble/oversimplified-boards/"
    headers = {"Accept": "application/vnd.github.v3+json"}

    constructor() {
        this.boards = {}
        this.boardSHAs = {}
        this.boardData = {}
    }

    fetchTypes() {
        return fetch(this.URL + "contents/", this.headers)
        .then(response => response.json())
            .then(response => this.types = response.map(f => {this.boards[f.name] = []; return f.name}))
    }

    fetchNames() {
        if (this.getTypes().length === 0) {
            return this.fetchTypes().then(() => this.fetchNames())

        } else {
            return Promise.all(
                this.getTypes().map(type => fetch(`${this.URL}contents/${type}`)
                    .then(response => response.json())
                    .then(response => this.boards[type] = response.map(f => {this.boardSHAs[type + f.name.replace(".json", "")] = f.sha; return f.name.replace(".json", "")}))
                )
            ).then(names => names.flat())
        } 
    }

    fetchBoard(type, board) {
        if (this.getBoard(type, board) !== undefined) {
            return Promise.resolve(this.getBoard(type, board))
        } else if (this.getSHA(type, board) === undefined) {
            return this.fetchNames()
                .then(() => this.fetchBoard(type, board))
        } else {
            // const url = `${this.URL}${type}/${board}.json`
            const url = `${this.URL}git/blobs/${this.getSHA(type, board)}`
            return fetch(url, this.headers)
                .then(response => response.json())
                .then(response => JSON.parse(atob(response.content)))
                .then(response => this.boardData[type + board] = response)
        }
    }

    getSHA(type, board) {
        return this.boardSHAs[type + board]
    }

    getBoard(type, board) {
        return this.boardData[type + board]
    }

    getTypes() {
        return Object.keys(this.boards)
    }

    getNames() {
        return this.getTypes().map(k => this.boards[k])
    }

    getTypeFromName(name) {
        for (let type of this.getTypes()) {
            if (type === name) {
                return type
            }
        }
    }

    getTypeNamePairs() {
        return this.getTypes().map(t => [t, this.boards[t]])
    }

    size() {
        return this.getNames().length
    }
} 