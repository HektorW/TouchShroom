
import BaseScreen from './BaseScreen';

export default class GameScreen extends BaseScreen {

  constructor() {


    
  }

  activate() {

  }

  renderDOM($parent) {
    let gameTemplate =  `
      <h1 style="position:fixed; top:40%; width:100%; left:0; text-align:center;">GAME</h1>
      <div id="screen_game" class="screen">
        <canvas id="canvas" width="600" height="400">
          <p>Your browser doesn't seem to support the Canvas-element :(.</p>
        </canvas>
      </div>
    `;

    super.renderDOM($parent, gameTemplate);
  }

}