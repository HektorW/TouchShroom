


export default class BaseScreen {

  constructor(networkManager) {
    this.networkManager = networkManager;

    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  renderDOM($el) { }
  unrenderDOM() { }

}