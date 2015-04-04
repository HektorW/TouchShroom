
import { EventEmitter } from 'events';

export default class BaseScreen extends EventEmitter {

  constructor(networkManager, soundManager) {
    this.networkManager = networkManager;
    this.soundManager = soundManager;

    this.active = false;
  }

  activate() {
    this.active = true;

    this.bindNetworkEvents();
  }
  deactivate() {
    this.active = false;

    this.unbindNetworkEvents();
  }


  renderDOM($parent, template) {
    if (this.$el) {
      this.unrenderDOM();
    }

    if (template) {
      this.$el = $(template);
    } else {
      this.$el = $('<div>');
    }

    $parent.html(this.$el);
    this.bindDOMEvents();
  }
  unrenderDOM() {
    if (!this.$el) {
      console.warn('Unrender screen which has no $el');
    }

    this.unbindDOMEvents();
  }


  bindDOMEvents() {
    if (!this.domEvents) return;

    for (var definition in this.domEvents) {
      let split = definition.split(' ');
      let event = split[0];
      let selector = split.slice(1).join(' ');
      let callback = this[this.domEvents[definition]];

      this.$el.find(selector).on(event, callback.bind(this));
    }
  }
  unbindDOMEvents() {
    this.$el.off();
  }


  bindNetworkEvents() {
    if (!this.networkEvents) return;

    this._networkEventHandlers = [];

    for (let event in this.networkEvents) {
      let handler = this[this.networkEvents[event]].bind(this);

      this._networkEventHandlers.push({ event, handler });

      this.networkManager.on(event, handler);
    }
  }
  unbindNetworkEvents() {
    this._networkEventHandlers.forEach((networkEvent) => {
      this.networkManager.off(networkEvent.event, networkEvent.handler);
    });
  }


  requestScreen(screen) {
    this.emit('requestScreen', { screen });
  }
}