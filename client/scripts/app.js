
import SoundManager from './SoundManager';
import NetworkManager from './NetworkManager';
import ScreenManager from './ScreenManager';

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