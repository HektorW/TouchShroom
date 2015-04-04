
import SoundManager from './soundmanager';
import NetworkManager from './networkmanager';
import ScreenManager from './screenmanager';

export default class App {

  constructor() {
    this.networkManager = new NetworkManager();
    this.soundManager = new SoundManager();
    this.screenManager = new ScreenManager(this.networkManager, this.soundManager);
  }

  init() {
    this.networkManager.init();
    this.soundManager.init();
    this.screenManager.init();

    return this;
  }

}