
// includes some browser polyfills
require('babelify/polyfill');

import Game from './game'
import App from './app';

// var game = window.game = new Game().init();
var app = window.app = new App().init();
