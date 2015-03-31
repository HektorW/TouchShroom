
import { drawCircle } from '../util/draw';


export default class Base {

  constructor(game, id, left, top, scale, resources, resources_max) {
    this.game = game;
    this.id = id;

    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.1;
    this.shadow_size = 30;

    this.color = '#AAAAAA';

    this.selected = false;
    this.hovered = false;
    this.targeted = false;

    this.spawn_delay = 0;
    this.spawn_delay_max = 0.5;

    this.resources = resources || 0;
    this.resources_max = resources_max;

    this.player = null;

    this.resize();
  }


  update(time) {
    if(this.spawn_delay > 0)
      this.spawn_delay -= time;
  }

  draw(ctx) {
    ctx.save();


    if (this.hovered){
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
    } else if (this.selected){
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;
    }

    drawCircle(ctx, this.x, this.y, this.size, this.color, 'fill');

    // Draw text
    ctx.fillStyle = 'black';
    var text = this.resources + ((this.player)? '/' + this.resources_max : '');
    var m = ctx.measureText(text);
    ctx.fillText(text, this.x - m.width/2, this.y);

    ctx.restore();
  }


  resize() {
    if (this.game.width > this.game.height) {
      this.x = this.game.width * this.left;
      this.y = this.game.height * this.top;
      this.size = this.game.height * this.scale;
    } else {
      this.x = this.game.width - (this.game.width * this.top);
      this.y = this.game.height * this.left;
      this.size = this.game.width * this.scale;
    }
  }

  setPlayer(player) {
    if (this.player){
      this.player.removeBase(this);
    }

    this.color = player.color;
    this.player = player;
    this.player.addBase(this);
  }

  canSendMinion() {
    return (this.spawn_delay <= 0.0);
  }

  sendMinion() {
    this.spawn_delay = this.spawn_delay_max;
    --this.resources;
  }
}
