(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Sound = _interopRequire(require("./soundmanager.js"));

var _ = _interopRequire(require("./underscore.js"));

var Game = (function () {
  function Game() {
    _classCallCheck(this, Game);

    this.canvas = null;
    this.ctx = null;
    this.soundManager = null;

    this.last_time = -1;
    this.now = -1;

    this.selected_base = null;
    this.hovered_base = null;
    this.targeted_base = null;

    this.bases = [];
    this.players = [];
    this.minions = [];
    this.particles = [];

    this.me = null;
    this.animationFrame = null;
  }

  _createClass(Game, {
    init: {
      value: function init() {
        this.soundManager = new Sound().init();

        this.canvas = document.querySelector("#canvas");
        this.ctx = this.canvas.getContext("2d");

        return this;
      }
    },
    initEvents: {
      value: function initEvents() {}
    },
    resize: {
      value: function resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;

        _.each(this.bases, function (e) {
          return e.resize();
        });
        _.each(this.minions, function (e) {
          return e.resize();
        });
        _.each(this.particles, function (e) {
          return e.resize();
        });
      }
    }
  });

  return Game;
})();

module.exports = Game;

function heheScopeAwaySillyImplementation() {

  /**
   * { INIT }
   * Main entry point for initialization
   * General initialization not bound to a game instance
   */
  GAME.init = function () {
    SOUND.init();

    GAME.canvas = document.querySelector("#canvas");
    GAME.ctx = GAME.canvas.getContext("2d");

    // Find element in array by property
    GAME.players.findBy = function (prop, value) {
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][prop] === value) return this[i];
      }
      return undefined;
    };
    GAME.players.byID = function (id) {
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].id === id) return this[i];
      }
    };

    // Add method to base list
    GAME.bases.indexByID = function (id) {
      for (var i = this.length - 1; i >= 0; i--) {
        if (this[i].id === id) return i;
      }
      return undefined;
    };
    GAME.bases.byID = function (id) {
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].id === id) return this[i];
      }
    };

    // MINION
    GAME.minions.byID = function (id) {
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].id === id) return this[i];
      }
    };

    GAME.resize();

    ////////////////////
    // SETUP CONTROLS //
    ////////////////////
    function startTouch(x, y) {
      TOUCH.down = true;
      TOUCH.start_x = TOUCH.x = x;
      TOUCH.start_y = TOUCH.y = y;
      GAME.startTouch();
    }
    function drag(x, y) {
      TOUCH.old_x = TOUCH.x;
      TOUCH.old_y = TOUCH.y;
      TOUCH.x = x;
      TOUCH.y = y;
    }
    function endTouch(x, y) {
      TOUCH.down = false;
      TOUCH.end_x = x;
      TOUCH.end_y = y;
      TOUCH.x = -1;
      TOUCH.y = -1;
      GAME.endTouch();
    }
    GAME.canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
      startTouch(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener("mousemove", function (e) {
      e.preventDefault();
      drag(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener("mouseup", function (e) {
      e.preventDefault();
      endTouch(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      startTouch(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    GAME.canvas.addEventListener("touchend", function (e) {
      e.preventDefault();
      endTouch(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    GAME.canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      drag(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    window.addEventListener("resize", GAME.resize, false);
  };
  /**
   * { SETUP }
   * Setup a specific game with info from server
   * @param  {Object} data  Setup data from server (players, level)
   */
  GAME.setup = function (data) {
    var i, b, p, len;

    var lvl_name = data.level_name;
    var my_id = data.my_id;
    var players = data.players;

    timed("Level: " + lvl_name);

    for (i = 0, len = data.bases.length; i < len; i++) {
      b = data.bases[i];
      this.bases.push(new Base(b.id, b.left, b.top, b.scale, b.resources, b.resources_max));
    }
    for (i = 0, len = players.length; i < len; i++) {
      p = new Player(players[i].id, players[i].name, players[i].color);

      b = data.start_state[i];
      b.forEach(function (i) {
        // Know that this will push closer to GC (garbage collector)
        this.bases[i].setPlayer(p);
      }, this);

      GAME.players.push(p);

      if (players[i].id === my_id) {
        GAME.me = p;
      }
    }

    GAME.send("PLAYER.ready");

    // GAME.draw();
  };
  /**
   * { RESIZE }
   * Resize canvas and fix scales
   */
  GAME.resize = function () {
    var i;

    GAME.width = GAME.canvas.width = window.innerWidth;
    GAME.height = GAME.canvas.height = window.innerHeight;

    function r(e) {
      e.resize();
    }
    GAME.bases.forEach(r);
    GAME.minions.forEach(r);
    GAME.particles.forEach(r);
  };
  /**
   * { START }
   * Starts the game
   */
  GAME.start = function () {
    GAME.now = GAME.last_time = window.performance.now();
    GAME.animationFrame = window.requestAnimationFrame(GAME.loop);
  };
  /**
   * { END }
   * Called when server tells to end game
   */
  GAME.end = function () {
    if (GAME.animationFrame) window.cancelAnimationFrame(GAME.animationFrame);

    // CLEAN UP GAME
    GAME.bases.length = 0;
    GAME.players.length = 0;
    GAME.me = null;
    GAME.minions.length = 0;
    GAME.particles.length = 0;

    // Temporary solution to hide overlay and go back to START
    setTimeout(function () {
      CONTROLLER.overlayHide();
      CONTROLLER.setScreen("start");
    }, 3000);
  };

  ////////////
  // EVENTS //
  ////////////
  /**
   * { DISCONNECTION }
   * Called when a player disconnects from the game
   * @param  {Object} data
   */
  GAME.disconnection = function (data) {
    var p = this.players.findBy("id", data.player_id);

    if (p !== undefined) {
      CONTROLLER.overlayMessage("'{0}' disconnected".format(p.name));
    }
  };
  /**
   * { BASE RESOURCES }
   * When a base got updated resources from server
   * @param  {Object} data
   */
  GAME.baseResources = function (data) {
    var b = GAME.bases.byID(data.base_id);

    if (b) b.resources = data.resources;
  };
  /**
   * { NEW MINION }
   * Called when server sends a new minion
   * @param  {Object} data
   */
  GAME.newMinion = function (data) {
    var m = data.minion;

    var source = this.bases.byID(m.source_id);
    var target = this.bases.byID(m.target_id);

    var minion = new Minion(m.id, source, target, m.scale);

    source.sendMinion();

    this.minions.push(minion);
  };
  /**
   * { MINION HIT }
   * Called by server when minion reaches target base
   * @param  {Object} data
   */
  GAME.minionHit = function (data) {
    var minion_id = data.minion_id;
    var new_player_id = data.new_player_id;
    var resources = data.resources;

    // Fetch minion
    var minion = this.minions.byID(minion_id);

    if (!minion) {
      alert("Minion gone");
      return;
    }

    minion.dead_by_server = true;

    // Get target base
    var target = minion.target_base;
    // Set resources for base
    target.resources = resources;

    if (new_player_id !== undefined) {
      var player = this.players.byID(new_player_id);
      target.setPlayer(player);
    }
  };

  /**
   * { LOOP }
   * First entry point for game loop
   * @param  {Number} time    Time from performance.now
   */
  GAME.loop = function (time) {
    if (GAME.draw_time) GAME.draw_time = time - GAME.draw_time;
    GAME.now = time;
    var elapsed = (time - GAME.last_time) / 1000;
    GAME.last_time = time;

    GAME.update_time = time;
    GAME.update(elapsed);
    GAME.update_time = performance.now() - GAME.update_time;

    // out('update', GAME.update_time);
    // out('draw', GAME.draw_time);

    GAME.draw_time = performance.now();
    GAME.draw();

    GAME.animationFrame = window.requestAnimationFrame(GAME.loop);
  };
  /**
   * { UPDATE }
   * @param  {Number} t   Elapsed time since last update (seconds)
   */
  GAME.update = function (t) {
    var i, len, b, m, p;

    // Reset hovered and targeted
    this.hovered_base = null;
    this.targeted_base = null;

    for (i = 0, len = this.bases.length; i < len; i++) {
      b = this.bases[i];

      // Update base
      b.update(t);

      // Reset base hovered & targeted state
      b.hovered = false;
      b.targeted = false;

      /////////////////
      // CHECK INPUT //
      /////////////////
      // Mouse is over base
      if (pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)) {
        // See if there is any selected base and it isn't the one tested
        if (this.selected_base && this.selected_base !== b) {
          // Set the base as targeted and try to send
          GAME.trySendMinion(b);
        } else {
          // Check if base belons to 'me'
          if (this.me.bases_id.indexOf(b.id) !== -1) {
            // Set the base as hovered
            b.hovered = true;
          }
        }
      }

      if (this.me.bases_id.indexOf(b.id) != -1) {
        if (!b.selected && pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)) {
          b.hovered = true;
          this.hovered_base = b;
        }
      }

      /////////
      // OLD //
      /////////
      // if(!b.selected && pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
      //     if(this.selected_base){
      //         b.targeted = true;
      //         this.targeted_base = b;

      //         if(this.selected_base.spawn_delay <= 0.0){
      //             // Send to server
      //             NET.socket.emit('p.minion', {
      //                 source_id: this.selected_base.player_id,
      //                 target_id: this.targeted_base.player_id
      //             });

      //             // this.minions.push(
      //             //     new Minion(this.selected_base, this.targeted_base)
      //             //     );

      //             this.selected_base.spawn_delay = this.selected_base.spawn_delay_max;
      //         }
      //     } else {
      //         b.hovered = true;
      //         this.hovered_base = b;
      //     }
      // }
    }

    // Update minions
    for (i = 0, len = this.minions.length; i < len; i++) {
      m = this.minions[i];
      if (m.active) {
        m.update(t);

        if (!m.active) {
          SOUND.playRandomSound();

          this.particles.push(new Particle(m.target_base.left, m.target_base.top, m.target_base.scale, m.source_base.color));
        }
      }
      if (m.dead_by_server && !m.active) {
        this.minions.splice(i--, 1);
        --len;
      }
    }

    // Update paticles
    for (i = 0, len = this.particles.length; i < len; i++) {
      p = this.particles[i];
      p.update(t);

      if (!p.active) {
        this.particles.splice(i--, 1);
        --len;
      }
    }
  };
  /**
   * { DRAW }
   * Draw the scene
   */
  GAME.draw = function () {
    var i, len, b, m, x, y;

    GAME.ctx.clearRect(0, 0, GAME.width, GAME.height);

    //////////////////
    // Draw minions //
    //////////////////
    for (i = 0, len = this.minions.length; i < len; i++) {
      m = this.minions[i];
      if (m.active) m.draw(this.ctx);
    }

    ///////////////
    // Draw line //
    ///////////////
    if (this.selected_base) {
      b = this.selected_base;
      if (this.targeted_base) {
        x = this.targeted_base.x;
        y = this.targeted_base.y;
      } else {
        x = TOUCH.x;
        y = TOUCH.y;
      }

      GAME.ctx.save();

      GAME.ctx.globalAlpha = 0.3;
      var line_size = 5;
      var color = GAME.me.color || "#AAA";
      drawLine(GAME.ctx, b.x, b.y, x, y, color, line_size);
      drawCircle(GAME.ctx, x, y, line_size / 2, color);

      GAME.ctx.restore();
    }

    ////////////////
    // Draw bases //
    ////////////////
    for (i = 0, len = this.bases.length; i < len; i++) {
      this.bases[i].draw(this.ctx);
    }

    ////////////////////
    // DRAW PARTICLES //
    ////////////////////
    for (i = 0, len = this.particles.length; i < len; i++) {
      this.particles[i].draw(this.ctx);
    }

    ////////////////
    // DRAW SCORE //
    ////////////////
    GAME.drawScoreBar();
  };
  GAME.send = function (msg, data) {
    NET.send(msg, data);
  };
  /**
   * { DRAW SCORE }
   * Draw a score bar
   * Needs to be tuned for some performance probably
   *     Only update when score has updated
   */
  GAME.drawScoreBar = function () {
    var x, y, w, h, i, len, r, total, a, xt, wt, text;

    GAME.ctx.save();

    w = GAME.width / 1.5;
    h = GAME.height / 20;
    x = GAME.width / 2 - w / 2;
    y = GAME.height / 20 - h / 2;

    r = [];
    total = 0;
    for (i = 0, len = GAME.players.length; i < len; i++) {
      r[i] = GAME.players[i].totalResources();
      total += r[i];
    }

    xt = x;
    for (i = 0, len = GAME.players.length; i < len; i++) {
      GAME.ctx.fillStyle = GAME.players[i].color;
      wt = r[i] / total * w;
      GAME.ctx.fillRect(xt, y, wt, h);
      text = GAME.players[i].name + " - " + r[i];
      GAME.ctx.fillStyle = "black";
      GAME.ctx.fillText(text, xt + wt / 2 - GAME.ctx.measureText(text).width / 2, y + h / 2);

      xt += wt;
    }

    GAME.ctx.strokeStyle = "white";
    GAME.ctx.strokeRect(x, y, w, h);

    GAME.ctx.restore();
  };
  /**
   * { START TOUCH }
   */
  GAME.startTouch = function () {
    var i, b, len;

    // Test collision against all
    // for(i = 0; i < this.bases.length; i++){
    //     b = this.bases[i];

    //     if(pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
    //         b.selected = true;
    //         GAME.selected_base = b;
    //     }
    // }

    if (!GAME.me) return;

    for (i = 0, len = GAME.me.bases_id.length; i < len; i++) {
      b = GAME.bases[GAME.bases.indexByID(GAME.me.bases_id[i])];

      if (pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)) {
        b.selected = true;
        GAME.selected_base = b;
        break;
      }
    }

    /////////
    // OLD //
    /////////
    // // Test just against [me]
    // if(pointInCircle(TOUCH.x, TOUCH.y, GAME.me.x, GAME.me.y, GAME.me.size)){
    //     GAME.me.selected = true;
    //     GAME.selected_base = GAME.me;
    // }
  };
  /**
   * { END TOUCH }
   */
  GAME.endTouch = function () {
    if (GAME.selected_base) {
      // Add new minion
      if (GAME.targeted_base) {}
      GAME.selected_base.selected = false;
      GAME.selected_base = null;
    }
  };
  /**
   * { SEND MINION }
   * Tries to send a minion
   */
  GAME.trySendMinion = function (target) {
    target.targeted = true;
    this.targeted_base = target;

    // Call 'canSendMinion' on selected_base
    // [CHANGED] Allways ask server to send
    if (GAME.selected_base.canSendMinion() || true) {
      GAME.send("BASE.minion", {
        source_id: this.selected_base.id,
        target_id: target.id
      });
    }
  };
}

},{"./soundmanager.js":3,"./underscore.js":4}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Game = _interopRequire(require("./game"));

var game = window.game = new Game().init();

},{"./game":1}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozNow || window.msNow || undefined;

var Sound = (function () {
  function Sound() {
    _classCallCheck(this, Sound);

    this.ctx = null;
    this.sounds = [];
    this.sound_names = [];
    this.startup_event = null;
  }

  _createClass(Sound, {
    init: {
      value: function init() {
        if (!window.AudioContext) {
          throw "AudioContext not supported by browser";
        }

        this.ctx = new AudioContext();

        this.initSounds();

        return this;
      }
    },
    initSounds: {
      value: function initSounds() {
        this.loadSound("/res/sounds/marimba/c4.wav", "c4");
        this.loadSound("/res/sounds/marimba/d4.wav", "d4");
        this.loadSound("/res/sounds/marimba/e4.wav", "e4");
        this.loadSound("/res/sounds/marimba/f4.wav", "f4");
        this.loadSound("/res/sounds/marimba/g4.wav", "g4");
        this.loadSound("/res/sounds/marimba/a4.wav", "a4");
        this.loadSound("/res/sounds/marimba/b4.wav", "b4");
        this.loadSound("/res/sounds/marimba/c5.wav", "c5");
        this.loadSound("/res/sounds/marimba/d5.wav", "d5");
        this.loadSound("/res/sounds/marimba/e5.wav", "e5");
        this.loadSound("/res/sounds/marimba/f5.wav", "f5");
        this.loadSound("/res/sounds/marimba/g5.wav", "g5");
        this.loadSound("/res/sounds/marimba/a5.wav", "a5");
        this.loadSound("/res/sounds/marimba/b5.wav", "b5");
        this.loadSound("/res/sounds/marimba/c6.wav", "c6");
        this.loadSound("/res/sounds/marimba/d6.wav", "d6");
      }
    },
    loadSound: {
      value: function loadSound(url, name) {
        var _this = this;

        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";

        xhr.onload = function () {
          _this.ctx.decodeAudioData(xhr.response, function (buffer) {
            _this.sound_names.push(name);
            _this.sounds[name] = buffer;

            if (_this.startup_event === null) {
              _this.startup_event = function () {
                _this.playRandomSound();
                window.removeEventListener("touchstart", _this.startup_event, false);
              };
              window.addEventListener("touchstart", _this.startup_event, false);
            }
          });
        };

        xhr.open("GET", url);
        xhr.send();
      }
    },
    playSound: {
      value: function playSound(name) {
        if (!this.sounds[name]) {
          return;
        }var sound = this.tx.createBufferSource();
        sound.buffer = this.sounds[name];

        var gain = this.createGainNode(0.8, 0, 0.4);

        sound.connect(gain);
        gain.connect(this.ctx.destination);

        sound.noteOn(0);
      }
    },
    createGainNode: {
      value: function createGainNode(start, end, time) {
        var node = this.ctx.createGain();
        var now = this.ctx.currentTime;

        node.gain.linearRampToValueAtTime(start, now);
        node.gain.linearRampToValueAtTime(end, now + time);

        return gain;
      }
    },
    playRandomSound: {
      value: function playRandomSound() {
        this.playSound(this.sound_names[randomRangeInt(0, this.sound_names.length)]);
      }
    }
  });

  return Sound;
})();

module.exports = Sound;

},{}],4:[function(require,module,exports){
//     Underscore.js 1.8.2
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

"use strict";

(function () {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = /*window || */this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype,
      FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function Ctor() {};

  // Create a safe reference to the Underscore object for use below.
  var _ = (function (_2) {
    var _Wrapper = function _(_x) {
      return _2.apply(this, arguments);
    };

    _Wrapper.toString = function () {
      return _2.toString();
    };

    return _Wrapper;
  })(function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  });

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = "1.8.2";

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) {
      return func;
    }switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      case 2:
        return function (value, other) {
          return func.call(context, value, other);
        };
      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }
    return function () {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function cb(value, context, argCount) {
    if (value == null) {
      return _.identity;
    }if (_.isFunction(value)) {
      return optimizeCb(value, context, argCount);
    }if (_.isObject(value)) {
      return _.matcher(value);
    }return _.property(value);
  };
  _.iteratee = function (value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
    return function (obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function baseCreate(prototype) {
    if (!_.isObject(prototype)) {
      return {};
    }if (nativeCreate) {
      return nativeCreate(prototype);
    }Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var isArrayLike = function isArrayLike(collection) {
    var length = collection && collection.length;
    return typeof length == "number" && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function (obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function (obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function (obj, target, fromIndex) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    return _.indexOf(obj, target, typeof fromIndex == "number" && fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function (value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function (obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value,
        computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function (obj, iteratee, context) {
    var result = Infinity,
        lastComputed = Infinity,
        value,
        computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function (obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function (value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), "value");
  };

  // An internal function used for aggregate "group by" operations.
  var group = function group(behavior) {
    return function (obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key].push(value);else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function (result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key]++;else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [],
        fail = [];
    _.each(obj, function (value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function (array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = (function (_flatten) {
    var _flattenWrapper = function flatten(_x, _x2, _x3, _x4) {
      return _flatten.apply(this, arguments);
    };

    _flattenWrapper.toString = function () {
      return _flatten.toString();
    };

    return _flattenWrapper;
  })(function (input, shallow, strict, startIndex) {
    var output = [],
        idx = 0;
    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0,
            len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  });

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function (array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function () {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function (array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function (array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function () {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function (array) {
    var length = array && _.max(array, "length").length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function (list, values) {
    var result = {};
    for (var i = 0, length = list && list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function (array, item, isSorted) {
    var i = 0,
        length = array && array.length;
    if (typeof isSorted == "number") {
      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
    } else if (isSorted && length) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (item !== item) {
      return _.findIndex(slice.call(array, i), _.isNaN);
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function (array, item, from) {
    var idx = array ? array.length : 0;
    if (typeof from == "number") {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    if (item !== item) {
      return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = array != null && array.length;
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createIndexFinder(1);

  _.findLastIndex = createIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
        high = array.length;
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }
    return low;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function (start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) {
      return sourceFunc.apply(context, args);
    }var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) {
      return result;
    }return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function (func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError("Bind must be called on a function");
    var args = slice.call(arguments, 2);
    var bound = (function (_bound) {
      var _boundWrapper = function bound() {
        return _bound.apply(this, arguments);
      };

      _boundWrapper.toString = function () {
        return _bound.toString();
      };

      return _boundWrapper;
    })(function () {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    });
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function (func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = (function (_bound) {
      var _boundWrapper = function bound() {
        return _bound.apply(this, arguments);
      };

      _boundWrapper.toString = function () {
        return _bound.toString();
      };

      return _boundWrapper;
    })(function () {
      var position = 0,
          length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    });
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function (obj) {
    var i,
        length = arguments.length,
        key;
    if (length <= 1) throw new Error("bindAll must be passed function names");
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function (func, hasher) {
    var memoize = (function (_memoize) {
      var _memoizeWrapper = function memoize(_x) {
        return _memoize.apply(this, arguments);
      };

      _memoizeWrapper.toString = function () {
        return _memoize.toString();
      };

      return _memoizeWrapper;
    })(function (key) {
      var cache = memoize.cache;
      var address = "" + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    });
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function later() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function () {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = (function (_later) {
      var _laterWrapper = function later() {
        return _later.apply(this, arguments);
      };

      _laterWrapper.toString = function () {
        return _later.toString();
      };

      return _laterWrapper;
    })(function () {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    });

    return function () {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
  var nonEnumerableProps = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = "constructor";
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function (obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {},
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function (obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj),
        key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function (object, oiteratee, context) {
    var result = {},
        obj = object,
        iteratee,
        keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function (value, key, obj) {
        return key in obj;
      };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

  // Return a copy of the object without the blacklisted properties.
  _.omit = function (obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function (value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function (object, attrs) {
    var keys = _.keys(attrs),
        length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = (function (_eq) {
    var _eqWrapper = function eq(_x, _x2, _x3, _x4) {
      return _eq.apply(this, arguments);
    };

    _eqWrapper.toString = function () {
      return _eq.toString();
    };

    return _eqWrapper;
  })(function (a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case "[object RegExp]":
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case "[object String]":
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return "" + a === "" + b;
      case "[object Number]":
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case "[object Date]":
      case "[object Boolean]":
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === "[object Array]";
    if (!areArrays) {
      if (typeof a != "object" || typeof b != "object") return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor,
          bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ("constructor" in a && "constructor" in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),
          key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  });

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function (a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === "[object Array]";
  };

  // Is a given variable an object?
  _.isObject = function (obj) {
    var type = typeof obj;
    return type === "function" || type === "object" && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function (name) {
    _["is" + name] = function (obj) {
      return toString.call(obj) === "[object " + name + "]";
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return _.has(obj, "callee");
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != "function" && typeof Int8Array != "object") {
    _.isFunction = function (obj) {
      return typeof obj == "function" || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function (obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === "[object Boolean]";
  };

  // Is a given value equal to null?
  _.isNull = function (obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function (obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function (obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function (value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function (value) {
    return function () {
      return value;
    };
  };

  _.noop = function () {};

  _.property = function (key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function (obj) {
    return obj == null ? function () {} : function (key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function () {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function createEscaper(map) {
    var escaper = function escaper(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = "(?:" + _.keys(map).join("|") + ")";
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, "g");
    return function (string) {
      string = string == null ? "" : "" + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function (object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function (prefix) {
    var id = ++idCounter + "";
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    "\\": "\\",
    "\r": "r",
    "\n": "n",
    "\u2028": "u2028",
    "\u2029": "u2029"
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function escapeChar(match) {
    return "\\" + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g");

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";

    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";

    try {
      var render = new Function(settings.variable || "obj", "_", source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function template(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || "obj";
    template.source = "function(" + argument + "){\n" + source + "}";

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function (obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function result(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === "shift" || name === "splice") && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(["concat", "join", "slice"], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function () {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return "" + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === "function" && define.amd) {
    define("underscore", [], function () {
      return _;
    });
  }
}).call(undefined);

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFx1c2Vyc1xcaGVrdG9yXFxkZXNrdG9wXFx3b3Jrc3BhY2VcXHRvdWNoc2hyb29tXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvZ2FtZS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9tYWluLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NvdW5kbWFuYWdlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91bmRlcnNjb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNDTyxLQUFLLDJCQUFNLG1CQUFtQjs7SUFDOUIsQ0FBQywyQkFBTSxpQkFBaUI7O0lBR1YsSUFBSTtBQUVaLFdBRlEsSUFBSSxHQUVUOzBCQUZLLElBQUk7O0FBR3JCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV6QixRQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7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TUFBTSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QixLQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVc7QUFDN0IsYUFBTyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQzdELENBQUM7R0FDSCxDQUFDLENBQUM7OztBQUdILEdBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7QUFDN0IsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQ3RCLENBQUM7Ozs7QUFJRixHQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQzs7QUFFN0QsR0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNoQyxXQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQzNCLENBQUM7Ozs7Ozs7OztBQVNGLE1BQUksT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDOUMsVUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsWUFBVztBQUNsQyxhQUFPLENBQUMsQ0FBQztLQUNWLENBQUMsQ0FBQztHQUNKO0NBQ0YsQ0FBQSxDQUFDLElBQUksV0FBTSxDQUFFIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5pbXBvcnQgU291bmQgZnJvbSAnLi9zb3VuZG1hbmFnZXIuanMnO1xyXG5pbXBvcnQgXyBmcm9tICcuL3VuZGVyc2NvcmUuanMnXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jYW52YXMgPSBudWxsO1xyXG4gICAgdGhpcy5jdHggPSBudWxsO1xyXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIgPSBudWxsO1xyXG5cclxuICAgIHRoaXMubGFzdF90aW1lID0gLTE7XHJcbiAgICB0aGlzLm5vdyA9IC0xO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRfYmFzZSA9IG51bGw7XHJcbiAgICB0aGlzLmhvdmVyZWRfYmFzZSA9IG51bGw7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuYmFzZXMgPSBbXTtcclxuICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG4gICAgdGhpcy5taW5pb25zID0gW107XHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG5cclxuICAgIHRoaXMubWUgPSBudWxsO1xyXG4gICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIgPSBuZXcgU291bmQoKS5pbml0KCk7XHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FudmFzJyk7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuXHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIFxyXG4gIH1cclxuXHJcblxyXG4gIHJlc2l6ZSgpIHtcclxuICAgIHRoaXMud2lkdGggID0gdGhpcy5jYW52YXMud2lkdGggID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICBfLmVhY2godGhpcy5iYXNlcywgZSA9PiBlLnJlc2l6ZSgpKTtcclxuICAgIF8uZWFjaCh0aGlzLm1pbmlvbnMsIGUgPT4gZS5yZXNpemUoKSk7XHJcbiAgICBfLmVhY2godGhpcy5wYXJ0aWNsZXMsIGUgPT4gZS5yZXNpemUoKSk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGhlaGVTY29wZUF3YXlTaWxseUltcGxlbWVudGF0aW9uKCkge1xyXG5cclxuICAvKipcclxuICAgKiB7IElOSVQgfVxyXG4gICAqIE1haW4gZW50cnkgcG9pbnQgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICogR2VuZXJhbCBpbml0aWFsaXphdGlvbiBub3QgYm91bmQgdG8gYSBnYW1lIGluc3RhbmNlXHJcbiAgICovXHJcbiAgR0FNRS5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIFNPVU5ELmluaXQoKTtcclxuXHJcbiAgICBHQU1FLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYW52YXMnKTtcclxuICAgIEdBTUUuY3R4ID0gR0FNRS5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAvLyBGaW5kIGVsZW1lbnQgaW4gYXJyYXkgYnkgcHJvcGVydHlcclxuICAgIEdBTUUucGxheWVycy5maW5kQnkgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZSl7XHJcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgIGlmKHRoaXNbaV1bcHJvcF0gPT09IHZhbHVlKVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXNbaV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICBHQU1FLnBsYXllcnMuYnlJRCA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgICAgICByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgbWV0aG9kIHRvIGJhc2UgbGlzdFxyXG4gICAgR0FNRS5iYXNlcy5pbmRleEJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIEdBTUUuYmFzZXMuYnlJRCA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgICAgICByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBNSU5JT05cclxuICAgIEdBTUUubWluaW9ucy5ieUlEID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZClcclxuICAgICAgICAgIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEdBTUUucmVzaXplKCk7XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIFNFVFVQIENPTlRST0xTIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgZnVuY3Rpb24gc3RhcnRUb3VjaCh4LCB5KXtcclxuICAgICAgVE9VQ0guZG93biA9IHRydWU7XHJcbiAgICAgIFRPVUNILnN0YXJ0X3ggPSBUT1VDSC54ID0geDtcclxuICAgICAgVE9VQ0guc3RhcnRfeSA9IFRPVUNILnkgPSB5O1xyXG4gICAgICBHQU1FLnN0YXJ0VG91Y2goKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRyYWcoeCwgeSl7XHJcbiAgICAgIFRPVUNILm9sZF94ID0gVE9VQ0gueDtcclxuICAgICAgVE9VQ0gub2xkX3kgPSBUT1VDSC55O1xyXG4gICAgICBUT1VDSC54ID0geDtcclxuICAgICAgVE9VQ0gueSA9IHk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBlbmRUb3VjaCh4LCB5KXtcclxuICAgICAgVE9VQ0guZG93biA9IGZhbHNlO1xyXG4gICAgICBUT1VDSC5lbmRfeCA9IHg7XHJcbiAgICAgIFRPVUNILmVuZF95ID0geTtcclxuICAgICAgVE9VQ0gueCA9IC0xO1xyXG4gICAgICBUT1VDSC55ID0gLTE7XHJcbiAgICAgIEdBTUUuZW5kVG91Y2goKTtcclxuICAgIH1cclxuICAgIEdBTUUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHN0YXJ0VG91Y2goZS5wYWdlWCwgZS5wYWdlWSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBHQU1FLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkcmFnKGUucGFnZVgsIGUucGFnZVkpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG4gICAgR0FNRS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGVuZFRvdWNoKGUucGFnZVgsIGUucGFnZVkpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG4gICAgR0FNRS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHN0YXJ0VG91Y2goZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCwgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBHQU1FLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGVuZFRvdWNoKGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsIGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG4gICAgR0FNRS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZHJhZyhlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYLCBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZKTtcclxuICAgIH0sIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBHQU1FLnJlc2l6ZSwgZmFsc2UpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBTRVRVUCB9XHJcbiAgICogU2V0dXAgYSBzcGVjaWZpYyBnYW1lIHdpdGggaW5mbyBmcm9tIHNlcnZlclxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSAgU2V0dXAgZGF0YSBmcm9tIHNlcnZlciAocGxheWVycywgbGV2ZWwpXHJcbiAgICovXHJcbiAgR0FNRS5zZXR1cCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIGksIGIsIHAsIGxlbjtcclxuXHJcbiAgICB2YXIgbHZsX25hbWUgPSBkYXRhLmxldmVsX25hbWU7XHJcbiAgICB2YXIgbXlfaWQgPSBkYXRhLm15X2lkO1xyXG4gICAgdmFyIHBsYXllcnMgPSBkYXRhLnBsYXllcnM7XHJcblxyXG4gICAgdGltZWQoJ0xldmVsOiAnICsgbHZsX25hbWUpO1xyXG5cclxuICAgIGZvcihpID0gMCwgbGVuID0gZGF0YS5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGIgPSBkYXRhLmJhc2VzW2ldO1xyXG4gICAgICB0aGlzLmJhc2VzLnB1c2goXHJcbiAgICAgICAgbmV3IEJhc2UoYi5pZCwgYi5sZWZ0LCBiLnRvcCwgYi5zY2FsZSwgYi5yZXNvdXJjZXMsIGIucmVzb3VyY2VzX21heClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGZvcihpID0gMCwgbGVuID0gcGxheWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHAgPSBuZXcgUGxheWVyKFxyXG4gICAgICAgIHBsYXllcnNbaV0uaWQsXHJcbiAgICAgICAgcGxheWVyc1tpXS5uYW1lLFxyXG4gICAgICAgIHBsYXllcnNbaV0uY29sb3JcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGIgPSBkYXRhLnN0YXJ0X3N0YXRlW2ldO1xyXG4gICAgICBiLmZvckVhY2goZnVuY3Rpb24oaSl7IC8vIEtub3cgdGhhdCB0aGlzIHdpbGwgcHVzaCBjbG9zZXIgdG8gR0MgKGdhcmJhZ2UgY29sbGVjdG9yKVxyXG4gICAgICAgIHRoaXMuYmFzZXNbaV0uc2V0UGxheWVyKHApO1xyXG4gICAgICB9LCB0aGlzKTtcclxuXHJcbiAgICAgIEdBTUUucGxheWVycy5wdXNoKHApO1xyXG5cclxuICAgICAgaWYocGxheWVyc1tpXS5pZCA9PT0gbXlfaWQpe1xyXG4gICAgICAgIEdBTUUubWUgPSBwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgR0FNRS5zZW5kKCdQTEFZRVIucmVhZHknKTtcclxuXHJcbiAgICAvLyBHQU1FLmRyYXcoKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgUkVTSVpFIH1cclxuICAgKiBSZXNpemUgY2FudmFzIGFuZCBmaXggc2NhbGVzXHJcbiAgICovXHJcbiAgR0FNRS5yZXNpemUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgR0FNRS53aWR0aCAgPSBHQU1FLmNhbnZhcy53aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIEdBTUUuaGVpZ2h0ID0gR0FNRS5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIGZ1bmN0aW9uIHIoZSl7ZS5yZXNpemUoKTt9XHJcbiAgICBHQU1FLmJhc2VzLmZvckVhY2gocik7XHJcbiAgICBHQU1FLm1pbmlvbnMuZm9yRWFjaChyKTtcclxuICAgIEdBTUUucGFydGljbGVzLmZvckVhY2gocik7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IFNUQVJUIH1cclxuICAgKiBTdGFydHMgdGhlIGdhbWVcclxuICAgKi9cclxuICBHQU1FLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgIEdBTUUubm93ID0gR0FNRS5sYXN0X3RpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBHQU1FLmFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShHQU1FLmxvb3ApO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBFTkQgfVxyXG4gICAqIENhbGxlZCB3aGVuIHNlcnZlciB0ZWxscyB0byBlbmQgZ2FtZVxyXG4gICAqL1xyXG4gIEdBTUUuZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKEdBTUUuYW5pbWF0aW9uRnJhbWUpXHJcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShHQU1FLmFuaW1hdGlvbkZyYW1lKTtcclxuXHJcblxyXG4gICAgLy8gQ0xFQU4gVVAgR0FNRVxyXG4gICAgR0FNRS5iYXNlcy5sZW5ndGggPSAwO1xyXG4gICAgR0FNRS5wbGF5ZXJzLmxlbmd0aCA9IDA7XHJcbiAgICBHQU1FLm1lID0gbnVsbDtcclxuICAgIEdBTUUubWluaW9ucy5sZW5ndGggPSAwO1xyXG4gICAgR0FNRS5wYXJ0aWNsZXMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAvLyBUZW1wb3Jhcnkgc29sdXRpb24gdG8gaGlkZSBvdmVybGF5IGFuZCBnbyBiYWNrIHRvIFNUQVJUXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIENPTlRST0xMRVIub3ZlcmxheUhpZGUoKTtcclxuICAgICAgQ09OVFJPTExFUi5zZXRTY3JlZW4oJ3N0YXJ0Jyk7XHJcbiAgICB9LCAzMDAwKTtcclxuICB9O1xyXG5cclxuICAvLy8vLy8vLy8vLy9cclxuICAvLyBFVkVOVFMgLy9cclxuICAvLy8vLy8vLy8vLy9cclxuICAvKipcclxuICAgKiB7IERJU0NPTk5FQ1RJT04gfVxyXG4gICAqIENhbGxlZCB3aGVuIGEgcGxheWVyIGRpc2Nvbm5lY3RzIGZyb20gdGhlIGdhbWVcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLmRpc2Nvbm5lY3Rpb24gPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBwID0gdGhpcy5wbGF5ZXJzLmZpbmRCeSgnaWQnLCBkYXRhLnBsYXllcl9pZCk7XHJcblxyXG4gICAgaWYocCAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgQ09OVFJPTExFUi5vdmVybGF5TWVzc2FnZShcIid7MH0nIGRpc2Nvbm5lY3RlZFwiLmZvcm1hdChwLm5hbWUpKTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgQkFTRSBSRVNPVVJDRVMgfVxyXG4gICAqIFdoZW4gYSBiYXNlIGdvdCB1cGRhdGVkIHJlc291cmNlcyBmcm9tIHNlcnZlclxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUuYmFzZVJlc291cmNlcyA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIGIgPSBHQU1FLmJhc2VzLmJ5SUQoZGF0YS5iYXNlX2lkKTtcclxuXHJcbiAgICBpZihiKVxyXG4gICAgICBiLnJlc291cmNlcyA9IGRhdGEucmVzb3VyY2VzO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBORVcgTUlOSU9OIH1cclxuICAgKiBDYWxsZWQgd2hlbiBzZXJ2ZXIgc2VuZHMgYSBuZXcgbWluaW9uXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5uZXdNaW5pb24gPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBtID0gZGF0YS5taW5pb247XHJcblxyXG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuYmFzZXMuYnlJRChtLnNvdXJjZV9pZCk7XHJcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5iYXNlcy5ieUlEKG0udGFyZ2V0X2lkKTtcclxuXHJcbiAgICB2YXIgbWluaW9uID0gbmV3IE1pbmlvbihcclxuICAgICAgbS5pZCxcclxuICAgICAgc291cmNlLFxyXG4gICAgICB0YXJnZXQsXHJcbiAgICAgIG0uc2NhbGVcclxuICAgICk7XHJcblxyXG4gICAgc291cmNlLnNlbmRNaW5pb24oKTtcclxuXHJcbiAgICB0aGlzLm1pbmlvbnMucHVzaChtaW5pb24pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBNSU5JT04gSElUIH1cclxuICAgKiBDYWxsZWQgYnkgc2VydmVyIHdoZW4gbWluaW9uIHJlYWNoZXMgdGFyZ2V0IGJhc2VcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLm1pbmlvbkhpdCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIG1pbmlvbl9pZCA9IGRhdGEubWluaW9uX2lkO1xyXG4gICAgdmFyIG5ld19wbGF5ZXJfaWQgPSBkYXRhLm5ld19wbGF5ZXJfaWQ7XHJcbiAgICB2YXIgcmVzb3VyY2VzID0gZGF0YS5yZXNvdXJjZXM7XHJcblxyXG4gICAgLy8gRmV0Y2ggbWluaW9uXHJcbiAgICB2YXIgbWluaW9uID0gdGhpcy5taW5pb25zLmJ5SUQobWluaW9uX2lkKTtcclxuXHJcbiAgICBpZighbWluaW9uKXtcclxuICAgICAgYWxlcnQoJ01pbmlvbiBnb25lJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBtaW5pb24uZGVhZF9ieV9zZXJ2ZXIgPSB0cnVlO1xyXG5cclxuICAgIC8vIEdldCB0YXJnZXQgYmFzZVxyXG4gICAgdmFyIHRhcmdldCA9IG1pbmlvbi50YXJnZXRfYmFzZTtcclxuICAgIC8vIFNldCByZXNvdXJjZXMgZm9yIGJhc2VcclxuICAgIHRhcmdldC5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcblxyXG4gICAgaWYobmV3X3BsYXllcl9pZCAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgdmFyIHBsYXllciA9IHRoaXMucGxheWVycy5ieUlEKG5ld19wbGF5ZXJfaWQpO1xyXG4gICAgICB0YXJnZXQuc2V0UGxheWVyKHBsYXllcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIHsgTE9PUCB9XHJcbiAgICogRmlyc3QgZW50cnkgcG9pbnQgZm9yIGdhbWUgbG9vcFxyXG4gICAqIEBwYXJhbSAge051bWJlcn0gdGltZSAgICBUaW1lIGZyb20gcGVyZm9ybWFuY2Uubm93XHJcbiAgICovXHJcbiAgR0FNRS5sb29wID0gZnVuY3Rpb24odGltZSl7XHJcbiAgICBpZihHQU1FLmRyYXdfdGltZSlcclxuICAgICAgR0FNRS5kcmF3X3RpbWUgPSB0aW1lIC0gR0FNRS5kcmF3X3RpbWU7XHJcbiAgICBHQU1FLm5vdyA9IHRpbWU7XHJcbiAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gR0FNRS5sYXN0X3RpbWUpIC8gMTAwMC4wO1xyXG4gICAgR0FNRS5sYXN0X3RpbWUgPSB0aW1lO1xyXG5cclxuICAgIEdBTUUudXBkYXRlX3RpbWUgPSB0aW1lO1xyXG4gICAgR0FNRS51cGRhdGUoZWxhcHNlZCk7XHJcbiAgICBHQU1FLnVwZGF0ZV90aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSBHQU1FLnVwZGF0ZV90aW1lO1xyXG5cclxuICAgIC8vIG91dCgndXBkYXRlJywgR0FNRS51cGRhdGVfdGltZSk7XHJcbiAgICAvLyBvdXQoJ2RyYXcnLCBHQU1FLmRyYXdfdGltZSk7XHJcblxyXG4gICAgR0FNRS5kcmF3X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIEdBTUUuZHJhdygpO1xyXG5cclxuICAgIEdBTUUuYW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKEdBTUUubG9vcCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IFVQREFURSB9XHJcbiAgICogQHBhcmFtICB7TnVtYmVyfSB0ICAgRWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgdXBkYXRlIChzZWNvbmRzKVxyXG4gICAqL1xyXG4gIEdBTUUudXBkYXRlID0gZnVuY3Rpb24odCl7XHJcbiAgICB2YXIgaSwgbGVuLCBiLCBtLCBwO1xyXG5cclxuXHJcbiAgICAvLyBSZXNldCBob3ZlcmVkIGFuZCB0YXJnZXRlZFxyXG4gICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXRlZF9iYXNlID0gbnVsbDtcclxuXHJcblxyXG5cclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGIgPSB0aGlzLmJhc2VzW2ldO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGJhc2VcclxuICAgICAgYi51cGRhdGUodCk7XHJcblxyXG4gICAgICAvLyBSZXNldCBiYXNlIGhvdmVyZWQgJiB0YXJnZXRlZCBzdGF0ZVxyXG4gICAgICBiLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgYi50YXJnZXRlZCA9IGZhbHNlO1xyXG5cclxuXHJcbiAgICAgIC8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIC8vIENIRUNLIElOUFVUIC8vXHJcbiAgICAgIC8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIC8vIE1vdXNlIGlzIG92ZXIgYmFzZVxyXG4gICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgICAvLyBTZWUgaWYgdGhlcmUgaXMgYW55IHNlbGVjdGVkIGJhc2UgYW5kIGl0IGlzbid0IHRoZSBvbmUgdGVzdGVkXHJcbiAgICAgICAgaWYodGhpcy5zZWxlY3RlZF9iYXNlICYmIHRoaXMuc2VsZWN0ZWRfYmFzZSAhPT0gYil7XHJcbiAgICAgICAgICAvLyBTZXQgdGhlIGJhc2UgYXMgdGFyZ2V0ZWQgYW5kIHRyeSB0byBzZW5kXHJcbiAgICAgICAgICBHQU1FLnRyeVNlbmRNaW5pb24oYik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmFzZSBiZWxvbnMgdG8gJ21lJ1xyXG4gICAgICAgICAgaWYodGhpcy5tZS5iYXNlc19pZC5pbmRleE9mKGIuaWQpICE9PSAtMSl7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgYmFzZSBhcyBob3ZlcmVkXHJcbiAgICAgICAgICAgIGIuaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT0gLTEpe1xyXG4gICAgICAgIGlmKCFiLnNlbGVjdGVkICYmIHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAgICAgYi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gYjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgICAvLy8vLy8vLy9cclxuICAgICAgLy8gT0xEIC8vXHJcbiAgICAgIC8vLy8vLy8vL1xyXG4gICAgICAvLyBpZighYi5zZWxlY3RlZCAmJiBwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgLy8gICAgIGlmKHRoaXMuc2VsZWN0ZWRfYmFzZSl7XHJcbiAgICAgIC8vICAgICAgICAgYi50YXJnZXRlZCA9IHRydWU7XHJcbiAgICAgIC8vICAgICAgICAgdGhpcy50YXJnZXRlZF9iYXNlID0gYjtcclxuXHJcbiAgICAgIC8vICAgICAgICAgaWYodGhpcy5zZWxlY3RlZF9iYXNlLnNwYXduX2RlbGF5IDw9IDAuMCl7XHJcbiAgICAgIC8vICAgICAgICAgICAgIC8vIFNlbmQgdG8gc2VydmVyXHJcbiAgICAgIC8vICAgICAgICAgICAgIE5FVC5zb2NrZXQuZW1pdCgncC5taW5pb24nLCB7XHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICBzb3VyY2VfaWQ6IHRoaXMuc2VsZWN0ZWRfYmFzZS5wbGF5ZXJfaWQsXHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICB0YXJnZXRfaWQ6IHRoaXMudGFyZ2V0ZWRfYmFzZS5wbGF5ZXJfaWRcclxuICAgICAgLy8gICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAgICAgICAgICAgICAvLyB0aGlzLm1pbmlvbnMucHVzaChcclxuICAgICAgLy8gICAgICAgICAgICAgLy8gICAgIG5ldyBNaW5pb24odGhpcy5zZWxlY3RlZF9iYXNlLCB0aGlzLnRhcmdldGVkX2Jhc2UpXHJcbiAgICAgIC8vICAgICAgICAgICAgIC8vICAgICApO1xyXG5cclxuICAgICAgLy8gICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9iYXNlLnNwYXduX2RlbGF5ID0gdGhpcy5zZWxlY3RlZF9iYXNlLnNwYXduX2RlbGF5X21heDtcclxuICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAvLyAgICAgICAgIGIuaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgIC8vICAgICAgICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBiO1xyXG4gICAgICAvLyAgICAgfVxyXG4gICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyBVcGRhdGUgbWluaW9uc1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLm1pbmlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBtID0gdGhpcy5taW5pb25zW2ldO1xyXG4gICAgICBpZihtLmFjdGl2ZSl7XHJcbiAgICAgICAgbS51cGRhdGUodCk7XHJcblxyXG4gICAgICAgIGlmKCFtLmFjdGl2ZSl7XHJcbiAgICAgICAgICBTT1VORC5wbGF5UmFuZG9tU291bmQoKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKFxyXG4gICAgICAgICAgICBuZXcgUGFydGljbGUobS50YXJnZXRfYmFzZS5sZWZ0LCBtLnRhcmdldF9iYXNlLnRvcCwgbS50YXJnZXRfYmFzZS5zY2FsZSwgbS5zb3VyY2VfYmFzZS5jb2xvcilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYobS5kZWFkX2J5X3NlcnZlciAmJiAhbS5hY3RpdmUpe1xyXG4gICAgICAgIHRoaXMubWluaW9ucy5zcGxpY2UoaS0tLCAxKTtcclxuICAgICAgICAtLWxlbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBwYXRpY2xlc1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHAgPSB0aGlzLnBhcnRpY2xlc1tpXTtcclxuICAgICAgcC51cGRhdGUodCk7XHJcblxyXG4gICAgICBpZighcC5hY3RpdmUpe1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLS0sIDEpO1xyXG4gICAgICAgIC0tbGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IERSQVcgfVxyXG4gICAqIERyYXcgdGhlIHNjZW5lXHJcbiAgICovXHJcbiAgR0FNRS5kcmF3ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBpLCBsZW4sIGIsIG0sIHgsIHk7XHJcblxyXG4gICAgR0FNRS5jdHguY2xlYXJSZWN0KDAsIDAsIEdBTUUud2lkdGgsIEdBTUUuaGVpZ2h0KTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERyYXcgbWluaW9ucyAvL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMubWluaW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIG0gPSB0aGlzLm1pbmlvbnNbaV07XHJcbiAgICAgIGlmKG0uYWN0aXZlKVxyXG4gICAgICAgIG0uZHJhdyh0aGlzLmN0eCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLyBEcmF3IGxpbmUgLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vL1xyXG4gICAgaWYodGhpcy5zZWxlY3RlZF9iYXNlKXtcclxuICAgICAgYiA9IHRoaXMuc2VsZWN0ZWRfYmFzZTtcclxuICAgICAgaWYodGhpcy50YXJnZXRlZF9iYXNlKXtcclxuICAgICAgICB4ID0gdGhpcy50YXJnZXRlZF9iYXNlLng7XHJcbiAgICAgICAgeSA9IHRoaXMudGFyZ2V0ZWRfYmFzZS55O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHggPSBUT1VDSC54O1xyXG4gICAgICAgIHkgPSBUT1VDSC55O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBHQU1FLmN0eC5zYXZlKCk7XHJcblxyXG4gICAgICBHQU1FLmN0eC5nbG9iYWxBbHBoYSA9IDAuMztcclxuICAgICAgdmFyIGxpbmVfc2l6ZSA9IDU7XHJcbiAgICAgIHZhciBjb2xvciA9IEdBTUUubWUuY29sb3IgfHwgJyNBQUEnIDtcclxuICAgICAgZHJhd0xpbmUoR0FNRS5jdHgsIGIueCwgYi55LCB4LCB5LCBjb2xvciwgbGluZV9zaXplKTtcclxuICAgICAgZHJhd0NpcmNsZShHQU1FLmN0eCwgeCwgeSwgbGluZV9zaXplIC8gMiwgY29sb3IpO1xyXG5cclxuICAgICAgR0FNRS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERyYXcgYmFzZXMgLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHRoaXMuYmFzZXNbaV0uZHJhdyh0aGlzLmN0eCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERSQVcgUEFSVElDTEVTIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHRoaXMucGFydGljbGVzW2ldLmRyYXcodGhpcy5jdHgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLyBEUkFXIFNDT1JFIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBHQU1FLmRyYXdTY29yZUJhcigpO1xyXG4gIH07XHJcbiAgR0FNRS5zZW5kID0gZnVuY3Rpb24obXNnLCBkYXRhKXtcclxuICAgIE5FVC5zZW5kKG1zZywgZGF0YSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IERSQVcgU0NPUkUgfVxyXG4gICAqIERyYXcgYSBzY29yZSBiYXJcclxuICAgKiBOZWVkcyB0byBiZSB0dW5lZCBmb3Igc29tZSBwZXJmb3JtYW5jZSBwcm9iYWJseVxyXG4gICAqICAgICBPbmx5IHVwZGF0ZSB3aGVuIHNjb3JlIGhhcyB1cGRhdGVkXHJcbiAgICovXHJcbiAgR0FNRS5kcmF3U2NvcmVCYXIgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHgsIHksIHcsIGgsIGksIGxlbiwgciwgdG90YWwsIGEsIHh0LCB3dCwgdGV4dDtcclxuXHJcbiAgICBHQU1FLmN0eC5zYXZlKCk7XHJcblxyXG4gICAgdyA9IEdBTUUud2lkdGggLyAxLjU7XHJcbiAgICBoID0gR0FNRS5oZWlnaHQgLyAyMDtcclxuICAgIHggPSAoR0FNRS53aWR0aCAvIDIpIC0gKHcgLyAyKTtcclxuICAgIHkgPSAoR0FNRS5oZWlnaHQgLyAyMCkgLSAoaCAvIDIpO1xyXG5cclxuICAgIHIgPSBbXTtcclxuICAgIHRvdGFsID0gMDtcclxuICAgIGZvcihpID0gMCwgbGVuID0gR0FNRS5wbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgcltpXSA9IEdBTUUucGxheWVyc1tpXS50b3RhbFJlc291cmNlcygpO1xyXG4gICAgICB0b3RhbCArPSByW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIHh0ID0geDtcclxuICAgIGZvcihpID0gMCwgbGVuID0gR0FNRS5wbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgR0FNRS5jdHguZmlsbFN0eWxlID0gR0FNRS5wbGF5ZXJzW2ldLmNvbG9yO1xyXG4gICAgICB3dCA9IChyW2ldIC8gdG90YWwpICogdztcclxuICAgICAgR0FNRS5jdHguZmlsbFJlY3QoXHJcbiAgICAgICAgeHQsXHJcbiAgICAgICAgeSxcclxuICAgICAgICB3dCxcclxuICAgICAgICBoXHJcbiAgICAgICk7XHJcbiAgICAgIHRleHQgPSBHQU1FLnBsYXllcnNbaV0ubmFtZSArICcgLSAnICsgcltpXTtcclxuICAgICAgR0FNRS5jdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuICAgICAgR0FNRS5jdHguZmlsbFRleHQodGV4dCwgeHQgKyAod3QvMikgLSAoR0FNRS5jdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGgvMiksIHkrKGgvMikpO1xyXG5cclxuICAgICAgeHQgKz0gd3Q7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIEdBTUUuY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuICAgIEdBTUUuY3R4LnN0cm9rZVJlY3QoeCwgeSwgdywgaCk7XHJcblxyXG4gICAgR0FNRS5jdHgucmVzdG9yZSgpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBTVEFSVCBUT1VDSCB9XHJcbiAgICovXHJcbiAgR0FNRS5zdGFydFRvdWNoID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBpLCBiLCBsZW47XHJcblxyXG4gICAgLy8gVGVzdCBjb2xsaXNpb24gYWdhaW5zdCBhbGxcclxuICAgIC8vIGZvcihpID0gMDsgaSA8IHRoaXMuYmFzZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgLy8gICAgIGIgPSB0aGlzLmJhc2VzW2ldO1xyXG5cclxuICAgIC8vICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgIC8vICAgICAgICAgYi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAvLyAgICAgICAgIEdBTUUuc2VsZWN0ZWRfYmFzZSA9IGI7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIGlmKCFHQU1FLm1lKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBHQU1FLm1lLmJhc2VzX2lkLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgYiA9IEdBTUUuYmFzZXNbR0FNRS5iYXNlcy5pbmRleEJ5SUQoR0FNRS5tZS5iYXNlc19pZFtpXSldO1xyXG5cclxuICAgICAgaWYocG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XHJcbiAgICAgICAgYi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlID0gYjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vLy8vLy9cclxuICAgIC8vIE9MRCAvL1xyXG4gICAgLy8vLy8vLy8vXHJcbiAgICAvLyAvLyBUZXN0IGp1c3QgYWdhaW5zdCBbbWVdXHJcbiAgICAvLyBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIEdBTUUubWUueCwgR0FNRS5tZS55LCBHQU1FLm1lLnNpemUpKXtcclxuICAgIC8vICAgICBHQU1FLm1lLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgIC8vICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBHQU1FLm1lO1xyXG4gICAgLy8gfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBFTkQgVE9VQ0ggfVxyXG4gICAqL1xyXG4gIEdBTUUuZW5kVG91Y2ggPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoR0FNRS5zZWxlY3RlZF9iYXNlKXtcclxuICAgICAgLy8gQWRkIG5ldyBtaW5pb25cclxuICAgICAgaWYoR0FNRS50YXJnZXRlZF9iYXNlKXtcclxuXHJcbiAgICAgIH1cclxuICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgIEdBTUUuc2VsZWN0ZWRfYmFzZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IFNFTkQgTUlOSU9OIH1cclxuICAgKiBUcmllcyB0byBzZW5kIGEgbWluaW9uXHJcbiAgICovXHJcbiAgR0FNRS50cnlTZW5kTWluaW9uID0gZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgIHRhcmdldC50YXJnZXRlZCA9IHRydWU7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSB0YXJnZXQ7XHJcblxyXG4gICAgLy8gQ2FsbCAnY2FuU2VuZE1pbmlvbicgb24gc2VsZWN0ZWRfYmFzZVxyXG4gICAgLy8gW0NIQU5HRURdIEFsbHdheXMgYXNrIHNlcnZlciB0byBzZW5kXHJcbiAgICBpZihHQU1FLnNlbGVjdGVkX2Jhc2UuY2FuU2VuZE1pbmlvbigpIHx8IHRydWUpe1xyXG4gICAgICBHQU1FLnNlbmQoJ0JBU0UubWluaW9uJywge1xyXG4gICAgICAgIHNvdXJjZV9pZDogdGhpcy5zZWxlY3RlZF9iYXNlLmlkLFxyXG4gICAgICAgIHRhcmdldF9pZDogdGFyZ2V0LmlkXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG59IiwiXHJcbmltcG9ydCBHYW1lIGZyb20gJy4vZ2FtZSdcclxuXHJcbnZhciBnYW1lID0gd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpLmluaXQoKTsiLCJcclxuXHJcbmxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8XHJcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8XHJcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96Tm93IHx8XHJcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNOb3cgfHxcclxuICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jdHggPSBudWxsO1xyXG4gICAgdGhpcy5zb3VuZHMgPSBbXTtcclxuICAgIHRoaXMuc291bmRfbmFtZXMgPSBbXTtcclxuICAgIHRoaXMuc3RhcnR1cF9ldmVudCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgaWYgKCF3aW5kb3cuQXVkaW9Db250ZXh0KSB7XHJcbiAgICAgIHRocm93IFwiQXVkaW9Db250ZXh0IG5vdCBzdXBwb3J0ZWQgYnkgYnJvd3NlclwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cclxuICAgIHRoaXMuaW5pdFNvdW5kcygpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcblxyXG4gIGluaXRTb3VuZHMoKSB7ICBcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2M0LndhdicsICdjNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDQud2F2JywgJ2Q0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9lNC53YXYnLCAnZTQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Y0LndhdicsICdmNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZzQud2F2JywgJ2c0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9hNC53YXYnLCAnYTQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2I0LndhdicsICdiNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzUud2F2JywgJ2M1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9kNS53YXYnLCAnZDUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2U1LndhdicsICdlNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZjUud2F2JywgJ2Y1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9nNS53YXYnLCAnZzUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2E1LndhdicsICdhNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYjUud2F2JywgJ2I1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9jNi53YXYnLCAnYzYnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Q2LndhdicsICdkNicpO1xyXG4gIH1cclxuXHJcblxyXG4gIGxvYWRTb3VuZCh1cmwsIG5hbWUpIHtcclxuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xyXG4gICAgXHJcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmN0eC5kZWNvZGVBdWRpb0RhdGEoeGhyLnJlc3BvbnNlLCAoYnVmZmVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zb3VuZF9uYW1lcy5wdXNoKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuc291bmRzW25hbWVdID0gYnVmZmVyO1xyXG5cclxuICAgICAgICBpZih0aGlzLnN0YXJ0dXBfZXZlbnQgPT09IG51bGwpe1xyXG4gICAgICAgICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXlSYW5kb21Tb3VuZCgpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHBsYXlTb3VuZChuYW1lKSB7XHJcbiAgICBpZiAoIXRoaXMuc291bmRzW25hbWVdKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHNvdW5kID0gdGhpcy50eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHNvdW5kLmJ1ZmZlciA9IHRoaXMuc291bmRzW25hbWVdO1xyXG5cclxuICAgIGxldCBnYWluID0gdGhpcy5jcmVhdGVHYWluTm9kZSgwLjgsIDAuMCwgMC40KTtcclxuXHJcbiAgICBzb3VuZC5jb25uZWN0KGdhaW4pO1xyXG4gICAgZ2Fpbi5jb25uZWN0KHRoaXMuY3R4LmRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICBzb3VuZC5ub3RlT24oMCk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVHYWluTm9kZShzdGFydCwgZW5kLCB0aW1lKSB7XHJcbiAgICBsZXQgbm9kZSA9IHRoaXMuY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIGxldCBub3cgPSB0aGlzLmN0eC5jdXJyZW50VGltZTtcclxuXHJcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoc3RhcnQsIG5vdyk7XHJcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZW5kLCBub3cgKyB0aW1lKTtcclxuXHJcbiAgICByZXR1cm4gZ2FpbjtcclxuICB9XHJcblxyXG4gIHBsYXlSYW5kb21Tb3VuZCgpIHtcclxuICAgIHRoaXMucGxheVNvdW5kKHRoaXMuc291bmRfbmFtZXNbcmFuZG9tUmFuZ2VJbnQoMCwgdGhpcy5zb3VuZF9uYW1lcy5sZW5ndGgpXSk7XHJcbiAgfVxyXG59IiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS44LjJcclxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXHJcbi8vICAgICAoYykgMjAwOS0yMDE1IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXHJcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAvLyBCYXNlbGluZSBzZXR1cFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cclxuICB2YXIgcm9vdCA9IC8qd2luZG93IHx8ICovdGhpcztcclxuXHJcbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cclxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xyXG5cclxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxyXG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcclxuXHJcbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXHJcbiAgdmFyXHJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxyXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXHJcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXHJcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XHJcblxyXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxyXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxyXG4gIHZhclxyXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcclxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxyXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQsXHJcbiAgICBuYXRpdmVDcmVhdGUgICAgICAgPSBPYmplY3QuY3JlYXRlO1xyXG5cclxuICAvLyBOYWtlZCBmdW5jdGlvbiByZWZlcmVuY2UgZm9yIHN1cnJvZ2F0ZS1wcm90b3R5cGUtc3dhcHBpbmcuXHJcbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XHJcblxyXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxyXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcclxuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XHJcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xyXG4gIH07XHJcblxyXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXHJcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxyXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdC5cclxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcclxuICAgIH1cclxuICAgIGV4cG9ydHMuXyA9IF87XHJcbiAgfSBlbHNlIHtcclxuICAgIHJvb3QuXyA9IF87XHJcbiAgfVxyXG5cclxuICAvLyBDdXJyZW50IHZlcnNpb24uXHJcbiAgXy5WRVJTSU9OID0gJzEuOC4yJztcclxuXHJcbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxyXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXHJcbiAgLy8gZnVuY3Rpb25zLlxyXG4gIHZhciBvcHRpbWl6ZUNiID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcclxuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xyXG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XHJcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XHJcbiAgICAgIH07XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcclxuICAgICAgfTtcclxuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xyXG4gICAgICB9O1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gQSBtb3N0bHktaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWRcclxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXHJcbiAgdmFyIGNiID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KSB7XHJcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XHJcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIG9wdGltaXplQ2IodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcclxuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XHJcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgfTtcclxuICBfLml0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcclxuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xyXG4gIH07XHJcblxyXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXHJcbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIHVuZGVmaW5lZE9ubHkpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgIGlmIChsZW5ndGggPCAyIHx8IG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xyXG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXHJcbiAgICAgICAgICAgIGtleXMgPSBrZXlzRnVuYyhzb3VyY2UpLFxyXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgaWYgKCF1bmRlZmluZWRPbmx5IHx8IG9ialtrZXldID09PSB2b2lkIDApIG9ialtrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXHJcbiAgdmFyIGJhc2VDcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUpIHtcclxuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XHJcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XHJcbiAgICBDdG9yLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcclxuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcclxuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxuXHJcbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXHJcbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdFxyXG4gIC8vIFJlbGF0ZWQ6IGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXRvbGVuZ3RoXHJcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XHJcbiAgdmFyIGlzQXJyYXlMaWtlID0gZnVuY3Rpb24oY29sbGVjdGlvbikge1xyXG4gICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24gJiYgY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xyXG4gIH07XHJcblxyXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXHJcbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxyXG4gIC8vIHNwYXJzZSBhcnJheS1saWtlcyBhcyBpZiB0aGV5IHdlcmUgZGVuc2UuXHJcbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xyXG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcclxuICAgIHZhciBpLCBsZW5ndGg7XHJcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xyXG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XHJcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvYmo7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXHJcbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XHJcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcclxuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXHJcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXHJcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XHJcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgfTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgcmVkdWNpbmcgZnVuY3Rpb24gaXRlcmF0aW5nIGxlZnQgb3IgcmlnaHQuXHJcbiAgZnVuY3Rpb24gY3JlYXRlUmVkdWNlKGRpcikge1xyXG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcclxuICAgIC8vIGluIHRoZSBtYWluIGZ1bmN0aW9uIHdpbGwgZGVvcHRpbWl6ZSB0aGUsIHNlZSAjMTk5MS5cclxuICAgIGZ1bmN0aW9uIGl0ZXJhdG9yKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGtleXMsIGluZGV4LCBsZW5ndGgpIHtcclxuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xyXG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XHJcbiAgICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWVtbztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xyXG4gICAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xyXG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxyXG4gICAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXHJcbiAgICAgICAgICBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcclxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xyXG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xyXG4gICAgICAgIGluZGV4ICs9IGRpcjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxyXG4gIC8vIG9yIGBmb2xkbGAuXHJcbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBjcmVhdGVSZWR1Y2UoMSk7XHJcblxyXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxyXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gY3JlYXRlUmVkdWNlKC0xKTtcclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxyXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcclxuICAgIHZhciBrZXk7XHJcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xyXG4gICAgICBrZXkgPSBfLmZpbmRJbmRleChvYmosIHByZWRpY2F0ZSwgY29udGV4dCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBrZXkgPSBfLmZpbmRLZXkob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xyXG4gICAgfVxyXG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxyXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXHJcbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcclxuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xyXG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXHJcbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xyXG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xyXG4gIH07XHJcblxyXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxyXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXHJcbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcclxuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XHJcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxyXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xyXG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxyXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXHJcbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xyXG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcclxuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXHJcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XHJcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG5cclxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXHJcbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXHJcbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCwgZnJvbUluZGV4KSB7XHJcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XHJcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgdGFyZ2V0LCB0eXBlb2YgZnJvbUluZGV4ID09ICdudW1iZXInICYmIGZyb21JbmRleCkgPj0gMDtcclxuICB9O1xyXG5cclxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cclxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XHJcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcclxuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcclxuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcclxuICAgICAgcmV0dXJuIGZ1bmMgPT0gbnVsbCA/IGZ1bmMgOiBmdW5jLmFwcGx5KHZhbHVlLCBhcmdzKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXHJcbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XHJcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xyXG4gIH07XHJcblxyXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcclxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxyXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcclxuICB9O1xyXG5cclxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XHJcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cclxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcclxuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXHJcbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXHJcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xyXG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcclxuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcclxuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcclxuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XHJcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xyXG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcclxuICAgICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IC1JbmZpbml0eSAmJiByZXN1bHQgPT09IC1JbmZpbml0eSkge1xyXG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XHJcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXHJcbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxyXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcclxuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XHJcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgcmVzdWx0KSB7XHJcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xyXG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcclxuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XHJcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcblxyXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXHJcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxyXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xyXG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XHJcbiAgICB2YXIgc2h1ZmZsZWQgPSBBcnJheShsZW5ndGgpO1xyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xyXG4gICAgICBpZiAocmFuZCAhPT0gaW5kZXgpIHNodWZmbGVkW2luZGV4XSA9IHNodWZmbGVkW3JhbmRdO1xyXG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXHJcbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cclxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxyXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xyXG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xyXG4gICAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XHJcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcclxuICAgIH1cclxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxyXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xyXG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XHJcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICBpbmRleDogaW5kZXgsXHJcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcclxuICAgICAgfTtcclxuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcclxuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xyXG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xyXG4gICAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xyXG4gICAgfSksICd2YWx1ZScpO1xyXG4gIH07XHJcblxyXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cclxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcclxuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcclxuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcclxuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIHZhbHVlLCBrZXkpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxyXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxyXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xyXG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXHJcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxyXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xyXG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXHJcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXHJcbiAgLy8gY3JpdGVyaW9uLlxyXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xyXG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0rKzsgZWxzZSByZXN1bHRba2V5XSA9IDE7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXHJcbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xyXG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xyXG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xyXG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxyXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcclxuICAgIHJldHVybiBpc0FycmF5TGlrZShvYmopID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcclxuICB9O1xyXG5cclxuICAvLyBTcGxpdCBhIGNvbGxlY3Rpb24gaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXHJcbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxyXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcclxuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XHJcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XHJcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcclxuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xyXG4gIH07XHJcblxyXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cclxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXHJcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxyXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcclxuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xyXG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xyXG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXHJcbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cclxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLlxyXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xyXG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIChuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbikpKTtcclxuICB9O1xyXG5cclxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXHJcbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS5cclxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcclxuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xyXG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xyXG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cclxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxyXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cclxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcclxuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbik7XHJcbiAgfTtcclxuXHJcbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxyXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xyXG4gIH07XHJcblxyXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cclxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBzdHJpY3QsIHN0YXJ0SW5kZXgpIHtcclxuICAgIHZhciBvdXRwdXQgPSBbXSwgaWR4ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGlucHV0ICYmIGlucHV0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xyXG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xyXG4gICAgICAgIC8vZmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3RcclxuICAgICAgICBpZiAoIXNoYWxsb3cpIHZhbHVlID0gZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0KTtcclxuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcclxuICAgICAgICBvdXRwdXQubGVuZ3RoICs9IGxlbjtcclxuICAgICAgICB3aGlsZSAoaiA8IGxlbikge1xyXG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcclxuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgfTtcclxuXHJcbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxyXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XHJcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxyXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xyXG4gIH07XHJcblxyXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XHJcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxyXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXHJcbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XHJcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xyXG4gICAgaWYgKCFfLmlzQm9vbGVhbihpc1NvcnRlZCkpIHtcclxuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xyXG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xyXG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIHNlZW4gPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdmFsdWUgPSBhcnJheVtpXSxcclxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XHJcbiAgICAgIGlmIChpc1NvcnRlZCkge1xyXG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xyXG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcclxuICAgICAgfSBlbHNlIGlmIChpdGVyYXRlZSkge1xyXG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcclxuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XHJcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcblxyXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxyXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxyXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBfLnVuaXEoZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUpKTtcclxuICB9O1xyXG5cclxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXHJcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cclxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIGFyZ3NMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XHJcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcblxyXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cclxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxyXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICB2YXIgcmVzdCA9IGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCAxKTtcclxuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxyXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxyXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gXy51bnppcChhcmd1bWVudHMpO1xyXG4gIH07XHJcblxyXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcclxuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcclxuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICAgIHZhciBsZW5ndGggPSBhcnJheSAmJiBfLm1heChhcnJheSwgJ2xlbmd0aCcpLmxlbmd0aCB8fCAwO1xyXG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XHJcblxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG5cclxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXHJcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXHJcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxyXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdCAmJiBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICh2YWx1ZXMpIHtcclxuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXHJcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cclxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcclxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxyXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xyXG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheSAmJiBhcnJheS5sZW5ndGg7XHJcbiAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XHJcbiAgICAgIGkgPSBpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZDtcclxuICAgIH0gZWxzZSBpZiAoaXNTb3J0ZWQgJiYgbGVuZ3RoKSB7XHJcbiAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcclxuICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xyXG4gICAgfVxyXG4gICAgaWYgKGl0ZW0gIT09IGl0ZW0pIHtcclxuICAgICAgcmV0dXJuIF8uZmluZEluZGV4KHNsaWNlLmNhbGwoYXJyYXksIGkpLCBfLmlzTmFOKTtcclxuICAgIH1cclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XHJcbiAgICByZXR1cm4gLTE7XHJcbiAgfTtcclxuXHJcbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XHJcbiAgICB2YXIgaWR4ID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xyXG4gICAgaWYgKHR5cGVvZiBmcm9tID09ICdudW1iZXInKSB7XHJcbiAgICAgIGlkeCA9IGZyb20gPCAwID8gaWR4ICsgZnJvbSArIDEgOiBNYXRoLm1pbihpZHgsIGZyb20gKyAxKTtcclxuICAgIH1cclxuICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XHJcbiAgICAgIHJldHVybiBfLmZpbmRMYXN0SW5kZXgoc2xpY2UuY2FsbChhcnJheSwgMCwgaWR4KSwgXy5pc05hTik7XHJcbiAgICB9XHJcbiAgICB3aGlsZSAoLS1pZHggPj0gMCkgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XHJcbiAgICByZXR1cm4gLTE7XHJcbiAgfTtcclxuXHJcbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9uc1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZUluZGV4RmluZGVyKGRpcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcclxuICAgICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcclxuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ICE9IG51bGwgJiYgYXJyYXkubGVuZ3RoO1xyXG4gICAgICB2YXIgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XHJcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcclxuICAgICAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkgcmV0dXJuIGluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBpbmRleCBvbiBhbiBhcnJheS1saWtlIHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcclxuICBfLmZpbmRJbmRleCA9IGNyZWF0ZUluZGV4RmluZGVyKDEpO1xyXG5cclxuICBfLmZpbmRMYXN0SW5kZXggPSBjcmVhdGVJbmRleEZpbmRlcigtMSk7XHJcblxyXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcclxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXHJcbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XHJcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcclxuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XHJcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcclxuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XHJcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xyXG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGxvdztcclxuICB9O1xyXG5cclxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXHJcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcclxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxyXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xyXG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcclxuXHJcbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xyXG4gICAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcclxuXHJcbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XHJcbiAgICAgIHJhbmdlW2lkeF0gPSBzdGFydDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfTtcclxuXHJcbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdG8gZXhlY3V0ZSBhIGZ1bmN0aW9uIGFzIGEgY29uc3RydWN0b3JcclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcclxuICB2YXIgZXhlY3V0ZUJvdW5kID0gZnVuY3Rpb24oc291cmNlRnVuYywgYm91bmRGdW5jLCBjb250ZXh0LCBjYWxsaW5nQ29udGV4dCwgYXJncykge1xyXG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XHJcbiAgICB2YXIgcmVzdWx0ID0gc291cmNlRnVuYy5hcHBseShzZWxmLCBhcmdzKTtcclxuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9O1xyXG5cclxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcclxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXHJcbiAgLy8gYXZhaWxhYmxlLlxyXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcclxuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcclxuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcclxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xyXG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIGNvbnRleHQsIHRoaXMsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBib3VuZDtcclxuICB9O1xyXG5cclxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXHJcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xyXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cclxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XHJcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGJvdW5kQXJncy5sZW5ndGg7XHJcbiAgICAgIHZhciBhcmdzID0gQXJyYXkobGVuZ3RoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFyZ3NbaV0gPSBib3VuZEFyZ3NbaV0gPT09IF8gPyBhcmd1bWVudHNbcG9zaXRpb24rK10gOiBib3VuZEFyZ3NbaV07XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XHJcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIHRoaXMsIHRoaXMsIGFyZ3MpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBib3VuZDtcclxuICB9O1xyXG5cclxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcclxuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcclxuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXHJcbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICB2YXIgaSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCwga2V5O1xyXG4gICAgaWYgKGxlbmd0aCA8PSAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcclxuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBrZXkgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgIG9ialtrZXldID0gXy5iaW5kKG9ialtrZXldLCBvYmopO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9iajtcclxuICB9O1xyXG5cclxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxyXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xyXG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcclxuICAgICAgdmFyIGFkZHJlc3MgPSAnJyArIChoYXNoZXIgPyBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleSk7XHJcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xyXG4gICAgfTtcclxuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcclxuICAgIHJldHVybiBtZW1vaXplO1xyXG4gIH07XHJcblxyXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcclxuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXHJcbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcclxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xyXG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICB9LCB3YWl0KTtcclxuICB9O1xyXG5cclxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcclxuICAvLyBjbGVhcmVkLlxyXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XHJcblxyXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxyXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxyXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcclxuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xyXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxyXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XHJcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xyXG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xyXG4gICAgdmFyIHByZXZpb3VzID0gMDtcclxuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xyXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xyXG4gICAgICB0aW1lb3V0ID0gbnVsbDtcclxuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcclxuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcclxuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xyXG4gICAgICBjb250ZXh0ID0gdGhpcztcclxuICAgICAgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcclxuICAgICAgICBpZiAodGltZW91dCkge1xyXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByZXZpb3VzID0gbm93O1xyXG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XHJcbiAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XHJcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcclxuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XHJcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxyXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxyXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXHJcbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xyXG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xyXG5cclxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XHJcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcclxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xyXG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xyXG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xyXG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcclxuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XHJcbiAgICAgIGlmIChjYWxsTm93KSB7XHJcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxyXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcclxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxyXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcclxuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cclxuICBfLm5lZ2F0ZSA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxyXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXHJcbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGkgPSBzdGFydDtcclxuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cclxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXHJcbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xyXG4gICAgdmFyIG1lbW87XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xyXG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xyXG4gICAgICByZXR1cm4gbWVtbztcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XHJcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cclxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xyXG5cclxuICAvLyBPYmplY3QgRnVuY3Rpb25zXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBLZXlzIGluIElFIDwgOSB0aGF0IHdvbid0IGJlIGl0ZXJhdGVkIGJ5IGBmb3Iga2V5IGluIC4uLmAgYW5kIHRodXMgbWlzc2VkLlxyXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XHJcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdoYXNPd25Qcm9wZXJ0eScsICd0b0xvY2FsZVN0cmluZyddO1xyXG5cclxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xyXG4gICAgdmFyIG5vbkVudW1JZHggPSBub25FbnVtZXJhYmxlUHJvcHMubGVuZ3RoO1xyXG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xyXG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3RvciBpcyBhIHNwZWNpYWwgY2FzZS5cclxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcclxuICAgIGlmIChfLmhhcyhvYmosIHByb3ApICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSBrZXlzLnB1c2gocHJvcCk7XHJcblxyXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xyXG4gICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25vbkVudW1JZHhdO1xyXG4gICAgICBpZiAocHJvcCBpbiBvYmogJiYgb2JqW3Byb3BdICE9PSBwcm90b1twcm9wXSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkge1xyXG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxyXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcclxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XHJcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcclxuICAgIHZhciBrZXlzID0gW107XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcclxuICAgIC8vIEFoZW0sIElFIDwgOS5cclxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XHJcbiAgICByZXR1cm4ga2V5cztcclxuICB9O1xyXG5cclxuICAvLyBSZXRyaWV2ZSBhbGwgdGhlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdC5cclxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XHJcbiAgICB2YXIga2V5cyA9IFtdO1xyXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XHJcbiAgICAvLyBBaGVtLCBJRSA8IDkuXHJcbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xyXG4gICAgcmV0dXJuIGtleXM7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxyXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xyXG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xyXG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50IG9mIHRoZSBvYmplY3RcclxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxyXG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xyXG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XHJcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcclxuICAgICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxyXG4gICAgICAgICAgcmVzdWx0cyA9IHt9LFxyXG4gICAgICAgICAgY3VycmVudEtleTtcclxuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcclxuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH07XHJcblxyXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxyXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XHJcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XHJcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhaXJzO1xyXG4gIH07XHJcblxyXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cclxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxyXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXHJcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIHZhciBuYW1lcyA9IFtdO1xyXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xyXG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcclxuICB9O1xyXG5cclxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cclxuICBfLmV4dGVuZCA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cyk7XHJcblxyXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXHJcbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXHJcbiAgXy5leHRlbmRPd24gPSBfLmFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKF8ua2V5cyk7XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdFxyXG4gIF8uZmluZEtleSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XHJcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xyXG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKSwga2V5O1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAga2V5ID0ga2V5c1tpXTtcclxuICAgICAgaWYgKHByZWRpY2F0ZShvYmpba2V5XSwga2V5LCBvYmopKSByZXR1cm4ga2V5O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXHJcbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcclxuICAgIHZhciByZXN1bHQgPSB7fSwgb2JqID0gb2JqZWN0LCBpdGVyYXRlZSwga2V5cztcclxuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcclxuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xyXG4gICAgICBrZXlzID0gXy5hbGxLZXlzKG9iaik7XHJcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihvaXRlcmF0ZWUsIGNvbnRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAga2V5cyA9IGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpO1xyXG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikgeyByZXR1cm4ga2V5IGluIG9iajsgfTtcclxuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcclxuICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XHJcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG5cclxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXHJcbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xyXG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcclxuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xyXG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICByZXR1cm4gIV8uY29udGFpbnMoa2V5cywga2V5KTtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBfLnBpY2sob2JqLCBpdGVyYXRlZSwgY29udGV4dCk7XHJcbiAgfTtcclxuXHJcbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cclxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxyXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xyXG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcclxuICB9O1xyXG5cclxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXHJcbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXHJcbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXHJcbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XHJcbiAgICBpbnRlcmNlcHRvcihvYmopO1xyXG4gICAgcmV0dXJuIG9iajtcclxuICB9O1xyXG5cclxuICAvLyBSZXR1cm5zIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cclxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XHJcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xyXG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcclxuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9O1xyXG5cclxuXHJcbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cclxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xyXG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxyXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXHJcbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xyXG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxyXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xyXG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXHJcbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xyXG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcclxuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXHJcbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcclxuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcclxuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XHJcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxyXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxyXG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxyXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxyXG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXHJcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxyXG4gICAgICAgIHJldHVybiAnJyArIGEgPT09ICcnICsgYjtcclxuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcclxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxyXG4gICAgICAgIC8vIE9iamVjdChOYU4pIGlzIGVxdWl2YWxlbnQgdG8gTmFOXHJcbiAgICAgICAgaWYgKCthICE9PSArYSkgcmV0dXJuICtiICE9PSArYjtcclxuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxyXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XHJcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxyXG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcclxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXHJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xyXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cclxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XHJcbiAgICBpZiAoIWFyZUFycmF5cykge1xyXG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3RgcyBvciBgQXJyYXlgc1xyXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxyXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XHJcbiAgICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcclxuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxyXG4gICAgXHJcbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXHJcbiAgICAvLyBJdCdzIGRvbmUgaGVyZSBzaW5jZSB3ZSBvbmx5IG5lZWQgdGhlbSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzIGNvbXBhcmlzb24uXHJcbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XHJcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XHJcbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcclxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xyXG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcclxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxyXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXHJcbiAgICBhU3RhY2sucHVzaChhKTtcclxuICAgIGJTdGFjay5wdXNoKGIpO1xyXG5cclxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxyXG4gICAgaWYgKGFyZUFycmF5cykge1xyXG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cclxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XHJcbiAgICAgIGlmIChsZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXHJcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xyXG4gICAgICAgIGlmICghZXEoYVtsZW5ndGhdLCBiW2xlbmd0aF0sIGFTdGFjaywgYlN0YWNrKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cclxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcclxuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XHJcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cclxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcclxuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XHJcbiAgICAgICAgaWYgKCEoXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cclxuICAgIGFTdGFjay5wb3AoKTtcclxuICAgIGJTdGFjay5wb3AoKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxyXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIHJldHVybiBlcShhLCBiKTtcclxuICB9O1xyXG5cclxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cclxuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxyXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChpc0FycmF5TGlrZShvYmopICYmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikgfHwgXy5pc0FyZ3VtZW50cyhvYmopKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XHJcbiAgICByZXR1cm4gXy5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xyXG4gIH07XHJcblxyXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cclxuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xyXG4gIH07XHJcblxyXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XHJcbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcclxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcclxuICB9O1xyXG5cclxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cclxuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XHJcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcclxuICB9O1xyXG5cclxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNFcnJvci5cclxuICBfLmVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCcsICdFcnJvciddLCBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcclxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxyXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XHJcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxyXG4gIC8vIElFIDExICgjMTYyMSksIGFuZCBpbiBTYWZhcmkgOCAoIzE5MjkpLlxyXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xyXG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xyXG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xyXG4gIH07XHJcblxyXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cclxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcclxuICB9O1xyXG5cclxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cclxuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xyXG4gIH07XHJcblxyXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cclxuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcclxuICB9O1xyXG5cclxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cclxuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XHJcbiAgfTtcclxuXHJcbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxyXG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXHJcbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xyXG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xyXG4gIH07XHJcblxyXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xyXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cclxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXHJcbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfTtcclxuXHJcbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxyXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcclxuXHJcbiAgXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gR2VuZXJhdGVzIGEgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gb2JqZWN0IHRoYXQgcmV0dXJucyBhIGdpdmVuIHByb3BlcnR5LlxyXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgcmV0dXJuIG9iaiA9PSBudWxsID8gZnVuY3Rpb24oKXt9IDogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIHJldHVybiBvYmpba2V5XTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIFxyXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxyXG4gIF8ubWF0Y2hlciA9IF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XHJcbiAgICBhdHRycyA9IF8uZXh0ZW5kT3duKHt9LCBhdHRycyk7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBhdHRycyk7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxyXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xyXG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xyXG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xyXG4gICAgcmV0dXJuIGFjY3VtO1xyXG4gIH07XHJcblxyXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXHJcbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gICAgaWYgKG1heCA9PSBudWxsKSB7XHJcbiAgICAgIG1heCA9IG1pbjtcclxuICAgICAgbWluID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xyXG4gIH07XHJcblxyXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cclxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gIH07XHJcblxyXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxyXG4gIHZhciBlc2NhcGVNYXAgPSB7XHJcbiAgICAnJic6ICcmYW1wOycsXHJcbiAgICAnPCc6ICcmbHQ7JyxcclxuICAgICc+JzogJyZndDsnLFxyXG4gICAgJ1wiJzogJyZxdW90OycsXHJcbiAgICBcIidcIjogJyYjeDI3OycsXHJcbiAgICAnYCc6ICcmI3g2MDsnXHJcbiAgfTtcclxuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xyXG5cclxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXHJcbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcclxuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcclxuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XHJcbiAgICB9O1xyXG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkXHJcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XHJcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xyXG4gICAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xyXG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XHJcbiAgICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xyXG4gICAgfTtcclxuICB9O1xyXG4gIF8uZXNjYXBlID0gY3JlYXRlRXNjYXBlcihlc2NhcGVNYXApO1xyXG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcclxuXHJcbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcclxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cclxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XHJcbiAgICB2YXIgdmFsdWUgPSBvYmplY3QgPT0gbnVsbCA/IHZvaWQgMCA6IG9iamVjdFtwcm9wZXJ0eV07XHJcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xyXG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcclxuICB9O1xyXG5cclxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxyXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXHJcbiAgdmFyIGlkQ291bnRlciA9IDA7XHJcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xyXG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcclxuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xyXG4gIH07XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxyXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cclxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XHJcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXHJcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxyXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xyXG4gIH07XHJcblxyXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cclxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXHJcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXHJcbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XHJcblxyXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXHJcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXHJcbiAgdmFyIGVzY2FwZXMgPSB7XHJcbiAgICBcIidcIjogICAgICBcIidcIixcclxuICAgICdcXFxcJzogICAgICdcXFxcJyxcclxuICAgICdcXHInOiAgICAgJ3InLFxyXG4gICAgJ1xcbic6ICAgICAnbicsXHJcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXHJcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcclxuICB9O1xyXG5cclxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcclxuXHJcbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xyXG4gIH07XHJcblxyXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXHJcbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxyXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxyXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cclxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XHJcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xyXG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcclxuXHJcbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cclxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcclxuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXHJcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXHJcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcclxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcclxuXHJcbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxyXG4gICAgdmFyIGluZGV4ID0gMDtcclxuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xyXG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XHJcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XHJcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKGVzY2FwZSkge1xyXG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW50ZXJwb2xhdGUpIHtcclxuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcclxuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xyXG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkb2JlIFZNcyBuZWVkIHRoZSBtYXRjaCByZXR1cm5lZCB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IG9mZmVzdC5cclxuICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfSk7XHJcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xyXG5cclxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXHJcbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xyXG5cclxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcclxuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcclxuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXHJcbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcclxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xyXG5cclxuICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICB9O1xyXG5cclxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cclxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XHJcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xyXG4gICAgcmV0dXJuIGluc3RhbmNlO1xyXG4gIH07XHJcblxyXG4gIC8vIE9PUFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XHJcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcclxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxyXG5cclxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXHJcbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcclxuICAgIHJldHVybiBpbnN0YW5jZS5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcclxuICB9O1xyXG5cclxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXHJcbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xyXG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xyXG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxyXG4gIF8ubWl4aW4oXyk7XHJcblxyXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXHJcbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xyXG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XHJcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XHJcbiAgICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcclxuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBvYmopO1xyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXHJcbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xyXG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XHJcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxyXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcclxuICB9O1xyXG5cclxuICAvLyBQcm92aWRlIHVud3JhcHBpbmcgcHJveHkgZm9yIHNvbWUgbWV0aG9kcyB1c2VkIGluIGVuZ2luZSBvcGVyYXRpb25zXHJcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cclxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XHJcbiAgXHJcbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAnJyArIHRoaXMuX3dyYXBwZWQ7XHJcbiAgfTtcclxuXHJcbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xyXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxyXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcclxuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xyXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxyXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cclxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBfO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59LmNhbGwodGhpcykpOyJdfQ==
