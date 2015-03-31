
import { EventEmitter } from 'events';

export default class InputManager extends EventEmitter {

  constructor() {
    this.pointer = {
      x: 0,
      y: 0,
      down: false
    };
  }

  init() {
    this.initEvents();

    return this;
  }

  initEvents() {

  }

  moveEvent(event) {

  }
}