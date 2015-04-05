
import BaseScreen from './BaseScreen';

export default class LoadingScreen extends BaseScreen {

  constructor(...args) {
    super(...args);
    
    this.template = `
      <div id="screen_loading" class="screen">
        <h2>Connecting to server...</h2>
        <img src="res/images/waiting.gif" alt="">
      </div>
    `;
  }

}