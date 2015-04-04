
import BaseScreen from './BaseScreen';

export default class StartScreen extends BaseScreen {

  constructor(networkManager, soundManager) {
    super(networkManager, soundManager);

    this.domEvents = {
      'click #btn_play': 'onPlayClick'
    };
  }

  renderDOM($parent) {
    let template = `
      <div id="screen_start" class="screen">
        <button id="btn_play">Play</button>
      </div>
    `;

    super.renderDOM($parent, template);
  }


  onPlayClick() {
    this.requestScreen('lobby');
  }

}