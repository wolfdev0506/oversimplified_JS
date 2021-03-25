export class Resource {
    type = "resource"

    constructor(name) {
        this.name = name
    }
}

export const ResourcePieces = {
    gold: new Resource("gold"),
    food: new Resource("food"),
    oil: new Resource("oil"),
    lumber: new Resource("lumber"),
    iron: new Resource("iron"),
    brick: new Resource("stone"),
    coal: new Resource("coal"),
    // technology: Resource("Technology"),
}

export class Troop {
    type = "troop"

    constructor(name, domain, attacks, canAttackBuilding) {
        this.name = name
        this.domain = domain
        this.attacks = attacks
        this.canAttackBuilding = canAttackBuilding
    }
}

export const TroopPieces = {
    infantry: new Troop("infantry", "land", ["infantry", "tank"], true),
    tank: new Troop("tank", "land", ["infantry", "tank"], true),
    fighterPlane: new Troop("fighter plane", "air", ["fighterPlane", "bomberPlane"], false),
    bomberPlane: new Troop("bomber plane", "air", ["infantry", "tank", "battleship"], true),
    battleship: new Troop("battleship", "sea", ["battleship", "submarine"], true),
    submarine: new Troop("submarine", "sea", ["battleship", "submarine"], false),
}

export class Building {
    type = "building"

    constructor(name, biomes) {
        this.name = name
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

export const ResourceFactoryPieces = {
    sawmill: new ResourceFactory("saw mill", ["forest"], "lumber"),
    oilDrill: new ResourceFactory("oil drill", ["mountain", "forest", "grassland", "desert", "ocean"], "oil"),
    ironMine: new ResourceFactory("iron mine", ["mountain", "forest", "grassland", "desert"], "iron"),
    quarry: new ResourceFactory("quarry", ["mountain", "forest", "grassland", "desert"], "brick"),
    coalMine: new ResourceFactory("coal mine", ["mountain", "forest", "grassland", "desert"], "coal"),
    farm: new ResourceFactory("farm", ["grassland"], "food"),
} 

export class TroopFactory extends Building {
    type = "troopFactory" 

    constructor(name, biomes, produces) {
        super(name, biomes)

        this.produces = produces
    }
} 

export const TroopFactoryPieces = {
    landFactory: new TroopFactory("land factory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane"]),
    seaFactory: new TroopFactory("sea factory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane", "battleship", "submarine"]), 
    factory: new TroopFactory("factory", ["mountain", "forest", "grassland", "desert"], ["infantry", "tank", "fighterPlane", "bomberPlane", "battleship", "submarine"])
}

export class Storage extends Building {
    type = "storage"

    constructor(name, biomes) {
        super(name, biomes)
    }
}

export const StoragePieces = {
    warehouse: new Storage("warehouse", ["mountain", "forest", "grassland", "desert"])
}