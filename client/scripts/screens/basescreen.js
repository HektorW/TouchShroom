


export default class BaseScreen {

  constructor(networkManager, soundManager) {
    this.networkManager = networkManager;
    this.soundManager = soundManager;

    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  renderDOM($parent, template) {
    if (template) {
      this.$el = $(template);
    } else {
      this.$el = $('<div>');
    }

    $parent.html(this.$el);
    this.bindEvents();
  }

  unrenderDOM() {
    this.$el.off();
  }

  bindEvents() {
    for (var definition in this.events) {
      let split = definition.split(' ');
      let event = split[0];
      let selector = split.slice(1).join(' ');
      let callback = this[this.events[definition]].bind(this);

      this.$el.find(selector).on(event, callback);
    }
  }
}