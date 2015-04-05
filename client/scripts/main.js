
// includes some browser polyfills
require('babelify/polyfill');

import App from './app';

// var game = window.game = new Game().init();
var app = window.app = new App().init();
