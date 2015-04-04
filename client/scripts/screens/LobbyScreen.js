
import BaseScreen from './BaseScreen';

export default class LobbyScreen extends BaseScreen {

  constructor(...args) {
    super.apply(this, args);

    this.networkEvents = {
      'SERVER.initgame': onGameInit
    };
  }

  renderDOM($parent) {
    let template = `
      <div id="screen_waiting" class="screen">
        <h2>Waiting for opponent!</h2>
        <img src="res/images/waiting.gif" alt="">
      </div>
    `;

    super.renderDOM($parent, template);
  }

  onGameInit() {
    this.requestScreen('game');
  }
}