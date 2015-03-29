
import { pointInCircle, vecDistance } from './util/math'


export default class Minion {

  constructor(id, source, target, scale) {
    this.id = id;

    this.source_base = source;
    this.target_base = target;

    this.x = this.source_base.x;
    this.y = this.source_base.y;
    this.scale = scale || 0.01;
    this.size = 10;
    this.color = this.source_base.color;

    this.active = true;
    this.dead_by_server = false;

    this.start_time = window.performance.now();
    this.active_time = 0;

    this.speed = 3;

    this.resize();
  }

  update(time) {
    this.active_time += t;

    this.x = this.source_base.x + this.vel_x * this.active_time;
    this.y = this.source_base.y + this.vel_y * this.active_time;

    if(pointInCircle(this.x, this.y, this.target_base.x, this.target_base.y, this.target_base.size)){
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
    ctx.fill();
  }


  resize() {
    let delta_speed = ((GAME.width > GAME.height)? GAME.width : GAME.height) / this.speed;

    let distance = vecDistance(this.source_base.x, this.source_base.y, this.target_base.x, this.target_base.y);
    let distance_x = this.target_base.x - this.source_base.x;
    let distance_y = this.target_base.y - this.source_base.y;

    this.vel_x = (distance_x / Math.abs((distance / delta_speed))) || 0;
    this.vel_y = (distance_y / Math.abs((distance / delta_speed))) || 0;

    this.size = ((GAME.width > GAME.height)? GAME.height : GAME.width) * this.scale;
  }

};