
import BaseScreen from './BaseScreen';

export default class StartScreen extends BaseScreen {

  constructor(networkManager, soundManager) {
    super(networkManager, soundManager);

    this.template = `
      <div id="screen_start" class="screen">
        <button id="btn_play">Play</button>
      </div>
    `;

    this.domEvents = {
      'click #btn_play': 'onPlayClick'
    };
  }


  onPlayClick() {
    this.requestScreen('lobby');
  }

}