
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

    template = template || this.template || '<div>';
    this.$el = $(template);

    $parent.html(this.$el);
    this.bindDOMEvents();
  }
  unrenderDOM() {
    if (!this.$el) {
      console.warn('Unrender screen which has no $el');
      return;
    }

    this.unbindDOMEvents();
  }


  bindDOMEvents() {
    if (!this.domEvents) return;

    for (var definition in this.domEvents) {
      let split = definition.split(' ');
      let event = split[0];
      let selector = split.slice(1).join(' ');

      let $el;
      if (selector === 'window') {
        $el = $(window);
      } else {
        $el = this.$el.find(selector);
      }

      let callback = this[this.domEvents[definition]];

      $el.on(event, callback.bind(this));
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
    if (!this._networkEventHandlers) return;

    this._networkEventHandlers.forEach((networkEvent) => {
      this.networkManager.off(networkEvent.event, networkEvent.handler);
    });
  }


  requestScreen(screen) {
    this.emit('requestScreen', { screen });
  }
}