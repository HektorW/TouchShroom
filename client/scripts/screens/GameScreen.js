
import BaseScreen from './BaseScreen';
import Game from '../Game';


export default class GameScreen extends BaseScreen {

  constructor(...args) {
    super(...args)

    this.game = new Game(this.networkManager, this.soundManager);

    this.networkEvents = {};
  }

  activate() {
    super.activate();

    this.game.init();
  }

  deactivate() {
    super.deactivate();

    this.game.destroy();
  }

  renderDOM($parent) {
    let gameTemplate =  `
      <h1 style="position:fixed; top:40%; width:100%; left:0; text-align:center;">GAME</h1>
      <div id="screen_game" class="screen">
      </div>
    `;

    super.renderDOM($parent, gameTemplate);

    this.$el.find('#screen_game').append(this.game.canvas);
  }

}