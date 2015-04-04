
export default class ScreenManager {

  constructor($el) {
    this.$el = $el;

    this.screens = [];
    this.activeScreen = null;
  }


  setScreen(screen) {
    if (this.activeScreen) {
      this.activeScreen.deactivate();
      this.activeScreen.unrenderDOM();
    }

    this.activeScreen = screen;
    this.activeScreen.activate();
    this.activeScreen.renderDOM(this.$el);
  }
}