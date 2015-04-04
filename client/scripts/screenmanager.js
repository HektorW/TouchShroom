
import LoadingScreen from './screens/LoadingScreen';
import StartScreen from './screens/StartScreen';
import GameScreen from './screens/GameScreen';

export default class ScreenManager {

  constructor(networkManager, soundManager) {
    this.networkManager = networkManager;
    this.soundManager = soundManager;

    this.screens = [];
    this.activeScreen = null;
  }

  init() {
    this.initDOM();
    this.initScreens();
    this.initNetwork();

    this.setScreen(this.screens.loading);

    return this;
  }

  initDOM() {
    this.$el = $('[data-screen-container]');
  }

  initScreens() {
    this.screens = {
      'loading': new LoadingScreen(this.networkManager, this.soundManager),
      'start': new StartScreen(this.networkManager, this.soundManager),
      'game': new GameScreen(this.networkManager, this.soundManager)
    };
  }

  initNetwork() {
    let networkManager = this.networkManager;

    networkManager.on('connect', () => this.setScreen(this.screens.start));
  }


  setScreen(screen) {
    if (this.activeScreen) {
      this.activeScreen.deactivate();
      this.activeScreen.unrenderDOM();
    }

    this.activeScreen = screen;
    this.activeScreen.activate();
    this.activeScreen.renderDOM(this.$el);
  }
}



/** TODO
 *
 * { GAME }
 * -    Get information about players in game (DONE)
 *         Save players in some list (DONE)
 * -    Get information about game (DONE)
 * -    Bind listeners for game
 *         Save listener to be able to remove
 * -    Count down start -> start game
 * -    Game logic
 */

var CONTROLLER = {
    current_screen: null
};
/**
 * { INIT }
 */
CONTROLLER.init = function(){
    NET.init();
    GAME.init();

    CONTROLLER.current_screen = 'loading';

    CONTROLLER.bindevents();
};
/**
 * { BIND EVENTS }
 * Binds listeners and flow logic
 */
CONTROLLER.bindevents = function(){
    // Setup listeners
    DOM.on('#btn_play', 'click', function(){
        CONTROLLER.requestPlay();
    });
};

/**
 * { RESUQEST PLAY }
 * Called when client clicks 'Play'
 */
CONTROLLER.requestPlay = function(){
    NET.send('CLIENT.play');
    CONTROLLER.setScreen('waiting');
};

/**
 * { SET SCREEN }
 * Sets the active screen
 * @param  {String} screen  Name for the screen, e.g game/start/loading, !NOT HTML-DOM-id, e.g #screen_game!
 */
CONTROLLER.setScreen = function(screen){
    var s = DOM('#screen_' + screen);
    if(s){
        if(CONTROLLER.current_screen)
            DOM.addClass('#screen_' + CONTROLLER.current_screen, 'hidden');
        CONTROLLER.current_screen = screen;
        DOM.removeClass(s, 'hidden');
    }
};
/**
 * { OVERLAY MESSAGE }
 * Displays an overlay message
 * @param  {String} msg
 */
CONTROLLER.overlayMessage = function(msg){
    DOM.removeClass('#overlay', 'hidden');
    DOM.text('#overlay_message', "<h2>{0}</h2>".format(msg));
};
/**
 * { OVERLAY HIDE }
 * Hides the overlay
 */
CONTROLLER.overlayHide = function(){
    DOM.addClass('#overlay', 'hidden');
};
/**
 * { CONNECTED }
 */
CONTROLLER.connected = function(){
    timed('Connected!');
    CONTROLLER.setScreen('start');
};
/** 
 * { NO CONNECT}
 * Could not connect to server
 */
CONTROLLER.noconnect = function(){
    timed('Could not connect to server!');
    CONTROLLER.setScreen('noconnect');
};
/**
 * { DISCONNECTED }
 */
CONTROLLER.disconnected = function(){
    timed('Disconnected from server!');
    CONTROLLER.setScreen('noconnect');
};

/**
 * { START GAME }
 * Starts game
 */
CONTROLLER.startgame = function(){
    CONTROLLER.setScreen('game');
};


