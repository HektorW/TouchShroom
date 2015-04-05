
import { EventEmitter } from 'events';

// Should be made into singleton
// Users will access with getState()
// times will be calculated in getState()

export default class InputManager extends EventEmitter {

  constructor(game) {
    this.game = game;

    this.pointer = {
      x: 0,
      y: 0,
      down: false,
      timeDown: 0
    };
    this.lastPointer = Object.assign({}, this.pointer);
  }

  init() {
    this.initEvents();

    return this;
  }

  initEvents() {
    window.addEventListener('mousemove', this.updatePosition.bind(this), false);
    window.addEventListener('mousedown', this.onPointerDown.bind(this), false);
    window.addEventListener('mouseup', this.onPointerUp.bind(this), false);

    window.addEventListener('touchmove', this.updatePosition.bind(this), false);
    window.addEventListener('touchstart', this.onPointerDown.bind(this), false);
    window.addEventListener('touchend', this.onPointerUp.bind(this), false);
  }

  update(time) {
    this.lastPointer = Object.assign({}, this.pointer);

    if (this.pointer.down) {
      this.pointer.timeDown += time;
    } else {
      this.pointer.timeDown = 0;
    }
  }

  getState() {
    return {
      x: this.pointer.x,
      y: this.pointer.y,
      down: this.pointer.down
    };
  }


  translateEventCoordinates(event) {
    if (event.changedTouches) {
      return [ event.changedTouches[0].pageX, event.changedTouches[0].pageY ];
    }
  }

  updatePosition(event) {
    event.preventDefault();

    let [ pageX, pageY ] = this.translateEventCoordinates(event);
    [ this.pointer.x, this.pointer.y ] = [ pageX, pageY ];
  }

  onPointerDown(event) {
    this.updatePosition(event);
    this.pointer.down = true;
  }

  onPointerUp(event) {
    this.updatePosition(event);
    this.pointer.down = false;
    this.trigger('pointer.up');
  }

}