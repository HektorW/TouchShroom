(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _utilPrefixer = require("./util/prefixer");

var requestAnimationFrame = _utilPrefixer.requestAnimationFrame;
var cancelAnimationFrame = _utilPrefixer.cancelAnimationFrame;
var performance = _utilPrefixer.performance;

var _utilDraw = require("./util/draw");

var drawLine = _utilDraw.drawLine;
var drawCircle = _utilDraw.drawCircle;

var SoundManager = _interopRequire(require("./soundmanager"));

var InputManager = _interopRequire(require("./inputmanager"));

var NetworkManager = _interopRequire(require("./networkmanager"));

var Particle = _interopRequire(require("./objects/particle"));

var Player = _interopRequire(require("./objects/player"));

var Base = _interopRequire(require("./objects/base"));

var Minion = _interopRequire(require("./objects/minion"));

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
        this.soundManager = new SoundManager().init();
        this.networkManager = new NetworkManager().init();
        this.inputManager = new InputManager(this).init();

        this.canvas = document.querySelector("#canvas");
        this.ctx = this.canvas.getContext("2d");

        this.bindFunctions();
        this.initEvents();
        this.setupWierdArrayFunctions();

        this.resize();

        return this;
      }
    },
    bindFunctions: {
      value: function bindFunctions() {
        this.loop = this.loop.bind(this);
      }
    },
    initEvents: {
      value: function initEvents() {
        window.addEventListener("resize", this.resize.bind(this), false);
      }
    },
    setupWierdArrayFunctions: {
      value: function setupWierdArrayFunctions() {
        this.players.findBy = function (prop, value) {
          for (var i = this.length; i--;) {
            if (this[i][prop] === value) return this[i];
          }
        };

        this.players.byID = function (id) {
          for (var i = this.length; i--;) {
            if (this[i].id === id) return this[i];
          }
        };

        // Add method to base list
        this.bases.indexByID = function (id) {
          for (var i = this.length; i--;) {
            if (this[i].id === id) return i;
          }
        };

        this.bases.byID = function (id) {
          for (var i = this.length; i--;) {
            if (this[i].id === id) return this[i];
          }
        };

        // MINION
        this.minions.byID = function (id) {
          for (var i = this.length; i--;) {
            if (this[i].id === id) return this[i];
          }
        };
      }
    },
    setup: {
      value: function setup(data) {
        var _this = this;

        var lvl_name = data.level_name;
        var my_id = data.my_id;
        var players = data.players;

        // timed('Level: ' + lvl_name);

        for (var i = 0, len = data.bases.length; i < len; i++) {
          var b = data.bases[i];
          this.bases.push(new Base(this, b.id, b.left, b.top, b.scale, b.resources, b.resources_max));
        }
        for (var i = 0, len = players.length; i < len; i++) {
          (function (i, len) {
            var playerData = players[i];

            var player = new Player(_this, playerData.id, playerData.name, playerData.color);

            var startStates = data.start_state[i];
            startStates.forEach(function (i) {
              return _this.bases[i].setPlayer(player);
            });

            _this.players.push(player);

            if (playerData.id === my_id) {
              _this.me = player;
            }
          })(i, len);
        }

        this.send("PLAYER.ready");
      }
    },
    start: {
      value: function start() {
        this.now = this.last_time = performance.now();
        this.animationFrame = requestAnimationFrame(this.loop);
      }
    },
    end: {
      value: function end() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        // CLEAN UP GAME
        this.bases.length = 0;
        this.players.length = 0;
        this.me = null;
        this.minions.length = 0;
        this.particles.length = 0;

        // Temporary solution to hide overlay and go back to START
        setTimeout(function () {}, 3000);
      }
    },
    loop: {
      value: function loop() {
        requestAnimationFrame(this.loop);

        if (this.draw_time) this.draw_time = time - this.draw_time;

        this.now = time;
        var elapsed = (time - this.last_time) / 1000;
        this.last_time = time;

        this.update_time = time;
        this.update(elapsed);
        this.update_time = performance.now() - this.update_time;

        this.draw_time = performance.now();
        this.draw();
      }
    },
    update: {
      value: function update(time) {
        this.inputManager.update(time);
      }
    },
    draw: {
      value: function draw() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        for (var i = 0, len = this.minions.length; i < len; i++) {
          var m = this.minions[i];
          if (m.active) m.draw(ctx);
        }

        ///////////////
        // Draw line //
        ///////////////
        if (this.selected_base) {
          var b = this.selected_base;

          var x = undefined,
              y = undefined;
          if (this.targeted_base) {
            x = this.targeted_base.x;
            y = this.targeted_base.y;
          } else {
            x = this.inputManager.pointer.x;
            y = this.inputManager.pointer.y;
          }

          ctx.save();

          ctx.globalAlpha = 0.3;
          var line_size = 5;
          var color = this.me.color || "#AAA";
          drawLine(ctx, b.x, b.y, x, y, color, line_size);
          drawCircle(ctx, x, y, line_size / 2, color);

          ctx.restore();
        }

        for (var i = 0, len = this.bases.length; i < len; i++) {
          this.bases[i].draw(ctx);
        }

        for (var i = 0, len = this.particles.length; i < len; i++) {
          this.particles[i].draw(ctx);
        }

        this.drawScoreBar(ctx);
      }
    },
    drawScoreBar: {
      value: function drawScoreBar(ctx) {
        ctx.save();

        var w = width / 1.5;
        var h = height / 20;
        var x = width / 2 - w / 2;
        var y = height / 20 - h / 2;

        var r = [];
        var total = 0;
        for (var i = 0, len = this.players.length; i < len; i++) {
          r[i] = this.players[i].totalResources();
          total += r[i];
        }

        var xt = x;
        for (var i = 0, len = this.players.length; i < len; i++) {
          ctx.fillStyle = this.players[i].color;
          var wt = r[i] / total * w;
          ctx.fillRect(xt, y, wt, h);
          var text = this.players[i].name + " - " + r[i];
          ctx.fillStyle = "black";
          ctx.fillText(text, xt + wt / 2 - ctx.measureText(text).width / 2, y + h / 2);

          xt += wt;
        }

        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, w, h);

        ctx.restore();
      }
    },
    resize: {
      value: function resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;

        this.bases.forEach(function (e) {
          return e.resize();
        });
        this.minions.forEach(function (e) {
          return e.resize();
        });
        this.particles.forEach(function (e) {
          return e.resize();
        });
      }
    },
    trySendMinion: {
      value: function trySendMinion(target) {
        target.targeted = true;
        this.targeted_base = target;

        // Call 'canSendMinion' on selected_base
        // [CHANGED] Allways ask server to send
        if (this.selected_base.canSendMinion() || true) {
          this.networkManager.send("BASE.minion", {
            source_id: this.selected_base.id,
            target_id: target.id
          });
        }
      }
    },
    getByID: {
      value: function getByID(list, id) {
        for (var i = list.length; i--;) {
          var item = list[i];
          if (item && item.id == id) {
            return item;
          }
        }
      }
    }
  });

  return Game;
})();

module.exports = Game;

function heheScopeAwaySillyImplementation() {

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

  GAME.send = function (msg, data) {
    NET.send(msg, data);
  };

  /**
   * { START TOUCH }
   */
  GAME.startTouch = function () {
    var i, b, len;

    if (!GAME.me) return;

    for (i = 0, len = GAME.me.bases_id.length; i < len; i++) {
      b = GAME.bases[GAME.bases.indexByID(GAME.me.bases_id[i])];

      if (pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)) {
        b.selected = true;
        GAME.selected_base = b;
        break;
      }
    }
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
}

// CONTROLLER.overlayHide();
// CONTROLLER.setScreen('start');

},{"./inputmanager":2,"./networkmanager":4,"./objects/base":5,"./objects/minion":6,"./objects/particle":7,"./objects/player":8,"./soundmanager":9,"./util/draw":11,"./util/prefixer":13}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var InputManager = (function (_EventEmitter) {
  function InputManager(game) {
    _classCallCheck(this, InputManager);

    this.game = game;

    this.pointer = {
      x: 0,
      y: 0,
      down: false,
      timeDown: 0
    };
    this.lastPointer = Object.assign({}, this.pointer);
  }

  _inherits(InputManager, _EventEmitter);

  _createClass(InputManager, {
    init: {
      value: function init() {
        this.initEvents();

        return this;
      }
    },
    initEvents: {
      value: function initEvents() {
        window.addEventListener("mousemove", this.updatePosition.bind(this), false);
        window.addEventListener("mousedown", this.onPointerDown.bind(this), false);
        window.addEventListener("mouseup", this.onPointerUp.bind(this), false);

        window.addEventListener("touchmove", this.updatePosition.bind(this), false);
        window.addEventListener("touchstart", this.onPointerDown.bind(this), false);
        window.addEventListener("touchend", this.onPointerUp.bind(this), false);
      }
    },
    update: {
      value: function update(time) {
        this.lastPointer = Object.assign({}, this.pointer);

        if (this.pointer.down) {
          this.pointer.timeDown += time;
        } else {
          this.pointer.timeDown = 0;
        }
      }
    },
    getState: {
      value: function getState() {
        return {
          x: this.pointer.x,
          y: this.pointer.y,
          down: this.pointer.down
        };
      }
    },
    translateEventCoordinates: {
      value: function translateEventCoordinates(event) {
        if (event.changedTouches) {
          return [event.changedTouches[0].pageX, event.changedTouches[0].pageY];
        }
      }
    },
    updatePosition: {
      value: function updatePosition(event) {
        event.preventDefault();

        var _translateEventCoordinates = this.translateEventCoordinates(event);

        var _translateEventCoordinates2 = _slicedToArray(_translateEventCoordinates, 2);

        var pageX = _translateEventCoordinates2[0];
        var pageY = _translateEventCoordinates2[1];
        var _ref = [pageX, pageY];

        var _ref2 = _slicedToArray(_ref, 2);

        this.pointer.x = _ref2[0];
        this.pointer.y = _ref2[1];
      }
    },
    onPointerDown: {
      value: function onPointerDown(event) {
        this.updatePosition(event);
        this.pointer.down = true;
      }
    },
    onPointerUp: {
      value: function onPointerUp(event) {
        this.updatePosition(event);
        this.pointer.down = false;
        this.trigger("pointer.up");
      }
    }
  });

  return InputManager;
})(EventEmitter);

module.exports = InputManager;

},{"events":20}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// includes some browser polyfills
require("babelify/polyfill");

var Game = _interopRequire(require("./game"));

var game = window.game = new Game().init();

},{"./game":1,"babelify/polyfill":19}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// temp
function timed() {
  console.log(arguments[0]);
}

var NetworkManager = (function () {
  function NetworkManager(controller, game) {
    _classCallCheck(this, NetworkManager);

    this.controller = controller;
    this.game = game;

    this.socket = null;
    this.connected = false;
  }

  _createClass(NetworkManager, {
    init: {
      value: function init() {
        this.connect();
        this.setupSocketEventHandlers();
      }
    },
    connect: {
      value: function connect() {
        this.socket = io.connect(":8888", {
          reconnect: true
        });
      }
    },
    setupSocketEventHandlers: {
      value: function setupSocketEventHandlers() {
        var socket = this.socket;

        socket.on("error", this.onSocketError.bind(this));
        socket.on("connect", this.onSocketConnect.bind(this));
        socket.on("disconnect", this.onSocketDisconnect.bind(this));

        socket.on("SERVER.yourname", this.onServerYourname.bind(this));
        socket.on("SERVER.num_players", this.onServerNumPlayers.bind(this));
        socket.on("SERVER.initgame", this.onServerInitgame.bind(this));

        socket.on("GAME.setup", this.onGameSetup.bind(this));
        socket.on("GAME.start", this.onGameStart.bind(this));
        socket.on("GAME.end", this.onGameEnd.bind(this));
        socket.on("GAME.disconnection", this.onGameDisconnection.bind(this));
        socket.on("GAME.minion", this.onGameMinion.bind(this));

        socket.on("MINION.hit", this.onMinionHit.bind(this));

        socket.on("BASE.resources", this.onBaseResources.bind(thits));

        socket.on("my player", this.onMyPlayer.bind(this));
      }
    },
    send: {
      value: function send(msg, data) {
        this.socket.emit(msg, data);
      }
    },
    onSocketError: {
      value: function onSocketError() {
        if (!this.connected) {
          this.controller.noconnect();
        }
      }
    },
    onSocketConnect: {
      value: function onSocketConnect() {
        this.connected = true;
        this.controller.connected();
      }
    },
    onSocketDisconnect: {
      value: function onSocketDisconnect() {
        this.conected = false;
        this.controller.disconnected();
      }
    },
    onServerYourname: {
      value: function onServerYourname(data) {
        timed("You shall be known as '" + data.name + "'");
      }
    },
    onServerNumPlayers: {
      value: function onServerNumPlayers(data) {
        timed("Players online: " + data.num_players);
      }
    },
    onServerInitgame: {
      value: function onServerInitgame() {
        this.controller.startgame();
      }
    },
    onGameSetup: {
      value: function onGameSetup(data) {
        this.game.setup(data);
      }
    },
    onGameStart: {
      value: function onGameStart() {
        this.game.start();
      }
    },
    onGameEnd: {
      value: function onGameEnd() {
        this.game.end();
      }
    },
    onGameDisconnection: {
      value: function onGameDisconnection(data) {
        this.game.disconnection(data);
      }
    },
    onGameMinion: {
      value: function onGameMinion(data) {
        this.game.newMinion(data);
      }
    },
    onMinionHit: {
      value: function onMinionHit(data) {
        this.game.minionHit(data);
      }
    },
    onBaseResources: {
      value: function onBaseResources(data) {
        this.game.baseResources(data);
      }
    },
    onMyPlayer: {
      value: function onMyPlayer(data) {
        this.game.me = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
        this.game.me.player_id = data.player.player_id;
        this.game.bases.push(this.game.me);
      }
    }
  });

  return NetworkManager;
})();

module.exports = NetworkManager;

/** { INIT }
 *
 */
NET.init = function () {

  this.socket.on("g.players", function (data) {
    var i, b, len;
    var p = data.players;
    for (i = 0, len = p.length; i < len; i++) {
      var index = GAME.bases.indexByID(p[i].player_id);

      // If player is not in game -> Add
      if (index === undefined) {
        b = new Base(p[i].aspect_left, p[i].aspect_top, p[i].aspect_size, p[i].color);
        b.player_id = p[i].player_id;
        GAME.bases.push(b);
      }
      // Else set values correct
      else {
        b = GAME.bases[index];
        b.aspect_left = p[i].aspect_left;
        b.aspect_top = p[i].aspect_top;
        b.aspect_size = p[i].aspect_size;
        b.color = p[i].color;
      }
    }

    // Call resize to fix aspects
    GAME.resize();
  });

  this.socket.on("p.connection", function (data) {
    if (data.player.player_id !== GAME.me.player_id) {
      var b = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
      b.player_id = data.player.player_id;
      GAME.bases.push(b);
    }
  });
  this.socket.on("p.disconnection", function (data) {
    var i = GAME.bases.indexByID(data.player_id);
    if (i !== undefined) {
      GAME.bases.splice(i, 1);
    }
  });

  this.socket.on("b.minion", function (data) {
    var source_index = GAME.bases.indexByID(data.source_id);
    var target_index = GAME.bases.indexByID(data.target_id);

    if (source_index !== undefined && target_index !== undefined) {
      GAME.minions.push(new Minion(GAME.bases[source_index], GAME.bases[target_index]));
    }
  });
};

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var drawCircle = require("../util/draw").drawCircle;

var Base = (function () {
  function Base(game, id, left, top, scale, resources, resources_max) {
    _classCallCheck(this, Base);

    this.game = game;
    this.id = id;

    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.1;
    this.shadow_size = 30;

    this.color = "#AAAAAA";

    this.selected = false;
    this.hovered = false;
    this.targeted = false;

    this.spawn_delay = 0;
    this.spawn_delay_max = 0.5;

    this.resources = resources || 0;
    this.resources_max = resources_max;

    this.player = null;

    this.resize();
  }

  _createClass(Base, {
    update: {
      value: function update(time) {
        if (this.spawn_delay > 0) this.spawn_delay -= time;
      }
    },
    draw: {
      value: function draw(ctx) {
        ctx.save();

        if (this.hovered) {
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 10;
        } else if (this.selected) {
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 20;
        }

        drawCircle(ctx, this.x, this.y, this.size, this.color, "fill");

        // Draw text
        ctx.fillStyle = "black";
        var text = this.resources + (this.player ? "/" + this.resources_max : "");
        var m = ctx.measureText(text);
        ctx.fillText(text, this.x - m.width / 2, this.y);

        ctx.restore();
      }
    },
    resize: {
      value: function resize() {
        if (this.game.width > this.game.height) {
          this.x = this.game.width * this.left;
          this.y = this.game.height * this.top;
          this.size = this.game.height * this.scale;
        } else {
          this.x = this.game.width - this.game.width * this.top;
          this.y = this.game.height * this.left;
          this.size = this.game.width * this.scale;
        }
      }
    },
    setPlayer: {
      value: function setPlayer(player) {
        if (this.player) {
          this.player.removeBase(this);
        }

        this.color = player.color;
        this.player = player;
        this.player.addBase(this);
      }
    },
    canSendMinion: {
      value: function canSendMinion() {
        return this.spawn_delay <= 0;
      }
    },
    sendMinion: {
      value: function sendMinion() {
        this.spawn_delay = this.spawn_delay_max;
        --this.resources;
      }
    }
  });

  return Base;
})();

module.exports = Base;

},{"../util/draw":11}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _utilMath = require("../util/math");

var pointInCircle = _utilMath.pointInCircle;
var vecDistance = _utilMath.vecDistance;

var Minion = (function () {
  function Minion(id, source, target, scale) {
    _classCallCheck(this, Minion);

    this.id = id;

    this.source_base = source;
    this.target_base = target;

    this.x = this.source_base.x;
    this.y = this.source_base.y;
    this.scale = scale || 0.01;
    this.size = 10;
    this.color = this.source_base.color;

    this.active = true;
    this.dead_by_server = false;

    this.start_time = window.performance.now();
    this.active_time = 0;

    this.speed = 3;

    this.resize();
  }

  _createClass(Minion, {
    update: {
      value: function update(time) {
        this.active_time += t;

        this.x = this.source_base.x + this.vel_x * this.active_time;
        this.y = this.source_base.y + this.vel_y * this.active_time;

        if (pointInCircle(this.x, this.y, this.target_base.x, this.target_base.y, this.target_base.size)) {
          this.active = false;
        }
      }
    },
    draw: {
      value: function draw(ctx) {
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
        ctx.fill();
      }
    },
    resize: {
      value: function resize() {
        var delta_speed = (GAME.width > GAME.height ? GAME.width : GAME.height) / this.speed;

        var distance = vecDistance(this.source_base.x, this.source_base.y, this.target_base.x, this.target_base.y);
        var distance_x = this.target_base.x - this.source_base.x;
        var distance_y = this.target_base.y - this.source_base.y;

        this.vel_x = distance_x / Math.abs(distance / delta_speed) || 0;
        this.vel_y = distance_y / Math.abs(distance / delta_speed) || 0;

        this.size = (GAME.width > GAME.height ? GAME.height : GAME.width) * this.scale;
      }
    }
  });

  return Minion;
})();

module.exports = Minion;

},{"../util/math":12}],7:[function(require,module,exports){
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var hexcolorToRGB = require("../util/color").hexcolorToRGB;

var Particle = (function () {
  function Particle() {
    _classCallCheck(this, Particle);
  }

  _createClass(Particle, {
    constuctor: {
      value: function constuctor(game, left, top, scale, color) {
        this.game = game;

        this.x = -1;
        this.y = -1;
        this.size = -1;

        this.left = left;
        this.top = top;
        this.scale = scale || 0.01;

        this.color = color || "#AAAAAA";
        this.rgba = hexcolorToRGB(this.color);
        this.rgba[3] = 1;

        this.active = true;
        this.live_count = 0;

        this.resize();
      }
    },
    update: {
      value: function update(time) {
        this.live_count += time;
        this.rgba[3] -= time * 0.5;

        if (this.rgba[3] < 0) this.active = false;
      }
    },
    draw: {
      value: function draw(ctx) {
        ctx.save();

        var _rgba = _slicedToArray(this.rgba, 4);

        var r = _rgba[0];
        var g = _rgba[1];
        var b = _rgba[2];
        var a = _rgba[3];

        ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + this.live_count * 10, Math.PI * 2, false);
        ctx.stroke();

        ctx.restore();
      }
    },
    resize: {
      value: function resize() {
        if (this.game.width > this.game.height) {
          this.x = this.game.width * this.left;
          this.y = this.game.height * this.top;
          this.size = this.game.height * this.scale;
        } else {
          this.x = this.game.width - this.game.width * this.top;
          this.y = this.game.height * this.left;
          this.size = this.game.width * this.scale;
        }
      }
    }
  });

  return Particle;
})();

module.exports = Particle;

},{"../util/color":10}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Player = (function () {
  function Player(game, id, name, color) {
    _classCallCheck(this, Player);

    this.game = game;

    this.id = id;
    this.name = name;
    this.color = color;

    this.bases_id = [];
  }

  _createClass(Player, {
    addBase: {
      value: function addBase(base) {
        if (!this.bases_id.contains(base.id)) this.bases_id.push(base.id);
      }
    },
    removeBase: {
      value: function removeBase(base) {
        var i = this.bases_id.indexOf(base.id);
        if (i !== -1) this.bases_id.splice(i, 1);
      }
    },
    totalResources: {
      value: function totalResources() {
        var total = 0;

        for (var i = this.bases_id.length; i--;) {
          var base = this.game.getByID(this.game.bases, this.bases_id[i]);
          total += base.resources;
        }
        return total;
      }
    }
  });

  return Player;
})();

module.exports = Player;

},{}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var randomRangeInt = require("./util/util.js").randomRangeInt;

var AudioContext = require("./util/prefixer.js").AudioContext;

var SoundManager = (function () {
  function SoundManager() {
    _classCallCheck(this, SoundManager);

    this.ctx = null;
    this.sounds = [];
    this.sound_names = [];
    this.startup_event = null;
  }

  _createClass(SoundManager, {
    init: {
      value: function init() {
        if (!AudioContext) {
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

            if ("touchstart" in window && _this.startup_event === null) {
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
        }var sound = this.ctx.createBufferSource();
        sound.buffer = this.sounds[name];

        var gain = this.createGainNode(0.8, 0, 0.4);

        sound.connect(gain);
        gain.connect(this.ctx.destination);

        sound.start(0);
      }
    },
    createGainNode: {
      value: function createGainNode(start, end, time) {
        var node = this.ctx.createGain();
        var now = this.ctx.currentTime;

        node.gain.linearRampToValueAtTime(start, now);
        node.gain.linearRampToValueAtTime(end, now + time);

        return node;
      }
    },
    playRandomSound: {
      value: function playRandomSound() {
        this.playSound(this.sound_names[randomRangeInt(0, this.sound_names.length)]);
      }
    }
  });

  return SoundManager;
})();

module.exports = SoundManager;

},{"./util/prefixer.js":13,"./util/util.js":14}],10:[function(require,module,exports){
"use strict";

function hexcharToDec(hexval) {
    var c = hexval.toUpperCase().charCodeAt(0);
    return c < 60 ? c - 48 : c - 55;
}
function hexcolorToRGB(hex) {
    hex = hex.replace("#", "");
    var rgb = [];
    var inc = hex.length < 6 ? 1 : 2;
    for (var i = 0, len = hex.length; i < len; i += inc) {
        // var v = hex.substr(i, inc);
        rgb.push(parseInt(hex.substr(i, inc), 16));
    }
    return rgb;
}

module.exports = {
    hexcharToDec: hexcharToDec,
    hexcolorToRGB: hexcolorToRGB
};

},{}],11:[function(require,module,exports){
"use strict";

function drawLine(ctx, x1, y1, x2, y2, color, width) {

  if (color) ctx.strokeStyle = color;
  if (width) ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCircle(ctx, x, y, r, color) {
  var style = arguments[5] === undefined ? "fill" : arguments[5];

  if (color) ctx[style + "Style"] = color;

  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI * 2, false);
  ctx[style]();
}

module.exports = {
  drawLine: drawLine,
  drawCircle: drawCircle
};

},{}],12:[function(require,module,exports){
"use strict";

function vecDistanceSq(x1, y1, x2, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}
function vecDistance(x1, y1, x2, y2) {
    return Math.sqrt(vecDistanceSq(x1, y1, x2, y2));
}
function pointInCircle(px, py, cx, cy, cr) {
    return vecDistanceSq(px, py, cx, cy) < Math.pow(cr, 2);
}

module.exports = {
    vecDistanceSq: vecDistanceSq,
    vecDistance: vecDistance,
    pointInCircle: pointInCircle
};

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    setTimeout(function () {
        callback(window.performance.now());
    }, 1000 / 60);
};

exports.requestAnimationFrame = requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;

exports.cancelAnimationFrame = cancelAnimationFrame;
var performance = window.performance = {};
exports.performance = performance;
performance.now = performance.now || performance.webkitNow || performance.mozNow || performance.msNow || function () {
    return new Date().getTime();
};

var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || undefined;

/*module.exports = {
  requestAnimationFrame,
  cancelAnimationFrame,
  performance,
  AudioContext
};*/
exports.AudioContext = AudioContext;

},{}],14:[function(require,module,exports){
"use strict";

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function randomRangeInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    randomRange: randomRange,
    randomRangeInt: randomRangeInt
};

},{}],15:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":16,"regenerator-babel/runtime":17}],16:[function(require,module,exports){
/**
 * Core.js 0.6.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , parseInt        = global.parseInt
  , isFinite        = global.isFinite
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , console         = global.console || {}
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return toString.call(it).slice(8, -1);
}
function classof(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , pow    = Math.pow
  , abs    = Math.abs
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}
function lz(num){
  return num > 9 ? num : '0' + num;
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
      try {
        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
      } catch(e){}
    }()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_TAG         = getWellKnownSymbol(TO_STRING_TAG)
  , SYMBOL_SPECIES     = getWellKnownSymbol('species')
  , SYMBOL_ITERATOR;
function setSpecies(C){
  if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

/******************************************************************************
 * Module : common.export                                                     *
 ******************************************************************************/

var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // extend global
    if(framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
    // export
    if(exports[key] != out)hidden(exports, key, exp);
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : common.iterators                                                  *
 ******************************************************************************/

SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
var ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
    // Safari has byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function checkDangerIterClosing(fn){
  var danger = true;
  var O = {
    next: function(){ throw 1 },
    'return': function(){ danger = false }
  };
  O[SYMBOL_ITERATOR] = returnThis;
  try {
    fn(O);
  } catch(e){}
  return danger;
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function safeIterClose(exec, iterator){
  try {
    exec(iterator);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
function forOf(iterable, entries, fn, that){
  safeIterClose(function(iterator){
    var f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
      return closeIterator(iterator);
    }
  }, getIterator(iterable));
}

/******************************************************************************
 * Module : es6.symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR),
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
  
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6.object.statics                                                *
 ******************************************************************************/

!function(){
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
}();

/******************************************************************************
 * Module : es6.object.prototype                                              *
 ******************************************************************************/

!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[SYMBOL_TAG] = DOT;
  if(cof(tmp) != DOT)hidden(ObjectProto, TO_STRING, function(){
    return '[object ' + classof(this) + ']';
  });
}({});

/******************************************************************************
 * Module : es6.object.statics-accept-primitives                              *
 ******************************************************************************/

!function(){
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] = MODE == 1 ? function(it){
        return isObject(it) ? fn(it) : it;
      } : MODE == 2 ? function(it){
        return isObject(it) ? fn(it) : true;
      } : MODE == 3 ? function(it){
        return isObject(it) ? fn(it) : false;
      } : MODE == 4 ? function(it, key){
        return fn(toObject(it), key);
      } : function(it){
        return fn(toObject(it));
      };
      try { fn(DOT) }
      catch(e){ f = 1 }
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
}();

/******************************************************************************
 * Module : es6.function                                                      *
 ******************************************************************************/

!function(NAME){
  // 19.2.4.2 name
  NAME in FunctionProto || (DESC && defineProperty(FunctionProto, NAME, {
    configurable: true,
    get: function(){
      var match = String(this).match(/^\s*function ([^ (]*)/)
        , name  = match ? match[1] : '';
      has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
      return name;
    },
    set: function(value){
      has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
    }
  }));
}('name');

/******************************************************************************
 * Module : es6.number.constructor                                            *
 ******************************************************************************/

Number('0o1') && Number('0b1') || function(_Number, NumberProto){
  function toNumber(it){
    if(isObject(it))it = toPrimitive(it);
    if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
      var binary = false;
      switch(it.charCodeAt(1)){
        case 66 : case 98  : binary = true;
        case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
      }
    } return +it;
  }
  function toPrimitive(it){
    var fn, val;
    if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
    if(isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
  }
  forEach.call(DESC ? getNames(_Number)
  : array('MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY'), function(key){
    key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
  });
  Number[PROTOTYPE] = NumberProto;
  NumberProto[CONSTRUCTOR] = Number;
  hidden(global, NUMBER, Number);
}(Number, Number[PROTOTYPE]);

/******************************************************************************
 * Module : es6.number.statics                                                *
 ******************************************************************************/

!function(isInteger){
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
// 20.1.2.3 Number.isInteger(number)
}(Number.isInteger || function(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
});

/******************************************************************************
 * Module : es6.math                                                          *
 ******************************************************************************/

// ECMAScript 6 shim
!function(){
  // 20.2.2.28 Math.sign(x)
  var E    = Math.E
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , sign = Math.sign || function(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
    
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
}();

/******************************************************************************
 * Module : es6.string                                                        *
 ******************************************************************************/

!function(fromCharCode){
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
}(String.fromCharCode);

/******************************************************************************
 * Module : es6.array.statics                                                 *
 ******************************************************************************/

!function(){
  $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , mapfn   = arguments[1]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
        , index   = 0
        , length, result, step;
      if(isIterable(O)){
        result = new (generic(this, Array));
        safeIterClose(function(iterator){
          for(; !(step = iterator.next()).done; index++){
            result[index] = mapping ? f(step.value, index) : step.value;
          }
        }, getIterator(O));
      } else {
        result = new (generic(this, Array))(length = toLength(O.length));
        for(; length > index; index++){
          result[index] = mapping ? f(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }
  });
  
  $define(STATIC, ARRAY, {
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  
  setSpecies(Array);
}();

/******************************************************************************
 * Module : es6.array.prototype                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  
  if(framework){
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }
}();

/******************************************************************************
 * Module : es6.iterators                                                     *
 ******************************************************************************/

!function(at){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return iterResult(1);
    }
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
}(createPointAt(true));

/******************************************************************************
 * Module : es6.regexp                                                        *
 ******************************************************************************/

DESC && !function(RegExpProto, _RegExp){  
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
    RegExp = function RegExp(pattern, flags){
      return new _RegExp(cof(pattern) == REGEXP && flags !== undefined
        ? pattern.source : pattern, flags);
    }
    forEach.call(getNames(_RegExp), function(key){
      key in RegExp || defineProperty(RegExp, key, {
        configurable: true,
        get: function(){ return _RegExp[key] },
        set: function(it){ _RegExp[key] = it }
      });
    });
    RegExpProto[CONSTRUCTOR] = RegExp;
    RegExp[PROTOTYPE] = RegExpProto;
    hidden(global, REGEXP, RegExp);
  }
  
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')defineProperty(RegExpProto, 'flags', {
    configurable: true,
    get: createReplacer(/^.*\/(\w*)$/, '$1')
  });
  
  setSpecies(RegExp);
}(RegExp[PROTOTYPE], RegExp);

/******************************************************************************
 * Module : web.immediate                                                     *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(run, 0, id);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6.promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, RECORD){
    function isThenable(it){
      var then;
      if(isObject(it))then = it.then;
      return isFunction(then) ? then : false;
    }
    function handledRejectionOrHasOnRejected(promise){
      var record = promise[RECORD]
        , chain  = record.c
        , i      = 0
        , react;
      if(record.h)return true;
      while(chain.length > i){
        react = chain[i++];
        if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
      }
    }
    function notify(record, reject){
      var chain = record.c;
      if(reject || chain.length)asap(function(){
        var promise = record.p
          , value   = record.v
          , ok      = record.s == 1
          , i       = 0;
        if(reject && !handledRejectionOrHasOnRejected(promise)){
          setTimeout(function(){
            if(!handledRejectionOrHasOnRejected(promise)){
              if(NODE){
                if(!process.emit('unhandledRejection', value, promise)){
                  // default node.js behavior
                }
              } else if(isFunction(console.error)){
                console.error('Unhandled promise rejection', value);
              }
            }
          }, 1e3);
        } else while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              if(!ok)record.h = true;
              ret = cb === true ? value : cb(value);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(value);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(value){
      var record = this
        , then, wrapper;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      try {
        if(then = isThenable(value)){
          wrapper = {r: record, d: false}; // wrap
          then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          record.v = value;
          record.s = 1;
          notify(record);
        }
      } catch(err){
        reject.call(wrapper || {r: record, d: false}, err); // wrap
      }
    }
    function reject(value){
      var record = this;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      record.v = value;
      record.s = 2;
      notify(record, true);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var record = {
        p: this,      // promise
        c: [],        // chain
        s: 0,         // state
        d: false,     // done
        v: undefined, // value
        h: false      // handled rejection
      };
      hidden(this, RECORD, record);
      try {
        executor(ctx(resolve, record, 1), ctx(reject, record, 1));
      } catch(err){
        reject.call(record, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), record = this[RECORD];
        record.c.push(react);
        record.s && notify(record);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('record'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6.collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || !DESC || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(checkDangerIterClosing(function(O){ new C(O) })){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        if(entry.p)entry.p = entry.p.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6.reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getPrototypeOf(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getPrototypeOf(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = descriptor(0);
    }
    if(has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
      existingDescriptor.value = V;
      return defineProperty(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: function(target, argumentsList /*, newTarget*/){
      var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
        , instance = create(isObject(proto) ? proto : ObjectProto)
        , result   = apply.call(target, instance, argumentsList);
      return isObject(result) ? result : instance;
    },
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7.proposals                                                     *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://gist.github.com/WebReflection/9353781
    getOwnPropertyDescriptors: function(object){
      var O      = toObject(object)
        , result = {};
      forEach.call(ownKeys(O), function(key){
        defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
      });
      return result;
    },
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values:  createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7.abstract-refs                                                 *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : js.array.statics                                                  *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});

/******************************************************************************
 * Module : web.dom.itarable                                                  *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), true);
},{}],17:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg < finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":15}],19:[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":18}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL2dhbWUuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9pbnB1dG1hbmFnZXIuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9tYWluLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvbmV0d29ya21hbmFnZXIuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9vYmplY3RzL2Jhc2UuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9vYmplY3RzL21pbmlvbi5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL29iamVjdHMvcGFydGljbGUuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9vYmplY3RzL3BsYXllci5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NvdW5kbWFuYWdlci5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvY29sb3IuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL2RyYXcuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL21hdGguanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL3ByZWZpeGVyLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC91dGlsLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL2xpYi9iYWJlbC9wb2x5ZmlsbC5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9zaGltLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1iYWJlbC9ydW50aW1lLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL3BvbHlmaWxsLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L3BvbHlmaWxsLmpzIiwiL2hvbWUvaGVrdG9ydy93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzRCQ0N5RSxpQkFBaUI7O0lBQWpGLHFCQUFx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RztBQUNmLGVBQVcsRUFBWCxXQUFXO0FBQ1gsa0JBQWMsRUFBZCxjQUFjO0NBQ2YsQ0FBQTs7O0FDWEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNoQkE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5pbXBvcnQgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCBwZXJmb3JtYW5jZSB9IGZyb20gJy4vdXRpbC9wcmVmaXhlcic7XG5pbXBvcnQgeyBkcmF3TGluZSwgZHJhd0NpcmNsZSB9IGZyb20gJy4vdXRpbC9kcmF3JztcblxuaW1wb3J0IFNvdW5kTWFuYWdlciBmcm9tICcuL3NvdW5kbWFuYWdlcic7XG5pbXBvcnQgSW5wdXRNYW5hZ2VyIGZyb20gJy4vaW5wdXRtYW5hZ2VyJztcbmltcG9ydCBOZXR3b3JrTWFuYWdlciBmcm9tICcuL25ldHdvcmttYW5hZ2VyJztcblxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4vb2JqZWN0cy9wYXJ0aWNsZSc7XG5pbXBvcnQgUGxheWVyIGZyb20gJy4vb2JqZWN0cy9wbGF5ZXInO1xuaW1wb3J0IEJhc2UgZnJvbSAnLi9vYmplY3RzL2Jhc2UnO1xuaW1wb3J0IE1pbmlvbiBmcm9tICcuL29iamVjdHMvbWluaW9uJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG4gICAgdGhpcy5jdHggPSBudWxsO1xuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbnVsbDtcblxuICAgIHRoaXMubGFzdF90aW1lID0gLTE7XG4gICAgdGhpcy5ub3cgPSAtMTtcblxuICAgIHRoaXMuc2VsZWN0ZWRfYmFzZSA9IG51bGw7XG4gICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBudWxsO1xuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IG51bGw7XG5cbiAgICB0aGlzLmJhc2VzID0gW107XG4gICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgdGhpcy5taW5pb25zID0gW107XG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcblxuICAgIHRoaXMubWUgPSBudWxsO1xuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSBudWxsO1xuICB9XG5cblxuICBpbml0KCkge1xuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcigpLmluaXQoKTtcbiAgICB0aGlzLm5ldHdvcmtNYW5hZ2VyID0gbmV3IE5ldHdvcmtNYW5hZ2VyKCkuaW5pdCgpO1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyID0gbmV3IElucHV0TWFuYWdlcih0aGlzKS5pbml0KCk7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYW52YXMnKTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICB0aGlzLmJpbmRGdW5jdGlvbnMoKTtcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB0aGlzLnNldHVwV2llcmRBcnJheUZ1bmN0aW9ucygpO1xuXG4gICAgdGhpcy5yZXNpemUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYmluZEZ1bmN0aW9ucygpIHtcbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3AuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGluaXRFdmVudHMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgfVxuXG5cbiAgc2V0dXBXaWVyZEFycmF5RnVuY3Rpb25zKCkge1xuICAgIHRoaXMucGxheWVycy5maW5kQnkgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xuICAgICAgZm9yIChsZXQgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xuICAgICAgICBpZiAodGhpc1tpXVtwcm9wXSA9PT0gdmFsdWUpIHJldHVybiB0aGlzW2ldO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnBsYXllcnMuYnlJRCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5sZW5ndGg7IGktLTsgKSB7XG4gICAgICAgIGlmICh0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIHRoaXNbaV07XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCBtZXRob2QgdG8gYmFzZSBsaXN0XG4gICAgdGhpcy5iYXNlcy5pbmRleEJ5SUQgPSBmdW5jdGlvbihpZCkge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuYmFzZXMuYnlJRCA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGZvcih2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICl7XG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKSByZXR1cm4gdGhpc1tpXTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gTUlOSU9OXG4gICAgdGhpcy5taW5pb25zLmJ5SUQgPSBmdW5jdGlvbihpZCl7XG4gICAgICBmb3IodmFyIGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApe1xuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIHRoaXNbaV07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG5cbiAgc2V0dXAoZGF0YSkge1xuICAgIGxldCBsdmxfbmFtZSA9IGRhdGEubGV2ZWxfbmFtZTtcbiAgICBsZXQgbXlfaWQgPSBkYXRhLm15X2lkO1xuICAgIGxldCBwbGF5ZXJzID0gZGF0YS5wbGF5ZXJzO1xuXG4gICAgLy8gdGltZWQoJ0xldmVsOiAnICsgbHZsX25hbWUpO1xuXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gZGF0YS5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICBsZXQgYiA9IGRhdGEuYmFzZXNbaV07XG4gICAgICB0aGlzLmJhc2VzLnB1c2goXG4gICAgICAgIG5ldyBCYXNlKHRoaXMsIGIuaWQsIGIubGVmdCwgYi50b3AsIGIuc2NhbGUsIGIucmVzb3VyY2VzLCBiLnJlc291cmNlc19tYXgpXG4gICAgICApO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBwbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIGxldCBwbGF5ZXJEYXRhID0gcGxheWVyc1tpXTtcblxuICAgICAgbGV0IHBsYXllciA9IG5ldyBQbGF5ZXIoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHBsYXllckRhdGEuaWQsXG4gICAgICAgIHBsYXllckRhdGEubmFtZSxcbiAgICAgICAgcGxheWVyRGF0YS5jb2xvclxuICAgICAgKTtcblxuICAgICAgbGV0IHN0YXJ0U3RhdGVzID0gZGF0YS5zdGFydF9zdGF0ZVtpXTtcbiAgICAgIHN0YXJ0U3RhdGVzLmZvckVhY2goaSA9PiB0aGlzLmJhc2VzW2ldLnNldFBsYXllcihwbGF5ZXIpKTtcblxuICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcblxuICAgICAgaWYgKHBsYXllckRhdGEuaWQgPT09IG15X2lkKXtcbiAgICAgICAgdGhpcy5tZSA9IHBsYXllcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNlbmQoJ1BMQVlFUi5yZWFkeScpO1xuICB9XG5cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLm5vdyA9IHRoaXMubGFzdF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3ApO1xuICB9XG5cbiAgZW5kKCkge1xuICAgIGlmKHRoaXMuYW5pbWF0aW9uRnJhbWUpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xuXG4gICAgLy8gQ0xFQU4gVVAgR0FNRVxuICAgIHRoaXMuYmFzZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLnBsYXllcnMubGVuZ3RoID0gMDtcbiAgICB0aGlzLm1lID0gbnVsbDtcbiAgICB0aGlzLm1pbmlvbnMubGVuZ3RoID0gMDtcbiAgICB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPSAwO1xuXG4gICAgLy8gVGVtcG9yYXJ5IHNvbHV0aW9uIHRvIGhpZGUgb3ZlcmxheSBhbmQgZ28gYmFjayB0byBTVEFSVFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIC8vIENPTlRST0xMRVIub3ZlcmxheUhpZGUoKTtcbiAgICAgIC8vIENPTlRST0xMRVIuc2V0U2NyZWVuKCdzdGFydCcpO1xuICAgIH0sIDMwMDApO1xuICB9XG5cblxuICBsb29wKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3ApO1xuXG4gICAgaWYgKHRoaXMuZHJhd190aW1lKVxuICAgICAgdGhpcy5kcmF3X3RpbWUgPSB0aW1lIC0gdGhpcy5kcmF3X3RpbWU7XG5cbiAgICB0aGlzLm5vdyA9IHRpbWU7XG4gICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIHRoaXMubGFzdF90aW1lKSAvIDEwMDAuMDtcbiAgICB0aGlzLmxhc3RfdGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLnVwZGF0ZV90aW1lID0gdGltZTtcbiAgICB0aGlzLnVwZGF0ZShlbGFwc2VkKTtcbiAgICB0aGlzLnVwZGF0ZV90aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLnVwZGF0ZV90aW1lO1xuXG4gICAgdGhpcy5kcmF3X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLmRyYXcoKTtcbiAgfVxuXG5cbiAgdXBkYXRlKHRpbWUpIHtcbiAgICB0aGlzLmlucHV0TWFuYWdlci51cGRhdGUodGltZSk7XG4gIH1cblxuXG4gIGRyYXcgKCkge1xuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy5taW5pb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsZXQgbSA9IHRoaXMubWluaW9uc1tpXTtcbiAgICAgIGlmIChtLmFjdGl2ZSkgbS5kcmF3KGN0eCk7XG4gICAgfVxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBEcmF3IGxpbmUgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICBpZiAodGhpcy5zZWxlY3RlZF9iYXNlKXtcbiAgICAgIGxldCBiID0gdGhpcy5zZWxlY3RlZF9iYXNlO1xuXG4gICAgICBsZXQgeCwgeTtcbiAgICAgIGlmICh0aGlzLnRhcmdldGVkX2Jhc2Upe1xuICAgICAgICB4ID0gdGhpcy50YXJnZXRlZF9iYXNlLng7XG4gICAgICAgIHkgPSB0aGlzLnRhcmdldGVkX2Jhc2UueTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHggPSB0aGlzLmlucHV0TWFuYWdlci5wb2ludGVyLng7XG4gICAgICAgIHkgPSB0aGlzLmlucHV0TWFuYWdlci5wb2ludGVyLnk7XG4gICAgICB9XG5cbiAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMztcbiAgICAgIGxldCBsaW5lX3NpemUgPSA1O1xuICAgICAgbGV0IGNvbG9yID0gdGhpcy5tZS5jb2xvciB8fCAnI0FBQScgO1xuICAgICAgZHJhd0xpbmUoY3R4LCBiLngsIGIueSwgeCwgeSwgY29sb3IsIGxpbmVfc2l6ZSk7XG4gICAgICBkcmF3Q2lyY2xlKGN0eCwgeCwgeSwgbGluZV9zaXplIC8gMiwgY29sb3IpO1xuXG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHRoaXMuYmFzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgdGhpcy5iYXNlc1tpXS5kcmF3KGN0eCk7XG4gICAgfVxuXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uZHJhdyhjdHgpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1Njb3JlQmFyKGN0eCk7XG4gIH1cblxuICBkcmF3U2NvcmVCYXIoY3R4KSB7XG4gICAgY3R4LnNhdmUoKTtcblxuICAgIGxldCB3ID0gd2lkdGggLyAxLjU7XG4gICAgbGV0IGggPSBoZWlnaHQgLyAyMDtcbiAgICBsZXQgeCA9ICh3aWR0aCAvIDIpIC0gKHcgLyAyKTtcbiAgICBsZXQgeSA9IChoZWlnaHQgLyAyMCkgLSAoaCAvIDIpO1xuXG4gICAgbGV0IHIgPSBbXTtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgcltpXSA9IHRoaXMucGxheWVyc1tpXS50b3RhbFJlc291cmNlcygpO1xuICAgICAgdG90YWwgKz0gcltpXTtcbiAgICB9XG5cbiAgICBsZXQgeHQgPSB4O1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGxheWVyc1tpXS5jb2xvcjtcbiAgICAgIGxldCB3dCA9IChyW2ldIC8gdG90YWwpICogdztcbiAgICAgIGN0eC5maWxsUmVjdCh4dCwgeSwgd3QsIGgpO1xuICAgICAgbGV0IHRleHQgPSB0aGlzLnBsYXllcnNbaV0ubmFtZSArICcgLSAnICsgcltpXTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIHh0ICsgKHd0LzIpIC0gKGN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aC8yKSwgeSsoaC8yKSk7XG5cbiAgICAgIHh0ICs9IHd0O1xuICAgIH1cblxuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguc3Ryb2tlUmVjdCh4LCB5LCB3LCBoKTtcblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cblxuXG4gIHJlc2l6ZSgpIHtcbiAgICB0aGlzLndpZHRoICA9IHRoaXMuY2FudmFzLndpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgdGhpcy5iYXNlcy5mb3JFYWNoKGUgPT4gZS5yZXNpemUoKSk7XG4gICAgdGhpcy5taW5pb25zLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcbiAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGUgPT4gZS5yZXNpemUoKSk7XG4gIH1cblxuXG5cbiAgdHJ5U2VuZE1pbmlvbih0YXJnZXQpIHtcbiAgICB0YXJnZXQudGFyZ2V0ZWQgPSB0cnVlO1xuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IHRhcmdldDtcblxuICAgIC8vIENhbGwgJ2NhblNlbmRNaW5pb24nIG9uIHNlbGVjdGVkX2Jhc2VcbiAgICAvLyBbQ0hBTkdFRF0gQWxsd2F5cyBhc2sgc2VydmVyIHRvIHNlbmRcbiAgICBpZiAodGhpcy5zZWxlY3RlZF9iYXNlLmNhblNlbmRNaW5pb24oKSB8fCB0cnVlKXtcbiAgICAgIHRoaXMubmV0d29ya01hbmFnZXIuc2VuZCgnQkFTRS5taW5pb24nLCB7XG4gICAgICAgIHNvdXJjZV9pZDogdGhpcy5zZWxlY3RlZF9iYXNlLmlkLFxuICAgICAgICB0YXJnZXRfaWQ6IHRhcmdldC5pZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QnlJRChsaXN0LCBpZCkge1xuICAgIGZvciAobGV0IGkgPSBsaXN0Lmxlbmd0aDsgaS0tOyApIHtcbiAgICAgIGxldCBpdGVtID0gbGlzdFtpXTtcbiAgICAgIGlmIChpdGVtICYmIGl0ZW0uaWQgPT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuXG5cblxuZnVuY3Rpb24gaGVoZVNjb3BlQXdheVNpbGx5SW1wbGVtZW50YXRpb24oKSB7XG5cblxuXG4gIC8vLy8vLy8vLy8vL1xuICAvLyBFVkVOVFMgLy9cbiAgLy8vLy8vLy8vLy8vXG4gIC8qKlxuICAgKiB7IERJU0NPTk5FQ1RJT04gfVxuICAgKiBDYWxsZWQgd2hlbiBhIHBsYXllciBkaXNjb25uZWN0cyBmcm9tIHRoZSBnYW1lXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKi9cbiAgR0FNRS5kaXNjb25uZWN0aW9uID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgdmFyIHAgPSB0aGlzLnBsYXllcnMuZmluZEJ5KCdpZCcsIGRhdGEucGxheWVyX2lkKTtcblxuICAgIGlmKHAgIT09IHVuZGVmaW5lZCl7XG4gICAgICBDT05UUk9MTEVSLm92ZXJsYXlNZXNzYWdlKFwiJ3swfScgZGlzY29ubmVjdGVkXCIuZm9ybWF0KHAubmFtZSkpO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIHsgQkFTRSBSRVNPVVJDRVMgfVxuICAgKiBXaGVuIGEgYmFzZSBnb3QgdXBkYXRlZCByZXNvdXJjZXMgZnJvbSBzZXJ2ZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gICAqL1xuICBHQU1FLmJhc2VSZXNvdXJjZXMgPSBmdW5jdGlvbihkYXRhKXtcbiAgICB2YXIgYiA9IEdBTUUuYmFzZXMuYnlJRChkYXRhLmJhc2VfaWQpO1xuXG4gICAgaWYoYilcbiAgICAgIGIucmVzb3VyY2VzID0gZGF0YS5yZXNvdXJjZXM7XG4gIH07XG4gIC8qKlxuICAgKiB7IE5FVyBNSU5JT04gfVxuICAgKiBDYWxsZWQgd2hlbiBzZXJ2ZXIgc2VuZHMgYSBuZXcgbWluaW9uXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKi9cbiAgR0FNRS5uZXdNaW5pb24gPSBmdW5jdGlvbihkYXRhKXtcbiAgICB2YXIgbSA9IGRhdGEubWluaW9uO1xuXG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuYmFzZXMuYnlJRChtLnNvdXJjZV9pZCk7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuYmFzZXMuYnlJRChtLnRhcmdldF9pZCk7XG5cbiAgICB2YXIgbWluaW9uID0gbmV3IE1pbmlvbihcbiAgICAgIG0uaWQsXG4gICAgICBzb3VyY2UsXG4gICAgICB0YXJnZXQsXG4gICAgICBtLnNjYWxlXG4gICAgKTtcblxuICAgIHNvdXJjZS5zZW5kTWluaW9uKCk7XG5cbiAgICB0aGlzLm1pbmlvbnMucHVzaChtaW5pb24pO1xuICB9O1xuICAvKipcbiAgICogeyBNSU5JT04gSElUIH1cbiAgICogQ2FsbGVkIGJ5IHNlcnZlciB3aGVuIG1pbmlvbiByZWFjaGVzIHRhcmdldCBiYXNlXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICAgKi9cbiAgR0FNRS5taW5pb25IaXQgPSBmdW5jdGlvbihkYXRhKXtcbiAgICB2YXIgbWluaW9uX2lkID0gZGF0YS5taW5pb25faWQ7XG4gICAgdmFyIG5ld19wbGF5ZXJfaWQgPSBkYXRhLm5ld19wbGF5ZXJfaWQ7XG4gICAgdmFyIHJlc291cmNlcyA9IGRhdGEucmVzb3VyY2VzO1xuXG4gICAgLy8gRmV0Y2ggbWluaW9uXG4gICAgdmFyIG1pbmlvbiA9IHRoaXMubWluaW9ucy5ieUlEKG1pbmlvbl9pZCk7XG5cbiAgICBpZighbWluaW9uKXtcbiAgICAgIGFsZXJ0KCdNaW5pb24gZ29uZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1pbmlvbi5kZWFkX2J5X3NlcnZlciA9IHRydWU7XG5cbiAgICAvLyBHZXQgdGFyZ2V0IGJhc2VcbiAgICB2YXIgdGFyZ2V0ID0gbWluaW9uLnRhcmdldF9iYXNlO1xuICAgIC8vIFNldCByZXNvdXJjZXMgZm9yIGJhc2VcbiAgICB0YXJnZXQucmVzb3VyY2VzID0gcmVzb3VyY2VzO1xuXG4gICAgaWYobmV3X3BsYXllcl9pZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllcnMuYnlJRChuZXdfcGxheWVyX2lkKTtcbiAgICAgIHRhcmdldC5zZXRQbGF5ZXIocGxheWVyKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIHsgVVBEQVRFIH1cbiAgICogQHBhcmFtICB7TnVtYmVyfSB0ICAgRWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgdXBkYXRlIChzZWNvbmRzKVxuICAgKi9cbiAgR0FNRS51cGRhdGUgPSBmdW5jdGlvbih0KXtcbiAgICB2YXIgaSwgbGVuLCBiLCBtLCBwO1xuXG5cbiAgICAvLyBSZXNldCBob3ZlcmVkIGFuZCB0YXJnZXRlZFxuICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gbnVsbDtcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSBudWxsO1xuXG5cblxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICBiID0gdGhpcy5iYXNlc1tpXTtcblxuICAgICAgLy8gVXBkYXRlIGJhc2VcbiAgICAgIGIudXBkYXRlKHQpO1xuXG4gICAgICAvLyBSZXNldCBiYXNlIGhvdmVyZWQgJiB0YXJnZXRlZCBzdGF0ZVxuICAgICAgYi5ob3ZlcmVkID0gZmFsc2U7XG4gICAgICBiLnRhcmdldGVkID0gZmFsc2U7XG5cblxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgIC8vIENIRUNLIElOUFVUIC8vXG4gICAgICAvLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgLy8gTW91c2UgaXMgb3ZlciBiYXNlXG4gICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcbiAgICAgICAgLy8gU2VlIGlmIHRoZXJlIGlzIGFueSBzZWxlY3RlZCBiYXNlIGFuZCBpdCBpc24ndCB0aGUgb25lIHRlc3RlZFxuICAgICAgICBpZih0aGlzLnNlbGVjdGVkX2Jhc2UgJiYgdGhpcy5zZWxlY3RlZF9iYXNlICE9PSBiKXtcbiAgICAgICAgICAvLyBTZXQgdGhlIGJhc2UgYXMgdGFyZ2V0ZWQgYW5kIHRyeSB0byBzZW5kXG4gICAgICAgICAgR0FNRS50cnlTZW5kTWluaW9uKGIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIENoZWNrIGlmIGJhc2UgYmVsb25zIHRvICdtZSdcbiAgICAgICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT09IC0xKXtcbiAgICAgICAgICAgIC8vIFNldCB0aGUgYmFzZSBhcyBob3ZlcmVkXG4gICAgICAgICAgICBiLmhvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT0gLTEpe1xuICAgICAgICBpZighYi5zZWxlY3RlZCAmJiBwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcbiAgICAgICAgICBiLmhvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gYjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvLyBVcGRhdGUgbWluaW9uc1xuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5taW5pb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIG0gPSB0aGlzLm1pbmlvbnNbaV07XG4gICAgICBpZihtLmFjdGl2ZSl7XG4gICAgICAgIG0udXBkYXRlKHQpO1xuXG4gICAgICAgIGlmKCFtLmFjdGl2ZSl7XG4gICAgICAgICAgU09VTkQucGxheVJhbmRvbVNvdW5kKCk7XG5cbiAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IFBhcnRpY2xlKG0udGFyZ2V0X2Jhc2UubGVmdCwgbS50YXJnZXRfYmFzZS50b3AsIG0udGFyZ2V0X2Jhc2Uuc2NhbGUsIG0uc291cmNlX2Jhc2UuY29sb3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihtLmRlYWRfYnlfc2VydmVyICYmICFtLmFjdGl2ZSl7XG4gICAgICAgIHRoaXMubWluaW9ucy5zcGxpY2UoaS0tLCAxKTtcbiAgICAgICAgLS1sZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHBhdGljbGVzXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICBwID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICBwLnVwZGF0ZSh0KTtcblxuICAgICAgaWYoIXAuYWN0aXZlKXtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgIC0tbGVuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuXG4gIEdBTUUuc2VuZCA9IGZ1bmN0aW9uKG1zZywgZGF0YSl7XG4gICAgTkVULnNlbmQobXNnLCBkYXRhKTtcbiAgfTtcbiAgXG5cblxuXG4gIC8qKlxuICAgKiB7IFNUQVJUIFRPVUNIIH1cbiAgICovXG4gIEdBTUUuc3RhcnRUb3VjaCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGksIGIsIGxlbjtcblxuICAgIGlmKCFHQU1FLm1lKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBHQU1FLm1lLmJhc2VzX2lkLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIGIgPSBHQU1FLmJhc2VzW0dBTUUuYmFzZXMuaW5kZXhCeUlEKEdBTUUubWUuYmFzZXNfaWRbaV0pXTtcblxuICAgICAgaWYocG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XG4gICAgICAgIGIuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBiO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIHsgRU5EIFRPVUNIIH1cbiAgICovXG4gIEdBTUUuZW5kVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIGlmKEdBTUUuc2VsZWN0ZWRfYmFzZSl7XG4gICAgICAvLyBBZGQgbmV3IG1pbmlvblxuICAgICAgaWYoR0FNRS50YXJnZXRlZF9iYXNlKXtcblxuICAgICAgfVxuICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBudWxsO1xuICAgIH1cbiAgfTtcbn0iLCJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0TWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG5cbiAgICB0aGlzLnBvaW50ZXIgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGRvd246IGZhbHNlLFxuICAgICAgdGltZURvd246IDBcbiAgICB9O1xuICAgIHRoaXMubGFzdFBvaW50ZXIgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBvaW50ZXIpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy51cGRhdGVQb3NpdGlvbi5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcyksIGZhbHNlKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gIH1cblxuICB1cGRhdGUodGltZSkge1xuICAgIHRoaXMubGFzdFBvaW50ZXIgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBvaW50ZXIpO1xuXG4gICAgaWYgKHRoaXMucG9pbnRlci5kb3duKSB7XG4gICAgICB0aGlzLnBvaW50ZXIudGltZURvd24gKz0gdGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wb2ludGVyLnRpbWVEb3duID0gMDtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogdGhpcy5wb2ludGVyLngsXG4gICAgICB5OiB0aGlzLnBvaW50ZXIueSxcbiAgICAgIGRvd246IHRoaXMucG9pbnRlci5kb3duXG4gICAgfTtcbiAgfVxuXG5cbiAgdHJhbnNsYXRlRXZlbnRDb29yZGluYXRlcyhldmVudCkge1xuICAgIGlmIChldmVudC5jaGFuZ2VkVG91Y2hlcykge1xuICAgICAgcmV0dXJuIFsgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIF07XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlUG9zaXRpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgbGV0IFsgcGFnZVgsIHBhZ2VZIF0gPSB0aGlzLnRyYW5zbGF0ZUV2ZW50Q29vcmRpbmF0ZXMoZXZlbnQpO1xuICAgIFsgdGhpcy5wb2ludGVyLngsIHRoaXMucG9pbnRlci55IF0gPSBbIHBhZ2VYLCBwYWdlWSBdO1xuICB9XG5cbiAgb25Qb2ludGVyRG93bihldmVudCkge1xuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgIHRoaXMucG9pbnRlci5kb3duID0gdHJ1ZTtcbiAgfVxuXG4gIG9uUG9pbnRlclVwKGV2ZW50KSB7XG4gICAgdGhpcy51cGRhdGVQb3NpdGlvbihldmVudCk7XG4gICAgdGhpcy5wb2ludGVyLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLnRyaWdnZXIoJ3BvaW50ZXIudXAnKTtcbiAgfVxuXG59IiwiXG4vLyBpbmNsdWRlcyBzb21lIGJyb3dzZXIgcG9seWZpbGxzXG5yZXF1aXJlKCdiYWJlbGlmeS9wb2x5ZmlsbCcpO1xuXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUnXG5cbnZhciBnYW1lID0gd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpLmluaXQoKTtcbiIsIlxuLy8gdGVtcFxuZnVuY3Rpb24gdGltZWQoKSB7IGNvbnNvbGUubG9nKGFyZ3VtZW50c1swXSk7IH1cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ldHdvcmtNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyLCBnYW1lKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gIH1cblxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5jb25uZWN0KCk7XG4gICAgdGhpcy5zZXR1cFNvY2tldEV2ZW50SGFuZGxlcnMoKTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCc6ODg4OCcsIHtcbiAgICAgICAgcmVjb25uZWN0OiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBzZXR1cFNvY2tldEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgbGV0IHNvY2tldCA9IHRoaXMuc29ja2V0O1xuXG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIHRoaXMub25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0Q29ubmVjdC5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKTtcblxuICAgIHNvY2tldC5vbignU0VSVkVSLnlvdXJuYW1lJywgdGhpcy5vblNlcnZlcllvdXJuYW1lLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignU0VSVkVSLm51bV9wbGF5ZXJzJywgdGhpcy5vblNlcnZlck51bVBsYXllcnMuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdTRVJWRVIuaW5pdGdhbWUnLCB0aGlzLm9uU2VydmVySW5pdGdhbWUuYmluZCh0aGlzKSk7XG5cbiAgICBzb2NrZXQub24oJ0dBTUUuc2V0dXAnLCB0aGlzLm9uR2FtZVNldHVwLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignR0FNRS5zdGFydCcsIHRoaXMub25HYW1lU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdHQU1FLmVuZCcsIHRoaXMub25HYW1lRW5kLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignR0FNRS5kaXNjb25uZWN0aW9uJywgdGhpcy5vbkdhbWVEaXNjb25uZWN0aW9uLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignR0FNRS5taW5pb24nLCB0aGlzLm9uR2FtZU1pbmlvbi5iaW5kKHRoaXMpKTtcblxuICAgIHNvY2tldC5vbignTUlOSU9OLmhpdCcsIHRoaXMub25NaW5pb25IaXQuYmluZCh0aGlzKSk7XG5cbiAgICBzb2NrZXQub24oJ0JBU0UucmVzb3VyY2VzJywgdGhpcy5vbkJhc2VSZXNvdXJjZXMuYmluZCh0aGl0cykpO1xuXG4gICAgc29ja2V0Lm9uKCdteSBwbGF5ZXInLCB0aGlzLm9uTXlQbGF5ZXIuYmluZCh0aGlzKSk7XG4gIH1cblxuICBzZW5kKG1zZywgZGF0YSkge1xuICAgIHRoaXMuc29ja2V0LmVtaXQobXNnLCBkYXRhKTtcbiAgfVxuXG5cbiAgb25Tb2NrZXRFcnJvcigpIHtcbiAgICBpZiAoIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXIubm9jb25uZWN0KCk7XG4gICAgfVxuICB9XG4gIG9uU29ja2V0Q29ubmVjdCgpIHtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgdGhpcy5jb250cm9sbGVyLmNvbm5lY3RlZCgpO1xuICB9XG4gIG9uU29ja2V0RGlzY29ubmVjdCgpIHtcbiAgICB0aGlzLmNvbmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5jb250cm9sbGVyLmRpc2Nvbm5lY3RlZCgpO1xuICB9XG5cbiAgb25TZXJ2ZXJZb3VybmFtZShkYXRhKSB7XG4gICAgdGltZWQoYFlvdSBzaGFsbCBiZSBrbm93biBhcyAnJHtkYXRhLm5hbWV9J2ApO1xuICB9XG4gIG9uU2VydmVyTnVtUGxheWVycyhkYXRhKSB7XG4gICAgdGltZWQoJ1BsYXllcnMgb25saW5lOiAnICsgZGF0YS5udW1fcGxheWVycyk7XG4gIH1cbiAgb25TZXJ2ZXJJbml0Z2FtZSgpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuc3RhcnRnYW1lKCk7XG4gIH1cblxuICBvbkdhbWVTZXR1cChkYXRhKSB7XG4gICAgdGhpcy5nYW1lLnNldHVwKGRhdGEpO1xuICB9XG4gIG9uR2FtZVN0YXJ0KCkge1xuICAgIHRoaXMuZ2FtZS5zdGFydCgpOyBcbiAgfVxuICBvbkdhbWVFbmQoKSB7XG4gICAgdGhpcy5nYW1lLmVuZCgpO1xuICB9XG4gIG9uR2FtZURpc2Nvbm5lY3Rpb24oZGF0YSkge1xuICAgIHRoaXMuZ2FtZS5kaXNjb25uZWN0aW9uKGRhdGEpO1xuICB9XG4gIG9uR2FtZU1pbmlvbihkYXRhKSB7XG4gICAgdGhpcy5nYW1lLm5ld01pbmlvbihkYXRhKTtcbiAgfVxuXG4gIG9uTWluaW9uSGl0KGRhdGEpIHtcbiAgICB0aGlzLmdhbWUubWluaW9uSGl0KGRhdGEpO1xuICB9XG5cbiAgb25CYXNlUmVzb3VyY2VzKGRhdGEpIHtcbiAgICB0aGlzLmdhbWUuYmFzZVJlc291cmNlcyhkYXRhKTtcbiAgfVxuXG4gIG9uTXlQbGF5ZXIoZGF0YSkge1xuICAgIHRoaXMuZ2FtZS5tZSA9IG5ldyBCYXNlKGRhdGEucGxheWVyLmFzcGVjdF9sZWZ0LCBkYXRhLnBsYXllci5hc3BlY3RfdG9wLCBkYXRhLnBsYXllci5hc3BlY3Rfc2l6ZSwgZGF0YS5wbGF5ZXIuY29sb3IpO1xuICAgIHRoaXMuZ2FtZS5tZS5wbGF5ZXJfaWQgPSBkYXRhLnBsYXllci5wbGF5ZXJfaWQ7XG4gICAgdGhpcy5nYW1lLmJhc2VzLnB1c2godGhpcy5nYW1lLm1lKTtcbiAgfVxufVxuXG5cbi8qKiB7IElOSVQgfVxuICpcbiAqL1xuTkVULmluaXQgPSBmdW5jdGlvbigpe1xuXG5cblxuICAgIHRoaXMuc29ja2V0Lm9uKCdnLnBsYXllcnMnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGksIGIsIGxlbjtcbiAgICAgICAgdmFyIHAgPSBkYXRhLnBsYXllcnM7XG4gICAgICAgIGZvcihpID0gMCwgbGVuID0gcC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBHQU1FLmJhc2VzLmluZGV4QnlJRChwW2ldLnBsYXllcl9pZCk7XG5cbiAgICAgICAgICAgIC8vIElmIHBsYXllciBpcyBub3QgaW4gZ2FtZSAtPiBBZGRcbiAgICAgICAgICAgIGlmKGluZGV4ID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGIgPSBuZXcgQmFzZShwW2ldLmFzcGVjdF9sZWZ0LCBwW2ldLmFzcGVjdF90b3AsIHBbaV0uYXNwZWN0X3NpemUsIHBbaV0uY29sb3IpO1xuICAgICAgICAgICAgICAgIGIucGxheWVyX2lkID0gcFtpXS5wbGF5ZXJfaWQ7XG4gICAgICAgICAgICAgICAgR0FNRS5iYXNlcy5wdXNoKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRWxzZSBzZXQgdmFsdWVzIGNvcnJlY3RcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGIgPSBHQU1FLmJhc2VzW2luZGV4XTtcbiAgICAgICAgICAgICAgICBiLmFzcGVjdF9sZWZ0ID0gcFtpXS5hc3BlY3RfbGVmdDtcbiAgICAgICAgICAgICAgICBiLmFzcGVjdF90b3AgPSBwW2ldLmFzcGVjdF90b3A7XG4gICAgICAgICAgICAgICAgYi5hc3BlY3Rfc2l6ZSA9IHBbaV0uYXNwZWN0X3NpemU7XG4gICAgICAgICAgICAgICAgYi5jb2xvciA9IHBbaV0uY29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsIHJlc2l6ZSB0byBmaXggYXNwZWN0c1xuICAgICAgICBHQU1FLnJlc2l6ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ3AuY29ubmVjdGlvbicsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZihkYXRhLnBsYXllci5wbGF5ZXJfaWQgIT09IEdBTUUubWUucGxheWVyX2lkKXtcbiAgICAgICAgICAgIHZhciBiID0gbmV3IEJhc2UoZGF0YS5wbGF5ZXIuYXNwZWN0X2xlZnQsIGRhdGEucGxheWVyLmFzcGVjdF90b3AsIGRhdGEucGxheWVyLmFzcGVjdF9zaXplLCBkYXRhLnBsYXllci5jb2xvcik7XG4gICAgICAgICAgICBiLnBsYXllcl9pZCA9IGRhdGEucGxheWVyLnBsYXllcl9pZDtcbiAgICAgICAgICAgIEdBTUUuYmFzZXMucHVzaChiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdwLmRpc2Nvbm5lY3Rpb24nLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGkgPSBHQU1FLmJhc2VzLmluZGV4QnlJRChkYXRhLnBsYXllcl9pZCk7XG4gICAgICAgIGlmKGkgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBHQU1FLmJhc2VzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ2IubWluaW9uJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZhciBzb3VyY2VfaW5kZXggPSBHQU1FLmJhc2VzLmluZGV4QnlJRChkYXRhLnNvdXJjZV9pZCk7XG4gICAgICAgIHZhciB0YXJnZXRfaW5kZXggPSBHQU1FLmJhc2VzLmluZGV4QnlJRChkYXRhLnRhcmdldF9pZCk7XG5cbiAgICAgICAgaWYoc291cmNlX2luZGV4ICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0X2luZGV4ICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgR0FNRS5taW5pb25zLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IE1pbmlvbihHQU1FLmJhc2VzW3NvdXJjZV9pbmRleF0sIEdBTUUuYmFzZXNbdGFyZ2V0X2luZGV4XSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG59OyIsIlxuaW1wb3J0IHsgZHJhd0NpcmNsZSB9IGZyb20gJy4uL3V0aWwvZHJhdyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZSB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSwgaWQsIGxlZnQsIHRvcCwgc2NhbGUsIHJlc291cmNlcywgcmVzb3VyY2VzX21heCkge1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5pZCA9IGlkO1xuXG4gICAgdGhpcy54ID0gLTE7XG4gICAgdGhpcy55ID0gLTE7XG4gICAgdGhpcy5zaXplID0gLTE7XG5cbiAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgIHRoaXMudG9wID0gdG9wO1xuICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCAwLjE7XG4gICAgdGhpcy5zaGFkb3dfc2l6ZSA9IDMwO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjQUFBQUFBJztcblxuICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcbiAgICB0aGlzLnRhcmdldGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLnNwYXduX2RlbGF5ID0gMDtcbiAgICB0aGlzLnNwYXduX2RlbGF5X21heCA9IDAuNTtcblxuICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzIHx8IDA7XG4gICAgdGhpcy5yZXNvdXJjZXNfbWF4ID0gcmVzb3VyY2VzX21heDtcblxuICAgIHRoaXMucGxheWVyID0gbnVsbDtcblxuICAgIHRoaXMucmVzaXplKCk7XG4gIH1cblxuXG4gIHVwZGF0ZSh0aW1lKSB7XG4gICAgaWYodGhpcy5zcGF3bl9kZWxheSA+IDApXG4gICAgICB0aGlzLnNwYXduX2RlbGF5IC09IHRpbWU7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5zYXZlKCk7XG5cblxuICAgIGlmICh0aGlzLmhvdmVyZWQpe1xuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gdGhpcy5jb2xvcjtcbiAgICAgIGN0eC5zaGFkb3dCbHVyID0gMTA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkKXtcbiAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHRoaXMuY29sb3I7XG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDIwO1xuICAgIH1cblxuICAgIGRyYXdDaXJjbGUoY3R4LCB0aGlzLngsIHRoaXMueSwgdGhpcy5zaXplLCB0aGlzLmNvbG9yLCAnZmlsbCcpO1xuXG4gICAgLy8gRHJhdyB0ZXh0XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgdmFyIHRleHQgPSB0aGlzLnJlc291cmNlcyArICgodGhpcy5wbGF5ZXIpPyAnLycgKyB0aGlzLnJlc291cmNlc19tYXggOiAnJyk7XG4gICAgdmFyIG0gPSBjdHgubWVhc3VyZVRleHQodGV4dCk7XG4gICAgY3R4LmZpbGxUZXh0KHRleHQsIHRoaXMueCAtIG0ud2lkdGgvMiwgdGhpcy55KTtcblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cblxuXG4gIHJlc2l6ZSgpIHtcbiAgICBpZiAodGhpcy5nYW1lLndpZHRoID4gdGhpcy5nYW1lLmhlaWdodCkge1xuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5sZWZ0O1xuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMudG9wO1xuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMuc2NhbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMueCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLmdhbWUud2lkdGggKiB0aGlzLnRvcCk7XG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy5sZWZ0O1xuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5zY2FsZTtcbiAgICB9XG4gIH1cblxuICBzZXRQbGF5ZXIocGxheWVyKSB7XG4gICAgaWYgKHRoaXMucGxheWVyKXtcbiAgICAgIHRoaXMucGxheWVyLnJlbW92ZUJhc2UodGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb2xvciA9IHBsYXllci5jb2xvcjtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICB0aGlzLnBsYXllci5hZGRCYXNlKHRoaXMpO1xuICB9XG5cbiAgY2FuU2VuZE1pbmlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuc3Bhd25fZGVsYXkgPD0gMC4wKTtcbiAgfVxuXG4gIHNlbmRNaW5pb24oKSB7XG4gICAgdGhpcy5zcGF3bl9kZWxheSA9IHRoaXMuc3Bhd25fZGVsYXlfbWF4O1xuICAgIC0tdGhpcy5yZXNvdXJjZXM7XG4gIH1cbn1cbiIsIlxuaW1wb3J0IHsgcG9pbnRJbkNpcmNsZSwgdmVjRGlzdGFuY2UgfSBmcm9tICcuLi91dGlsL21hdGgnXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW9uIHtcblxuICBjb25zdHJ1Y3RvcihpZCwgc291cmNlLCB0YXJnZXQsIHNjYWxlKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuXG4gICAgdGhpcy5zb3VyY2VfYmFzZSA9IHNvdXJjZTtcbiAgICB0aGlzLnRhcmdldF9iYXNlID0gdGFyZ2V0O1xuXG4gICAgdGhpcy54ID0gdGhpcy5zb3VyY2VfYmFzZS54O1xuICAgIHRoaXMueSA9IHRoaXMuc291cmNlX2Jhc2UueTtcbiAgICB0aGlzLnNjYWxlID0gc2NhbGUgfHwgMC4wMTtcbiAgICB0aGlzLnNpemUgPSAxMDtcbiAgICB0aGlzLmNvbG9yID0gdGhpcy5zb3VyY2VfYmFzZS5jb2xvcjtcblxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLmRlYWRfYnlfc2VydmVyID0gZmFsc2U7XG5cbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5hY3RpdmVfdGltZSA9IDA7XG5cbiAgICB0aGlzLnNwZWVkID0gMztcblxuICAgIHRoaXMucmVzaXplKCk7XG4gIH1cblxuICB1cGRhdGUodGltZSkge1xuICAgIHRoaXMuYWN0aXZlX3RpbWUgKz0gdDtcblxuICAgIHRoaXMueCA9IHRoaXMuc291cmNlX2Jhc2UueCArIHRoaXMudmVsX3ggKiB0aGlzLmFjdGl2ZV90aW1lO1xuICAgIHRoaXMueSA9IHRoaXMuc291cmNlX2Jhc2UueSArIHRoaXMudmVsX3kgKiB0aGlzLmFjdGl2ZV90aW1lO1xuXG4gICAgaWYocG9pbnRJbkNpcmNsZSh0aGlzLngsIHRoaXMueSwgdGhpcy50YXJnZXRfYmFzZS54LCB0aGlzLnRhcmdldF9iYXNlLnksIHRoaXMudGFyZ2V0X2Jhc2Uuc2l6ZSkpe1xuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMuc2l6ZSwgTWF0aC5QSSoyLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgfVxuXG5cbiAgcmVzaXplKCkge1xuICAgIGxldCBkZWx0YV9zcGVlZCA9ICgoR0FNRS53aWR0aCA+IEdBTUUuaGVpZ2h0KT8gR0FNRS53aWR0aCA6IEdBTUUuaGVpZ2h0KSAvIHRoaXMuc3BlZWQ7XG5cbiAgICBsZXQgZGlzdGFuY2UgPSB2ZWNEaXN0YW5jZSh0aGlzLnNvdXJjZV9iYXNlLngsIHRoaXMuc291cmNlX2Jhc2UueSwgdGhpcy50YXJnZXRfYmFzZS54LCB0aGlzLnRhcmdldF9iYXNlLnkpO1xuICAgIGxldCBkaXN0YW5jZV94ID0gdGhpcy50YXJnZXRfYmFzZS54IC0gdGhpcy5zb3VyY2VfYmFzZS54O1xuICAgIGxldCBkaXN0YW5jZV95ID0gdGhpcy50YXJnZXRfYmFzZS55IC0gdGhpcy5zb3VyY2VfYmFzZS55O1xuXG4gICAgdGhpcy52ZWxfeCA9IChkaXN0YW5jZV94IC8gTWF0aC5hYnMoKGRpc3RhbmNlIC8gZGVsdGFfc3BlZWQpKSkgfHwgMDtcbiAgICB0aGlzLnZlbF95ID0gKGRpc3RhbmNlX3kgLyBNYXRoLmFicygoZGlzdGFuY2UgLyBkZWx0YV9zcGVlZCkpKSB8fCAwO1xuXG4gICAgdGhpcy5zaXplID0gKChHQU1FLndpZHRoID4gR0FNRS5oZWlnaHQpPyBHQU1FLmhlaWdodCA6IEdBTUUud2lkdGgpICogdGhpcy5zY2FsZTtcbiAgfVxuXG59OyIsIlxuaW1wb3J0IHsgaGV4Y29sb3JUb1JHQiB9IGZyb20gJy4uL3V0aWwvY29sb3InO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnRpY2xlIHtcbiAgXG4gIGNvbnN0dWN0b3IoZ2FtZSwgbGVmdCwgdG9wLCBzY2FsZSwgY29sb3IpIHtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuXG4gICAgdGhpcy54ID0gLTE7XG4gICAgdGhpcy55ID0gLTE7XG4gICAgdGhpcy5zaXplID0gLTE7XG5cbiAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgIHRoaXMudG9wID0gdG9wO1xuICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCAwLjAxO1xuXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yIHx8ICcjQUFBQUFBJztcbiAgICB0aGlzLnJnYmEgPSBoZXhjb2xvclRvUkdCKHRoaXMuY29sb3IpO1xuICAgIHRoaXMucmdiYVszXSA9IDEuMDtcblxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLmxpdmVfY291bnQgPSAwLjA7XG5cbiAgICB0aGlzLnJlc2l6ZSgpO1xuICB9XG5cblxuICB1cGRhdGUodGltZSkge1xuICAgIHRoaXMubGl2ZV9jb3VudCArPSB0aW1lO1xuICAgIHRoaXMucmdiYVszXSAtPSB0aW1lICogMC41O1xuXG4gICAgaWYgKHRoaXMucmdiYVszXSA8IDApXG4gICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB9XG5cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5zYXZlKCk7XG5cbiAgICBsZXQgW3IsIGcsIGIsIGFdID0gdGhpcy5yZ2JhO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2JhKCR7cn0sJHtnfSwke2J9LCR7YX0pYDtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUgKyAodGhpcy5saXZlX2NvdW50ICogMTApLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG5cblxuICByZXNpemUoKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA+IHRoaXMuZ2FtZS5oZWlnaHQpIHtcbiAgICAgIHRoaXMueCA9IHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMubGVmdDtcbiAgICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnRvcDtcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnNjYWxlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5nYW1lLndpZHRoICogdGhpcy50b3ApO1xuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMubGVmdDtcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMuc2NhbGU7XG4gICAgfVxuICB9XG5cbn0iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSwgaWQsIG5hbWUsIGNvbG9yKSB7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcblxuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcblxuICAgIHRoaXMuYmFzZXNfaWQgPSBbXTtcbiAgfVxuXG4gIGFkZEJhc2UoYmFzZSkge1xuICAgIGlmKCF0aGlzLmJhc2VzX2lkLmNvbnRhaW5zKGJhc2UuaWQpKVxuICAgICAgdGhpcy5iYXNlc19pZC5wdXNoKGJhc2UuaWQpO1xuICB9XG5cbiAgcmVtb3ZlQmFzZShiYXNlKSB7XG4gICAgbGV0IGkgPSB0aGlzLmJhc2VzX2lkLmluZGV4T2YoYmFzZS5pZCk7XG4gICAgaWYoaSAhPT0gLTEpXG4gICAgICB0aGlzLmJhc2VzX2lkLnNwbGljZShpLCAxKTtcbiAgfVxuXG4gIHRvdGFsUmVzb3VyY2VzKCkge1xuICAgIGxldCB0b3RhbCA9IDA7XG5cbiAgICBmb3IobGV0IGkgPSB0aGlzLmJhc2VzX2lkLmxlbmd0aDsgaS0tOyApe1xuICAgICAgbGV0IGJhc2UgPSB0aGlzLmdhbWUuZ2V0QnlJRCh0aGlzLmdhbWUuYmFzZXMsIHRoaXMuYmFzZXNfaWRbaV0pO1xuICAgICAgdG90YWwgKz0gYmFzZS5yZXNvdXJjZXM7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbDtcbiAgfVxufSIsIlxuXG5pbXBvcnQgeyByYW5kb21SYW5nZUludCB9IGZyb20gJy4vdXRpbC91dGlsLmpzJztcbmltcG9ydCB7IEF1ZGlvQ29udGV4dCB9IGZyb20gJy4vdXRpbC9wcmVmaXhlci5qcyc7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZE1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xuICAgIHRoaXMuc291bmRfbmFtZXMgPSBbXTtcbiAgICB0aGlzLnN0YXJ0dXBfZXZlbnQgPSBudWxsO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAoIUF1ZGlvQ29udGV4dCkge1xuICAgICAgdGhyb3cgXCJBdWRpb0NvbnRleHQgbm90IHN1cHBvcnRlZCBieSBicm93c2VyXCI7XG4gICAgfVxuXG4gICAgdGhpcy5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbiAgICB0aGlzLmluaXRTb3VuZHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICBpbml0U291bmRzKCkgeyAgXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzQud2F2JywgJ2M0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDQud2F2JywgJ2Q0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTQud2F2JywgJ2U0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZjQud2F2JywgJ2Y0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZzQud2F2JywgJ2c0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTQud2F2JywgJ2E0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYjQud2F2JywgJ2I0Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzUud2F2JywgJ2M1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDUud2F2JywgJ2Q1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTUud2F2JywgJ2U1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZjUud2F2JywgJ2Y1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZzUud2F2JywgJ2c1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTUud2F2JywgJ2E1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYjUud2F2JywgJ2I1Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzYud2F2JywgJ2M2Jyk7XG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDYud2F2JywgJ2Q2Jyk7XG4gIH1cblxuXG4gIGxvYWRTb3VuZCh1cmwsIG5hbWUpIHtcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHRoaXMuY3R4LmRlY29kZUF1ZGlvRGF0YSh4aHIucmVzcG9uc2UsIChidWZmZXIpID0+IHtcbiAgICAgICAgdGhpcy5zb3VuZF9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgICB0aGlzLnNvdW5kc1tuYW1lXSA9IGJ1ZmZlcjtcblxuICAgICAgICBpZigndG91Y2hzdGFydCcgaW4gd2luZG93ICYmIHRoaXMuc3RhcnR1cF9ldmVudCA9PT0gbnVsbCl7XG4gICAgICAgICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU291bmQoKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgeGhyLnNlbmQoKTtcbiAgfVxuXG5cbiAgcGxheVNvdW5kKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuc291bmRzW25hbWVdKSByZXR1cm47XG5cbiAgICBsZXQgc291bmQgPSB0aGlzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICBzb3VuZC5idWZmZXIgPSB0aGlzLnNvdW5kc1tuYW1lXTtcblxuICAgIGxldCBnYWluID0gdGhpcy5jcmVhdGVHYWluTm9kZSgwLjgsIDAuMCwgMC40KTtcblxuICAgIHNvdW5kLmNvbm5lY3QoZ2Fpbik7XG4gICAgZ2Fpbi5jb25uZWN0KHRoaXMuY3R4LmRlc3RpbmF0aW9uKTtcblxuICAgIHNvdW5kLnN0YXJ0KDApO1xuICB9XG5cbiAgY3JlYXRlR2Fpbk5vZGUoc3RhcnQsIGVuZCwgdGltZSkge1xuICAgIGxldCBub2RlID0gdGhpcy5jdHguY3JlYXRlR2FpbigpO1xuICAgIGxldCBub3cgPSB0aGlzLmN0eC5jdXJyZW50VGltZTtcblxuICAgIG5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShzdGFydCwgbm93KTtcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZW5kLCBub3cgKyB0aW1lKTtcblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcGxheVJhbmRvbVNvdW5kKCkge1xuICAgIHRoaXMucGxheVNvdW5kKHRoaXMuc291bmRfbmFtZXNbcmFuZG9tUmFuZ2VJbnQoMCwgdGhpcy5zb3VuZF9uYW1lcy5sZW5ndGgpXSk7XG4gIH1cbn0iLCJmdW5jdGlvbiBoZXhjaGFyVG9EZWMoaGV4dmFsKXtcbiAgICB2YXIgYyA9IGhleHZhbC50b1VwcGVyQ2FzZSgpLmNoYXJDb2RlQXQoMCk7XG4gICAgcmV0dXJuIChjIDwgNjApPyAoYy00OCkgOiAoYy01NSk7XG59XG5mdW5jdGlvbiBoZXhjb2xvclRvUkdCKGhleCl7XG4gICAgaGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgdmFyIHJnYiA9IFtdO1xuICAgIHZhciBpbmMgPSAoaGV4Lmxlbmd0aCA8IDYpPyAxIDogMjtcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBoZXgubGVuZ3RoOyBpIDwgbGVuOyBpKz1pbmMpe1xuICAgICAgICAvLyB2YXIgdiA9IGhleC5zdWJzdHIoaSwgaW5jKTtcbiAgICAgICAgcmdiLnB1c2gocGFyc2VJbnQoaGV4LnN1YnN0cihpLCBpbmMpLCAxNikpO1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xufVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBoZXhjaGFyVG9EZWMsXG4gICAgaGV4Y29sb3JUb1JHQlxufTsiLCJcbmZ1bmN0aW9uIGRyYXdMaW5lKGN0eCwgeDEsIHkxLCB4MiwgeTIsIGNvbG9yLCB3aWR0aCl7XG5cbiAgaWYoY29sb3IpIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBpZih3aWR0aCkgY3R4LmxpbmVXaWR0aCA9IHdpZHRoO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xuICBjdHgubGluZVRvKHgyLCB5Mik7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd0NpcmNsZShjdHgsIHgsIHksIHIsIGNvbG9yLCBzdHlsZSA9ICdmaWxsJyl7XG5cbiAgaWYoY29sb3IpIGN0eFtzdHlsZSsnU3R5bGUnXSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmFyYyh4LCB5LCByLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgY3R4W3N0eWxlXSgpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkcmF3TGluZSxcbiAgZHJhd0NpcmNsZVxufSIsIlxuZnVuY3Rpb24gdmVjRGlzdGFuY2VTcSh4MSwgeTEsIHgyLCB5Mil7XG4gICAgcmV0dXJuIE1hdGgucG93KHgxLXgyLCAyKSArIE1hdGgucG93KHkxLXkyLCAyKTtcbn1cbmZ1bmN0aW9uIHZlY0Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKXtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHZlY0Rpc3RhbmNlU3EoeDEsIHkxLCB4MiwgeTIpKTtcbn1cbmZ1bmN0aW9uIHBvaW50SW5DaXJjbGUocHgsIHB5LCBjeCwgY3ksIGNyKXtcbiAgICByZXR1cm4gKHZlY0Rpc3RhbmNlU3EocHgsIHB5LCBjeCwgY3kpIDwgTWF0aC5wb3coY3IsIDIpKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmVjRGlzdGFuY2VTcSxcbiAgdmVjRGlzdGFuY2UsXG4gIHBvaW50SW5DaXJjbGVcbn07IiwiXG5leHBvcnQgbGV0IHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDAvNjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbmV4cG9ydCBsZXQgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dDtcblxuXG5leHBvcnQgbGV0IHBlcmZvcm1hbmNlID0gd2luZG93LnBlcmZvcm1hbmNlID0ge307XG5wZXJmb3JtYW5jZS5ub3cgPSBwZXJmb3JtYW5jZS5ub3cgfHxcbiAgICAgICAgICAgICAgICAgIHBlcmZvcm1hbmNlLndlYmtpdE5vdyB8fFxuICAgICAgICAgICAgICAgICAgcGVyZm9ybWFuY2UubW96Tm93IHx8XG4gICAgICAgICAgICAgICAgICBwZXJmb3JtYW5jZS5tc05vdyB8fFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpOyB9O1xuXG5cbmV4cG9ydCBsZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fFxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96QXVkaW9Db250ZXh0IHx8XG4gICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuXG5cbi8qbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUsXG4gIHBlcmZvcm1hbmNlLFxuICBBdWRpb0NvbnRleHRcbn07Ki8iLCJcbmZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pKSArIG1pbik7XG59XG5mdW5jdGlvbiByYW5kb21SYW5nZUludChtaW4sIG1heCl7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikpICsgbWluKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbVJhbmdlLFxuICByYW5kb21SYW5nZUludFxufSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcblwidXNlIHN0cmljdFwiO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9zaGltXCIpO1xuXG5yZXF1aXJlKFwicmVnZW5lcmF0b3ItYmFiZWwvcnVudGltZVwiKTtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBDb3JlLmpzIDAuNi4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qc1xuICogTGljZW5zZTogaHR0cDovL3JvY2subWl0LWxpY2Vuc2Uub3JnXG4gKiDCqSAyMDE1IERlbmlzIFB1c2hrYXJldlxuICovXG4hZnVuY3Rpb24oZ2xvYmFsLCBmcmFtZXdvcmssIHVuZGVmaW5lZCl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLy8gU2hvcnRjdXRzIGZvciBbW0NsYXNzXV0gJiBwcm9wZXJ0eSBuYW1lc1xyXG52YXIgT0JKRUNUICAgICAgICAgID0gJ09iamVjdCdcclxuICAsIEZVTkNUSU9OICAgICAgICA9ICdGdW5jdGlvbidcclxuICAsIEFSUkFZICAgICAgICAgICA9ICdBcnJheSdcclxuICAsIFNUUklORyAgICAgICAgICA9ICdTdHJpbmcnXHJcbiAgLCBOVU1CRVIgICAgICAgICAgPSAnTnVtYmVyJ1xyXG4gICwgUkVHRVhQICAgICAgICAgID0gJ1JlZ0V4cCdcclxuICAsIERBVEUgICAgICAgICAgICA9ICdEYXRlJ1xyXG4gICwgTUFQICAgICAgICAgICAgID0gJ01hcCdcclxuICAsIFNFVCAgICAgICAgICAgICA9ICdTZXQnXHJcbiAgLCBXRUFLTUFQICAgICAgICAgPSAnV2Vha01hcCdcclxuICAsIFdFQUtTRVQgICAgICAgICA9ICdXZWFrU2V0J1xyXG4gICwgU1lNQk9MICAgICAgICAgID0gJ1N5bWJvbCdcclxuICAsIFBST01JU0UgICAgICAgICA9ICdQcm9taXNlJ1xyXG4gICwgTUFUSCAgICAgICAgICAgID0gJ01hdGgnXHJcbiAgLCBBUkdVTUVOVFMgICAgICAgPSAnQXJndW1lbnRzJ1xyXG4gICwgUFJPVE9UWVBFICAgICAgID0gJ3Byb3RvdHlwZSdcclxuICAsIENPTlNUUlVDVE9SICAgICA9ICdjb25zdHJ1Y3RvcidcclxuICAsIFRPX1NUUklORyAgICAgICA9ICd0b1N0cmluZydcclxuICAsIFRPX1NUUklOR19UQUcgICA9IFRPX1NUUklORyArICdUYWcnXHJcbiAgLCBUT19MT0NBTEUgICAgICAgPSAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgLCBIQVNfT1dOICAgICAgICAgPSAnaGFzT3duUHJvcGVydHknXHJcbiAgLCBGT1JfRUFDSCAgICAgICAgPSAnZm9yRWFjaCdcclxuICAsIElURVJBVE9SICAgICAgICA9ICdpdGVyYXRvcidcclxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQCcgKyBJVEVSQVRPUlxyXG4gICwgUFJPQ0VTUyAgICAgICAgID0gJ3Byb2Nlc3MnXHJcbiAgLCBDUkVBVEVfRUxFTUVOVCAgPSAnY3JlYXRlRWxlbWVudCdcclxuICAvLyBBbGlhc2VzIGdsb2JhbCBvYmplY3RzIGFuZCBwcm90b3R5cGVzXHJcbiAgLCBGdW5jdGlvbiAgICAgICAgPSBnbG9iYWxbRlVOQ1RJT05dXHJcbiAgLCBPYmplY3QgICAgICAgICAgPSBnbG9iYWxbT0JKRUNUXVxyXG4gICwgQXJyYXkgICAgICAgICAgID0gZ2xvYmFsW0FSUkFZXVxyXG4gICwgU3RyaW5nICAgICAgICAgID0gZ2xvYmFsW1NUUklOR11cclxuICAsIE51bWJlciAgICAgICAgICA9IGdsb2JhbFtOVU1CRVJdXHJcbiAgLCBSZWdFeHAgICAgICAgICAgPSBnbG9iYWxbUkVHRVhQXVxyXG4gICwgRGF0ZSAgICAgICAgICAgID0gZ2xvYmFsW0RBVEVdXHJcbiAgLCBNYXAgICAgICAgICAgICAgPSBnbG9iYWxbTUFQXVxyXG4gICwgU2V0ICAgICAgICAgICAgID0gZ2xvYmFsW1NFVF1cclxuICAsIFdlYWtNYXAgICAgICAgICA9IGdsb2JhbFtXRUFLTUFQXVxyXG4gICwgV2Vha1NldCAgICAgICAgID0gZ2xvYmFsW1dFQUtTRVRdXHJcbiAgLCBTeW1ib2wgICAgICAgICAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICwgTWF0aCAgICAgICAgICAgID0gZ2xvYmFsW01BVEhdXHJcbiAgLCBUeXBlRXJyb3IgICAgICAgPSBnbG9iYWwuVHlwZUVycm9yXHJcbiAgLCBSYW5nZUVycm9yICAgICAgPSBnbG9iYWwuUmFuZ2VFcnJvclxyXG4gICwgc2V0VGltZW91dCAgICAgID0gZ2xvYmFsLnNldFRpbWVvdXRcclxuICAsIHNldEltbWVkaWF0ZSAgICA9IGdsb2JhbC5zZXRJbW1lZGlhdGVcclxuICAsIGNsZWFySW1tZWRpYXRlICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxyXG4gICwgcGFyc2VJbnQgICAgICAgID0gZ2xvYmFsLnBhcnNlSW50XHJcbiAgLCBpc0Zpbml0ZSAgICAgICAgPSBnbG9iYWwuaXNGaW5pdGVcclxuICAsIHByb2Nlc3MgICAgICAgICA9IGdsb2JhbFtQUk9DRVNTXVxyXG4gICwgbmV4dFRpY2sgICAgICAgID0gcHJvY2VzcyAmJiBwcm9jZXNzLm5leHRUaWNrXHJcbiAgLCBkb2N1bWVudCAgICAgICAgPSBnbG9iYWwuZG9jdW1lbnRcclxuICAsIGh0bWwgICAgICAgICAgICA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxyXG4gICwgbmF2aWdhdG9yICAgICAgID0gZ2xvYmFsLm5hdmlnYXRvclxyXG4gICwgZGVmaW5lICAgICAgICAgID0gZ2xvYmFsLmRlZmluZVxyXG4gICwgY29uc29sZSAgICAgICAgID0gZ2xvYmFsLmNvbnNvbGUgfHwge31cclxuICAsIEFycmF5UHJvdG8gICAgICA9IEFycmF5W1BST1RPVFlQRV1cclxuICAsIE9iamVjdFByb3RvICAgICA9IE9iamVjdFtQUk9UT1RZUEVdXHJcbiAgLCBGdW5jdGlvblByb3RvICAgPSBGdW5jdGlvbltQUk9UT1RZUEVdXHJcbiAgLCBJbmZpbml0eSAgICAgICAgPSAxIC8gMFxyXG4gICwgRE9UICAgICAgICAgICAgID0gJy4nO1xyXG5cclxuLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XHJcbiAgcmV0dXJuIGl0ICE9PSBudWxsICYmICh0eXBlb2YgaXQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGl0ID09ICdmdW5jdGlvbicpO1xyXG59XHJcbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJztcclxufVxyXG4vLyBOYXRpdmUgZnVuY3Rpb24/XHJcbnZhciBpc05hdGl2ZSA9IGN0eCgvLi8udGVzdCwgL1xcW25hdGl2ZSBjb2RlXFxdXFxzKlxcfVxccyokLywgMSk7XHJcblxyXG4vLyBPYmplY3QgaW50ZXJuYWwgW1tDbGFzc11dIG9yIHRvU3RyaW5nVGFnXHJcbi8vIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcclxudmFyIHRvU3RyaW5nID0gT2JqZWN0UHJvdG9bVE9fU1RSSU5HXTtcclxuZnVuY3Rpb24gc2V0VG9TdHJpbmdUYWcoaXQsIHRhZywgc3RhdCl7XHJcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0W1BST1RPVFlQRV0sIFNZTUJPTF9UQUcpKWhpZGRlbihpdCwgU1lNQk9MX1RBRywgdGFnKTtcclxufVxyXG5mdW5jdGlvbiBjb2YoaXQpe1xyXG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XHJcbn1cclxuZnVuY3Rpb24gY2xhc3NvZihpdCl7XHJcbiAgdmFyIE8sIFQ7XHJcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xyXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1NZTUJPTF9UQUddKSA9PSAnc3RyaW5nJyA/IFQgOiBjb2YoTyk7XHJcbn1cclxuXHJcbi8vIEZ1bmN0aW9uXHJcbnZhciBjYWxsICA9IEZ1bmN0aW9uUHJvdG8uY2FsbFxyXG4gICwgYXBwbHkgPSBGdW5jdGlvblByb3RvLmFwcGx5XHJcbiAgLCBSRUZFUkVOQ0VfR0VUO1xyXG4vLyBQYXJ0aWFsIGFwcGx5XHJcbmZ1bmN0aW9uIHBhcnQoLyogLi4uYXJncyAqLyl7XHJcbiAgdmFyIGZuICAgICA9IGFzc2VydEZ1bmN0aW9uKHRoaXMpXHJcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJncyAgID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIF8gICAgICA9IHBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXHJcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBpID0gMCwgaiA9IDAsIF9hcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICAgIF9hcmdzID0gYXJncy5zbGljZSgpO1xyXG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gaTsgaSsrKWlmKF9hcmdzW2ldID09PSBfKV9hcmdzW2ldID0gYXJndW1lbnRzW2orK107XHJcbiAgICB3aGlsZShfbGVuZ3RoID4gailfYXJncy5wdXNoKGFyZ3VtZW50c1tqKytdKTtcclxuICAgIHJldHVybiBpbnZva2UoZm4sIF9hcmdzLCB0aGF0KTtcclxuICB9XHJcbn1cclxuLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXHJcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCwgbGVuZ3RoKXtcclxuICBhc3NlcnRGdW5jdGlvbihmbik7XHJcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xyXG4gIHN3aXRjaChsZW5ndGgpe1xyXG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICB9XHJcbn1cclxuLy8gRmFzdCBhcHBseVxyXG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcclxuZnVuY3Rpb24gaW52b2tlKGZuLCBhcmdzLCB0aGF0KXtcclxuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XHJcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoIHwgMCl7XHJcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcclxuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcclxuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcclxuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcclxuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcclxuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XHJcbn1cclxuXHJcbi8vIE9iamVjdDpcclxudmFyIGNyZWF0ZSAgICAgICAgICAgPSBPYmplY3QuY3JlYXRlXHJcbiAgLCBnZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LmdldFByb3RvdHlwZU9mXHJcbiAgLCBzZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LnNldFByb3RvdHlwZU9mXHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XHJcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXNcclxuICAsIGdldE93bkRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXHJcbiAgLCBnZXRLZXlzICAgICAgICAgID0gT2JqZWN0LmtleXNcclxuICAsIGdldE5hbWVzICAgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gICwgZ2V0U3ltYm9scyAgICAgICA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHNcclxuICAsIGlzRnJvemVuICAgICAgICAgPSBPYmplY3QuaXNGcm96ZW5cclxuICAsIGhhcyAgICAgICAgICAgICAgPSBjdHgoY2FsbCwgT2JqZWN0UHJvdG9bSEFTX09XTl0sIDIpXHJcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXHJcbiAgLCBFUzVPYmplY3QgICAgICAgID0gT2JqZWN0XHJcbiAgLCBEaWN0O1xyXG5mdW5jdGlvbiB0b09iamVjdChpdCl7XHJcbiAgcmV0dXJuIEVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gcmV0dXJuSXQoaXQpe1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5UaGlzKCl7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuZnVuY3Rpb24gZ2V0KG9iamVjdCwga2V5KXtcclxuICBpZihoYXMob2JqZWN0LCBrZXkpKXJldHVybiBvYmplY3Rba2V5XTtcclxufVxyXG5mdW5jdGlvbiBvd25LZXlzKGl0KXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHJldHVybiBnZXRTeW1ib2xzID8gZ2V0TmFtZXMoaXQpLmNvbmNhdChnZXRTeW1ib2xzKGl0KSkgOiBnZXROYW1lcyhpdCk7XHJcbn1cclxuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxyXG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSl7XHJcbiAgdmFyIFQgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxyXG4gICAgICAsIGtleXMgICA9IGdldEtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn1cclxuZnVuY3Rpb24ga2V5T2Yob2JqZWN0LCBlbCl7XHJcbiAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59XHJcblxyXG4vLyBBcnJheVxyXG4vLyBhcnJheSgnc3RyMSxzdHIyLHN0cjMnKSA9PiBbJ3N0cjEnLCAnc3RyMicsICdzdHIzJ11cclxuZnVuY3Rpb24gYXJyYXkoaXQpe1xyXG4gIHJldHVybiBTdHJpbmcoaXQpLnNwbGl0KCcsJyk7XHJcbn1cclxudmFyIHB1c2ggICAgPSBBcnJheVByb3RvLnB1c2hcclxuICAsIHVuc2hpZnQgPSBBcnJheVByb3RvLnVuc2hpZnRcclxuICAsIHNsaWNlICAgPSBBcnJheVByb3RvLnNsaWNlXHJcbiAgLCBzcGxpY2UgID0gQXJyYXlQcm90by5zcGxpY2VcclxuICAsIGluZGV4T2YgPSBBcnJheVByb3RvLmluZGV4T2ZcclxuICAsIGZvckVhY2ggPSBBcnJheVByb3RvW0ZPUl9FQUNIXTtcclxuLypcclxuICogMCAtPiBmb3JFYWNoXHJcbiAqIDEgLT4gbWFwXHJcbiAqIDIgLT4gZmlsdGVyXHJcbiAqIDMgLT4gc29tZVxyXG4gKiA0IC0+IGV2ZXJ5XHJcbiAqIDUgLT4gZmluZFxyXG4gKiA2IC0+IGZpbmRJbmRleFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlNZXRob2QodHlwZSl7XHJcbiAgdmFyIGlzTWFwICAgICAgID0gdHlwZSA9PSAxXHJcbiAgICAsIGlzRmlsdGVyICAgID0gdHlwZSA9PSAyXHJcbiAgICAsIGlzU29tZSAgICAgID0gdHlwZSA9PSAzXHJcbiAgICAsIGlzRXZlcnkgICAgID0gdHlwZSA9PSA0XHJcbiAgICAsIGlzRmluZEluZGV4ID0gdHlwZSA9PSA2XHJcbiAgICAsIG5vaG9sZXMgICAgID0gdHlwZSA9PSA1IHx8IGlzRmluZEluZGV4O1xyXG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIHRoYXQgICA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAsIHNlbGYgICA9IEVTNU9iamVjdChPKVxyXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBpc01hcCA/IEFycmF5KGxlbmd0aCkgOiBpc0ZpbHRlciA/IFtdIDogdW5kZWZpbmVkXHJcbiAgICAgICwgdmFsLCByZXM7XHJcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKG5vaG9sZXMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZih0eXBlKXtcclxuICAgICAgICBpZihpc01hcClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoaXNFdmVyeSlyZXR1cm4gZmFsc2U7ICAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNGaW5kSW5kZXggPyAtMSA6IGlzU29tZSB8fCBpc0V2ZXJ5ID8gaXNFdmVyeSA6IHJlc3VsdDtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlDb250YWlucyhpc0NvbnRhaW5zKXtcclxuICByZXR1cm4gZnVuY3Rpb24oZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aCk7XHJcbiAgICBpZihpc0NvbnRhaW5zICYmIGVsICE9IGVsKXtcclxuICAgICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihzYW1lTmFOKE9baW5kZXhdKSlyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKGlzQ29udGFpbnMgfHwgaW5kZXggaW4gTyl7XHJcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gcmV0dXJuICFpc0NvbnRhaW5zICYmIC0xO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBnZW5lcmljKEEsIEIpe1xyXG4gIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgdnMgaXNGdW5jdGlvblxyXG4gIHJldHVybiB0eXBlb2YgQSA9PSAnZnVuY3Rpb24nID8gQSA6IEI7XHJcbn1cclxuXHJcbi8vIE1hdGhcclxudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmIC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcclxuICAsIHBvdyAgICA9IE1hdGgucG93XHJcbiAgLCBhYnMgICAgPSBNYXRoLmFic1xyXG4gICwgY2VpbCAgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciAgPSBNYXRoLmZsb29yXHJcbiAgLCBtYXggICAgPSBNYXRoLm1heFxyXG4gICwgbWluICAgID0gTWF0aC5taW5cclxuICAsIHJhbmRvbSA9IE1hdGgucmFuZG9tXHJcbiAgLCB0cnVuYyAgPSBNYXRoLnRydW5jIHx8IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxuICAgIH1cclxuLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuZnVuY3Rpb24gc2FtZU5hTihudW1iZXIpe1xyXG4gIHJldHVybiBudW1iZXIgIT0gbnVtYmVyO1xyXG59XHJcbi8vIDcuMS40IFRvSW50ZWdlclxyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiBpc05hTihpdCkgPyAwIDogdHJ1bmMoaXQpO1xyXG59XHJcbi8vIDcuMS4xNSBUb0xlbmd0aFxyXG5mdW5jdGlvbiB0b0xlbmd0aChpdCl7XHJcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCBNQVhfU0FGRV9JTlRFR0VSKSA6IDA7XHJcbn1cclxuZnVuY3Rpb24gdG9JbmRleChpbmRleCwgbGVuZ3RoKXtcclxuICB2YXIgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xyXG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xyXG59XHJcbmZ1bmN0aW9uIGx6KG51bSl7XHJcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVJlcGxhY2VyKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xyXG4gIHZhciByZXBsYWNlciA9IGlzT2JqZWN0KHJlcGxhY2UpID8gZnVuY3Rpb24ocGFydCl7XHJcbiAgICByZXR1cm4gcmVwbGFjZVtwYXJ0XTtcclxuICB9IDogcmVwbGFjZTtcclxuICByZXR1cm4gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIFN0cmluZyhpc1N0YXRpYyA/IGl0IDogdGhpcykucmVwbGFjZShyZWdFeHAsIHJlcGxhY2VyKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlUG9pbnRBdCh0b1N0cmluZyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHBvcyl7XHJcbiAgICB2YXIgcyA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxyXG4gICAgICAsIGwgPSBzLmxlbmd0aFxyXG4gICAgICAsIGEsIGI7XHJcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIHRvU3RyaW5nID8gJycgOiB1bmRlZmluZWQ7XHJcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcclxuICAgICAgPyB0b1N0cmluZyA/IHMuY2hhckF0KGkpIDogYVxyXG4gICAgICA6IHRvU3RyaW5nID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQXNzZXJ0aW9uICYgZXJyb3JzXHJcbnZhciBSRURVQ0VfRVJST1IgPSAnUmVkdWNlIG9mIGVtcHR5IG9iamVjdCB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcclxuICBpZighY29uZGl0aW9uKXRocm93IFR5cGVFcnJvcihtc2cyID8gbXNnMSArIG1zZzIgOiBtc2cxKTtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcclxuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0RnVuY3Rpb24oaXQpe1xyXG4gIGFzc2VydChpc0Z1bmN0aW9uKGl0KSwgaXQsICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydE9iamVjdChpdCl7XHJcbiAgYXNzZXJ0KGlzT2JqZWN0KGl0KSwgaXQsICcgaXMgbm90IGFuIG9iamVjdCEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0SW5zdGFuY2UoaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcclxuICBhc3NlcnQoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvciwgbmFtZSwgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xyXG59XHJcblxyXG4vLyBQcm9wZXJ0eSBkZXNjcmlwdG9ycyAmIFN5bWJvbFxyXG5mdW5jdGlvbiBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpe1xyXG4gIHJldHVybiB7XHJcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXHJcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXHJcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXHJcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNpbXBsZVNldChvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gIG9iamVjdFtrZXldID0gdmFsdWU7XHJcbiAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XHJcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpKTtcclxuICB9IDogc2ltcGxlU2V0O1xyXG59XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiBTWU1CT0wgKyAnKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgcmFuZG9tKCkpW1RPX1NUUklOR10oMzYpO1xyXG59XHJcbmZ1bmN0aW9uIGdldFdlbGxLbm93blN5bWJvbChuYW1lLCBzZXR0ZXIpe1xyXG4gIHJldHVybiAoU3ltYm9sICYmIFN5bWJvbFtuYW1lXSkgfHwgKHNldHRlciA/IFN5bWJvbCA6IHNhZmVTeW1ib2wpKFNZTUJPTCArIERPVCArIG5hbWUpO1xyXG59XHJcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxyXG52YXIgREVTQyA9ICEhZnVuY3Rpb24oKXtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDIgfX0pLmEgPT0gMjtcclxuICAgICAgfSBjYXRjaChlKXt9XHJcbiAgICB9KClcclxuICAsIHNpZCAgICA9IDBcclxuICAsIGhpZGRlbiA9IGNyZWF0ZURlZmluZXIoMSlcclxuICAsIHNldCAgICA9IFN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGRlblxyXG4gICwgc2FmZVN5bWJvbCA9IFN5bWJvbCB8fCB1aWQ7XHJcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbih0YXJnZXQsIHNyYyl7XHJcbiAgZm9yKHZhciBrZXkgaW4gc3JjKWhpZGRlbih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gIHJldHVybiB0YXJnZXQ7XHJcbn1cclxuXHJcbnZhciBTWU1CT0xfVU5TQ09QQUJMRVMgPSBnZXRXZWxsS25vd25TeW1ib2woJ3Vuc2NvcGFibGVzJylcclxuICAsIEFycmF5VW5zY29wYWJsZXMgICA9IEFycmF5UHJvdG9bU1lNQk9MX1VOU0NPUEFCTEVTXSB8fCB7fVxyXG4gICwgU1lNQk9MX1RBRyAgICAgICAgID0gZ2V0V2VsbEtub3duU3ltYm9sKFRPX1NUUklOR19UQUcpXHJcbiAgLCBTWU1CT0xfU1BFQ0lFUyAgICAgPSBnZXRXZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKVxyXG4gICwgU1lNQk9MX0lURVJBVE9SO1xyXG5mdW5jdGlvbiBzZXRTcGVjaWVzKEMpe1xyXG4gIGlmKERFU0MgJiYgKGZyYW1ld29yayB8fCAhaXNOYXRpdmUoQykpKWRlZmluZVByb3BlcnR5KEMsIFNZTUJPTF9TUEVDSUVTLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IHJldHVyblRoaXNcclxuICB9KTtcclxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb21tb24uZXhwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgTk9ERSA9IGNvZihwcm9jZXNzKSA9PSBQUk9DRVNTXHJcbiAgLCBjb3JlID0ge31cclxuICAsIHBhdGggPSBmcmFtZXdvcmsgPyBnbG9iYWwgOiBjb3JlXHJcbiAgLCBvbGQgID0gZ2xvYmFsLmNvcmVcclxuICAsIGV4cG9ydEdsb2JhbFxyXG4gIC8vIHR5cGUgYml0bWFwXHJcbiAgLCBGT1JDRUQgPSAxXHJcbiAgLCBHTE9CQUwgPSAyXHJcbiAgLCBTVEFUSUMgPSA0XHJcbiAgLCBQUk9UTyAgPSA4XHJcbiAgLCBCSU5EICAgPSAxNlxyXG4gICwgV1JBUCAgID0gMzI7XHJcbmZ1bmN0aW9uICRkZWZpbmUodHlwZSwgbmFtZSwgc291cmNlKXtcclxuICB2YXIga2V5LCBvd24sIG91dCwgZXhwXHJcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmIEdMT0JBTFxyXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogKHR5cGUgJiBTVEFUSUMpXHJcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IE9iamVjdFByb3RvKVtQUk9UT1RZUEVdXHJcbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcclxuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xyXG4gIGZvcihrZXkgaW4gc291cmNlKXtcclxuICAgIC8vIHRoZXJlIGlzIGEgc2ltaWxhciBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmIEZPUkNFRCkgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXRcclxuICAgICAgJiYgKCFpc0Z1bmN0aW9uKHRhcmdldFtrZXldKSB8fCBpc05hdGl2ZSh0YXJnZXRba2V5XSkpO1xyXG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcclxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XHJcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcclxuICAgIGlmKCFmcmFtZXdvcmsgJiYgaXNHbG9iYWwgJiYgIWlzRnVuY3Rpb24odGFyZ2V0W2tleV0pKWV4cCA9IHNvdXJjZVtrZXldO1xyXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcclxuICAgIGVsc2UgaWYodHlwZSAmIEJJTkQgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XHJcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxyXG4gICAgZWxzZSBpZih0eXBlICYgV1JBUCAmJiAhZnJhbWV3b3JrICYmIHRhcmdldFtrZXldID09IG91dCl7XHJcbiAgICAgIGV4cCA9IGZ1bmN0aW9uKHBhcmFtKXtcclxuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIG91dCA/IG5ldyBvdXQocGFyYW0pIDogb3V0KHBhcmFtKTtcclxuICAgICAgfVxyXG4gICAgICBleHBbUFJPVE9UWVBFXSA9IG91dFtQUk9UT1RZUEVdO1xyXG4gICAgfSBlbHNlIGV4cCA9IHR5cGUgJiBQUk9UTyAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4dGVuZCBnbG9iYWxcclxuICAgIGlmKGZyYW1ld29yayAmJiB0YXJnZXQgJiYgIW93bil7XHJcbiAgICAgIGlmKGlzR2xvYmFsKXRhcmdldFtrZXldID0gb3V0O1xyXG4gICAgICBlbHNlIGRlbGV0ZSB0YXJnZXRba2V5XSAmJiBoaWRkZW4odGFyZ2V0LCBrZXksIG91dCk7XHJcbiAgICB9XHJcbiAgICAvLyBleHBvcnRcclxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZGVuKGV4cG9ydHMsIGtleSwgZXhwKTtcclxuICB9XHJcbn1cclxuLy8gQ29tbW9uSlMgZXhwb3J0XHJcbmlmKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xyXG4vLyBSZXF1aXJlSlMgZXhwb3J0XHJcbmVsc2UgaWYoaXNGdW5jdGlvbihkZWZpbmUpICYmIGRlZmluZS5hbWQpZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGNvcmV9KTtcclxuLy8gRXhwb3J0IHRvIGdsb2JhbCBvYmplY3RcclxuZWxzZSBleHBvcnRHbG9iYWwgPSB0cnVlO1xyXG5pZihleHBvcnRHbG9iYWwgfHwgZnJhbWV3b3JrKXtcclxuICBjb3JlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xyXG4gICAgZ2xvYmFsLmNvcmUgPSBvbGQ7XHJcbiAgICByZXR1cm4gY29yZTtcclxuICB9XHJcbiAgZ2xvYmFsLmNvcmUgPSBjb3JlO1xyXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbi5pdGVyYXRvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblNZTUJPTF9JVEVSQVRPUiA9IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUik7XHJcbnZhciBJVEVSICA9IHNhZmVTeW1ib2woJ2l0ZXInKVxyXG4gICwgS0VZICAgPSAxXHJcbiAgLCBWQUxVRSA9IDJcclxuICAsIEl0ZXJhdG9ycyA9IHt9XHJcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9XHJcbiAgICAvLyBTYWZhcmkgaGFzIGJ5Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXHJcbiAgLCBCVUdHWV9JVEVSQVRPUlMgPSAna2V5cycgaW4gQXJyYXlQcm90byAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpO1xyXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxyXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgcmV0dXJuVGhpcyk7XHJcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcclxuICBoaWRkZW4oTywgU1lNQk9MX0lURVJBVE9SLCB2YWx1ZSk7XHJcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxyXG4gIEZGX0lURVJBVE9SIGluIEFycmF5UHJvdG8gJiYgaGlkZGVuKE8sIEZGX0lURVJBVE9SLCB2YWx1ZSk7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcclxuICBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdID0gY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xyXG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xyXG59XHJcbmZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yKENvbnN0cnVjdG9yLCBOQU1FLCB2YWx1ZSwgREVGQVVMVCl7XHJcbiAgdmFyIHByb3RvID0gQ29uc3RydWN0b3JbUFJPVE9UWVBFXVxyXG4gICAgLCBpdGVyICA9IGdldChwcm90bywgU1lNQk9MX0lURVJBVE9SKSB8fCBnZXQocHJvdG8sIEZGX0lURVJBVE9SKSB8fCAoREVGQVVMVCAmJiBnZXQocHJvdG8sIERFRkFVTFQpKSB8fCB2YWx1ZTtcclxuICBpZihmcmFtZXdvcmspe1xyXG4gICAgLy8gRGVmaW5lIGl0ZXJhdG9yXHJcbiAgICBzZXRJdGVyYXRvcihwcm90bywgaXRlcik7XHJcbiAgICBpZihpdGVyICE9PSB2YWx1ZSl7XHJcbiAgICAgIHZhciBpdGVyUHJvdG8gPSBnZXRQcm90b3R5cGVPZihpdGVyLmNhbGwobmV3IENvbnN0cnVjdG9yKSk7XHJcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgICAgc2V0VG9TdHJpbmdUYWcoaXRlclByb3RvLCBOQU1FICsgJyBJdGVyYXRvcicsIHRydWUpO1xyXG4gICAgICAvLyBGRiBmaXhcclxuICAgICAgaGFzKHByb3RvLCBGRl9JVEVSQVRPUikgJiYgc2V0SXRlcmF0b3IoaXRlclByb3RvLCByZXR1cm5UaGlzKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxyXG4gIEl0ZXJhdG9yc1tOQU1FXSA9IGl0ZXI7XHJcbiAgLy8gRkYgJiB2OCBmaXhcclxuICBJdGVyYXRvcnNbTkFNRSArICcgSXRlcmF0b3InXSA9IHJldHVyblRoaXM7XHJcbiAgcmV0dXJuIGl0ZXI7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lU3RkSXRlcmF0b3JzKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQpe1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZXIoa2luZCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTtcclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xyXG4gIHZhciBlbnRyaWVzID0gY3JlYXRlSXRlcihLRVkrVkFMVUUpXHJcbiAgICAsIHZhbHVlcyAgPSBjcmVhdGVJdGVyKFZBTFVFKTtcclxuICBpZihERUZBVUxUID09IFZBTFVFKXZhbHVlcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIHZhbHVlcywgJ3ZhbHVlcycpO1xyXG4gIGVsc2UgZW50cmllcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIGVudHJpZXMsICdlbnRyaWVzJyk7XHJcbiAgaWYoREVGQVVMVCl7XHJcbiAgICAkZGVmaW5lKFBST1RPICsgRk9SQ0VEICogQlVHR1lfSVRFUkFUT1JTLCBOQU1FLCB7XHJcbiAgICAgIGVudHJpZXM6IGVudHJpZXMsXHJcbiAgICAgIGtleXM6IElTX1NFVCA/IHZhbHVlcyA6IGNyZWF0ZUl0ZXIoS0VZKSxcclxuICAgICAgdmFsdWVzOiB2YWx1ZXNcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBpdGVyUmVzdWx0KGRvbmUsIHZhbHVlKXtcclxuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxufVxyXG5mdW5jdGlvbiBpc0l0ZXJhYmxlKGl0KXtcclxuICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxyXG4gICAgLCBTeW1ib2wgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBoYXNFeHQgPSAoU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1IpIGluIE87XHJcbiAgcmV0dXJuIGhhc0V4dCB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gTyB8fCBoYXMoSXRlcmF0b3JzLCBjbGFzc29mKE8pKTtcclxufVxyXG5mdW5jdGlvbiBnZXRJdGVyYXRvcihpdCl7XHJcbiAgdmFyIFN5bWJvbCAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1JdXHJcbiAgICAsIGdldEl0ZXIgPSBleHQgfHwgaXRbU1lNQk9MX0lURVJBVE9SXSB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xyXG4gIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gc3RlcENhbGwoZm4sIHZhbHVlLCBlbnRyaWVzKXtcclxuICByZXR1cm4gZW50cmllcyA/IGludm9rZShmbiwgdmFsdWUpIDogZm4odmFsdWUpO1xyXG59XHJcbmZ1bmN0aW9uIGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoZm4pe1xyXG4gIHZhciBkYW5nZXIgPSB0cnVlO1xyXG4gIHZhciBPID0ge1xyXG4gICAgbmV4dDogZnVuY3Rpb24oKXsgdGhyb3cgMSB9LFxyXG4gICAgJ3JldHVybic6IGZ1bmN0aW9uKCl7IGRhbmdlciA9IGZhbHNlIH1cclxuICB9O1xyXG4gIE9bU1lNQk9MX0lURVJBVE9SXSA9IHJldHVyblRoaXM7XHJcbiAgdHJ5IHtcclxuICAgIGZuKE8pO1xyXG4gIH0gY2F0Y2goZSl7fVxyXG4gIHJldHVybiBkYW5nZXI7XHJcbn1cclxuZnVuY3Rpb24gY2xvc2VJdGVyYXRvcihpdGVyYXRvcil7XHJcbiAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcclxuICBpZihyZXQgIT09IHVuZGVmaW5lZClyZXQuY2FsbChpdGVyYXRvcik7XHJcbn1cclxuZnVuY3Rpb24gc2FmZUl0ZXJDbG9zZShleGVjLCBpdGVyYXRvcil7XHJcbiAgdHJ5IHtcclxuICAgIGV4ZWMoaXRlcmF0b3IpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGZvck9mKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XHJcbiAgc2FmZUl0ZXJDbG9zZShmdW5jdGlvbihpdGVyYXRvcil7XHJcbiAgICB2YXIgZiA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxyXG4gICAgICAsIHN0ZXA7XHJcbiAgICB3aGlsZSghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpaWYoc3RlcENhbGwoZiwgc3RlcC52YWx1ZSwgZW50cmllcykgPT09IGZhbHNlKXtcclxuICAgICAgcmV0dXJuIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3IpO1xyXG4gICAgfVxyXG4gIH0sIGdldEl0ZXJhdG9yKGl0ZXJhYmxlKSk7XHJcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnN5bWJvbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxyXG4hZnVuY3Rpb24oVEFHLCBTeW1ib2xSZWdpc3RyeSwgQWxsU3ltYm9scywgc2V0dGVyKXtcclxuICAvLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcclxuICBpZighaXNOYXRpdmUoU3ltYm9sKSl7XHJcbiAgICBTeW1ib2wgPSBmdW5jdGlvbihkZXNjcmlwdGlvbil7XHJcbiAgICAgIGFzc2VydCghKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpLCBTWU1CT0wgKyAnIGlzIG5vdCBhICcgKyBDT05TVFJVQ1RPUik7XHJcbiAgICAgIHZhciB0YWcgPSB1aWQoZGVzY3JpcHRpb24pXHJcbiAgICAgICAgLCBzeW0gPSBzZXQoY3JlYXRlKFN5bWJvbFtQUk9UT1RZUEVdKSwgVEFHLCB0YWcpO1xyXG4gICAgICBBbGxTeW1ib2xzW3RhZ10gPSBzeW07XHJcbiAgICAgIERFU0MgJiYgc2V0dGVyICYmIGRlZmluZVByb3BlcnR5KE9iamVjdFByb3RvLCB0YWcsIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICBoaWRkZW4odGhpcywgdGFnLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHN5bTtcclxuICAgIH1cclxuICAgIGhpZGRlbihTeW1ib2xbUFJPVE9UWVBFXSwgVE9fU1RSSU5HLCBmdW5jdGlvbigpe1xyXG4gICAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gICRkZWZpbmUoR0xPQkFMICsgV1JBUCwge1N5bWJvbDogU3ltYm9sfSk7XHJcbiAgXHJcbiAgdmFyIHN5bWJvbFN0YXRpY3MgPSB7XHJcbiAgICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcclxuICAgICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXHJcbiAgICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXHJcbiAgICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gU3ltYm9sKGtleSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXHJcbiAgICBpdGVyYXRvcjogU1lNQk9MX0lURVJBVE9SIHx8IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUiksXHJcbiAgICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcclxuICAgIGtleUZvcjogcGFydC5jYWxsKGtleU9mLCBTeW1ib2xSZWdpc3RyeSksXHJcbiAgICAvLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuICAgIHNwZWNpZXM6IFNZTUJPTF9TUEVDSUVTLFxyXG4gICAgLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xyXG4gICAgdG9TdHJpbmdUYWc6IFNZTUJPTF9UQUcgPSBnZXRXZWxsS25vd25TeW1ib2woVE9fU1RSSU5HX1RBRywgdHJ1ZSksXHJcbiAgICAvLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXHJcbiAgICB1bnNjb3BhYmxlczogU1lNQk9MX1VOU0NPUEFCTEVTLFxyXG4gICAgcHVyZTogc2FmZVN5bWJvbCxcclxuICAgIHNldDogc2V0LFxyXG4gICAgdXNlU2V0dGVyOiBmdW5jdGlvbigpe3NldHRlciA9IHRydWV9LFxyXG4gICAgdXNlU2ltcGxlOiBmdW5jdGlvbigpe3NldHRlciA9IGZhbHNlfVxyXG4gIH07XHJcbiAgLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXHJcbiAgLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxyXG4gIC8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxyXG4gIC8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXHJcbiAgLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4gIC8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcclxuICAvLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbiAgZm9yRWFjaC5jYWxsKGFycmF5KCdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BsaXQsdG9QcmltaXRpdmUnKSxcclxuICAgIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgc3ltYm9sU3RhdGljc1tpdF0gPSBnZXRXZWxsS25vd25TeW1ib2woaXQpO1xyXG4gICAgfVxyXG4gICk7XHJcbiAgJGRlZmluZShTVEFUSUMsIFNZTUJPTCwgc3ltYm9sU3RhdGljcyk7XHJcbiAgXHJcbiAgc2V0VG9TdHJpbmdUYWcoU3ltYm9sLCBTWU1CT0wpO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogIWlzTmF0aXZlKFN5bWJvbCksIE9CSkVDVCwge1xyXG4gICAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICAgIGdldE93blByb3BlcnR5TmFtZXM6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgdmFyIG5hbWVzID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKSwgcmVzdWx0ID0gW10sIGtleSwgaSA9IDA7XHJcbiAgICAgIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxyXG4gICAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHZhciBuYW1lcyA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSksIHJlc3VsdCA9IFtdLCBrZXksIGkgPSAwO1xyXG4gICAgICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cclxuICBzZXRUb1N0cmluZ1RhZyhNYXRoLCBNQVRILCB0cnVlKTtcclxuICAvLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxyXG4gIHNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xyXG59KHNhZmVTeW1ib2woJ3RhZycpLCB7fSwge30sIHRydWUpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgb2JqZWN0U3RhdGljID0ge1xyXG4gICAgLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxuICAgIGFzc2lnbjogYXNzaWduLFxyXG4gICAgLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcclxuICAgIGlzOiBmdW5jdGlvbih4LCB5KXtcclxuICAgICAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxyXG4gIC8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrcyB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cclxuICAnX19wcm90b19fJyBpbiBPYmplY3RQcm90byAmJiBmdW5jdGlvbihidWdneSwgc2V0KXtcclxuICAgIHRyeSB7XHJcbiAgICAgIHNldCA9IGN0eChjYWxsLCBnZXRPd25EZXNjcmlwdG9yKE9iamVjdFByb3RvLCAnX19wcm90b19fJykuc2V0LCAyKTtcclxuICAgICAgc2V0KHt9LCBBcnJheVByb3RvKTtcclxuICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZSB9XHJcbiAgICBvYmplY3RTdGF0aWMuc2V0UHJvdG90eXBlT2YgPSBzZXRQcm90b3R5cGVPZiA9IHNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8sIHByb3RvKXtcclxuICAgICAgYXNzZXJ0T2JqZWN0KE8pO1xyXG4gICAgICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgaXNPYmplY3QocHJvdG8pLCBwcm90bywgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xyXG4gICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xyXG4gICAgICBlbHNlIHNldChPLCBwcm90byk7XHJcbiAgICAgIHJldHVybiBPO1xyXG4gICAgfVxyXG4gIH0oKTtcclxuICAkZGVmaW5lKFNUQVRJQywgT0JKRUNULCBvYmplY3RTdGF0aWMpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5vYmplY3QucHJvdG90eXBlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbih0bXApe1xyXG4gIC8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxyXG4gIHRtcFtTWU1CT0xfVEFHXSA9IERPVDtcclxuICBpZihjb2YodG1wKSAhPSBET1QpaGlkZGVuKE9iamVjdFByb3RvLCBUT19TVFJJTkcsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XHJcbiAgfSk7XHJcbn0oe30pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAvLyBPYmplY3Qgc3RhdGljIG1ldGhvZHMgYWNjZXB0IHByaW1pdGl2ZXNcclxuICBmdW5jdGlvbiB3cmFwT2JqZWN0TWV0aG9kKGtleSwgTU9ERSl7XHJcbiAgICB2YXIgZm4gID0gT2JqZWN0W2tleV1cclxuICAgICAgLCBleHAgPSBjb3JlW09CSkVDVF1ba2V5XVxyXG4gICAgICAsIGYgICA9IDBcclxuICAgICAgLCBvICAgPSB7fTtcclxuICAgIGlmKCFleHAgfHwgaXNOYXRpdmUoZXhwKSl7XHJcbiAgICAgIG9ba2V5XSA9IE1PREUgPT0gMSA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XHJcbiAgICAgIH0gOiBNT0RFID09IDIgPyBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XHJcbiAgICAgIH0gOiBNT0RFID09IDMgPyBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGZhbHNlO1xyXG4gICAgICB9IDogTU9ERSA9PSA0ID8gZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICAgICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSwga2V5KTtcclxuICAgICAgfSA6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcclxuICAgICAgfTtcclxuICAgICAgdHJ5IHsgZm4oRE9UKSB9XHJcbiAgICAgIGNhdGNoKGUpeyBmID0gMSB9XHJcbiAgICAgICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogZiwgT0JKRUNULCBvKTtcclxuICAgIH1cclxuICB9XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZnJlZXplJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnc2VhbCcsIDEpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ3ByZXZlbnRFeHRlbnNpb25zJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnaXNGcm96ZW4nLCAyKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdpc1NlYWxlZCcsIDIpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2lzRXh0ZW5zaWJsZScsIDMpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIDQpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldFByb3RvdHlwZU9mJyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgna2V5cycpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5TmFtZXMnKTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuZnVuY3Rpb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oTkFNRSl7XHJcbiAgLy8gMTkuMi40LjIgbmFtZVxyXG4gIE5BTUUgaW4gRnVuY3Rpb25Qcm90byB8fCAoREVTQyAmJiBkZWZpbmVQcm9wZXJ0eShGdW5jdGlvblByb3RvLCBOQU1FLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXHJcbiAgICAgICAgLCBuYW1lICA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcclxuICAgICAgaGFzKHRoaXMsIE5BTUUpIHx8IGRlZmluZVByb3BlcnR5KHRoaXMsIE5BTUUsIGRlc2NyaXB0b3IoNSwgbmFtZSkpO1xyXG4gICAgICByZXR1cm4gbmFtZTtcclxuICAgIH0sXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgaGFzKHRoaXMsIE5BTUUpIHx8IGRlZmluZVByb3BlcnR5KHRoaXMsIE5BTUUsIGRlc2NyaXB0b3IoMCwgdmFsdWUpKTtcclxuICAgIH1cclxuICB9KSk7XHJcbn0oJ25hbWUnKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm51bWJlci5jb25zdHJ1Y3RvciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuTnVtYmVyKCcwbzEnKSAmJiBOdW1iZXIoJzBiMScpIHx8IGZ1bmN0aW9uKF9OdW1iZXIsIE51bWJlclByb3RvKXtcclxuICBmdW5jdGlvbiB0b051bWJlcihpdCl7XHJcbiAgICBpZihpc09iamVjdChpdCkpaXQgPSB0b1ByaW1pdGl2ZShpdCk7XHJcbiAgICBpZih0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMiAmJiBpdC5jaGFyQ29kZUF0KDApID09IDQ4KXtcclxuICAgICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xyXG4gICAgICBzd2l0Y2goaXQuY2hhckNvZGVBdCgxKSl7XHJcbiAgICAgICAgY2FzZSA2NiA6IGNhc2UgOTggIDogYmluYXJ5ID0gdHJ1ZTtcclxuICAgICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcclxuICAgICAgfVxyXG4gICAgfSByZXR1cm4gK2l0O1xyXG4gIH1cclxuICBmdW5jdGlvbiB0b1ByaW1pdGl2ZShpdCl7XHJcbiAgICB2YXIgZm4sIHZhbDtcclxuICAgIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC52YWx1ZU9mKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XHJcbiAgICBpZihpc0Z1bmN0aW9uKGZuID0gaXRbVE9fU1RSSU5HXSkgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xyXG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gbnVtYmVyXCIpO1xyXG4gIH1cclxuICBOdW1iZXIgPSBmdW5jdGlvbiBOdW1iZXIoaXQpe1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBOdW1iZXIgPyBuZXcgX051bWJlcih0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xyXG4gIH1cclxuICBmb3JFYWNoLmNhbGwoREVTQyA/IGdldE5hbWVzKF9OdW1iZXIpXHJcbiAgOiBhcnJheSgnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFknKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIGtleSBpbiBOdW1iZXIgfHwgZGVmaW5lUHJvcGVydHkoTnVtYmVyLCBrZXksIGdldE93bkRlc2NyaXB0b3IoX051bWJlciwga2V5KSk7XHJcbiAgfSk7XHJcbiAgTnVtYmVyW1BST1RPVFlQRV0gPSBOdW1iZXJQcm90bztcclxuICBOdW1iZXJQcm90b1tDT05TVFJVQ1RPUl0gPSBOdW1iZXI7XHJcbiAgaGlkZGVuKGdsb2JhbCwgTlVNQkVSLCBOdW1iZXIpO1xyXG59KE51bWJlciwgTnVtYmVyW1BST1RPVFlQRV0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYubnVtYmVyLnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oaXNJbnRlZ2VyKXtcclxuICAkZGVmaW5lKFNUQVRJQywgTlVNQkVSLCB7XHJcbiAgICAvLyAyMC4xLjIuMSBOdW1iZXIuRVBTSUxPTlxyXG4gICAgRVBTSUxPTjogcG93KDIsIC01MiksXHJcbiAgICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxyXG4gICAgaXNGaW5pdGU6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShpdCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXHJcbiAgICBpc0ludGVnZXI6IGlzSW50ZWdlcixcclxuICAgIC8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXHJcbiAgICBpc05hTjogc2FtZU5hTixcclxuICAgIC8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcclxuICAgIGlzU2FmZUludGVnZXI6IGZ1bmN0aW9uKG51bWJlcil7XHJcbiAgICAgIHJldHVybiBpc0ludGVnZXIobnVtYmVyKSAmJiBhYnMobnVtYmVyKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXHJcbiAgICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSLFxyXG4gICAgLy8gMjAuMS4yLjEwIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSXHJcbiAgICBNSU5fU0FGRV9JTlRFR0VSOiAtTUFYX1NBRkVfSU5URUdFUixcclxuICAgIC8vIDIwLjEuMi4xMiBOdW1iZXIucGFyc2VGbG9hdChzdHJpbmcpXHJcbiAgICBwYXJzZUZsb2F0OiBwYXJzZUZsb2F0LFxyXG4gICAgLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxyXG4gICAgcGFyc2VJbnQ6IHBhcnNlSW50XHJcbiAgfSk7XHJcbi8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxyXG59KE51bWJlci5pc0ludGVnZXIgfHwgZnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiAhaXNPYmplY3QoaXQpICYmIGlzRmluaXRlKGl0KSAmJiBmbG9vcihpdCkgPT09IGl0O1xyXG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm1hdGggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IHNoaW1cclxuIWZ1bmN0aW9uKCl7XHJcbiAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gIHZhciBFICAgID0gTWF0aC5FXHJcbiAgICAsIGV4cCAgPSBNYXRoLmV4cFxyXG4gICAgLCBsb2cgID0gTWF0aC5sb2dcclxuICAgICwgc3FydCA9IE1hdGguc3FydFxyXG4gICAgLCBzaWduID0gTWF0aC5zaWduIHx8IGZ1bmN0aW9uKHgpe1xyXG4gICAgICAgIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcclxuICAgICAgfTtcclxuICBcclxuICAvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbiAgZnVuY3Rpb24gYXNpbmgoeCl7XHJcbiAgICByZXR1cm4gIWlzRmluaXRlKHggPSAreCkgfHwgeCA9PSAwID8geCA6IHggPCAwID8gLWFzaW5oKC14KSA6IGxvZyh4ICsgc3FydCh4ICogeCArIDEpKTtcclxuICB9XHJcbiAgLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcclxuICBmdW5jdGlvbiBleHBtMSh4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xyXG4gIH1cclxuICAgIFxyXG4gICRkZWZpbmUoU1RBVElDLCBNQVRILCB7XHJcbiAgICAvLyAyMC4yLjIuMyBNYXRoLmFjb3NoKHgpXHJcbiAgICBhY29zaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcclxuICAgIGFzaW5oOiBhc2luaCxcclxuICAgIC8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcclxuICAgIGF0YW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjkgTWF0aC5jYnJ0KHgpXHJcbiAgICBjYnJ0OiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIHNpZ24oeCA9ICt4KSAqIHBvdyhhYnMoeCksIDEgLyAzKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTEgTWF0aC5jbHozMih4KVxyXG4gICAgY2x6MzI6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPj4+PSAwKSA/IDMyIC0geFtUT19TVFJJTkddKDIpLmxlbmd0aCA6IDMyO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcclxuICAgIGNvc2g6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKGV4cCh4ID0gK3gpICsgZXhwKC14KSkgLyAyO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbiAgICBleHBtMTogZXhwbTEsXHJcbiAgICAvLyAyMC4yLjIuMTYgTWF0aC5mcm91bmQoeClcclxuICAgIC8vIFRPRE86IGZhbGxiYWNrIGZvciBJRTktXHJcbiAgICBmcm91bmQ6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbeF0pWzBdO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xNyBNYXRoLmh5cG90KFt2YWx1ZTFbLCB2YWx1ZTJbLCDigKYgXV1dKVxyXG4gICAgaHlwb3Q6IGZ1bmN0aW9uKHZhbHVlMSwgdmFsdWUyKXtcclxuICAgICAgdmFyIHN1bSAgPSAwXHJcbiAgICAgICAgLCBsZW4xID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgbGVuMiA9IGxlbjFcclxuICAgICAgICAsIGFyZ3MgPSBBcnJheShsZW4xKVxyXG4gICAgICAgICwgbGFyZyA9IC1JbmZpbml0eVxyXG4gICAgICAgICwgYXJnO1xyXG4gICAgICB3aGlsZShsZW4xLS0pe1xyXG4gICAgICAgIGFyZyA9IGFyZ3NbbGVuMV0gPSArYXJndW1lbnRzW2xlbjFdO1xyXG4gICAgICAgIGlmKGFyZyA9PSBJbmZpbml0eSB8fCBhcmcgPT0gLUluZmluaXR5KXJldHVybiBJbmZpbml0eTtcclxuICAgICAgICBpZihhcmcgPiBsYXJnKWxhcmcgPSBhcmc7XHJcbiAgICAgIH1cclxuICAgICAgbGFyZyA9IGFyZyB8fCAxO1xyXG4gICAgICB3aGlsZShsZW4yLS0pc3VtICs9IHBvdyhhcmdzW2xlbjJdIC8gbGFyZywgMik7XHJcbiAgICAgIHJldHVybiBsYXJnICogc3FydChzdW0pO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcclxuICAgIGltdWw6IGZ1bmN0aW9uKHgsIHkpe1xyXG4gICAgICB2YXIgVUludDE2ID0gMHhmZmZmXHJcbiAgICAgICAgLCB4biA9ICt4XHJcbiAgICAgICAgLCB5biA9ICt5XHJcbiAgICAgICAgLCB4bCA9IFVJbnQxNiAmIHhuXHJcbiAgICAgICAgLCB5bCA9IFVJbnQxNiAmIHluO1xyXG4gICAgICByZXR1cm4gMCB8IHhsICogeWwgKyAoKFVJbnQxNiAmIHhuID4+PiAxNikgKiB5bCArIHhsICogKFVJbnQxNiAmIHluID4+PiAxNikgPDwgMTYgPj4+IDApO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yMCBNYXRoLmxvZzFwKHgpXHJcbiAgICBsb2cxcDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IGxvZygxICsgeCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjIxIE1hdGgubG9nMTAoeClcclxuICAgIGxvZzEwOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4xMDtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjIgTWF0aC5sb2cyKHgpXHJcbiAgICBsb2cyOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcclxuICAgIHNpZ246IHNpZ24sXHJcbiAgICAvLyAyMC4yLjIuMzAgTWF0aC5zaW5oKHgpXHJcbiAgICBzaW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIChhYnMoeCA9ICt4KSA8IDEpID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDIgOiAoZXhwKHggLSAxKSAtIGV4cCgteCAtIDEpKSAqIChFIC8gMik7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjMzIE1hdGgudGFuaCh4KVxyXG4gICAgdGFuaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHZhciBhID0gZXhwbTEoeCA9ICt4KVxyXG4gICAgICAgICwgYiA9IGV4cG0xKC14KTtcclxuICAgICAgcmV0dXJuIGEgPT0gSW5maW5pdHkgPyAxIDogYiA9PSBJbmZpbml0eSA/IC0xIDogKGEgLSBiKSAvIChleHAoeCkgKyBleHAoLXgpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxyXG4gICAgdHJ1bmM6IHRydW5jXHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGZyb21DaGFyQ29kZSl7XHJcbiAgZnVuY3Rpb24gYXNzZXJ0Tm90UmVnRXhwKGl0KXtcclxuICAgIGlmKGNvZihpdCkgPT0gUkVHRVhQKXRocm93IFR5cGVFcnJvcigpO1xyXG4gIH1cclxuICBcclxuICAkZGVmaW5lKFNUQVRJQywgU1RSSU5HLCB7XHJcbiAgICAvLyAyMS4xLjIuMiBTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzKVxyXG4gICAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHZhciByZXMgPSBbXVxyXG4gICAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgaSAgID0gMFxyXG4gICAgICAgICwgY29kZVxyXG4gICAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgICBjb2RlID0gK2FyZ3VtZW50c1tpKytdO1xyXG4gICAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xyXG4gICAgICAgIHJlcy5wdXNoKGNvZGUgPCAweDEwMDAwXHJcbiAgICAgICAgICA/IGZyb21DaGFyQ29kZShjb2RlKVxyXG4gICAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjIuNCBTdHJpbmcucmF3KGNhbGxTaXRlLCAuLi5zdWJzdGl0dXRpb25zKVxyXG4gICAgcmF3OiBmdW5jdGlvbihjYWxsU2l0ZSl7XHJcbiAgICAgIHZhciByYXcgPSB0b09iamVjdChjYWxsU2l0ZS5yYXcpXHJcbiAgICAgICAgLCBsZW4gPSB0b0xlbmd0aChyYXcubGVuZ3RoKVxyXG4gICAgICAgICwgc2xuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzID0gW11cclxuICAgICAgICAsIGkgICA9IDA7XHJcbiAgICAgIHdoaWxlKGxlbiA+IGkpe1xyXG4gICAgICAgIHJlcy5wdXNoKFN0cmluZyhyYXdbaSsrXSkpO1xyXG4gICAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgICB9IHJldHVybiByZXMuam9pbignJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgJGRlZmluZShQUk9UTywgU1RSSU5HLCB7XHJcbiAgICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcclxuICAgIGNvZGVQb2ludEF0OiBjcmVhdGVQb2ludEF0KGZhbHNlKSxcclxuICAgIC8vIDIxLjEuMy42IFN0cmluZy5wcm90b3R5cGUuZW5kc1dpdGgoc2VhcmNoU3RyaW5nIFssIGVuZFBvc2l0aW9uXSlcclxuICAgIGVuZHNXaXRoOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICB2YXIgdGhhdCA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgZW5kUG9zaXRpb24gPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxyXG4gICAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IG1pbih0b0xlbmd0aChlbmRQb3NpdGlvbiksIGxlbik7XHJcbiAgICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgICAgcmV0dXJuIHRoYXQuc2xpY2UoZW5kIC0gc2VhcmNoU3RyaW5nLmxlbmd0aCwgZW5kKSA9PT0gc2VhcmNoU3RyaW5nO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy43IFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbiA9IDApXHJcbiAgICBpbmNsdWRlczogZnVuY3Rpb24oc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xyXG4gICAgICBhc3NlcnROb3RSZWdFeHAoc2VhcmNoU3RyaW5nKTtcclxuICAgICAgcmV0dXJuICEhflN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKS5pbmRleE9mKHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjMuMTMgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQoY291bnQpXHJcbiAgICByZXBlYXQ6IGZ1bmN0aW9uKGNvdW50KXtcclxuICAgICAgdmFyIHN0ciA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgcmVzID0gJydcclxuICAgICAgICAsIG4gICA9IHRvSW50ZWdlcihjb3VudCk7XHJcbiAgICAgIGlmKDAgPiBuIHx8IG4gPT0gSW5maW5pdHkpdGhyb3cgUmFuZ2VFcnJvcihcIkNvdW50IGNhbid0IGJlIG5lZ2F0aXZlXCIpO1xyXG4gICAgICBmb3IoO24gPiAwOyAobiA+Pj49IDEpICYmIChzdHIgKz0gc3RyKSlpZihuICYgMSlyZXMgKz0gc3RyO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy4xOCBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIFssIHBvc2l0aW9uIF0pXHJcbiAgICBzdGFydHNXaXRoOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICB2YXIgdGhhdCAgPSBTdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGluZGV4ID0gdG9MZW5ndGgobWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcclxuICAgICAgc2VhcmNoU3RyaW5nICs9ICcnO1xyXG4gICAgICByZXR1cm4gdGhhdC5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2hTdHJpbmcubGVuZ3RoKSA9PT0gc2VhcmNoU3RyaW5nO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KFN0cmluZy5mcm9tQ2hhckNvZGUpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuYXJyYXkuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFNUQVRJQyArIEZPUkNFRCAqIGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoQXJyYXkuZnJvbSksIEFSUkFZLCB7XHJcbiAgICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmcm9tOiBmdW5jdGlvbihhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XHJcbiAgICAgIHZhciBPICAgICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcclxuICAgICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAgICwgaW5kZXggICA9IDBcclxuICAgICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwO1xyXG4gICAgICBpZihpc0l0ZXJhYmxlKE8pKXtcclxuICAgICAgICByZXN1bHQgPSBuZXcgKGdlbmVyaWModGhpcywgQXJyYXkpKTtcclxuICAgICAgICBzYWZlSXRlckNsb3NlKGZ1bmN0aW9uKGl0ZXJhdG9yKXtcclxuICAgICAgICAgIGZvcig7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XHJcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihzdGVwLnZhbHVlLCBpbmRleCkgOiBzdGVwLnZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGdldEl0ZXJhdG9yKE8pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBuZXcgKGdlbmVyaWModGhpcywgQXJyYXkpKShsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCkpO1xyXG4gICAgICAgIGZvcig7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcclxuICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICAkZGVmaW5lKFNUQVRJQywgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcclxuICAgIG9mOiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgICAgdmFyIGluZGV4ICA9IDBcclxuICAgICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgICAsIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpKGxlbmd0aCk7XHJcbiAgICAgIHdoaWxlKGxlbmd0aCA+IGluZGV4KXJlc3VsdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXgrK107XHJcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgc2V0U3BlY2llcyhBcnJheSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LmFycmF5LnByb3RvdHlwZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgJGRlZmluZShQUk9UTywgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMy4zIEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluKHRhcmdldCwgc3RhcnQsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gICAgY29weVdpdGhpbjogZnVuY3Rpb24odGFyZ2V0IC8qID0gMCAqLywgc3RhcnQgLyogPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcclxuICAgICAgdmFyIE8gICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBsZW4gICA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAgICwgdG8gICAgPSB0b0luZGV4KHRhcmdldCwgbGVuKVxyXG4gICAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXHJcbiAgICAgICAgLCBlbmQgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAgICwgZmluICAgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IHRvSW5kZXgoZW5kLCBsZW4pXHJcbiAgICAgICAgLCBjb3VudCA9IG1pbihmaW4gLSBmcm9tLCBsZW4gLSB0bylcclxuICAgICAgICAsIGluYyAgID0gMTtcclxuICAgICAgaWYoZnJvbSA8IHRvICYmIHRvIDwgZnJvbSArIGNvdW50KXtcclxuICAgICAgICBpbmMgID0gLTE7XHJcbiAgICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XHJcbiAgICAgICAgdG8gICA9IHRvICsgY291bnQgLSAxO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlKGNvdW50LS0gPiAwKXtcclxuICAgICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xyXG4gICAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xyXG4gICAgICAgIHRvICs9IGluYztcclxuICAgICAgICBmcm9tICs9IGluYztcclxuICAgICAgfSByZXR1cm4gTztcclxuICAgIH0sXHJcbiAgICAvLyAyMi4xLjMuNiBBcnJheS5wcm90b3R5cGUuZmlsbCh2YWx1ZSwgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aClcclxuICAgIGZpbGw6IGZ1bmN0aW9uKHZhbHVlIC8qLCBzdGFydCA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xyXG4gICAgICB2YXIgTyAgICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXHJcbiAgICAgICAgLCBlbmQgICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XHJcbiAgICAgIHdoaWxlKGVuZFBvcyA+IGluZGV4KU9baW5kZXgrK10gPSB2YWx1ZTtcclxuICAgICAgcmV0dXJuIE87XHJcbiAgICB9LFxyXG4gICAgLy8gMjIuMS4zLjggQXJyYXkucHJvdG90eXBlLmZpbmQocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZmluZDogY3JlYXRlQXJyYXlNZXRob2QoNSksXHJcbiAgICAvLyAyMi4xLjMuOSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZpbmRJbmRleDogY3JlYXRlQXJyYXlNZXRob2QoNilcclxuICB9KTtcclxuICBcclxuICBpZihmcmFtZXdvcmspe1xyXG4gICAgLy8gMjIuMS4zLjMxIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxyXG4gICAgZm9yRWFjaC5jYWxsKGFycmF5KCdmaW5kLGZpbmRJbmRleCxmaWxsLGNvcHlXaXRoaW4sZW50cmllcyxrZXlzLHZhbHVlcycpLCBmdW5jdGlvbihpdCl7XHJcbiAgICAgIEFycmF5VW5zY29wYWJsZXNbaXRdID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgU1lNQk9MX1VOU0NPUEFCTEVTIGluIEFycmF5UHJvdG8gfHwgaGlkZGVuKEFycmF5UHJvdG8sIFNZTUJPTF9VTlNDT1BBQkxFUywgQXJyYXlVbnNjb3BhYmxlcyk7XHJcbiAgfVxyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5pdGVyYXRvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihhdCl7XHJcbiAgLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxyXG4gIC8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXHJcbiAgLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxyXG4gIC8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG4gIGRlZmluZVN0ZEl0ZXJhdG9ycyhBcnJheSwgQVJSQVksIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogdG9PYmplY3QoaXRlcmF0ZWQpLCBpOiAwLCBrOiBraW5kfSk7XHJcbiAgLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbiAgfSwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICwgaW5kZXggPSBpdGVyLmkrKztcclxuICAgIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcclxuICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgICByZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIH1cclxuICAgIGlmKGtpbmQgPT0gS0VZKSAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgaW5kZXgpO1xyXG4gICAgaWYoa2luZCA9PSBWQUxVRSlyZXR1cm4gaXRlclJlc3VsdCgwLCBPW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIFtpbmRleCwgT1tpbmRleF1dKTtcclxuICB9LCBWQUxVRSk7XHJcbiAgXHJcbiAgLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxyXG4gIEl0ZXJhdG9yc1tBUkdVTUVOVFNdID0gSXRlcmF0b3JzW0FSUkFZXTtcclxuICBcclxuICAvLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbiAgZGVmaW5lU3RkSXRlcmF0b3JzKFN0cmluZywgU1RSSU5HLCBmdW5jdGlvbihpdGVyYXRlZCl7XHJcbiAgICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcclxuICAvLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbiAgfSwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgICAsIGluZGV4ID0gaXRlci5pXHJcbiAgICAgICwgcG9pbnQ7XHJcbiAgICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIHBvaW50ID0gYXQuY2FsbChPLCBpbmRleCk7XHJcbiAgICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgcG9pbnQpO1xyXG4gIH0pO1xyXG59KGNyZWF0ZVBvaW50QXQodHJ1ZSkpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYucmVnZXhwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5ERVNDICYmICFmdW5jdGlvbihSZWdFeHBQcm90bywgX1JlZ0V4cCl7ICBcclxuICAvLyBSZWdFeHAgYWxsb3dzIGEgcmVnZXggd2l0aCBmbGFncyBhcyB0aGUgcGF0dGVyblxyXG4gIGlmKCFmdW5jdGlvbigpe3RyeXtyZXR1cm4gUmVnRXhwKC9hL2csICdpJykgPT0gJy9hL2knfWNhdGNoKGUpe319KCkpe1xyXG4gICAgUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcclxuICAgICAgcmV0dXJuIG5ldyBfUmVnRXhwKGNvZihwYXR0ZXJuKSA9PSBSRUdFWFAgJiYgZmxhZ3MgIT09IHVuZGVmaW5lZFxyXG4gICAgICAgID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuLCBmbGFncyk7XHJcbiAgICB9XHJcbiAgICBmb3JFYWNoLmNhbGwoZ2V0TmFtZXMoX1JlZ0V4cCksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGtleSBpbiBSZWdFeHAgfHwgZGVmaW5lUHJvcGVydHkoUmVnRXhwLCBrZXksIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gX1JlZ0V4cFtrZXldIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbihpdCl7IF9SZWdFeHBba2V5XSA9IGl0IH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFJlZ0V4cFByb3RvW0NPTlNUUlVDVE9SXSA9IFJlZ0V4cDtcclxuICAgIFJlZ0V4cFtQUk9UT1RZUEVdID0gUmVnRXhwUHJvdG87XHJcbiAgICBoaWRkZW4oZ2xvYmFsLCBSRUdFWFAsIFJlZ0V4cCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcclxuICBpZigvLi9nLmZsYWdzICE9ICdnJylkZWZpbmVQcm9wZXJ0eShSZWdFeHBQcm90bywgJ2ZsYWdzJywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiBjcmVhdGVSZXBsYWNlcigvXi4qXFwvKFxcdyopJC8sICckMScpXHJcbiAgfSk7XHJcbiAgXHJcbiAgc2V0U3BlY2llcyhSZWdFeHApO1xyXG59KFJlZ0V4cFtQUk9UT1RZUEVdLCBSZWdFeHApO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiB3ZWIuaW1tZWRpYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBzZXRJbW1lZGlhdGUgc2hpbVxyXG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBlbHNlOlxyXG5pc0Z1bmN0aW9uKHNldEltbWVkaWF0ZSkgJiYgaXNGdW5jdGlvbihjbGVhckltbWVkaWF0ZSkgfHwgZnVuY3Rpb24oT05SRUFEWVNUQVRFQ0hBTkdFKXtcclxuICB2YXIgcG9zdE1lc3NhZ2UgICAgICA9IGdsb2JhbC5wb3N0TWVzc2FnZVxyXG4gICAgLCBhZGRFdmVudExpc3RlbmVyID0gZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXJcclxuICAgICwgTWVzc2FnZUNoYW5uZWwgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxyXG4gICAgLCBjb3VudGVyICAgICAgICAgID0gMFxyXG4gICAgLCBxdWV1ZSAgICAgICAgICAgID0ge31cclxuICAgICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XHJcbiAgc2V0SW1tZWRpYXRlID0gZnVuY3Rpb24oZm4pe1xyXG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XHJcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xyXG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGludm9rZShpc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcclxuICAgIH1cclxuICAgIGRlZmVyKGNvdW50ZXIpO1xyXG4gICAgcmV0dXJuIGNvdW50ZXI7XHJcbiAgfVxyXG4gIGNsZWFySW1tZWRpYXRlID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICB9XHJcbiAgZnVuY3Rpb24gcnVuKGlkKXtcclxuICAgIGlmKGhhcyhxdWV1ZSwgaWQpKXtcclxuICAgICAgdmFyIGZuID0gcXVldWVbaWRdO1xyXG4gICAgICBkZWxldGUgcXVldWVbaWRdO1xyXG4gICAgICBmbigpO1xyXG4gICAgfVxyXG4gIH1cclxuICBmdW5jdGlvbiBsaXN0bmVyKGV2ZW50KXtcclxuICAgIHJ1bihldmVudC5kYXRhKTtcclxuICB9XHJcbiAgLy8gTm9kZS5qcyAwLjgtXHJcbiAgaWYoTk9ERSl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgbmV4dFRpY2socGFydC5jYWxsKHJ1biwgaWQpKTtcclxuICAgIH1cclxuICAvLyBNb2Rlcm4gYnJvd3NlcnMsIHNraXAgaW1wbGVtZW50YXRpb24gZm9yIFdlYldvcmtlcnNcclxuICAvLyBJRTggaGFzIHBvc3RNZXNzYWdlLCBidXQgaXQncyBzeW5jICYgdHlwZW9mIGl0cyBwb3N0TWVzc2FnZSBpcyBvYmplY3RcclxuICB9IGVsc2UgaWYoYWRkRXZlbnRMaXN0ZW5lciAmJiBpc0Z1bmN0aW9uKHBvc3RNZXNzYWdlKSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHBvc3RNZXNzYWdlKGlkLCAnKicpO1xyXG4gICAgfVxyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcclxuICAvLyBXZWJXb3JrZXJzXHJcbiAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oTWVzc2FnZUNoYW5uZWwpKXtcclxuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XHJcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcclxuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcclxuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xyXG4gIC8vIElFOC1cclxuICB9IGVsc2UgaWYoZG9jdW1lbnQgJiYgT05SRUFEWVNUQVRFQ0hBTkdFIGluIGRvY3VtZW50W0NSRUFURV9FTEVNRU5UXSgnc2NyaXB0Jykpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRbQ1JFQVRFX0VMRU1FTlRdKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcclxuICAgICAgICBydW4oaWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcclxuICB9IGVsc2Uge1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHNldFRpbWVvdXQocnVuLCAwLCBpZCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KCdvbnJlYWR5c3RhdGVjaGFuZ2UnKTtcclxuJGRlZmluZShHTE9CQUwgKyBCSU5ELCB7XHJcbiAgc2V0SW1tZWRpYXRlOiAgIHNldEltbWVkaWF0ZSxcclxuICBjbGVhckltbWVkaWF0ZTogY2xlYXJJbW1lZGlhdGVcclxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5wcm9taXNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVTNiBwcm9taXNlcyBzaGltXHJcbi8vIEJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXRpZnkvbmF0aXZlLXByb21pc2Utb25seS9cclxuIWZ1bmN0aW9uKFByb21pc2UsIHRlc3Qpe1xyXG4gIGlzRnVuY3Rpb24oUHJvbWlzZSkgJiYgaXNGdW5jdGlvbihQcm9taXNlLnJlc29sdmUpXHJcbiAgJiYgUHJvbWlzZS5yZXNvbHZlKHRlc3QgPSBuZXcgUHJvbWlzZShmdW5jdGlvbigpe30pKSA9PSB0ZXN0XHJcbiAgfHwgZnVuY3Rpb24oYXNhcCwgUkVDT1JEKXtcclxuICAgIGZ1bmN0aW9uIGlzVGhlbmFibGUoaXQpe1xyXG4gICAgICB2YXIgdGhlbjtcclxuICAgICAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xyXG4gICAgICByZXR1cm4gaXNGdW5jdGlvbih0aGVuKSA/IHRoZW4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocHJvbWlzZSl7XHJcbiAgICAgIHZhciByZWNvcmQgPSBwcm9taXNlW1JFQ09SRF1cclxuICAgICAgICAsIGNoYWluICA9IHJlY29yZC5jXHJcbiAgICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICAgLCByZWFjdDtcclxuICAgICAgaWYocmVjb3JkLmgpcmV0dXJuIHRydWU7XHJcbiAgICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpe1xyXG4gICAgICAgIHJlYWN0ID0gY2hhaW5baSsrXTtcclxuICAgICAgICBpZihyZWFjdC5mYWlsIHx8IGhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocmVhY3QuUCkpcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5vdGlmeShyZWNvcmQsIHJlamVjdCl7XHJcbiAgICAgIHZhciBjaGFpbiA9IHJlY29yZC5jO1xyXG4gICAgICBpZihyZWplY3QgfHwgY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgcHJvbWlzZSA9IHJlY29yZC5wXHJcbiAgICAgICAgICAsIHZhbHVlICAgPSByZWNvcmQudlxyXG4gICAgICAgICAgLCBvayAgICAgID0gcmVjb3JkLnMgPT0gMVxyXG4gICAgICAgICAgLCBpICAgICAgID0gMDtcclxuICAgICAgICBpZihyZWplY3QgJiYgIWhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocHJvbWlzZSkpe1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZighaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKSl7XHJcbiAgICAgICAgICAgICAgaWYoTk9ERSl7XHJcbiAgICAgICAgICAgICAgICBpZighcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSkpe1xyXG4gICAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IG5vZGUuanMgYmVoYXZpb3JcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2UgaWYoaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCAxZTMpO1xyXG4gICAgICAgIH0gZWxzZSB3aGlsZShjaGFpbi5sZW5ndGggPiBpKSFmdW5jdGlvbihyZWFjdCl7XHJcbiAgICAgICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxyXG4gICAgICAgICAgICAsIHJldCwgdGhlbjtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmKGNiKXtcclxuICAgICAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcclxuICAgICAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoUFJPTUlTRSArICctY2hhaW4gY3ljbGUnKSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xyXG4gICAgICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XHJcbiAgICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgIHJlYWN0LnJlaihlcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0oY2hhaW5baSsrXSk7XHJcbiAgICAgICAgY2hhaW4ubGVuZ3RoID0gMDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHZhbHVlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHRoaXNcclxuICAgICAgICAsIHRoZW4sIHdyYXBwZXI7XHJcbiAgICAgIGlmKHJlY29yZC5kKXJldHVybjtcclxuICAgICAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gICAgICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XHJcbiAgICAgICAgICB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXHJcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eChyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KHJlamVjdCwgd3JhcHBlciwgMSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICAgICAgcmVjb3JkLnMgPSAxO1xyXG4gICAgICAgICAgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgcmVqZWN0LmNhbGwod3JhcHBlciB8fCB7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGVycik7IC8vIHdyYXBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHRoaXM7XHJcbiAgICAgIGlmKHJlY29yZC5kKXJldHVybjtcclxuICAgICAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gICAgICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICByZWNvcmQucyA9IDI7XHJcbiAgICAgIG5vdGlmeShyZWNvcmQsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XHJcbiAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KEMpW1NZTUJPTF9TUEVDSUVTXTtcclxuICAgICAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XHJcbiAgICB9XHJcbiAgICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxyXG4gICAgUHJvbWlzZSA9IGZ1bmN0aW9uKGV4ZWN1dG9yKXtcclxuICAgICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xyXG4gICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBQcm9taXNlLCBQUk9NSVNFKTtcclxuICAgICAgdmFyIHJlY29yZCA9IHtcclxuICAgICAgICBwOiB0aGlzLCAgICAgIC8vIHByb21pc2VcclxuICAgICAgICBjOiBbXSwgICAgICAgIC8vIGNoYWluXHJcbiAgICAgICAgczogMCwgICAgICAgICAvLyBzdGF0ZVxyXG4gICAgICAgIGQ6IGZhbHNlLCAgICAgLy8gZG9uZVxyXG4gICAgICAgIHY6IHVuZGVmaW5lZCwgLy8gdmFsdWVcclxuICAgICAgICBoOiBmYWxzZSAgICAgIC8vIGhhbmRsZWQgcmVqZWN0aW9uXHJcbiAgICAgIH07XHJcbiAgICAgIGhpZGRlbih0aGlzLCBSRUNPUkQsIHJlY29yZCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXhlY3V0b3IoY3R4KHJlc29sdmUsIHJlY29yZCwgMSksIGN0eChyZWplY3QsIHJlY29yZCwgMSkpO1xyXG4gICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgcmVqZWN0LmNhbGwocmVjb3JkLCBlcnIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NpZ25IaWRkZW4oUHJvbWlzZVtQUk9UT1RZUEVdLCB7XHJcbiAgICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXHJcbiAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcclxuICAgICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcylbQ09OU1RSVUNUT1JdKVtTWU1CT0xfU1BFQ0lFU107XHJcbiAgICAgICAgdmFyIHJlYWN0ID0ge1xyXG4gICAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXHJcbiAgICAgICAgICBmYWlsOiBpc0Z1bmN0aW9uKG9uUmVqZWN0ZWQpICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcclxuICAgICAgICB9ICwgUCA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFByb21pc2UpKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICByZWFjdC5yZXMgPSBhc3NlcnRGdW5jdGlvbihyZXNvbHZlKTtcclxuICAgICAgICAgIHJlYWN0LnJlaiA9IGFzc2VydEZ1bmN0aW9uKHJlamVjdCk7XHJcbiAgICAgICAgfSksIHJlY29yZCA9IHRoaXNbUkVDT1JEXTtcclxuICAgICAgICByZWNvcmQuYy5wdXNoKHJlYWN0KTtcclxuICAgICAgICByZWNvcmQucyAmJiBub3RpZnkocmVjb3JkKTtcclxuICAgICAgICByZXR1cm4gUDtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcclxuICAgICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGFzc2lnbkhpZGRlbihQcm9taXNlLCB7XHJcbiAgICAgIC8vIDI1LjQuNC4xIFByb21pc2UuYWxsKGl0ZXJhYmxlKVxyXG4gICAgICBhbGw6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICB2YXIgUHJvbWlzZSA9IGdldENvbnN0cnVjdG9yKHRoaXMpXHJcbiAgICAgICAgICAsIHZhbHVlcyAgPSBbXTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgcHVzaCwgdmFsdWVzKTtcclxuICAgICAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcclxuICAgICAgICAgIGlmKHJlbWFpbmluZylmb3JFYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGVsc2UgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxyXG4gICAgICByYWNlOiBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgdmFyIFByb21pc2UgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShwcm9taXNlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcclxuICAgICAgcmVqZWN0OiBmdW5jdGlvbihyKXtcclxuICAgICAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIHJlamVjdChyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXHJcbiAgICAgIHJlc29sdmU6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdCh4KSAmJiBSRUNPUkQgaW4geCAmJiBnZXRQcm90b3R5cGVPZih4KSA9PT0gdGhpc1tQUk9UT1RZUEVdXHJcbiAgICAgICAgICA/IHggOiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgICByZXNvbHZlKHgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0obmV4dFRpY2sgfHwgc2V0SW1tZWRpYXRlLCBzYWZlU3ltYm9sKCdyZWNvcmQnKSk7XHJcbiAgc2V0VG9TdHJpbmdUYWcoUHJvbWlzZSwgUFJPTUlTRSk7XHJcbiAgc2V0U3BlY2llcyhQcm9taXNlKTtcclxuICAkZGVmaW5lKEdMT0JBTCArIEZPUkNFRCAqICFpc05hdGl2ZShQcm9taXNlKSwge1Byb21pc2U6IFByb21pc2V9KTtcclxufShnbG9iYWxbUFJPTUlTRV0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuY29sbGVjdGlvbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFQ01BU2NyaXB0IDYgY29sbGVjdGlvbnMgc2hpbVxyXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgVUlEICAgPSBzYWZlU3ltYm9sKCd1aWQnKVxyXG4gICAgLCBPMSAgICA9IHNhZmVTeW1ib2woJ08xJylcclxuICAgICwgV0VBSyAgPSBzYWZlU3ltYm9sKCd3ZWFrJylcclxuICAgICwgTEVBSyAgPSBzYWZlU3ltYm9sKCdsZWFrJylcclxuICAgICwgTEFTVCAgPSBzYWZlU3ltYm9sKCdsYXN0JylcclxuICAgICwgRklSU1QgPSBzYWZlU3ltYm9sKCdmaXJzdCcpXHJcbiAgICAsIFNJWkUgID0gREVTQyA/IHNhZmVTeW1ib2woJ3NpemUnKSA6ICdzaXplJ1xyXG4gICAgLCB1aWQgICA9IDBcclxuICAgICwgdG1wICAgPSB7fTtcclxuICBcclxuICBmdW5jdGlvbiBnZXRDb2xsZWN0aW9uKEMsIE5BTUUsIG1ldGhvZHMsIGNvbW1vbk1ldGhvZHMsIGlzTWFwLCBpc1dlYWspe1xyXG4gICAgdmFyIEFEREVSID0gaXNNYXAgPyAnc2V0JyA6ICdhZGQnXHJcbiAgICAgICwgcHJvdG8gPSBDICYmIENbUFJPVE9UWVBFXVxyXG4gICAgICAsIE8gICAgID0ge307XHJcbiAgICBmdW5jdGlvbiBpbml0RnJvbUl0ZXJhYmxlKHRoYXQsIGl0ZXJhYmxlKXtcclxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBpc01hcCwgdGhhdFtBRERFUl0sIHRoYXQpO1xyXG4gICAgICByZXR1cm4gdGhhdDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZpeFNWWihrZXksIGNoYWluKXtcclxuICAgICAgdmFyIG1ldGhvZCA9IHByb3RvW2tleV07XHJcbiAgICAgIGlmKGZyYW1ld29yaylwcm90b1trZXldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSwgYik7XHJcbiAgICAgICAgcmV0dXJuIGNoYWluID8gdGhpcyA6IHJlc3VsdDtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmKCFpc05hdGl2ZShDKSB8fCAhKGlzV2VhayB8fCAoIUJVR0dZX0lURVJBVE9SUyAmJiBoYXMocHJvdG8sIEZPUl9FQUNIKSAmJiBoYXMocHJvdG8sICdlbnRyaWVzJykpKSl7XHJcbiAgICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXHJcbiAgICAgIEMgPSBpc1dlYWtcclxuICAgICAgICA/IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgICAgIHNldCh0aGlzLCBVSUQsIHVpZCsrKTtcclxuICAgICAgICAgICAgaW5pdEZyb21JdGVyYWJsZSh0aGlzLCBpdGVyYWJsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgOiBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhhdCwgQywgTkFNRSk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBPMSwgY3JlYXRlKG51bGwpKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIFNJWkUsIDApO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgTEFTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIEZJUlNULCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICBpbml0RnJvbUl0ZXJhYmxlKHRoYXQsIGl0ZXJhYmxlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgIGFzc2lnbkhpZGRlbihhc3NpZ25IaWRkZW4oQ1tQUk9UT1RZUEVdLCBtZXRob2RzKSwgY29tbW9uTWV0aG9kcyk7XHJcbiAgICAgIGlzV2VhayB8fCAhREVTQyB8fCBkZWZpbmVQcm9wZXJ0eShDW1BST1RPVFlQRV0sICdzaXplJywge2dldDogZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gYXNzZXJ0RGVmaW5lZCh0aGlzW1NJWkVdKTtcclxuICAgICAgfX0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIE5hdGl2ZSA9IENcclxuICAgICAgICAsIGluc3QgICA9IG5ldyBDXHJcbiAgICAgICAgLCBjaGFpbiAgPSBpbnN0W0FEREVSXShpc1dlYWsgPyB7fSA6IC0wLCAxKVxyXG4gICAgICAgICwgYnVnZ3laZXJvO1xyXG4gICAgICAvLyB3cmFwIHRvIGluaXQgY29sbGVjdGlvbnMgZnJvbSBpdGVyYWJsZVxyXG4gICAgICBpZihjaGVja0Rhbmdlckl0ZXJDbG9zaW5nKGZ1bmN0aW9uKE8peyBuZXcgQyhPKSB9KSl7XHJcbiAgICAgICAgQyA9IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIEMsIE5BTUUpO1xyXG4gICAgICAgICAgcmV0dXJuIGluaXRGcm9tSXRlcmFibGUobmV3IE5hdGl2ZSwgaXRlcmFibGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDW1BST1RPVFlQRV0gPSBwcm90bztcclxuICAgICAgICBpZihmcmFtZXdvcmspcHJvdG9bQ09OU1RSVUNUT1JdID0gQztcclxuICAgICAgfVxyXG4gICAgICBpc1dlYWsgfHwgaW5zdFtGT1JfRUFDSF0oZnVuY3Rpb24odmFsLCBrZXkpe1xyXG4gICAgICAgIGJ1Z2d5WmVybyA9IDEgLyBrZXkgPT09IC1JbmZpbml0eTtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIGZpeCBjb252ZXJ0aW5nIC0wIGtleSB0byArMFxyXG4gICAgICBpZihidWdneVplcm8pe1xyXG4gICAgICAgIGZpeFNWWignZGVsZXRlJyk7XHJcbiAgICAgICAgZml4U1ZaKCdoYXMnKTtcclxuICAgICAgICBpc01hcCAmJiBmaXhTVlooJ2dldCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xyXG4gICAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4U1ZaKEFEREVSLCB0cnVlKTtcclxuICAgIH1cclxuICAgIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xyXG4gICAgc2V0U3BlY2llcyhDKTtcclxuICAgIFxyXG4gICAgT1tOQU1FXSA9IEM7XHJcbiAgICAkZGVmaW5lKEdMT0JBTCArIFdSQVAgKyBGT1JDRUQgKiAhaXNOYXRpdmUoQyksIE8pO1xyXG4gICAgXHJcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cclxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcclxuICAgIGlzV2VhayB8fCBkZWZpbmVTdGRJdGVyYXRvcnMoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiBraW5kfSk7XHJcbiAgICB9LCBmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAgICAgLCBraW5kICA9IGl0ZXIua1xyXG4gICAgICAgICwgZW50cnkgPSBpdGVyLmw7XHJcbiAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcclxuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcclxuICAgICAgaWYoIWl0ZXIubyB8fCAhKGl0ZXIubCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogaXRlci5vW0ZJUlNUXSkpe1xyXG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXHJcbiAgICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcclxuICAgICAgaWYoa2luZCA9PSBLRVkpICByZXR1cm4gaXRlclJlc3VsdCgwLCBlbnRyeS5rKTtcclxuICAgICAgaWYoa2luZCA9PSBWQUxVRSlyZXR1cm4gaXRlclJlc3VsdCgwLCBlbnRyeS52KTtcclxuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBbZW50cnkuaywgZW50cnkudl0pOyAgIFxyXG4gICAgfSwgaXNNYXAgPyBLRVkrVkFMVUUgOiBWQUxVRSwgIWlzTWFwKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIEM7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XHJcbiAgICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XHJcbiAgICBpZighaXNPYmplY3QoaXQpKXJldHVybiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xyXG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcclxuICAgIGlmKGlzRnJvemVuKGl0KSlyZXR1cm4gJ0YnO1xyXG4gICAgaWYoIWhhcyhpdCwgVUlEKSl7XHJcbiAgICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXHJcbiAgICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcclxuICAgICAgLy8gYWRkIG1pc3Npbmcgb2JqZWN0IGlkXHJcbiAgICAgIGhpZGRlbihpdCwgVUlELCArK3VpZCk7XHJcbiAgICAvLyByZXR1cm4gb2JqZWN0IGlkIHdpdGggcHJlZml4XHJcbiAgICB9IHJldHVybiAnTycgKyBpdFtVSURdO1xyXG4gIH1cclxuICBmdW5jdGlvbiBnZXRFbnRyeSh0aGF0LCBrZXkpe1xyXG4gICAgLy8gZmFzdCBjYXNlXHJcbiAgICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xyXG4gICAgaWYoaW5kZXggIT0gJ0YnKXJldHVybiB0aGF0W08xXVtpbmRleF07XHJcbiAgICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcclxuICAgIGZvcihlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xyXG4gICAgfVxyXG4gIH1cclxuICBmdW5jdGlvbiBkZWYodGhhdCwga2V5LCB2YWx1ZSl7XHJcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXHJcbiAgICAgICwgcHJldiwgaW5kZXg7XHJcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcclxuICAgIGlmKGVudHJ5KWVudHJ5LnYgPSB2YWx1ZTtcclxuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XHJcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XHJcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxyXG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxyXG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XHJcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcclxuICAgICAgfTtcclxuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XHJcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XHJcbiAgICAgIHRoYXRbU0laRV0rKztcclxuICAgICAgLy8gYWRkIHRvIGluZGV4XHJcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfVxyXG5cclxuICB2YXIgY29sbGVjdGlvbk1ldGhvZHMgPSB7XHJcbiAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcclxuICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0W08xXSwgZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICAgICAgZW50cnkuciA9IHRydWU7XHJcbiAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xyXG4gICAgICB9XHJcbiAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhhdFtTSVpFXSA9IDA7XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXHJcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIHRoYXQgID0gdGhpc1xyXG4gICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xyXG4gICAgICBpZihlbnRyeSl7XHJcbiAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXHJcbiAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xyXG4gICAgICAgIGRlbGV0ZSB0aGF0W08xXVtlbnRyeS5pXTtcclxuICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICBpZihwcmV2KXByZXYubiA9IG5leHQ7XHJcbiAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xyXG4gICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcclxuICAgICAgICBpZih0aGF0W0xBU1RdID09IGVudHJ5KXRoYXRbTEFTVF0gPSBwcmV2O1xyXG4gICAgICAgIHRoYXRbU0laRV0tLTtcclxuICAgICAgfSByZXR1cm4gISFlbnRyeTtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcclxuICAgICAgICAsIGVudHJ5O1xyXG4gICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXNbRklSU1RdKXtcclxuICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xyXG4gICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHJldHVybiAhIWdldEVudHJ5KHRoaXMsIGtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIzLjEgTWFwIE9iamVjdHNcclxuICBNYXAgPSBnZXRDb2xsZWN0aW9uKE1hcCwgTUFQLCB7XHJcbiAgICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoaXMsIGtleSk7XHJcbiAgICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjEuMy45IE1hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmKHRoaXMsIGtleSA9PT0gMCA/IDAgOiBrZXksIHZhbHVlKTtcclxuICAgIH1cclxuICB9LCBjb2xsZWN0aW9uTWV0aG9kcywgdHJ1ZSk7XHJcbiAgXHJcbiAgLy8gMjMuMiBTZXQgT2JqZWN0c1xyXG4gIFNldCA9IGdldENvbGxlY3Rpb24oU2V0LCBTRVQsIHtcclxuICAgIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gICAgYWRkOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIGNvbGxlY3Rpb25NZXRob2RzKTtcclxuICBcclxuICBmdW5jdGlvbiBkZWZXZWFrKHRoYXQsIGtleSwgdmFsdWUpe1xyXG4gICAgaWYoaXNGcm96ZW4oYXNzZXJ0T2JqZWN0KGtleSkpKWxlYWtTdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICBlbHNlIHtcclxuICAgICAgaGFzKGtleSwgV0VBSykgfHwgaGlkZGVuKGtleSwgV0VBSywge30pO1xyXG4gICAgICBrZXlbV0VBS11bdGhhdFtVSURdXSA9IHZhbHVlO1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9XHJcbiAgZnVuY3Rpb24gbGVha1N0b3JlKHRoYXQpe1xyXG4gICAgcmV0dXJuIHRoYXRbTEVBS10gfHwgaGlkZGVuKHRoYXQsIExFQUssIG5ldyBNYXApW0xFQUtdO1xyXG4gIH1cclxuICBcclxuICB2YXIgd2Vha01ldGhvZHMgPSB7XHJcbiAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xyXG4gICAgICByZXR1cm4gaGFzKGtleSwgV0VBSykgJiYgaGFzKGtleVtXRUFLXSwgdGhpc1tVSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbVUlEXV07XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XHJcbiAgICAgIHJldHVybiBoYXMoa2V5LCBXRUFLKSAmJiBoYXMoa2V5W1dFQUtdLCB0aGlzW1VJRF0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgLy8gMjMuMyBXZWFrTWFwIE9iamVjdHNcclxuICBXZWFrTWFwID0gZ2V0Q29sbGVjdGlvbihXZWFrTWFwLCBXRUFLTUFQLCB7XHJcbiAgICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZihpc09iamVjdChrZXkpKXtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYoaGFzKGtleSwgV0VBSykpcmV0dXJuIGtleVtXRUFLXVt0aGlzW1VJRF1dO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmV2Vhayh0aGlzLCBrZXksIHZhbHVlKTtcclxuICAgIH1cclxuICB9LCB3ZWFrTWV0aG9kcywgdHJ1ZSwgdHJ1ZSk7XHJcbiAgXHJcbiAgLy8gSUUxMSBXZWFrTWFwIGZyb3plbiBrZXlzIGZpeFxyXG4gIGlmKGZyYW1ld29yayAmJiBuZXcgV2Vha01hcCgpLnNldChPYmplY3QuZnJlZXplKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xyXG4gICAgZm9yRWFjaC5jYWxsKGFycmF5KCdkZWxldGUsaGFzLGdldCxzZXQnKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIG1ldGhvZCA9IFdlYWtNYXBbUFJPVE9UWVBFXVtrZXldO1xyXG4gICAgICBXZWFrTWFwW1BST1RPVFlQRV1ba2V5XSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGxlYWt5IG1hcFxyXG4gICAgICAgIGlmKGlzT2JqZWN0KGEpICYmIGlzRnJvemVuKGEpKXtcclxuICAgICAgICAgIHZhciByZXN1bHQgPSBsZWFrU3RvcmUodGhpcylba2V5XShhLCBiKTtcclxuICAgICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxyXG4gICAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIzLjQgV2Vha1NldCBPYmplY3RzXHJcbiAgV2Vha1NldCA9IGdldENvbGxlY3Rpb24oV2Vha1NldCwgV0VBS1NFVCwge1xyXG4gICAgLy8gMjMuNC4zLjEgV2Vha1NldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gICAgYWRkOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWZXZWFrKHRoaXMsIHZhbHVlLCB0cnVlKTtcclxuICAgIH1cclxuICB9LCB3ZWFrTWV0aG9kcywgZmFsc2UsIHRydWUpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5yZWZsZWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gIGZ1bmN0aW9uIEVudW1lcmF0ZShpdGVyYXRlZCl7XHJcbiAgICB2YXIga2V5cyA9IFtdLCBrZXk7XHJcbiAgICBmb3Ioa2V5IGluIGl0ZXJhdGVkKWtleXMucHVzaChrZXkpO1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgYToga2V5cywgaTogMH0pO1xyXG4gIH1cclxuICBjcmVhdGVJdGVyYXRvcihFbnVtZXJhdGUsIE9CSkVDVCwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIGtleXMgPSBpdGVyLmFcclxuICAgICAgLCBrZXk7XHJcbiAgICBkbyB7XHJcbiAgICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aClyZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIH0gd2hpbGUoISgoa2V5ID0ga2V5c1tpdGVyLmkrK10pIGluIGl0ZXIubykpO1xyXG4gICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwga2V5KTtcclxuICB9KTtcclxuICBcclxuICBmdW5jdGlvbiB3cmFwKGZuKXtcclxuICAgIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIGFzc2VydE9iamVjdChpdCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSwgdHJ1ZTtcclxuICAgICAgfSBjYXRjaChlKXtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gcmVmbGVjdEdldCh0YXJnZXQsIHByb3BlcnR5S2V5LyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl1cclxuICAgICAgLCBkZXNjID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcclxuICAgIGlmKGRlc2MpcmV0dXJuIGhhcyhkZXNjLCAndmFsdWUnKVxyXG4gICAgICA/IGRlc2MudmFsdWVcclxuICAgICAgOiBkZXNjLmdldCA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyB1bmRlZmluZWRcclxuICAgICAgICA6IGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG90eXBlT2YodGFyZ2V0KSlcclxuICAgICAgPyByZWZsZWN0R2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXHJcbiAgICAgIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuICBmdW5jdGlvbiByZWZsZWN0U2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgNCA/IHRhcmdldCA6IGFyZ3VtZW50c1szXVxyXG4gICAgICAsIG93bkRlc2MgID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpXHJcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcclxuICAgIGlmKCFvd25EZXNjKXtcclxuICAgICAgaWYoaXNPYmplY3QocHJvdG8gPSBnZXRQcm90b3R5cGVPZih0YXJnZXQpKSl7XHJcbiAgICAgICAgcmV0dXJuIHJlZmxlY3RTZXQocHJvdG8sIHByb3BlcnR5S2V5LCBWLCByZWNlaXZlcik7XHJcbiAgICAgIH1cclxuICAgICAgb3duRGVzYyA9IGRlc2NyaXB0b3IoMCk7XHJcbiAgICB9XHJcbiAgICBpZihoYXMob3duRGVzYywgJ3ZhbHVlJykpe1xyXG4gICAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gZ2V0T3duRGVzY3JpcHRvcihyZWNlaXZlciwgcHJvcGVydHlLZXkpIHx8IGRlc2NyaXB0b3IoMCk7XHJcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvci52YWx1ZSA9IFY7XHJcbiAgICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eShyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvciksIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3duRGVzYy5zZXQgPT09IHVuZGVmaW5lZFxyXG4gICAgICA/IGZhbHNlXHJcbiAgICAgIDogKG93bkRlc2Muc2V0LmNhbGwocmVjZWl2ZXIsIFYpLCB0cnVlKTtcclxuICB9XHJcbiAgdmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgcmV0dXJuSXQ7XHJcbiAgXHJcbiAgdmFyIHJlZmxlY3QgPSB7XHJcbiAgICAvLyAyNi4xLjEgUmVmbGVjdC5hcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdClcclxuICAgIGFwcGx5OiBjdHgoY2FsbCwgYXBwbHksIDMpLFxyXG4gICAgLy8gMjYuMS4yIFJlZmxlY3QuY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCBbLCBuZXdUYXJnZXRdKVxyXG4gICAgY29uc3RydWN0OiBmdW5jdGlvbih0YXJnZXQsIGFyZ3VtZW50c0xpc3QgLyosIG5ld1RhcmdldCovKXtcclxuICAgICAgdmFyIHByb3RvICAgID0gYXNzZXJ0RnVuY3Rpb24oYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl0pW1BST1RPVFlQRV1cclxuICAgICAgICAsIGluc3RhbmNlID0gY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0UHJvdG8pXHJcbiAgICAgICAgLCByZXN1bHQgICA9IGFwcGx5LmNhbGwodGFyZ2V0LCBpbnN0YW5jZSwgYXJndW1lbnRzTGlzdCk7XHJcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4zIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcylcclxuICAgIGRlZmluZVByb3BlcnR5OiB3cmFwKGRlZmluZVByb3BlcnR5KSxcclxuICAgIC8vIDI2LjEuNCBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgICBkZWxldGVQcm9wZXJ0eTogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHZhciBkZXNjID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gICAgICByZXR1cm4gZGVzYyAmJiAhZGVzYy5jb25maWd1cmFibGUgPyBmYWxzZSA6IGRlbGV0ZSB0YXJnZXRbcHJvcGVydHlLZXldO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXHJcbiAgICBlbnVtZXJhdGU6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiBuZXcgRW51bWVyYXRlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXHJcbiAgICBnZXQ6IHJlZmxlY3RHZXQsXHJcbiAgICAvLyAyNi4xLjcgUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHJldHVybiBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxyXG4gICAgZ2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiBnZXRQcm90b3R5cGVPZihhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS45IFJlZmxlY3QuaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgICBoYXM6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgICByZXR1cm4gcHJvcGVydHlLZXkgaW4gdGFyZ2V0O1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxyXG4gICAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgICByZXR1cm4gISFpc0V4dGVuc2libGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuMTEgUmVmbGVjdC5vd25LZXlzKHRhcmdldClcclxuICAgIG93bktleXM6IG93bktleXMsXHJcbiAgICAvLyAyNi4xLjEyIFJlZmxlY3QucHJldmVudEV4dGVuc2lvbnModGFyZ2V0KVxyXG4gICAgcHJldmVudEV4dGVuc2lvbnM6IHdyYXAoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zIHx8IHJldHVybkl0KSxcclxuICAgIC8vIDI2LjEuMTMgUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgViBbLCByZWNlaXZlcl0pXHJcbiAgICBzZXQ6IHJlZmxlY3RTZXRcclxuICB9XHJcbiAgLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXHJcbiAgaWYoc2V0UHJvdG90eXBlT2YpcmVmbGVjdC5zZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvdG8pe1xyXG4gICAgcmV0dXJuIHNldFByb3RvdHlwZU9mKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm90byksIHRydWU7XHJcbiAgfTtcclxuICBcclxuICAkZGVmaW5lKEdMT0JBTCwge1JlZmxlY3Q6IHt9fSk7XHJcbiAgJGRlZmluZShTVEFUSUMsICdSZWZsZWN0JywgcmVmbGVjdCk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM3LnByb3Bvc2FscyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgJGRlZmluZShQUk9UTywgQVJSQVksIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG4gICAgaW5jbHVkZXM6IGNyZWF0ZUFycmF5Q29udGFpbnModHJ1ZSlcclxuICB9KTtcclxuICAkZGVmaW5lKFBST1RPLCBTVFJJTkcsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuYXRcclxuICAgIGF0OiBjcmVhdGVQb2ludEF0KHRydWUpXHJcbiAgfSk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAgICAgLCBrZXlzICAgPSBnZXRLZXlzKG9iamVjdClcclxuICAgICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICAgLCByZXN1bHQgPSBBcnJheShsZW5ndGgpXHJcbiAgICAgICAgLCBrZXk7XHJcbiAgICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XHJcbiAgICAgIGVsc2Ugd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBPW2tleXNbaSsrXV07XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gICRkZWZpbmUoU1RBVElDLCBPQkpFQ1QsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vOTM1Mzc4MVxyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgICAsIHJlc3VsdCA9IHt9O1xyXG4gICAgICBmb3JFYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0eShyZXN1bHQsIGtleSwgZGVzY3JpcHRvcigwLCBnZXRPd25EZXNjcmlwdG9yKE8sIGtleSkpKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3J3YWxkcm9uL3RjMzktbm90ZXMvYmxvYi9tYXN0ZXIvZXM2LzIwMTQtMDQvYXByLTkubWQjNTEtb2JqZWN0ZW50cmllcy1vYmplY3R2YWx1ZXNcclxuICAgIHZhbHVlczogIGNyZWF0ZU9iamVjdFRvQXJyYXkoZmFsc2UpLFxyXG4gICAgZW50cmllczogY3JlYXRlT2JqZWN0VG9BcnJheSh0cnVlKVxyXG4gIH0pO1xyXG4gICRkZWZpbmUoU1RBVElDLCBSRUdFWFAsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thbmdheC85Njk4MTAwXHJcbiAgICBlc2NhcGU6IGNyZWF0ZVJlcGxhY2VyKC8oW1xcXFxcXC1bXFxde30oKSorPy4sXiR8XSkvZywgJ1xcXFwkMScsIHRydWUpXHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM3LmFic3RyYWN0LXJlZnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3plbnBhcnNpbmcvZXMtYWJzdHJhY3QtcmVmc1xyXG4hZnVuY3Rpb24oUkVGRVJFTkNFKXtcclxuICBSRUZFUkVOQ0VfR0VUID0gZ2V0V2VsbEtub3duU3ltYm9sKFJFRkVSRU5DRSsnR2V0JywgdHJ1ZSk7XHJcbiAgdmFyIFJFRkVSRU5DRV9TRVQgPSBnZXRXZWxsS25vd25TeW1ib2woUkVGRVJFTkNFK1NFVCwgdHJ1ZSlcclxuICAgICwgUkVGRVJFTkNFX0RFTEVURSA9IGdldFdlbGxLbm93blN5bWJvbChSRUZFUkVOQ0UrJ0RlbGV0ZScsIHRydWUpO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBTWU1CT0wsIHtcclxuICAgIHJlZmVyZW5jZUdldDogUkVGRVJFTkNFX0dFVCxcclxuICAgIHJlZmVyZW5jZVNldDogUkVGRVJFTkNFX1NFVCxcclxuICAgIHJlZmVyZW5jZURlbGV0ZTogUkVGRVJFTkNFX0RFTEVURVxyXG4gIH0pO1xyXG4gIFxyXG4gIGhpZGRlbihGdW5jdGlvblByb3RvLCBSRUZFUkVOQ0VfR0VULCByZXR1cm5UaGlzKTtcclxuICBcclxuICBmdW5jdGlvbiBzZXRNYXBNZXRob2RzKENvbnN0cnVjdG9yKXtcclxuICAgIGlmKENvbnN0cnVjdG9yKXtcclxuICAgICAgdmFyIE1hcFByb3RvID0gQ29uc3RydWN0b3JbUFJPVE9UWVBFXTtcclxuICAgICAgaGlkZGVuKE1hcFByb3RvLCBSRUZFUkVOQ0VfR0VULCBNYXBQcm90by5nZXQpO1xyXG4gICAgICBoaWRkZW4oTWFwUHJvdG8sIFJFRkVSRU5DRV9TRVQsIE1hcFByb3RvLnNldCk7XHJcbiAgICAgIGhpZGRlbihNYXBQcm90bywgUkVGRVJFTkNFX0RFTEVURSwgTWFwUHJvdG9bJ2RlbGV0ZSddKTtcclxuICAgIH1cclxuICB9XHJcbiAgc2V0TWFwTWV0aG9kcyhNYXApO1xyXG4gIHNldE1hcE1ldGhvZHMoV2Vha01hcCk7XHJcbn0oJ3JlZmVyZW5jZScpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBqcy5hcnJheS5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxyXG4hZnVuY3Rpb24oYXJyYXlTdGF0aWNzKXtcclxuICBmdW5jdGlvbiBzZXRBcnJheVN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcclxuICAgIGZvckVhY2guY2FsbChhcnJheShrZXlzKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoa2V5IGluIEFycmF5UHJvdG8pYXJyYXlTdGF0aWNzW2tleV0gPSBjdHgoY2FsbCwgQXJyYXlQcm90b1trZXldLCBsZW5ndGgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNldEFycmF5U3RhdGljcygncG9wLHJldmVyc2Usc2hpZnQsa2V5cyx2YWx1ZXMsZW50cmllcycsIDEpO1xyXG4gIHNldEFycmF5U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xyXG4gIHNldEFycmF5U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xyXG4gICAgICAgICAgICAgICAgICAncmVkdWNlLHJlZHVjZVJpZ2h0LGNvcHlXaXRoaW4sZmlsbCx0dXJuJyk7XHJcbiAgJGRlZmluZShTVEFUSUMsIEFSUkFZLCBhcnJheVN0YXRpY3MpO1xyXG59KHt9KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogd2ViLmRvbS5pdGFyYWJsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKE5vZGVMaXN0KXtcclxuICBpZihmcmFtZXdvcmsgJiYgTm9kZUxpc3QgJiYgIShTWU1CT0xfSVRFUkFUT1IgaW4gTm9kZUxpc3RbUFJPVE9UWVBFXSkpe1xyXG4gICAgaGlkZGVuKE5vZGVMaXN0W1BST1RPVFlQRV0sIFNZTUJPTF9JVEVSQVRPUiwgSXRlcmF0b3JzW0FSUkFZXSk7XHJcbiAgfVxyXG4gIEl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEl0ZXJhdG9yc1tBUlJBWV07XHJcbn0oZ2xvYmFsLk5vZGVMaXN0KTtcbn0odHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCksIHRydWUpOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvbWFzdGVyL0xJQ0VOU0UgZmlsZS4gQW5cbiAqIGFkZGl0aW9uYWwgZ3JhbnQgb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpblxuICogdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID1cbiAgICB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHJldHVybiBuZXcgR2VuZXJhdG9yKGlubmVyRm4sIG91dGVyRm4sIHNlbGYgfHwgbnVsbCwgdHJ5TG9jc0xpc3QgfHwgW10pO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuZXJhdG9yID0gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCk7XG4gICAgICB2YXIgY2FsbE5leHQgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLm5leHQpO1xuICAgICAgdmFyIGNhbGxUaHJvdyA9IHN0ZXAuYmluZChnZW5lcmF0b3JbXCJ0aHJvd1wiXSk7XG5cbiAgICAgIGZ1bmN0aW9uIHN0ZXAoYXJnKSB7XG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaCh0aGlzLCBudWxsLCBhcmcpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICByZXNvbHZlKGluZm8udmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZShpbmZvLnZhbHVlKS50aGVuKGNhbGxOZXh0LCBjYWxsVGhyb3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxOZXh0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGdlbmVyYXRvciA9IG91dGVyRm4gPyBPYmplY3QuY3JlYXRlKG91dGVyRm4ucHJvdG90eXBlKSA6IHRoaXM7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCk7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSxcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yLFxuICAgICAgICAgICAgYXJnXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gTGlrZSByZXR1cm5pbmcgZ2VuZXJhdG9yLnRocm93KHVuY2F1Z2h0KSwgYnV0IHdpdGhvdXQgdGhlXG4gICAgICAgICAgICAvLyBvdmVyaGVhZCBvZiBhbiBleHRyYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIGFyZyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgXCJhdHRlbXB0IHRvIHNlbmQgXCIgKyBKU09OLnN0cmluZ2lmeShhcmcpICsgXCIgdG8gbmV3Ym9ybiBnZW5lcmF0b3JcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG5cbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihyZWNvcmQuYXJnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW5lcmF0b3IubmV4dCA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJuZXh0XCIpO1xuICAgIGdlbmVyYXRvcltcInRocm93XCJdID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInRocm93XCIpO1xuICAgIGdlbmVyYXRvcltcInJldHVyblwiXSA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJyZXR1cm5cIik7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICAvLyBQcmUtaW5pdGlhbGl6ZSBhdCBsZWFzdCAyMCB0ZW1wb3JhcnkgdmFyaWFibGVzIHRvIGVuYWJsZSBoaWRkZW5cbiAgICAgIC8vIGNsYXNzIG9wdGltaXphdGlvbnMgZm9yIHNpbXBsZSBnZW5lcmF0b3JzLlxuICAgICAgZm9yICh2YXIgdGVtcEluZGV4ID0gMCwgdGVtcE5hbWU7XG4gICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIHRlbXBOYW1lID0gXCJ0XCIgKyB0ZW1wSW5kZXgpIHx8IHRlbXBJbmRleCA8IDIwO1xuICAgICAgICAgICArK3RlbXBJbmRleCkge1xuICAgICAgICB0aGlzW3RlbXBOYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcbiAgICAgICAgcmV0dXJuICEhY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOiB0aGlzXG4pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2JhYmVsL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZS9wb2x5ZmlsbFwiKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
