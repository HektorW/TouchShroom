
import { hexcolorToRGB } from '../util/color';


export default class Particle {
  
  constuctor(game, left, top, scale, color) {
    this.game = game;

    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.01;

    this.color = color || '#AAAAAA';
    this.rgba = hexcolorToRGB(this.color);
    this.rgba[3] = 1.0;

    this.active = true;
    this.live_count = 0.0;

    this.resize();
  }


  update(time) {
    this.live_count += time;
    this.rgba[3] -= time * 0.5;

    if (this.rgba[3] < 0)
      this.active = false;
  }


  draw(ctx) {
    ctx.save();

    let [r, g, b, a] = this.rgba;
    ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + (this.live_count * 10), Math.PI*2, false);
    ctx.stroke();

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

}