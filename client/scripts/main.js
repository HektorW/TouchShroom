
// includes some browser polyfills
require('babelify/polyfill');

import Game from './game'

var game = window.game = new Game().init();
