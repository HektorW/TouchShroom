(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Sound = _interopRequire(require("./soundmanager"));

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
    }
  });

  return Game;
})();

module.exports = Game;

function hehe() {

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

},{"./soundmanager":3}],2:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFx1c2Vyc1xcaGVrdG9yXFxkZXNrdG9wXFx3b3Jrc3BhY2VcXHRvdWNoc2hyb29tXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvZ2FtZS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9tYWluLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NvdW5kbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQ08sS0FBSywyQkFBTSxnQkFBZ0I7O0lBR2IsSUFBSTtBQUVaLFdBRlEsSUFBSSxHQUVUOzBCQUZLLElBQUk7O0FBR3JCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV6QixRQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7O0FBRTFCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFB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O0FBQzNDLFVBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUM3QixVQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFJLEVBQUUsR0FBQyxDQUFDLEFBQUMsR0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxBQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBQyxDQUFDLEFBQUMsQ0FBQyxDQUFDOztBQUVyRixRQUFFLElBQUksRUFBRSxDQUFDO0tBQ1Y7O0FBR0QsUUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVoQyxRQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3BCLENBQUM7Ozs7QUFJRixNQUFJLENBQUMsVUFBVSxHQUFHLFlBQVU7QUFDMUIsUUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWWQsUUFBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ1QsT0FBTzs7QUFFVCxTQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFDO0FBQ3JELE9BQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUQsVUFBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxD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QUksQ0FBQztPQUNiOztBQUVELG1CQUFlO2FBQUEsMkJBQUc7QUFDaEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDOUU7Ozs7U0E1RmtCLEtBQUs7OztpQkFBTCxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5pbXBvcnQgU291bmQgZnJvbSAnLi9zb3VuZG1hbmFnZXInO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuICAgIHRoaXMuY3R4ID0gbnVsbDtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmxhc3RfdGltZSA9IC0xO1xyXG4gICAgdGhpcy5ub3cgPSAtMTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXRlZF9iYXNlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmJhc2VzID0gW107XHJcbiAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgIHRoaXMubWluaW9ucyA9IFtdO1xyXG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLm1lID0gbnVsbDtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kKCkuaW5pdCgpO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhbnZhcycpO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcblxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhlaGUoKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIHsgSU5JVCB9XHJcbiAgICogTWFpbiBlbnRyeSBwb2ludCBmb3IgaW5pdGlhbGl6YXRpb25cclxuICAgKiBHZW5lcmFsIGluaXRpYWxpemF0aW9uIG5vdCBib3VuZCB0byBhIGdhbWUgaW5zdGFuY2VcclxuICAgKi9cclxuICBHQU1FLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgU09VTkQuaW5pdCgpO1xyXG5cclxuICAgIEdBTUUuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhbnZhcycpO1xyXG4gICAgR0FNRS5jdHggPSBHQU1FLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIC8vIEZpbmQgZWxlbWVudCBpbiBhcnJheSBieSBwcm9wZXJ0eVxyXG4gICAgR0FNRS5wbGF5ZXJzLmZpbmRCeSA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlKXtcclxuICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgaWYodGhpc1tpXVtwcm9wXSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIEdBTUUucGxheWVycy5ieUlEID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZClcclxuICAgICAgICAgIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBtZXRob2QgdG8gYmFzZSBsaXN0XHJcbiAgICBHQU1FLmJhc2VzLmluZGV4QnlJRCA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZClcclxuICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgR0FNRS5iYXNlcy5ieUlEID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZClcclxuICAgICAgICAgIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE1JTklPTlxyXG4gICAgR0FNRS5taW5pb25zLmJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXNbaV07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgR0FNRS5yZXNpemUoKTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gU0VUVVAgQ09OVFJPTFMgLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBmdW5jdGlvbiBzdGFydFRvdWNoKHgsIHkpe1xyXG4gICAgICBUT1VDSC5kb3duID0gdHJ1ZTtcclxuICAgICAgVE9VQ0guc3RhcnRfeCA9IFRPVUNILnggPSB4O1xyXG4gICAgICBUT1VDSC5zdGFydF95ID0gVE9VQ0gueSA9IHk7XHJcbiAgICAgIEdBTUUuc3RhcnRUb3VjaCgpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZHJhZyh4LCB5KXtcclxuICAgICAgVE9VQ0gub2xkX3ggPSBUT1VDSC54O1xyXG4gICAgICBUT1VDSC5vbGRfeSA9IFRPVUNILnk7XHJcbiAgICAgIFRPVUNILnggPSB4O1xyXG4gICAgICBUT1VDSC55ID0geTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGVuZFRvdWNoKHgsIHkpe1xyXG4gICAgICBUT1VDSC5kb3duID0gZmFsc2U7XHJcbiAgICAgIFRPVUNILmVuZF94ID0geDtcclxuICAgICAgVE9VQ0guZW5kX3kgPSB5O1xyXG4gICAgICBUT1VDSC54ID0gLTE7XHJcbiAgICAgIFRPVUNILnkgPSAtMTtcclxuICAgICAgR0FNRS5lbmRUb3VjaCgpO1xyXG4gICAgfVxyXG4gICAgR0FNRS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgc3RhcnRUb3VjaChlLnBhZ2VYLCBlLnBhZ2VZKTtcclxuICAgIH0sIGZhbHNlKTtcclxuICAgIEdBTUUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRyYWcoZS5wYWdlWCwgZS5wYWdlWSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBHQU1FLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZW5kVG91Y2goZS5wYWdlWCwgZS5wYWdlWSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBHQU1FLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgc3RhcnRUb3VjaChlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYLCBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZKTtcclxuICAgIH0sIGZhbHNlKTtcclxuICAgIEdBTUUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZW5kVG91Y2goZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCwgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBHQU1FLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBkcmFnKGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsIGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIEdBTUUucmVzaXplLCBmYWxzZSk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IFNFVFVQIH1cclxuICAgKiBTZXR1cCBhIHNwZWNpZmljIGdhbWUgd2l0aCBpbmZvIGZyb20gc2VydmVyXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhICBTZXR1cCBkYXRhIGZyb20gc2VydmVyIChwbGF5ZXJzLCBsZXZlbClcclxuICAgKi9cclxuICBHQU1FLnNldHVwID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgaSwgYiwgcCwgbGVuO1xyXG5cclxuICAgIHZhciBsdmxfbmFtZSA9IGRhdGEubGV2ZWxfbmFtZTtcclxuICAgIHZhciBteV9pZCA9IGRhdGEubXlfaWQ7XHJcbiAgICB2YXIgcGxheWVycyA9IGRhdGEucGxheWVycztcclxuXHJcbiAgICB0aW1lZCgnTGV2ZWw6ICcgKyBsdmxfbmFtZSk7XHJcblxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBkYXRhLmJhc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgYiA9IGRhdGEuYmFzZXNbaV07XHJcbiAgICAgIHRoaXMuYmFzZXMucHVzaChcclxuICAgICAgICBuZXcgQmFzZShiLmlkLCBiLmxlZnQsIGIudG9wLCBiLnNjYWxlLCBiLnJlc291cmNlcywgYi5yZXNvdXJjZXNfbWF4KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBwbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgcCA9IG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgcGxheWVyc1tpXS5pZCxcclxuICAgICAgICBwbGF5ZXJzW2ldLm5hbWUsXHJcbiAgICAgICAgcGxheWVyc1tpXS5jb2xvclxyXG4gICAgICApO1xyXG5cclxuICAgICAgYiA9IGRhdGEuc3RhcnRfc3RhdGVbaV07XHJcbiAgICAgIGIuZm9yRWFjaChmdW5jdGlvbihpKXsgLy8gS25vdyB0aGF0IHRoaXMgd2lsbCBwdXNoIGNsb3NlciB0byBHQyAoZ2FyYmFnZSBjb2xsZWN0b3IpXHJcbiAgICAgICAgdGhpcy5iYXNlc1tpXS5zZXRQbGF5ZXIocCk7XHJcbiAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgR0FNRS5wbGF5ZXJzLnB1c2gocCk7XHJcblxyXG4gICAgICBpZihwbGF5ZXJzW2ldLmlkID09PSBteV9pZCl7XHJcbiAgICAgICAgR0FNRS5tZSA9IHA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBHQU1FLnNlbmQoJ1BMQVlFUi5yZWFkeScpO1xyXG5cclxuICAgIC8vIEdBTUUuZHJhdygpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBSRVNJWkUgfVxyXG4gICAqIFJlc2l6ZSBjYW52YXMgYW5kIGZpeCBzY2FsZXNcclxuICAgKi9cclxuICBHQU1FLnJlc2l6ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBHQU1FLndpZHRoICA9IEdBTUUuY2FudmFzLndpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgR0FNRS5oZWlnaHQgPSBHQU1FLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgZnVuY3Rpb24gcihlKXtlLnJlc2l6ZSgpO31cclxuICAgIEdBTUUuYmFzZXMuZm9yRWFjaChyKTtcclxuICAgIEdBTUUubWluaW9ucy5mb3JFYWNoKHIpO1xyXG4gICAgR0FNRS5wYXJ0aWNsZXMuZm9yRWFjaChyKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgU1RBUlQgfVxyXG4gICAqIFN0YXJ0cyB0aGUgZ2FtZVxyXG4gICAqL1xyXG4gIEdBTUUuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgR0FNRS5ub3cgPSBHQU1FLmxhc3RfdGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIEdBTUUuYW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKEdBTUUubG9vcCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IEVORCB9XHJcbiAgICogQ2FsbGVkIHdoZW4gc2VydmVyIHRlbGxzIHRvIGVuZCBnYW1lXHJcbiAgICovXHJcbiAgR0FNRS5lbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoR0FNRS5hbmltYXRpb25GcmFtZSlcclxuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKEdBTUUuYW5pbWF0aW9uRnJhbWUpO1xyXG5cclxuXHJcbiAgICAvLyBDTEVBTiBVUCBHQU1FXHJcbiAgICBHQU1FLmJhc2VzLmxlbmd0aCA9IDA7XHJcbiAgICBHQU1FLnBsYXllcnMubGVuZ3RoID0gMDtcclxuICAgIEdBTUUubWUgPSBudWxsO1xyXG4gICAgR0FNRS5taW5pb25zLmxlbmd0aCA9IDA7XHJcbiAgICBHQU1FLnBhcnRpY2xlcy5sZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIFRlbXBvcmFyeSBzb2x1dGlvbiB0byBoaWRlIG92ZXJsYXkgYW5kIGdvIGJhY2sgdG8gU1RBUlRcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgQ09OVFJPTExFUi5vdmVybGF5SGlkZSgpO1xyXG4gICAgICBDT05UUk9MTEVSLnNldFNjcmVlbignc3RhcnQnKTtcclxuICAgIH0sIDMwMDApO1xyXG4gIH07XHJcblxyXG4gIC8vLy8vLy8vLy8vL1xyXG4gIC8vIEVWRU5UUyAvL1xyXG4gIC8vLy8vLy8vLy8vL1xyXG4gIC8qKlxyXG4gICAqIHsgRElTQ09OTkVDVElPTiB9XHJcbiAgICogQ2FsbGVkIHdoZW4gYSBwbGF5ZXIgZGlzY29ubmVjdHMgZnJvbSB0aGUgZ2FtZVxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUuZGlzY29ubmVjdGlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIHAgPSB0aGlzLnBsYXllcnMuZmluZEJ5KCdpZCcsIGRhdGEucGxheWVyX2lkKTtcclxuXHJcbiAgICBpZihwICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICBDT05UUk9MTEVSLm92ZXJsYXlNZXNzYWdlKFwiJ3swfScgZGlzY29ubmVjdGVkXCIuZm9ybWF0KHAubmFtZSkpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBCQVNFIFJFU09VUkNFUyB9XHJcbiAgICogV2hlbiBhIGJhc2UgZ290IHVwZGF0ZWQgcmVzb3VyY2VzIGZyb20gc2VydmVyXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5iYXNlUmVzb3VyY2VzID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgYiA9IEdBTUUuYmFzZXMuYnlJRChkYXRhLmJhc2VfaWQpO1xyXG5cclxuICAgIGlmKGIpXHJcbiAgICAgIGIucmVzb3VyY2VzID0gZGF0YS5yZXNvdXJjZXM7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IE5FVyBNSU5JT04gfVxyXG4gICAqIENhbGxlZCB3aGVuIHNlcnZlciBzZW5kcyBhIG5ldyBtaW5pb25cclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLm5ld01pbmlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIG0gPSBkYXRhLm1pbmlvbjtcclxuXHJcbiAgICB2YXIgc291cmNlID0gdGhpcy5iYXNlcy5ieUlEKG0uc291cmNlX2lkKTtcclxuICAgIHZhciB0YXJnZXQgPSB0aGlzLmJhc2VzLmJ5SUQobS50YXJnZXRfaWQpO1xyXG5cclxuICAgIHZhciBtaW5pb24gPSBuZXcgTWluaW9uKFxyXG4gICAgICBtLmlkLFxyXG4gICAgICBzb3VyY2UsXHJcbiAgICAgIHRhcmdldCxcclxuICAgICAgbS5zY2FsZVxyXG4gICAgKTtcclxuXHJcbiAgICBzb3VyY2Uuc2VuZE1pbmlvbigpO1xyXG5cclxuICAgIHRoaXMubWluaW9ucy5wdXNoKG1pbmlvbik7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IE1JTklPTiBISVQgfVxyXG4gICAqIENhbGxlZCBieSBzZXJ2ZXIgd2hlbiBtaW5pb24gcmVhY2hlcyB0YXJnZXQgYmFzZVxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUubWluaW9uSGl0ID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgbWluaW9uX2lkID0gZGF0YS5taW5pb25faWQ7XHJcbiAgICB2YXIgbmV3X3BsYXllcl9pZCA9IGRhdGEubmV3X3BsYXllcl9pZDtcclxuICAgIHZhciByZXNvdXJjZXMgPSBkYXRhLnJlc291cmNlcztcclxuXHJcbiAgICAvLyBGZXRjaCBtaW5pb25cclxuICAgIHZhciBtaW5pb24gPSB0aGlzLm1pbmlvbnMuYnlJRChtaW5pb25faWQpO1xyXG5cclxuICAgIGlmKCFtaW5pb24pe1xyXG4gICAgICBhbGVydCgnTWluaW9uIGdvbmUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIG1pbmlvbi5kZWFkX2J5X3NlcnZlciA9IHRydWU7XHJcblxyXG4gICAgLy8gR2V0IHRhcmdldCBiYXNlXHJcbiAgICB2YXIgdGFyZ2V0ID0gbWluaW9uLnRhcmdldF9iYXNlO1xyXG4gICAgLy8gU2V0IHJlc291cmNlcyBmb3IgYmFzZVxyXG4gICAgdGFyZ2V0LnJlc291cmNlcyA9IHJlc291cmNlcztcclxuXHJcbiAgICBpZihuZXdfcGxheWVyX2lkICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICB2YXIgcGxheWVyID0gdGhpcy5wbGF5ZXJzLmJ5SUQobmV3X3BsYXllcl9pZCk7XHJcbiAgICAgIHRhcmdldC5zZXRQbGF5ZXIocGxheWVyKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogeyBMT09QIH1cclxuICAgKiBGaXJzdCBlbnRyeSBwb2ludCBmb3IgZ2FtZSBsb29wXHJcbiAgICogQHBhcmFtICB7TnVtYmVyfSB0aW1lICAgIFRpbWUgZnJvbSBwZXJmb3JtYW5jZS5ub3dcclxuICAgKi9cclxuICBHQU1FLmxvb3AgPSBmdW5jdGlvbih0aW1lKXtcclxuICAgIGlmKEdBTUUuZHJhd190aW1lKVxyXG4gICAgICBHQU1FLmRyYXdfdGltZSA9IHRpbWUgLSBHQU1FLmRyYXdfdGltZTtcclxuICAgIEdBTUUubm93ID0gdGltZTtcclxuICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSBHQU1FLmxhc3RfdGltZSkgLyAxMDAwLjA7XHJcbiAgICBHQU1FLmxhc3RfdGltZSA9IHRpbWU7XHJcblxyXG4gICAgR0FNRS51cGRhdGVfdGltZSA9IHRpbWU7XHJcbiAgICBHQU1FLnVwZGF0ZShlbGFwc2VkKTtcclxuICAgIEdBTUUudXBkYXRlX3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIEdBTUUudXBkYXRlX3RpbWU7XHJcblxyXG4gICAgLy8gb3V0KCd1cGRhdGUnLCBHQU1FLnVwZGF0ZV90aW1lKTtcclxuICAgIC8vIG91dCgnZHJhdycsIEdBTUUuZHJhd190aW1lKTtcclxuXHJcbiAgICBHQU1FLmRyYXdfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgR0FNRS5kcmF3KCk7XHJcblxyXG4gICAgR0FNRS5hbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoR0FNRS5sb29wKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgVVBEQVRFIH1cclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHQgICBFbGFwc2VkIHRpbWUgc2luY2UgbGFzdCB1cGRhdGUgKHNlY29uZHMpXHJcbiAgICovXHJcbiAgR0FNRS51cGRhdGUgPSBmdW5jdGlvbih0KXtcclxuICAgIHZhciBpLCBsZW4sIGIsIG0sIHA7XHJcblxyXG5cclxuICAgIC8vIFJlc2V0IGhvdmVyZWQgYW5kIHRhcmdldGVkXHJcbiAgICB0aGlzLmhvdmVyZWRfYmFzZSA9IG51bGw7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSBudWxsO1xyXG5cclxuXHJcblxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLmJhc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgYiA9IHRoaXMuYmFzZXNbaV07XHJcblxyXG4gICAgICAvLyBVcGRhdGUgYmFzZVxyXG4gICAgICBiLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgIC8vIFJlc2V0IGJhc2UgaG92ZXJlZCAmIHRhcmdldGVkIHN0YXRlXHJcbiAgICAgIGIuaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICBiLnRhcmdldGVkID0gZmFsc2U7XHJcblxyXG5cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgLy8gQ0hFQ0sgSU5QVVQgLy9cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgLy8gTW91c2UgaXMgb3ZlciBiYXNlXHJcbiAgICAgIGlmKHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAgIC8vIFNlZSBpZiB0aGVyZSBpcyBhbnkgc2VsZWN0ZWQgYmFzZSBhbmQgaXQgaXNuJ3QgdGhlIG9uZSB0ZXN0ZWRcclxuICAgICAgICBpZih0aGlzLnNlbGVjdGVkX2Jhc2UgJiYgdGhpcy5zZWxlY3RlZF9iYXNlICE9PSBiKXtcclxuICAgICAgICAgIC8vIFNldCB0aGUgYmFzZSBhcyB0YXJnZXRlZCBhbmQgdHJ5IHRvIHNlbmRcclxuICAgICAgICAgIEdBTUUudHJ5U2VuZE1pbmlvbihiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBiYXNlIGJlbG9ucyB0byAnbWUnXHJcbiAgICAgICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT09IC0xKXtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBiYXNlIGFzIGhvdmVyZWRcclxuICAgICAgICAgICAgYi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHRoaXMubWUuYmFzZXNfaWQuaW5kZXhPZihiLmlkKSAhPSAtMSl7XHJcbiAgICAgICAgaWYoIWIuc2VsZWN0ZWQgJiYgcG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XHJcbiAgICAgICAgICBiLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIC8vLy8vLy8vL1xyXG4gICAgICAvLyBPTEQgLy9cclxuICAgICAgLy8vLy8vLy8vXHJcbiAgICAgIC8vIGlmKCFiLnNlbGVjdGVkICYmIHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAvLyAgICAgaWYodGhpcy5zZWxlY3RlZF9iYXNlKXtcclxuICAgICAgLy8gICAgICAgICBiLnRhcmdldGVkID0gdHJ1ZTtcclxuICAgICAgLy8gICAgICAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSBiO1xyXG5cclxuICAgICAgLy8gICAgICAgICBpZih0aGlzLnNlbGVjdGVkX2Jhc2Uuc3Bhd25fZGVsYXkgPD0gMC4wKXtcclxuICAgICAgLy8gICAgICAgICAgICAgLy8gU2VuZCB0byBzZXJ2ZXJcclxuICAgICAgLy8gICAgICAgICAgICAgTkVULnNvY2tldC5lbWl0KCdwLm1pbmlvbicsIHtcclxuICAgICAgLy8gICAgICAgICAgICAgICAgIHNvdXJjZV9pZDogdGhpcy5zZWxlY3RlZF9iYXNlLnBsYXllcl9pZCxcclxuICAgICAgLy8gICAgICAgICAgICAgICAgIHRhcmdldF9pZDogdGhpcy50YXJnZXRlZF9iYXNlLnBsYXllcl9pZFxyXG4gICAgICAvLyAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgIC8vICAgICAgICAgICAgIC8vIHRoaXMubWluaW9ucy5wdXNoKFxyXG4gICAgICAvLyAgICAgICAgICAgICAvLyAgICAgbmV3IE1pbmlvbih0aGlzLnNlbGVjdGVkX2Jhc2UsIHRoaXMudGFyZ2V0ZWRfYmFzZSlcclxuICAgICAgLy8gICAgICAgICAgICAgLy8gICAgICk7XHJcblxyXG4gICAgICAvLyAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2Jhc2Uuc3Bhd25fZGVsYXkgPSB0aGlzLnNlbGVjdGVkX2Jhc2Uuc3Bhd25fZGVsYXlfbWF4O1xyXG4gICAgICAvLyAgICAgICAgIH1cclxuICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vICAgICAgICAgYi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgLy8gICAgICAgICB0aGlzLmhvdmVyZWRfYmFzZSA9IGI7XHJcbiAgICAgIC8vICAgICB9XHJcbiAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIFVwZGF0ZSBtaW5pb25zXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMubWluaW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIG0gPSB0aGlzLm1pbmlvbnNbaV07XHJcbiAgICAgIGlmKG0uYWN0aXZlKXtcclxuICAgICAgICBtLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgICAgaWYoIW0uYWN0aXZlKXtcclxuICAgICAgICAgIFNPVU5ELnBsYXlSYW5kb21Tb3VuZCgpO1xyXG5cclxuICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2goXHJcbiAgICAgICAgICAgIG5ldyBQYXJ0aWNsZShtLnRhcmdldF9iYXNlLmxlZnQsIG0udGFyZ2V0X2Jhc2UudG9wLCBtLnRhcmdldF9iYXNlLnNjYWxlLCBtLnNvdXJjZV9iYXNlLmNvbG9yKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZihtLmRlYWRfYnlfc2VydmVyICYmICFtLmFjdGl2ZSl7XHJcbiAgICAgICAgdGhpcy5taW5pb25zLnNwbGljZShpLS0sIDEpO1xyXG4gICAgICAgIC0tbGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHBhdGljbGVzXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgcCA9IHRoaXMucGFydGljbGVzW2ldO1xyXG4gICAgICBwLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgIGlmKCFwLmFjdGl2ZSl7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGktLSwgMSk7XHJcbiAgICAgICAgLS1sZW47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgRFJBVyB9XHJcbiAgICogRHJhdyB0aGUgc2NlbmVcclxuICAgKi9cclxuICBHQU1FLmRyYXcgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGksIGxlbiwgYiwgbSwgeCwgeTtcclxuXHJcbiAgICBHQU1FLmN0eC5jbGVhclJlY3QoMCwgMCwgR0FNRS53aWR0aCwgR0FNRS5oZWlnaHQpO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gRHJhdyBtaW5pb25zIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5taW5pb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgbSA9IHRoaXMubWluaW9uc1tpXTtcclxuICAgICAgaWYobS5hY3RpdmUpXHJcbiAgICAgICAgbS5kcmF3KHRoaXMuY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERyYXcgbGluZSAvL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBpZih0aGlzLnNlbGVjdGVkX2Jhc2Upe1xyXG4gICAgICBiID0gdGhpcy5zZWxlY3RlZF9iYXNlO1xyXG4gICAgICBpZih0aGlzLnRhcmdldGVkX2Jhc2Upe1xyXG4gICAgICAgIHggPSB0aGlzLnRhcmdldGVkX2Jhc2UueDtcclxuICAgICAgICB5ID0gdGhpcy50YXJnZXRlZF9iYXNlLnk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgeCA9IFRPVUNILng7XHJcbiAgICAgICAgeSA9IFRPVUNILnk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIEdBTUUuY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgIEdBTUUuY3R4Lmdsb2JhbEFscGhhID0gMC4zO1xyXG4gICAgICB2YXIgbGluZV9zaXplID0gNTtcclxuICAgICAgdmFyIGNvbG9yID0gR0FNRS5tZS5jb2xvciB8fCAnI0FBQScgO1xyXG4gICAgICBkcmF3TGluZShHQU1FLmN0eCwgYi54LCBiLnksIHgsIHksIGNvbG9yLCBsaW5lX3NpemUpO1xyXG4gICAgICBkcmF3Q2lyY2xlKEdBTUUuY3R4LCB4LCB5LCBsaW5lX3NpemUgLyAyLCBjb2xvcik7XHJcblxyXG4gICAgICBHQU1FLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gRHJhdyBiYXNlcyAvL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLmJhc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgdGhpcy5iYXNlc1tpXS5kcmF3KHRoaXMuY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gRFJBVyBQQVJUSUNMRVMgLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uZHJhdyh0aGlzLmN0eCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERSQVcgU0NPUkUgLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIEdBTUUuZHJhd1Njb3JlQmFyKCk7XHJcbiAgfTtcclxuICBHQU1FLnNlbmQgPSBmdW5jdGlvbihtc2csIGRhdGEpe1xyXG4gICAgTkVULnNlbmQobXNnLCBkYXRhKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgRFJBVyBTQ09SRSB9XHJcbiAgICogRHJhdyBhIHNjb3JlIGJhclxyXG4gICAqIE5lZWRzIHRvIGJlIHR1bmVkIGZvciBzb21lIHBlcmZvcm1hbmNlIHByb2JhYmx5XHJcbiAgICogICAgIE9ubHkgdXBkYXRlIHdoZW4gc2NvcmUgaGFzIHVwZGF0ZWRcclxuICAgKi9cclxuICBHQU1FLmRyYXdTY29yZUJhciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgeCwgeSwgdywgaCwgaSwgbGVuLCByLCB0b3RhbCwgYSwgeHQsIHd0LCB0ZXh0O1xyXG5cclxuICAgIEdBTUUuY3R4LnNhdmUoKTtcclxuXHJcbiAgICB3ID0gR0FNRS53aWR0aCAvIDEuNTtcclxuICAgIGggPSBHQU1FLmhlaWdodCAvIDIwO1xyXG4gICAgeCA9IChHQU1FLndpZHRoIC8gMikgLSAodyAvIDIpO1xyXG4gICAgeSA9IChHQU1FLmhlaWdodCAvIDIwKSAtIChoIC8gMik7XHJcblxyXG4gICAgciA9IFtdO1xyXG4gICAgdG90YWwgPSAwO1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBHQU1FLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICByW2ldID0gR0FNRS5wbGF5ZXJzW2ldLnRvdGFsUmVzb3VyY2VzKCk7XHJcbiAgICAgIHRvdGFsICs9IHJbaV07XHJcbiAgICB9XHJcblxyXG4gICAgeHQgPSB4O1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBHQU1FLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBHQU1FLmN0eC5maWxsU3R5bGUgPSBHQU1FLnBsYXllcnNbaV0uY29sb3I7XHJcbiAgICAgIHd0ID0gKHJbaV0gLyB0b3RhbCkgKiB3O1xyXG4gICAgICBHQU1FLmN0eC5maWxsUmVjdChcclxuICAgICAgICB4dCxcclxuICAgICAgICB5LFxyXG4gICAgICAgIHd0LFxyXG4gICAgICAgIGhcclxuICAgICAgKTtcclxuICAgICAgdGV4dCA9IEdBTUUucGxheWVyc1tpXS5uYW1lICsgJyAtICcgKyByW2ldO1xyXG4gICAgICBHQU1FLmN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgICBHQU1FLmN0eC5maWxsVGV4dCh0ZXh0LCB4dCArICh3dC8yKSAtIChHQU1FLmN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aC8yKSwgeSsoaC8yKSk7XHJcblxyXG4gICAgICB4dCArPSB3dDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgR0FNRS5jdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgR0FNRS5jdHguc3Ryb2tlUmVjdCh4LCB5LCB3LCBoKTtcclxuXHJcbiAgICBHQU1FLmN0eC5yZXN0b3JlKCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IFNUQVJUIFRPVUNIIH1cclxuICAgKi9cclxuICBHQU1FLnN0YXJ0VG91Y2ggPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGksIGIsIGxlbjtcclxuXHJcbiAgICAvLyBUZXN0IGNvbGxpc2lvbiBhZ2FpbnN0IGFsbFxyXG4gICAgLy8gZm9yKGkgPSAwOyBpIDwgdGhpcy5iYXNlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAvLyAgICAgYiA9IHRoaXMuYmFzZXNbaV07XHJcblxyXG4gICAgLy8gICAgIGlmKHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgLy8gICAgICAgICBiLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgIC8vICAgICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlID0gYjtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgaWYoIUdBTUUubWUpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IEdBTUUubWUuYmFzZXNfaWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBiID0gR0FNRS5iYXNlc1tHQU1FLmJhc2VzLmluZGV4QnlJRChHQU1FLm1lLmJhc2VzX2lkW2ldKV07XHJcblxyXG4gICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgICBiLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBiO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vLy8vL1xyXG4gICAgLy8gT0xEIC8vXHJcbiAgICAvLy8vLy8vLy9cclxuICAgIC8vIC8vIFRlc3QganVzdCBhZ2FpbnN0IFttZV1cclxuICAgIC8vIGlmKHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgR0FNRS5tZS54LCBHQU1FLm1lLnksIEdBTUUubWUuc2l6ZSkpe1xyXG4gICAgLy8gICAgIEdBTUUubWUuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgLy8gICAgIEdBTUUuc2VsZWN0ZWRfYmFzZSA9IEdBTUUubWU7XHJcbiAgICAvLyB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IEVORCBUT1VDSCB9XHJcbiAgICovXHJcbiAgR0FNRS5lbmRUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBpZihHQU1FLnNlbGVjdGVkX2Jhc2Upe1xyXG4gICAgICAvLyBBZGQgbmV3IG1pbmlvblxyXG4gICAgICBpZihHQU1FLnRhcmdldGVkX2Jhc2Upe1xyXG5cclxuICAgICAgfVxyXG4gICAgICBHQU1FLnNlbGVjdGVkX2Jhc2Uuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlID0gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgU0VORCBNSU5JT04gfVxyXG4gICAqIFRyaWVzIHRvIHNlbmQgYSBtaW5pb25cclxuICAgKi9cclxuICBHQU1FLnRyeVNlbmRNaW5pb24gPSBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgdGFyZ2V0LnRhcmdldGVkID0gdHJ1ZTtcclxuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IHRhcmdldDtcclxuXHJcbiAgICAvLyBDYWxsICdjYW5TZW5kTWluaW9uJyBvbiBzZWxlY3RlZF9iYXNlXHJcbiAgICAvLyBbQ0hBTkdFRF0gQWxsd2F5cyBhc2sgc2VydmVyIHRvIHNlbmRcclxuICAgIGlmKEdBTUUuc2VsZWN0ZWRfYmFzZS5jYW5TZW5kTWluaW9uKCkgfHwgdHJ1ZSl7XHJcbiAgICAgIEdBTUUuc2VuZCgnQkFTRS5taW5pb24nLCB7XHJcbiAgICAgICAgc291cmNlX2lkOiB0aGlzLnNlbGVjdGVkX2Jhc2UuaWQsXHJcbiAgICAgICAgdGFyZ2V0X2lkOiB0YXJnZXQuaWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbn0iLCJcclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lJ1xyXG5cclxudmFyIGdhbWUgPSB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCkuaW5pdCgpOyIsIlxyXG5cclxubGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pOb3cgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc05vdyB8fFxyXG4gICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvdW5kIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmN0eCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xyXG4gICAgdGhpcy5zb3VuZF9uYW1lcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBpZiAoIXdpbmRvdy5BdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhyb3cgXCJBdWRpb0NvbnRleHQgbm90IHN1cHBvcnRlZCBieSBicm93c2VyXCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuXHJcbiAgaW5pdFNvdW5kcygpIHsgIFxyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzQud2F2JywgJ2M0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9kNC53YXYnLCAnZDQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2U0LndhdicsICdlNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZjQud2F2JywgJ2Y0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9nNC53YXYnLCAnZzQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2E0LndhdicsICdhNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYjQud2F2JywgJ2I0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9jNS53YXYnLCAnYzUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Q1LndhdicsICdkNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTUud2F2JywgJ2U1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9mNS53YXYnLCAnZjUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2c1LndhdicsICdnNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTUud2F2JywgJ2E1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9iNS53YXYnLCAnYjUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2M2LndhdicsICdjNicpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDYud2F2JywgJ2Q2Jyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgbG9hZFNvdW5kKHVybCwgbmFtZSkge1xyXG4gICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcbiAgICBcclxuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY3R4LmRlY29kZUF1ZGlvRGF0YSh4aHIucmVzcG9uc2UsIChidWZmZXIpID0+IHtcclxuICAgICAgICB0aGlzLnNvdW5kX25hbWVzLnB1c2gobmFtZSk7XHJcbiAgICAgICAgdGhpcy5zb3VuZHNbbmFtZV0gPSBidWZmZXI7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc3RhcnR1cF9ldmVudCA9PT0gbnVsbCl7XHJcbiAgICAgICAgICB0aGlzLnN0YXJ0dXBfZXZlbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheVJhbmRvbVNvdW5kKCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnN0YXJ0dXBfZXZlbnQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB4aHIub3BlbignR0VUJywgdXJsKTtcclxuICAgIHhoci5zZW5kKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcGxheVNvdW5kKG5hbWUpIHtcclxuICAgIGlmICghdGhpcy5zb3VuZHNbbmFtZV0pIHJldHVybjtcclxuXHJcbiAgICBsZXQgc291bmQgPSB0aGlzLnR4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgc291bmQuYnVmZmVyID0gdGhpcy5zb3VuZHNbbmFtZV07XHJcblxyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmNyZWF0ZUdhaW5Ob2RlKDAuOCwgMC4wLCAwLjQpO1xyXG5cclxuICAgIHNvdW5kLmNvbm5lY3QoZ2Fpbik7XHJcbiAgICBnYWluLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xyXG5cclxuICAgIHNvdW5kLm5vdGVPbigwKTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUdhaW5Ob2RlKHN0YXJ0LCBlbmQsIHRpbWUpIHtcclxuICAgIGxldCBub2RlID0gdGhpcy5jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgbGV0IG5vdyA9IHRoaXMuY3R4LmN1cnJlbnRUaW1lO1xyXG5cclxuICAgIG5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShzdGFydCwgbm93KTtcclxuICAgIG5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShlbmQsIG5vdyArIHRpbWUpO1xyXG5cclxuICAgIHJldHVybiBnYWluO1xyXG4gIH1cclxuXHJcbiAgcGxheVJhbmRvbVNvdW5kKCkge1xyXG4gICAgdGhpcy5wbGF5U291bmQodGhpcy5zb3VuZF9uYW1lc1tyYW5kb21SYW5nZUludCgwLCB0aGlzLnNvdW5kX25hbWVzLmxlbmd0aCldKTtcclxuICB9XHJcbn0iXX0=
