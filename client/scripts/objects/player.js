
export default class Player {

  constructor(game, id, name, color) {
    this.game = game;

    this.id = id;
    this.name = name;
    this.color = color;

    this.bases_id = [];
  }

  addBase(base) {
    if(!this.bases_id.contains(base.id))
      this.bases_id.push(base.id);
  }

  removeBase(base) {
    let i = this.bases_id.indexOf(base.id);
    if(i !== -1)
      this.bases_id.splice(i, 1);
  }

  totalResources() {
    let total = 0;

    for(let i = this.bases_id.length; i--; ){
      let base = this.game.getByID(this.game.bases, this.bases_id[i]);
      total += base.resources;
    }
    return total;
  }
}