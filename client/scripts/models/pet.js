export let Pet = class {
    constructor(id, damage, magic, lastMeal, endurance) {
        this.damage = damage;
        this.magic = magic;
        this.lastMeal = lastMeal;
        this.endurance = endurance;
        this.id = id;
        this.starvation_time = 0;
    }
}