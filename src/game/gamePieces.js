export class Resource {
    type = "resource"

    constructor(name) {
        this.name = name
    }
}

export const ResourcePieces = {
    lumber: new Resource("lumber"),
    oil: new Resource("oil"),
    iron: new Resource("iron"),
    brick: new Resource("stone"),
    coal: new Resource("coal"),
    food: new Resource("food"),
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

export class ResourceFactory {
    type = "factory"

    constructor(name, biome, produces) {
        this.name = name
        this.biome = biome
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