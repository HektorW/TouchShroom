
import BaseScreen from './BaseScreen';

export default class NoConnectionScreen extends BaseScreen {

  constructor(...args) {
    super(...args);

    this.template = `
      <div id="screen_noconnect" class="screen hidden">
        <img src="res/images/surprised.png" alt="" style="width:20%">
        <h2>Can't connect!</h2>
      </div>
    `; 
  }
}