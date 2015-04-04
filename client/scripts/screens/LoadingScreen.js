
import BaseScreen from './BaseScreen';

export default class LoadingScreen extends BaseScreen {

  renderDOM($parent) {
    let template = `
      <div id="screen_loading" class="screen">
        <h2>Loading</h2>
        <img src="res/images/waiting.gif" alt="">
      </div>
    `;

    super.renderDOM($parent, template);
  }

}