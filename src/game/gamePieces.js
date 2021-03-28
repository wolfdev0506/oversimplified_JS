export class GamePiece {
    constructor(name) {
        this.name = name
    }
}


export class Resource extends GamePiece {
    type = "resource"

    // constructor(name) {
    //     super(name)
    // }
}

export const ResourcePieces = {
    gold: {...new Resource("gold")},
    food: {...new Resource("food")},
    oil: {...new Resource("oil")},
    lumber: {...new Resource("lumber")},
    iron: {...new Resource("iron")},
    brick: {...new Resource("stone")},
    coal: {...new Resource("coal")},
    // technology: {...new Resource("technology")},
}

export class Troop extends GamePiece {
    type = "troop"

    constructor(name, domain, attacks, canAttackBuilding) {
        super(name)
        this.domain = domain
        this.attacks = attacks
        this.canAttackBuilding = canAttackBuilding
    }
}

export const TroopPieces = {
    infantry: {...new Troop("infantry", "land", ["infantry", "tank"], true)},
    tank: {...new Troop("tank", "land", ["infantry", "tank"], true)},
    fighterPlane: {...new Troop("fighterPlane", "air", ["fighterPlane", "bomberPlane"], false)},
    bomberPlane: {...new Troop("bomberPlane", "air", ["infantry", "tank", "battleship"], true)},
    battleship: {...new Troop("battleship", "sea", ["battleship", "submarine"], true)},
    submarine: {...new Troop("submarine", "sea", ["battleship", "submarine"], false)},
}

export class Building extends GamePiece {
    type = "building"

    constructor(name, biomes) {
        super(name)
        this.biomes = biomes
    }
}

export class ResourceFactory extends Building {
    type = "resourceFactory"

    constructor(name, biomes, produces) {
        super(name, biomes)

        this.produces = produces 
    }
}

export const ResourceFactoryPieces = { // I think these should just cost gold
    sawMill: {...new ResourceFactory("sawMill", ["forest"], "lumber")},
    oilDrill: {...new ResourceFactory("oilDrill", ["mountain", "forest", "grassland", "desert", "ocean"], "oil")},
    ironMine: {...new ResourceFactory("ironMine", ["mountain", "forest", "grassland", "desert"], "iron")},
    quarry: {...new ResourceFactory("quarry", ["mountain"], "brick")},
    coalMine: {...new ResourceFactory("coalMine", ["mountain", "forest", "grassland", "desert"], "coal")},
    farm: {...new ResourceFactory("farm", ["grassland"], "food")},
} 

export class TroopFactory extends Building {
    type = "troopFactory" 

    constructor(name, biomes, produces) {
        super(name, biomes)

        this.produces = produces
    }
} 

export const TroopFactoryPieces = {
    landFactory: {...new TroopFactory("landFactory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane"])},
    seaFactory: {...new TroopFactory("seaFactory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane", "battleship", "submarine"])}, 
    factory: {...new TroopFactory("factory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane", "battleship", "submarine"])}
}

export class Storage extends Building {
    type = "storage"

    // constructor(name, biomes) {
    //     super(name, biomes)
    // }
}

export const StoragePieces = {
    warehouse: {...new Storage("warehouse", ["mountain", "forest", "grassland", "desert"])}
}