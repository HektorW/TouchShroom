
import BaseScreen from './BaseScreen';

export default class GameScreen extends BaseScreen {

  constructor() {
    this.socketEvents = {

    }
  }

  activate() {

  }

  renderDOM($el) {
    let template =  `
      <div id="screen_game" class="screen">
        <canvas id="canvas" width="600" height="400">
          <p>Your browser doesn't seem to support the Canvas-element :(.</p>
        </canvas>
      </div>
    `;
  }

}