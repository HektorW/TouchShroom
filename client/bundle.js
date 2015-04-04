(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var SoundManager = _interopRequire(require("./soundmanager"));

var NetworkManager = _interopRequire(require("./networkmanager"));

var ScreenManager = _interopRequire(require("./screenmanager"));

var App = (function () {
  function App() {
    _classCallCheck(this, App);

    this.networkManager = new NetworkManager();
    this.soundManager = new SoundManager();
    this.screenManager = new ScreenManager(this.networkManager, this.soundManager);
  }

  _createClass(App, {
    init: {
      value: function init() {
        this.networkManager.init();
        this.soundManager.init();
        this.screenManager.init();

        return this;
      }
    }
  });

  return App;
})();

module.exports = App;

},{"./networkmanager":5,"./screenmanager":10,"./soundmanager":15}],2:[function(require,module,exports){
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
        return undefined;
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

},{"./inputmanager":3,"./networkmanager":5,"./objects/base":6,"./objects/minion":7,"./objects/particle":8,"./objects/player":9,"./soundmanager":15,"./util/draw":17,"./util/prefixer":19}],3:[function(require,module,exports){
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

},{"events":26}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// includes some browser polyfills
require("babelify/polyfill");

var Game = _interopRequire(require("./game"));

var App = _interopRequire(require("./app"));

// var game = window.game = new Game().init();
var app = window.app = new App().init();

},{"./app":1,"./game":2,"babelify/polyfill":25}],5:[function(require,module,exports){
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
    on: {
      value: function on(event, callback) {
        this.socket.on(event, callback);
      }
    },
    send: {
      value: function send(msg, data) {
        this.socket.emit(msg, data);
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

        socket.on("BASE.resources", this.onBaseResources.bind(this));

        socket.on("my player", this.onMyPlayer.bind(this));

        socket.on("g.players", this.onGPlayers.bind(this));

        socket.on("p.connection", this.onPConnection.bind(this));
        socket.on("p.disconnection", this.onPDisconnection.bind(this));

        socket.on("b.minion", this.onBMinion.bind(this));
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
        // this.controller.connected();
      }
    },
    onSocketDisconnect: {
      value: function onSocketDisconnect() {
        this.conected = false;
        // this.controller.disconnected();
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
    },
    onGPlayers: {

      // Probably unused
      // logic seems to be wrong

      value: function onGPlayers(data) {
        var players = data.players;
        var bases = this.game.bases;
        for (var i = 0, len = players.length; i < len; i++) {
          var index = game.bases.indexByID(players[i].player_id);

          // If player is not in game -> Add
          if (index === undefined) {
            var base = new Base(players[i].aspect_left, players[i].aspect_top, players[i].aspect_size, players[i].color);
            base.player_id = players[i].player_id;
            GAME.bases.push(base);
          }
          // Else set values correct
          else {
            var base = bases[index];
            base.aspect_left = players[i].aspect_left;
            base.aspect_top = players[i].aspect_top;
            base.aspect_size = players[i].aspect_size;
            base.color = players[i].color;
          }
        }

        // Call resize to fix aspects
        this.game.resize();
      }
    },
    onPConnection: {
      value: function onPConnection(data) {
        if (data.player.player_id !== this.game.me.player_id) {
          var b = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
          b.player_id = data.player.player_id;
          this.game.bases.push(b);
        }
      }
    },
    onPDisconnection: {

      // Seems to be unused, logic seems wrong

      value: function onPDisconnection(data) {
        var i = this.game.bases.indexByID(data.player_id);
        if (i !== undefined) {
          this.game.bases.splice(i, 1);
        }
      }
    },
    onBMinion: {
      value: function onBMinion(data) {
        var game = this.game;
        var bases = game.bases;
        var sourceBase = game.getByID(bases, data.source_id);
        var targetBase = game.getByID(bases, data.target_id);

        if (!!sourceBase && !!targetBase) {
          game.minions.push(new Minion(sourceBase, targetBase));
        }

        // var source_index = this.game.bases.indexByID(data.source_id);
        // var target_index = this.game.bases.indexByID(data.target_id);

        // if(source_index !== undefined && target_index !== undefined){
        //     this.game.minions.push(
        //       new Minion(this.game.bases[source_index], this.game.bases[target_index])
        //     );
        // }
      }
    }
  });

  return NetworkManager;
})();

module.exports = NetworkManager;

},{}],6:[function(require,module,exports){
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

},{"../util/draw":17}],7:[function(require,module,exports){
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

},{"../util/math":18}],8:[function(require,module,exports){
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

},{"../util/color":16}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var LoadingScreen = _interopRequire(require("./screens/LoadingScreen"));

var StartScreen = _interopRequire(require("./screens/StartScreen"));

var GameScreen = _interopRequire(require("./screens/GameScreen"));

var ScreenManager = (function () {
    function ScreenManager(networkManager, soundManager) {
        _classCallCheck(this, ScreenManager);

        this.networkManager = networkManager;
        this.soundManager = soundManager;

        this.screens = [];
        this.activeScreen = null;
    }

    _createClass(ScreenManager, {
        init: {
            value: function init() {
                this.initDOM();
                this.initScreens();
                this.initNetwork();

                this.setScreen(this.screens.loading);

                return this;
            }
        },
        initDOM: {
            value: function initDOM() {
                this.$el = $("[data-screen-container]");
            }
        },
        initScreens: {
            value: function initScreens() {
                this.screens = {
                    loading: new LoadingScreen(this.networkManager, this.soundManager),
                    start: new StartScreen(this.networkManager, this.soundManager),
                    game: new GameScreen(this.networkManager, this.soundManager)
                };
            }
        },
        initNetwork: {
            value: function initNetwork() {
                var _this = this;

                var networkManager = this.networkManager;

                networkManager.on("connect", function () {
                    return _this.setScreen(_this.screens.start);
                });
            }
        },
        setScreen: {
            value: function setScreen(screen) {
                if (this.activeScreen) {
                    this.activeScreen.deactivate();
                    this.activeScreen.unrenderDOM();
                }

                this.activeScreen = screen;
                this.activeScreen.activate();
                this.activeScreen.renderDOM(this.$el);
            }
        }
    });

    return ScreenManager;
})();

module.exports = ScreenManager;

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
CONTROLLER.init = function () {
    NET.init();
    GAME.init();

    CONTROLLER.current_screen = "loading";

    CONTROLLER.bindevents();
};
/**
 * { BIND EVENTS }
 * Binds listeners and flow logic
 */
CONTROLLER.bindevents = function () {
    // Setup listeners
    DOM.on("#btn_play", "click", function () {
        CONTROLLER.requestPlay();
    });
};

/**
 * { RESUQEST PLAY }
 * Called when client clicks 'Play'
 */
CONTROLLER.requestPlay = function () {
    NET.send("CLIENT.play");
    CONTROLLER.setScreen("waiting");
};

/**
 * { SET SCREEN }
 * Sets the active screen
 * @param  {String} screen  Name for the screen, e.g game/start/loading, !NOT HTML-DOM-id, e.g #screen_game!
 */
CONTROLLER.setScreen = function (screen) {
    var s = DOM("#screen_" + screen);
    if (s) {
        if (CONTROLLER.current_screen) DOM.addClass("#screen_" + CONTROLLER.current_screen, "hidden");
        CONTROLLER.current_screen = screen;
        DOM.removeClass(s, "hidden");
    }
};
/**
 * { OVERLAY MESSAGE }
 * Displays an overlay message
 * @param  {String} msg
 */
CONTROLLER.overlayMessage = function (msg) {
    DOM.removeClass("#overlay", "hidden");
    DOM.text("#overlay_message", "<h2>{0}</h2>".format(msg));
};
/**
 * { OVERLAY HIDE }
 * Hides the overlay
 */
CONTROLLER.overlayHide = function () {
    DOM.addClass("#overlay", "hidden");
};
/**
 * { CONNECTED }
 */
CONTROLLER.connected = function () {
    timed("Connected!");
    CONTROLLER.setScreen("start");
};
/** 
 * { NO CONNECT}
 * Could not connect to server
 */
CONTROLLER.noconnect = function () {
    timed("Could not connect to server!");
    CONTROLLER.setScreen("noconnect");
};
/**
 * { DISCONNECTED }
 */
CONTROLLER.disconnected = function () {
    timed("Disconnected from server!");
    CONTROLLER.setScreen("noconnect");
};

/**
 * { START GAME }
 * Starts game
 */
CONTROLLER.startgame = function () {
    CONTROLLER.setScreen("game");
};

},{"./screens/GameScreen":12,"./screens/LoadingScreen":13,"./screens/StartScreen":14}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = (function () {
  function BaseScreen(networkManager, soundManager) {
    _classCallCheck(this, BaseScreen);

    this.networkManager = networkManager;
    this.soundManager = soundManager;

    this.active = false;
  }

  _createClass(BaseScreen, {
    activate: {
      value: function activate() {
        this.active = true;
      }
    },
    deactivate: {
      value: function deactivate() {
        this.active = false;
      }
    },
    renderDOM: {
      value: function renderDOM($parent, template) {
        if (template) {
          this.$el = $(template);
        } else {
          this.$el = $("<div>");
        }

        $parent.html(this.$el);
        this.bindEvents();
      }
    },
    unrenderDOM: {
      value: function unrenderDOM() {
        this.$el.off();
      }
    },
    bindEvents: {
      value: function bindEvents() {
        for (var definition in this.events) {
          var split = definition.split(" ");
          var _event = split[0];
          var selector = split.slice(1).join(" ");
          var callback = this[this.events[definition]].bind(this);

          this.$el.find(selector).on(_event, callback);
        }
      }
    }
  });

  return BaseScreen;
})();

module.exports = BaseScreen;

},{}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = _interopRequire(require("./BaseScreen"));

var GameScreen = (function (_BaseScreen) {
  function GameScreen() {
    _classCallCheck(this, GameScreen);

    this.socketEvents = {};
  }

  _inherits(GameScreen, _BaseScreen);

  _createClass(GameScreen, {
    activate: {
      value: function activate() {}
    },
    renderDOM: {
      value: function renderDOM($el) {
        var template = "\n      <div id=\"screen_game\" class=\"screen\">\n        <canvas id=\"canvas\" width=\"600\" height=\"400\">\n          <p>Your browser doesn't seem to support the Canvas-element :(.</p>\n        </canvas>\n      </div>\n    ";
      }
    }
  });

  return GameScreen;
})(BaseScreen);

module.exports = GameScreen;

},{"./BaseScreen":11}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = _interopRequire(require("./BaseScreen"));

var LoadingScreen = (function (_BaseScreen) {
  function LoadingScreen() {
    _classCallCheck(this, LoadingScreen);

    if (_BaseScreen != null) {
      _BaseScreen.apply(this, arguments);
    }
  }

  _inherits(LoadingScreen, _BaseScreen);

  _createClass(LoadingScreen, {
    renderDOM: {
      value: function renderDOM($parent) {
        var template = "\n      <div id=\"screen_loading\" class=\"screen\">\n        <h2>Loading</h2>\n        <img src=\"res/images/waiting.gif\" alt=\"\">\n      </div>\n    ";

        _get(Object.getPrototypeOf(LoadingScreen.prototype), "renderDOM", this).call(this, $parent, template);
      }
    }
  });

  return LoadingScreen;
})(BaseScreen);

module.exports = LoadingScreen;

},{"./BaseScreen":11}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = _interopRequire(require("./BaseScreen"));

var StartScreen = (function (_BaseScreen) {
  function StartScreen(networkManager, soundManager) {
    _classCallCheck(this, StartScreen);

    _get(Object.getPrototypeOf(StartScreen.prototype), "constructor", this).call(this, networkManager, soundManager);

    this.events = {
      "click #btn_play": "onPlayClick"
    };
  }

  _inherits(StartScreen, _BaseScreen);

  _createClass(StartScreen, {
    renderDOM: {
      value: function renderDOM($parent) {
        var template = "\n      <div id=\"screen_start\" class=\"screen\">\n        <button id=\"btn_play\">Play</button>\n      </div>\n    ";

        _get(Object.getPrototypeOf(StartScreen.prototype), "renderDOM", this).call(this, $parent, template);
      }
    },
    onPlayClick: {
      value: function onPlayClick(event) {
        alert();
      }
    }
  });

  return StartScreen;
})(BaseScreen);

module.exports = StartScreen;

},{"./BaseScreen":11}],15:[function(require,module,exports){
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

},{"./util/prefixer.js":19,"./util/util.js":20}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":22,"regenerator-babel/runtime":23}],22:[function(require,module,exports){
/**
 * Core.js 0.6.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
"use strict";

!(function (global, framework, undefined) {
  "use strict";

  /******************************************************************************
   * Module : common                                                            *
   ******************************************************************************/

  // Shortcuts for [[Class]] & property names
  var OBJECT = "Object",
      FUNCTION = "Function",
      ARRAY = "Array",
      STRING = "String",
      NUMBER = "Number",
      REGEXP = "RegExp",
      DATE = "Date",
      MAP = "Map",
      SET = "Set",
      WEAKMAP = "WeakMap",
      WEAKSET = "WeakSet",
      SYMBOL = "Symbol",
      PROMISE = "Promise",
      MATH = "Math",
      ARGUMENTS = "Arguments",
      PROTOTYPE = "prototype",
      CONSTRUCTOR = "constructor",
      TO_STRING = "toString",
      TO_STRING_TAG = TO_STRING + "Tag",
      TO_LOCALE = "toLocaleString",
      HAS_OWN = "hasOwnProperty",
      FOR_EACH = "forEach",
      ITERATOR = "iterator",
      FF_ITERATOR = "@@" + ITERATOR,
      PROCESS = "process",
      CREATE_ELEMENT = "createElement"
  // Aliases global objects and prototypes
  ,
      Function = global[FUNCTION],
      Object = global[OBJECT],
      Array = global[ARRAY],
      String = global[STRING],
      Number = global[NUMBER],
      RegExp = global[REGEXP],
      Date = global[DATE],
      Map = global[MAP],
      Set = global[SET],
      WeakMap = global[WEAKMAP],
      WeakSet = global[WEAKSET],
      Symbol = global[SYMBOL],
      Math = global[MATH],
      TypeError = global.TypeError,
      RangeError = global.RangeError,
      setTimeout = global.setTimeout,
      setImmediate = global.setImmediate,
      clearImmediate = global.clearImmediate,
      parseInt = global.parseInt,
      isFinite = global.isFinite,
      process = global[PROCESS],
      nextTick = process && process.nextTick,
      document = global.document,
      html = document && document.documentElement,
      navigator = global.navigator,
      define = global.define,
      console = global.console || {},
      ArrayProto = Array[PROTOTYPE],
      ObjectProto = Object[PROTOTYPE],
      FunctionProto = Function[PROTOTYPE],
      Infinity = 1 / 0,
      DOT = ".";

  // http://jsperf.com/core-js-isobject
  function isObject(it) {
    return it !== null && (typeof it == "object" || typeof it == "function");
  }
  function isFunction(it) {
    return typeof it == "function";
  }
  // Native function?
  var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

  // Object internal [[Class]] or toStringTag
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
  var toString = ObjectProto[TO_STRING];
  function setToStringTag(it, tag, stat) {
    if (it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG)) hidden(it, SYMBOL_TAG, tag);
  }
  function cof(it) {
    return toString.call(it).slice(8, -1);
  }
  function classof(it) {
    var O, T;
    return it == undefined ? it === undefined ? "Undefined" : "Null" : typeof (T = (O = Object(it))[SYMBOL_TAG]) == "string" ? T : cof(O);
  }

  // Function
  var call = FunctionProto.call,
      apply = FunctionProto.apply,
      REFERENCE_GET;
  // Partial apply
  function part() {
    var fn = assertFunction(this),
        length = arguments.length,
        args = Array(length),
        i = 0,
        _ = path._,
        holder = false;
    while (length > i) if ((args[i] = arguments[i++]) === _) holder = true;
    return function () {
      var that = this,
          _length = arguments.length,
          i = 0,
          j = 0,
          _args;
      if (!holder && !_length) return invoke(fn, args, that);
      _args = args.slice();
      if (holder) for (; length > i; i++) if (_args[i] === _) _args[i] = arguments[j++];
      while (_length > j) _args.push(arguments[j++]);
      return invoke(fn, _args, that);
    };
  }
  // Optional / simple context binding
  function ctx(fn, that, length) {
    assertFunction(fn);
    if (~length && that === undefined) {
      return fn;
    }switch (length) {
      case 1:
        return function (a) {
          return fn.call(that, a);
        };
      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }return function () {
      return fn.apply(that, arguments);
    };
  }
  // Fast apply
  // http://jsperf.lnkit.com/fast-apply/5
  function invoke(fn, args, that) {
    var un = that === undefined;
    switch (args.length | 0) {
      case 0:
        return un ? fn() : fn.call(that);
      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);
      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
      case 5:
        return un ? fn(args[0], args[1], args[2], args[3], args[4]) : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
    }return fn.apply(that, args);
  }

  // Object:
  var create = Object.create,
      getPrototypeOf = Object.getPrototypeOf,
      setPrototypeOf = Object.setPrototypeOf,
      defineProperty = Object.defineProperty,
      defineProperties = Object.defineProperties,
      getOwnDescriptor = Object.getOwnPropertyDescriptor,
      getKeys = Object.keys,
      getNames = Object.getOwnPropertyNames,
      getSymbols = Object.getOwnPropertySymbols,
      isFrozen = Object.isFrozen,
      has = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  ,
      ES5Object = Object,
      Dict;
  function toObject(it) {
    return ES5Object(assertDefined(it));
  }
  function returnIt(it) {
    return it;
  }
  function returnThis() {
    return this;
  }
  function get(object, key) {
    if (has(object, key)) {
      return object[key];
    }
  }
  function ownKeys(it) {
    assertObject(it);
    return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
  }
  // 19.1.2.1 Object.assign(target, source, ...)
  var assign = Object.assign || function (target, source) {
    var T = Object(assertDefined(target)),
        l = arguments.length,
        i = 1;
    while (l > i) {
      var S = ES5Object(arguments[i++]),
          keys = getKeys(S),
          length = keys.length,
          j = 0,
          key;
      while (length > j) T[key = keys[j++]] = S[key];
    }
    return T;
  };
  function keyOf(object, el) {
    var O = toObject(object),
        keys = getKeys(O),
        length = keys.length,
        index = 0,
        key;
    while (length > index) if (O[key = keys[index++]] === el) {
      return key;
    }
  }

  // Array
  // array('str1,str2,str3') => ['str1', 'str2', 'str3']
  function array(it) {
    return String(it).split(",");
  }
  var push = ArrayProto.push,
      unshift = ArrayProto.unshift,
      slice = ArrayProto.slice,
      splice = ArrayProto.splice,
      indexOf = ArrayProto.indexOf,
      forEach = ArrayProto[FOR_EACH];
  /*
   * 0 -> forEach
   * 1 -> map
   * 2 -> filter
   * 3 -> some
   * 4 -> every
   * 5 -> find
   * 6 -> findIndex
   */
  function createArrayMethod(type) {
    var isMap = type == 1,
        isFilter = type == 2,
        isSome = type == 3,
        isEvery = type == 4,
        isFindIndex = type == 6,
        noholes = type == 5 || isFindIndex;
    return function (callbackfn /*, that = undefined */) {
      var O = Object(assertDefined(this)),
          that = arguments[1],
          self = ES5Object(O),
          f = ctx(callbackfn, that, 3),
          length = toLength(self.length),
          index = 0,
          result = isMap ? Array(length) : isFilter ? [] : undefined,
          val,
          res;
      for (; length > index; index++) if (noholes || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (type) {
          if (isMap) result[index] = res; // map
          else if (res) switch (type) {
            case 3:
              return true; // some
            case 5:
              return val; // find
            case 6:
              return index; // findIndex
            case 2:
              result.push(val); // filter
          } else if (isEvery) return false; // every
        }
      }
      return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
    };
  }
  function createArrayContains(isContains) {
    return function (el /*, fromIndex = 0 */) {
      var O = toObject(this),
          length = toLength(O.length),
          index = toIndex(arguments[1], length);
      if (isContains && el != el) {
        for (; length > index; index++) if (sameNaN(O[index])) return isContains || index;
      } else for (; length > index; index++) if (isContains || index in O) {
        if (O[index] === el) return isContains || index;
      }return !isContains && -1;
    };
  }
  function generic(A, B) {
    // strange IE quirks mode bug -> use typeof vs isFunction
    return typeof A == "function" ? A : B;
  }

  // Math
  var MAX_SAFE_INTEGER = 9007199254740991 // pow(2, 53) - 1 == 9007199254740991
  ,
      pow = Math.pow,
      abs = Math.abs,
      ceil = Math.ceil,
      floor = Math.floor,
      max = Math.max,
      min = Math.min,
      random = Math.random,
      trunc = Math.trunc || function (it) {
    return (it > 0 ? floor : ceil)(it);
  };
  // 20.1.2.4 Number.isNaN(number)
  function sameNaN(number) {
    return number != number;
  }
  // 7.1.4 ToInteger
  function toInteger(it) {
    return isNaN(it) ? 0 : trunc(it);
  }
  // 7.1.15 ToLength
  function toLength(it) {
    return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
  }
  function toIndex(index, length) {
    var index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  }
  function lz(num) {
    return num > 9 ? num : "0" + num;
  }

  function createReplacer(regExp, replace, isStatic) {
    var replacer = isObject(replace) ? function (part) {
      return replace[part];
    } : replace;
    return function (it) {
      return String(isStatic ? it : this).replace(regExp, replacer);
    };
  }
  function createPointAt(toString) {
    return function (pos) {
      var s = String(assertDefined(this)),
          i = toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l) return toString ? "" : undefined;
      a = s.charCodeAt(i);
      return a < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? toString ? s.charAt(i) : a : toString ? s.slice(i, i + 2) : (a - 55296 << 10) + (b - 56320) + 65536;
    };
  }

  // Assertion & errors
  var REDUCE_ERROR = "Reduce of empty object with no initial value";
  function assert(condition, msg1, msg2) {
    if (!condition) throw TypeError(msg2 ? msg1 + msg2 : msg1);
  }
  function assertDefined(it) {
    if (it == undefined) throw TypeError("Function called on null or undefined");
    return it;
  }
  function assertFunction(it) {
    assert(isFunction(it), it, " is not a function!");
    return it;
  }
  function assertObject(it) {
    assert(isObject(it), it, " is not an object!");
    return it;
  }
  function assertInstance(it, Constructor, name) {
    assert(it instanceof Constructor, name, ": use the 'new' operator!");
  }

  // Property descriptors & Symbol
  function descriptor(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  }
  function simpleSet(object, key, value) {
    object[key] = value;
    return object;
  }
  function createDefiner(bitmap) {
    return DESC ? function (object, key, value) {
      return defineProperty(object, key, descriptor(bitmap, value));
    } : simpleSet;
  }
  function uid(key) {
    return SYMBOL + "(" + key + ")_" + (++sid + random())[TO_STRING](36);
  }
  function getWellKnownSymbol(name, setter) {
    return Symbol && Symbol[name] || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
  }
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  var DESC = !!(function () {
    try {
      return defineProperty({}, "a", { get: function get() {
          return 2;
        } }).a == 2;
    } catch (e) {}
  })(),
      sid = 0,
      hidden = createDefiner(1),
      set = Symbol ? simpleSet : hidden,
      safeSymbol = Symbol || uid;
  function assignHidden(target, src) {
    for (var key in src) hidden(target, key, src[key]);
    return target;
  }

  var SYMBOL_UNSCOPABLES = getWellKnownSymbol("unscopables"),
      ArrayUnscopables = ArrayProto[SYMBOL_UNSCOPABLES] || {},
      SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG),
      SYMBOL_SPECIES = getWellKnownSymbol("species"),
      SYMBOL_ITERATOR;
  function setSpecies(C) {
    if (DESC && (framework || !isNative(C))) defineProperty(C, SYMBOL_SPECIES, {
      configurable: true,
      get: returnThis
    });
  }

  /******************************************************************************
   * Module : common.export                                                     *
   ******************************************************************************/

  var NODE = cof(process) == PROCESS,
      core = {},
      path = framework ? global : core,
      old = global.core,
      exportGlobal
  // type bitmap
  ,
      FORCED = 1,
      GLOBAL = 2,
      STATIC = 4,
      PROTO = 8,
      BIND = 16,
      WRAP = 32;
  function $define(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & GLOBAL,
        target = isGlobal ? global : type & STATIC ? global[name] : (global[name] || ObjectProto)[PROTOTYPE],
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal) source = name;
    for (key in source) {
      // there is a similar native
      own = !(type & FORCED) && target && key in target && (!isFunction(target[key]) || isNative(target[key]));
      // export native or passed
      out = (own ? target : source)[key];
      // prevent global pollution for namespaces
      if (!framework && isGlobal && !isFunction(target[key])) exp = source[key];
      // bind timers to global for call from export context
      else if (type & BIND && own) exp = ctx(out, global);
      // wrap global constructors for prevent change them in library
      else if (type & WRAP && !framework && target[key] == out) {
        exp = function (param) {
          return this instanceof out ? new out(param) : out(param);
        };
        exp[PROTOTYPE] = out[PROTOTYPE];
      } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
      // extend global
      if (framework && target && !own) {
        if (isGlobal) target[key] = out;else delete target[key] && hidden(target, key, out);
      }
      // export
      if (exports[key] != out) hidden(exports, key, exp);
    }
  }
  // CommonJS export
  if (typeof module != "undefined" && module.exports) module.exports = core;
  // RequireJS export
  else if (isFunction(define) && define.amd) define(function () {
    return core;
  });
  // Export to global object
  else exportGlobal = true;
  if (exportGlobal || framework) {
    core.noConflict = function () {
      global.core = old;
      return core;
    };
    global.core = core;
  }

  /******************************************************************************
   * Module : common.iterators                                                  *
   ******************************************************************************/

  SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
  var ITER = safeSymbol("iter"),
      KEY = 1,
      VALUE = 2,
      Iterators = {},
      IteratorPrototype = {}
  // Safari has byggy iterators w/o `next`
  ,
      BUGGY_ITERATORS = "keys" in ArrayProto && !("next" in [].keys());
  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  setIterator(IteratorPrototype, returnThis);
  function setIterator(O, value) {
    hidden(O, SYMBOL_ITERATOR, value);
    // Add iterator for FF iterator protocol
    FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
  }
  function createIterator(Constructor, NAME, next, proto) {
    Constructor[PROTOTYPE] = create(proto || IteratorPrototype, { next: descriptor(1, next) });
    setToStringTag(Constructor, NAME + " Iterator");
  }
  function defineIterator(Constructor, NAME, value, DEFAULT) {
    var proto = Constructor[PROTOTYPE],
        iter = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || DEFAULT && get(proto, DEFAULT) || value;
    if (framework) {
      // Define iterator
      setIterator(proto, iter);
      if (iter !== value) {
        var iterProto = getPrototypeOf(iter.call(new Constructor()));
        // Set @@toStringTag to native iterators
        setToStringTag(iterProto, NAME + " Iterator", true);
        // FF fix
        has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
      }
    }
    // Plug for library
    Iterators[NAME] = iter;
    // FF & v8 fix
    Iterators[NAME + " Iterator"] = returnThis;
    return iter;
  }
  function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET) {
    function createIter(kind) {
      return function () {
        return new Constructor(this, kind);
      };
    }
    createIterator(Constructor, NAME, next);
    var entries = createIter(KEY + VALUE),
        values = createIter(VALUE);
    if (DEFAULT == VALUE) values = defineIterator(Base, NAME, values, "values");else entries = defineIterator(Base, NAME, entries, "entries");
    if (DEFAULT) {
      $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
        entries: entries,
        keys: IS_SET ? values : createIter(KEY),
        values: values
      });
    }
  }
  function iterResult(done, value) {
    return { value: value, done: !!done };
  }
  function isIterable(it) {
    var O = Object(it),
        Symbol = global[SYMBOL],
        hasExt = ((Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O);
    return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
  }
  function getIterator(it) {
    var Symbol = global[SYMBOL],
        ext = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR],
        getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
    return assertObject(getIter.call(it));
  }
  function stepCall(fn, value, entries) {
    return entries ? invoke(fn, value) : fn(value);
  }
  function checkDangerIterClosing(fn) {
    var danger = true;
    var O = {
      next: function next() {
        throw 1;
      },
      "return": function _return() {
        danger = false;
      }
    };
    O[SYMBOL_ITERATOR] = returnThis;
    try {
      fn(O);
    } catch (e) {}
    return danger;
  }
  function closeIterator(iterator) {
    var ret = iterator["return"];
    if (ret !== undefined) ret.call(iterator);
  }
  function safeIterClose(exec, iterator) {
    try {
      exec(iterator);
    } catch (e) {
      closeIterator(iterator);
      throw e;
    }
  }
  function forOf(iterable, entries, fn, that) {
    safeIterClose(function (iterator) {
      var f = ctx(fn, that, entries ? 2 : 1),
          step;
      while (!(step = iterator.next()).done) if (stepCall(f, step.value, entries) === false) {
        return closeIterator(iterator);
      }
    }, getIterator(iterable));
  }

  /******************************************************************************
   * Module : es6.symbol                                                        *
   ******************************************************************************/

  // ECMAScript 6 symbols shim
  !(function (TAG, SymbolRegistry, AllSymbols, setter) {
    // 19.4.1.1 Symbol([description])
    if (!isNative(Symbol)) {
      Symbol = function (description) {
        assert(!(this instanceof Symbol), SYMBOL + " is not a " + CONSTRUCTOR);
        var tag = uid(description),
            sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
        AllSymbols[tag] = sym;
        DESC && setter && defineProperty(ObjectProto, tag, {
          configurable: true,
          set: function set(value) {
            hidden(this, tag, value);
          }
        });
        return sym;
      };
      hidden(Symbol[PROTOTYPE], TO_STRING, function () {
        return this[TAG];
      });
    }
    $define(GLOBAL + WRAP, { Symbol: Symbol });

    var symbolStatics = {
      // 19.4.2.1 Symbol.for(key)
      "for": function _for(key) {
        return has(SymbolRegistry, key += "") ? SymbolRegistry[key] : SymbolRegistry[key] = Symbol(key);
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
      useSetter: function useSetter() {
        setter = true;
      },
      useSimple: function useSimple() {
        setter = false;
      }
    };
    // 19.4.2.2 Symbol.hasInstance
    // 19.4.2.3 Symbol.isConcatSpreadable
    // 19.4.2.6 Symbol.match
    // 19.4.2.8 Symbol.replace
    // 19.4.2.9 Symbol.search
    // 19.4.2.11 Symbol.split
    // 19.4.2.12 Symbol.toPrimitive
    forEach.call(array("hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive"), function (it) {
      symbolStatics[it] = getWellKnownSymbol(it);
    });
    $define(STATIC, SYMBOL, symbolStatics);

    setToStringTag(Symbol, SYMBOL);

    $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
      // 19.1.2.7 Object.getOwnPropertyNames(O)
      getOwnPropertyNames: function getOwnPropertyNames(it) {
        var names = getNames(toObject(it)),
            result = [],
            key,
            i = 0;
        while (names.length > i) has(AllSymbols, key = names[i++]) || result.push(key);
        return result;
      },
      // 19.1.2.8 Object.getOwnPropertySymbols(O)
      getOwnPropertySymbols: function getOwnPropertySymbols(it) {
        var names = getNames(toObject(it)),
            result = [],
            key,
            i = 0;
        while (names.length > i) has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
        return result;
      }
    });

    // 20.2.1.9 Math[@@toStringTag]
    setToStringTag(Math, MATH, true);
    // 24.3.3 JSON[@@toStringTag]
    setToStringTag(global.JSON, "JSON", true);
  })(safeSymbol("tag"), {}, {}, true);

  /******************************************************************************
   * Module : es6.object.statics                                                *
   ******************************************************************************/

  !(function () {
    var objectStatic = {
      // 19.1.3.1 Object.assign(target, source)
      assign: assign,
      // 19.1.3.10 Object.is(value1, value2)
      is: function is(x, y) {
        return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
      }
    };
    // 19.1.3.19 Object.setPrototypeOf(O, proto)
    // Works with __proto__ only. Old v8 can't works with null proto objects.
    "__proto__" in ObjectProto && (function (buggy, set) {
      try {
        set = ctx(call, getOwnDescriptor(ObjectProto, "__proto__").set, 2);
        set({}, ArrayProto);
      } catch (e) {
        buggy = true;
      }
      objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function (O, proto) {
        assertObject(O);
        assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
        if (buggy) O.__proto__ = proto;else set(O, proto);
        return O;
      };
    })();
    $define(STATIC, OBJECT, objectStatic);
  })();

  /******************************************************************************
   * Module : es6.object.prototype                                              *
   ******************************************************************************/

  !(function (tmp) {
    // 19.1.3.6 Object.prototype.toString()
    tmp[SYMBOL_TAG] = DOT;
    if (cof(tmp) != DOT) hidden(ObjectProto, TO_STRING, function () {
      return "[object " + classof(this) + "]";
    });
  })({});

  /******************************************************************************
   * Module : es6.object.statics-accept-primitives                              *
   ******************************************************************************/

  !(function () {
    // Object static methods accept primitives
    function wrapObjectMethod(key, MODE) {
      var fn = Object[key],
          exp = core[OBJECT][key],
          f = 0,
          o = {};
      if (!exp || isNative(exp)) {
        o[key] = MODE == 1 ? function (it) {
          return isObject(it) ? fn(it) : it;
        } : MODE == 2 ? function (it) {
          return isObject(it) ? fn(it) : true;
        } : MODE == 3 ? function (it) {
          return isObject(it) ? fn(it) : false;
        } : MODE == 4 ? function (it, key) {
          return fn(toObject(it), key);
        } : function (it) {
          return fn(toObject(it));
        };
        try {
          fn(DOT);
        } catch (e) {
          f = 1;
        }
        $define(STATIC + FORCED * f, OBJECT, o);
      }
    }
    wrapObjectMethod("freeze", 1);
    wrapObjectMethod("seal", 1);
    wrapObjectMethod("preventExtensions", 1);
    wrapObjectMethod("isFrozen", 2);
    wrapObjectMethod("isSealed", 2);
    wrapObjectMethod("isExtensible", 3);
    wrapObjectMethod("getOwnPropertyDescriptor", 4);
    wrapObjectMethod("getPrototypeOf");
    wrapObjectMethod("keys");
    wrapObjectMethod("getOwnPropertyNames");
  })();

  /******************************************************************************
   * Module : es6.function                                                      *
   ******************************************************************************/

  !(function (NAME) {
    // 19.2.4.2 name
    NAME in FunctionProto || DESC && defineProperty(FunctionProto, NAME, {
      configurable: true,
      get: function get() {
        var match = String(this).match(/^\s*function ([^ (]*)/),
            name = match ? match[1] : "";
        has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
        return name;
      },
      set: function set(value) {
        has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
      }
    });
  })("name");

  /******************************************************************************
   * Module : es6.number.constructor                                            *
   ******************************************************************************/

  Number("0o1") && Number("0b1") || (function (_Number, NumberProto) {
    function toNumber(it) {
      if (isObject(it)) it = toPrimitive(it);
      if (typeof it == "string" && it.length > 2 && it.charCodeAt(0) == 48) {
        var binary = false;
        switch (it.charCodeAt(1)) {
          case 66:case 98:
            binary = true;
          case 79:case 111:
            return parseInt(it.slice(2), binary ? 2 : 8);
        }
      }return +it;
    }
    function toPrimitive(it) {
      var fn, val;
      if (isFunction(fn = it.valueOf) && !isObject(val = fn.call(it))) {
        return val;
      }if (isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it))) {
        return val;
      }throw TypeError("Can't convert object to number");
    }
    Number = function Number(it) {
      return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
    };
    forEach.call(DESC ? getNames(_Number) : array("MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY"), function (key) {
      key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
    });
    Number[PROTOTYPE] = NumberProto;
    NumberProto[CONSTRUCTOR] = Number;
    hidden(global, NUMBER, Number);
  })(Number, Number[PROTOTYPE]);

  /******************************************************************************
   * Module : es6.number.statics                                                *
   ******************************************************************************/

  !(function (isInteger) {
    $define(STATIC, NUMBER, {
      // 20.1.2.1 Number.EPSILON
      EPSILON: pow(2, -52),
      // 20.1.2.2 Number.isFinite(number)
      isFinite: (function (_isFinite) {
        var _isFiniteWrapper = function isFinite(_x) {
          return _isFinite.apply(this, arguments);
        };

        _isFiniteWrapper.toString = function () {
          return _isFinite.toString();
        };

        return _isFiniteWrapper;
      })(function (it) {
        return typeof it == "number" && isFinite(it);
      }),
      // 20.1.2.3 Number.isInteger(number)
      isInteger: isInteger,
      // 20.1.2.4 Number.isNaN(number)
      isNaN: sameNaN,
      // 20.1.2.5 Number.isSafeInteger(number)
      isSafeInteger: function isSafeInteger(number) {
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
  })(Number.isInteger || function (it) {
    return !isObject(it) && isFinite(it) && floor(it) === it;
  });

  /******************************************************************************
   * Module : es6.math                                                          *
   ******************************************************************************/

  // ECMAScript 6 shim
  !(function () {
    // 20.2.2.28 Math.sign(x)
    var E = Math.E,
        exp = Math.exp,
        log = Math.log,
        sqrt = Math.sqrt,
        sign = Math.sign || function (x) {
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };

    // 20.2.2.5 Math.asinh(x)
    function asinh(x) {
      return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
    }
    // 20.2.2.14 Math.expm1(x)
    function expm1(x) {
      return (x = +x) == 0 ? x : x > -0.000001 && x < 0.000001 ? x + x * x / 2 : exp(x) - 1;
    }

    $define(STATIC, MATH, {
      // 20.2.2.3 Math.acosh(x)
      acosh: function acosh(x) {
        return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
      },
      // 20.2.2.5 Math.asinh(x)
      asinh: asinh,
      // 20.2.2.7 Math.atanh(x)
      atanh: function atanh(x) {
        return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
      },
      // 20.2.2.9 Math.cbrt(x)
      cbrt: function cbrt(x) {
        return sign(x = +x) * pow(abs(x), 1 / 3);
      },
      // 20.2.2.11 Math.clz32(x)
      clz32: function clz32(x) {
        return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
      },
      // 20.2.2.12 Math.cosh(x)
      cosh: function cosh(x) {
        return (exp(x = +x) + exp(-x)) / 2;
      },
      // 20.2.2.14 Math.expm1(x)
      expm1: expm1,
      // 20.2.2.16 Math.fround(x)
      // TODO: fallback for IE9-
      fround: function fround(x) {
        return new Float32Array([x])[0];
      },
      // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
      hypot: function hypot(value1, value2) {
        var sum = 0,
            len1 = arguments.length,
            len2 = len1,
            args = Array(len1),
            larg = -Infinity,
            arg;
        while (len1--) {
          arg = args[len1] = +arguments[len1];
          if (arg == Infinity || arg == -Infinity) {
            return Infinity;
          }if (arg > larg) larg = arg;
        }
        larg = arg || 1;
        while (len2--) sum += pow(args[len2] / larg, 2);
        return larg * sqrt(sum);
      },
      // 20.2.2.18 Math.imul(x, y)
      imul: function imul(x, y) {
        var UInt16 = 65535,
            xn = +x,
            yn = +y,
            xl = UInt16 & xn,
            yl = UInt16 & yn;
        return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
      },
      // 20.2.2.20 Math.log1p(x)
      log1p: function log1p(x) {
        return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
      },
      // 20.2.2.21 Math.log10(x)
      log10: function log10(x) {
        return log(x) / Math.LN10;
      },
      // 20.2.2.22 Math.log2(x)
      log2: function log2(x) {
        return log(x) / Math.LN2;
      },
      // 20.2.2.28 Math.sign(x)
      sign: sign,
      // 20.2.2.30 Math.sinh(x)
      sinh: function sinh(x) {
        return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
      },
      // 20.2.2.33 Math.tanh(x)
      tanh: function tanh(x) {
        var a = expm1(x = +x),
            b = expm1(-x);
        return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
      },
      // 20.2.2.34 Math.trunc(x)
      trunc: trunc
    });
  })();

  /******************************************************************************
   * Module : es6.string                                                        *
   ******************************************************************************/

  !(function (fromCharCode) {
    function assertNotRegExp(it) {
      if (cof(it) == REGEXP) throw TypeError();
    }

    $define(STATIC, STRING, {
      // 21.1.2.2 String.fromCodePoint(...codePoints)
      fromCodePoint: function fromCodePoint(x) {
        var res = [],
            len = arguments.length,
            i = 0,
            code;
        while (len > i) {
          code = +arguments[i++];
          if (toIndex(code, 1114111) !== code) throw RangeError(code + " is not a valid code point");
          res.push(code < 65536 ? fromCharCode(code) : fromCharCode(((code -= 65536) >> 10) + 55296, code % 1024 + 56320));
        }return res.join("");
      },
      // 21.1.2.4 String.raw(callSite, ...substitutions)
      raw: (function (_raw) {
        var _rawWrapper = function raw(_x) {
          return _raw.apply(this, arguments);
        };

        _rawWrapper.toString = function () {
          return _raw.toString();
        };

        return _rawWrapper;
      })(function (callSite) {
        var raw = toObject(callSite.raw),
            len = toLength(raw.length),
            sln = arguments.length,
            res = [],
            i = 0;
        while (len > i) {
          res.push(String(raw[i++]));
          if (i < sln) res.push(String(arguments[i]));
        }return res.join("");
      })
    });

    $define(PROTO, STRING, {
      // 21.1.3.3 String.prototype.codePointAt(pos)
      codePointAt: createPointAt(false),
      // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
      endsWith: function endsWith(searchString /*, endPosition = @length */) {
        assertNotRegExp(searchString);
        var that = String(assertDefined(this)),
            endPosition = arguments[1],
            len = toLength(that.length),
            end = endPosition === undefined ? len : min(toLength(endPosition), len);
        searchString += "";
        return that.slice(end - searchString.length, end) === searchString;
      },
      // 21.1.3.7 String.prototype.includes(searchString, position = 0)
      includes: function includes(searchString /*, position = 0 */) {
        assertNotRegExp(searchString);
        return !! ~String(assertDefined(this)).indexOf(searchString, arguments[1]);
      },
      // 21.1.3.13 String.prototype.repeat(count)
      repeat: function repeat(count) {
        var str = String(assertDefined(this)),
            res = "",
            n = toInteger(count);
        if (0 > n || n == Infinity) throw RangeError("Count can't be negative");
        for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
        return res;
      },
      // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
      startsWith: function startsWith(searchString /*, position = 0 */) {
        assertNotRegExp(searchString);
        var that = String(assertDefined(this)),
            index = toLength(min(arguments[1], that.length));
        searchString += "";
        return that.slice(index, index + searchString.length) === searchString;
      }
    });
  })(String.fromCharCode);

  /******************************************************************************
   * Module : es6.array.statics                                                 *
   ******************************************************************************/

  !(function () {
    $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
      // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
      from: function from(arrayLike /*, mapfn = undefined, thisArg = undefined*/) {
        var O = Object(assertDefined(arrayLike)),
            mapfn = arguments[1],
            mapping = mapfn !== undefined,
            f = mapping ? ctx(mapfn, arguments[2], 2) : undefined,
            index = 0,
            length,
            result,
            step;
        if (isIterable(O)) {
          result = new (generic(this, Array))();
          safeIterClose(function (iterator) {
            for (; !(step = iterator.next()).done; index++) {
              result[index] = mapping ? f(step.value, index) : step.value;
            }
          }, getIterator(O));
        } else {
          result = new (generic(this, Array))(length = toLength(O.length));
          for (; length > index; index++) {
            result[index] = mapping ? f(O[index], index) : O[index];
          }
        }
        result.length = index;
        return result;
      }
    });

    $define(STATIC, ARRAY, {
      // 22.1.2.3 Array.of( ...items)
      of: function of() {
        var index = 0,
            length = arguments.length,
            result = new (generic(this, Array))(length);
        while (length > index) result[index] = arguments[index++];
        result.length = length;
        return result;
      }
    });

    setSpecies(Array);
  })();

  /******************************************************************************
   * Module : es6.array.prototype                                               *
   ******************************************************************************/

  !(function () {
    $define(PROTO, ARRAY, {
      // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
      copyWithin: function copyWithin(target, /* = 0 */start /* = 0, end = @length */) {
        var O = Object(assertDefined(this)),
            len = toLength(O.length),
            to = toIndex(target, len),
            from = toIndex(start, len),
            end = arguments[2],
            fin = end === undefined ? len : toIndex(end, len),
            count = min(fin - from, len - to),
            inc = 1;
        if (from < to && to < from + count) {
          inc = -1;
          from = from + count - 1;
          to = to + count - 1;
        }
        while (count-- > 0) {
          if (from in O) O[to] = O[from];else delete O[to];
          to += inc;
          from += inc;
        }return O;
      },
      // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
      fill: function fill(value /*, start = 0, end = @length */) {
        var O = Object(assertDefined(this)),
            length = toLength(O.length),
            index = toIndex(arguments[1], length),
            end = arguments[2],
            endPos = end === undefined ? length : toIndex(end, length);
        while (endPos > index) O[index++] = value;
        return O;
      },
      // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
      find: createArrayMethod(5),
      // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
      findIndex: createArrayMethod(6)
    });

    if (framework) {
      // 22.1.3.31 Array.prototype[@@unscopables]
      forEach.call(array("find,findIndex,fill,copyWithin,entries,keys,values"), function (it) {
        ArrayUnscopables[it] = true;
      });
      SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
    }
  })();

  /******************************************************************************
   * Module : es6.iterators                                                     *
   ******************************************************************************/

  !(function (at) {
    // 22.1.3.4 Array.prototype.entries()
    // 22.1.3.13 Array.prototype.keys()
    // 22.1.3.29 Array.prototype.values()
    // 22.1.3.30 Array.prototype[@@iterator]()
    defineStdIterators(Array, ARRAY, function (iterated, kind) {
      set(this, ITER, { o: toObject(iterated), i: 0, k: kind });
      // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    }, function () {
      var iter = this[ITER],
          O = iter.o,
          kind = iter.k,
          index = iter.i++;
      if (!O || index >= O.length) {
        iter.o = undefined;
        return iterResult(1);
      }
      if (kind == KEY) return iterResult(0, index);
      if (kind == VALUE) return iterResult(0, O[index]);
      return iterResult(0, [index, O[index]]);
    }, VALUE);

    // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
    Iterators[ARGUMENTS] = Iterators[ARRAY];

    // 21.1.3.27 String.prototype[@@iterator]()
    defineStdIterators(String, STRING, function (iterated) {
      set(this, ITER, { o: String(iterated), i: 0 });
      // 21.1.5.2.1 %StringIteratorPrototype%.next()
    }, function () {
      var iter = this[ITER],
          O = iter.o,
          index = iter.i,
          point;
      if (index >= O.length) return iterResult(1);
      point = at.call(O, index);
      iter.i += point.length;
      return iterResult(0, point);
    });
  })(createPointAt(true));

  /******************************************************************************
   * Module : es6.regexp                                                        *
   ******************************************************************************/

  DESC && !(function (RegExpProto, _RegExp) {
    // RegExp allows a regex with flags as the pattern
    if (!(function () {
      try {
        return RegExp(/a/g, "i") == "/a/i";
      } catch (e) {}
    })()) {
      RegExp = function RegExp(pattern, flags) {
        return new _RegExp(cof(pattern) == REGEXP && flags !== undefined ? pattern.source : pattern, flags);
      };
      forEach.call(getNames(_RegExp), function (key) {
        key in RegExp || defineProperty(RegExp, key, {
          configurable: true,
          get: function get() {
            return _RegExp[key];
          },
          set: function set(it) {
            _RegExp[key] = it;
          }
        });
      });
      RegExpProto[CONSTRUCTOR] = RegExp;
      RegExp[PROTOTYPE] = RegExpProto;
      hidden(global, REGEXP, RegExp);
    }

    // 21.2.5.3 get RegExp.prototype.flags()
    if (/./g.flags != "g") defineProperty(RegExpProto, "flags", {
      configurable: true,
      get: createReplacer(/^.*\/(\w*)$/, "$1")
    });

    setSpecies(RegExp);
  })(RegExp[PROTOTYPE], RegExp);

  /******************************************************************************
   * Module : web.immediate                                                     *
   ******************************************************************************/

  // setImmediate shim
  // Node.js 0.9+ & IE10+ has setImmediate, else:
  isFunction(setImmediate) && isFunction(clearImmediate) || (function (ONREADYSTATECHANGE) {
    var postMessage = global.postMessage,
        addEventListener = global.addEventListener,
        MessageChannel = global.MessageChannel,
        counter = 0,
        queue = {},
        defer,
        channel,
        port;
    setImmediate = function (fn) {
      var args = [],
          i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        invoke(isFunction(fn) ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearImmediate = function (id) {
      delete queue[id];
    };
    function run(id) {
      if (has(queue, id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    }
    function listner(event) {
      run(event.data);
    }
    // Node.js 0.8-
    if (NODE) {
      defer = function (id) {
        nextTick(part.call(run, id));
      }
      // Modern browsers, skip implementation for WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is object
      ;
    } else if (addEventListener && isFunction(postMessage) && !global.importScripts) {
      defer = function (id) {
        postMessage(id, "*");
      };
      addEventListener("message", listner, false);
      // WebWorkers
    } else if (isFunction(MessageChannel)) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listner;
      defer = ctx(port.postMessage, port, 1);
      // IE8-
    } else if (document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]("script")) {
      defer = function (id) {
        html.appendChild(document[CREATE_ELEMENT]("script"))[ONREADYSTATECHANGE] = function () {
          html.removeChild(this);
          run(id);
        };
      }
      // Rest old browsers
      ;
    } else {
      defer = function (id) {
        setTimeout(run, 0, id);
      };
    }
  })("onreadystatechange");
  $define(GLOBAL + BIND, {
    setImmediate: setImmediate,
    clearImmediate: clearImmediate
  });

  /******************************************************************************
   * Module : es6.promise                                                       *
   ******************************************************************************/

  // ES6 promises shim
  // Based on https://github.com/getify/native-promise-only/
  !(function (Promise, test) {
    isFunction(Promise) && isFunction(Promise.resolve) && Promise.resolve(test = new Promise(function () {})) == test || (function (asap, RECORD) {
      function isThenable(it) {
        var then;
        if (isObject(it)) then = it.then;
        return isFunction(then) ? then : false;
      }
      function handledRejectionOrHasOnRejected(promise) {
        var record = promise[RECORD],
            chain = record.c,
            i = 0,
            react;
        if (record.h) {
          return true;
        }while (chain.length > i) {
          react = chain[i++];
          if (react.fail || handledRejectionOrHasOnRejected(react.P)) {
            return true;
          }
        }
      }
      function notify(record, reject) {
        var chain = record.c;
        if (reject || chain.length) asap(function () {
          var promise = record.p,
              value = record.v,
              ok = record.s == 1,
              i = 0;
          if (reject && !handledRejectionOrHasOnRejected(promise)) {
            setTimeout(function () {
              if (!handledRejectionOrHasOnRejected(promise)) {
                if (NODE) {
                  if (!process.emit("unhandledRejection", value, promise)) {}
                } else if (isFunction(console.error)) {
                  console.error("Unhandled promise rejection", value);
                }
              }
            }, 1000);
          } else while (chain.length > i) !(function (react) {
            var cb = ok ? react.ok : react.fail,
                ret,
                then;
            try {
              if (cb) {
                if (!ok) record.h = true;
                ret = cb === true ? value : cb(value);
                if (ret === react.P) {
                  react.rej(TypeError(PROMISE + "-chain cycle"));
                } else if (then = isThenable(ret)) {
                  then.call(ret, react.res, react.rej);
                } else react.res(ret);
              } else react.rej(value);
            } catch (err) {
              react.rej(err);
            }
          })(chain[i++]);
          chain.length = 0;
        });
      }
      function resolve(value) {
        var record = this,
            then,
            wrapper;
        if (record.d) {
          return;
        }record.d = true;
        record = record.r || record; // unwrap
        try {
          if (then = isThenable(value)) {
            wrapper = { r: record, d: false }; // wrap
            then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
          } else {
            record.v = value;
            record.s = 1;
            notify(record);
          }
        } catch (err) {
          reject.call(wrapper || { r: record, d: false }, err); // wrap
        }
      }
      function reject(value) {
        var record = this;
        if (record.d) {
          return;
        }record.d = true;
        record = record.r || record; // unwrap
        record.v = value;
        record.s = 2;
        notify(record, true);
      }
      function getConstructor(C) {
        var S = assertObject(C)[SYMBOL_SPECIES];
        return S != undefined ? S : C;
      }
      // 25.4.3.1 Promise(executor)
      Promise = function (executor) {
        assertFunction(executor);
        assertInstance(this, Promise, PROMISE);
        var record = {
          p: this, // promise
          c: [], // chain
          s: 0, // state
          d: false, // done
          v: undefined, // value
          h: false // handled rejection
        };
        hidden(this, RECORD, record);
        try {
          executor(ctx(resolve, record, 1), ctx(reject, record, 1));
        } catch (err) {
          reject.call(record, err);
        }
      };
      assignHidden(Promise[PROTOTYPE], {
        // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
        then: function then(onFulfilled, onRejected) {
          var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
          var react = {
            ok: isFunction(onFulfilled) ? onFulfilled : true,
            fail: isFunction(onRejected) ? onRejected : false
          },
              P = react.P = new (S != undefined ? S : Promise)(function (resolve, reject) {
            react.res = assertFunction(resolve);
            react.rej = assertFunction(reject);
          }),
              record = this[RECORD];
          record.c.push(react);
          record.s && notify(record);
          return P;
        },
        // 25.4.5.1 Promise.prototype.catch(onRejected)
        "catch": function _catch(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
      assignHidden(Promise, {
        // 25.4.4.1 Promise.all(iterable)
        all: function all(iterable) {
          var Promise = getConstructor(this),
              values = [];
          return new Promise(function (resolve, reject) {
            forOf(iterable, false, push, values);
            var remaining = values.length,
                results = Array(remaining);
            if (remaining) forEach.call(values, function (promise, index) {
              Promise.resolve(promise).then(function (value) {
                results[index] = value;
                --remaining || resolve(results);
              }, reject);
            });else resolve(results);
          });
        },
        // 25.4.4.4 Promise.race(iterable)
        race: function race(iterable) {
          var Promise = getConstructor(this);
          return new Promise(function (resolve, reject) {
            forOf(iterable, false, function (promise) {
              Promise.resolve(promise).then(resolve, reject);
            });
          });
        },
        // 25.4.4.5 Promise.reject(r)
        reject: function reject(r) {
          return new (getConstructor(this))(function (resolve, reject) {
            reject(r);
          });
        },
        // 25.4.4.6 Promise.resolve(x)
        resolve: function resolve(x) {
          return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE] ? x : new (getConstructor(this))(function (resolve, reject) {
            resolve(x);
          });
        }
      });
    })(nextTick || setImmediate, safeSymbol("record"));
    setToStringTag(Promise, PROMISE);
    setSpecies(Promise);
    $define(GLOBAL + FORCED * !isNative(Promise), { Promise: Promise });
  })(global[PROMISE]);

  /******************************************************************************
   * Module : es6.collections                                                   *
   ******************************************************************************/

  // ECMAScript 6 collections shim
  !(function () {
    var UID = safeSymbol("uid"),
        O1 = safeSymbol("O1"),
        WEAK = safeSymbol("weak"),
        LEAK = safeSymbol("leak"),
        LAST = safeSymbol("last"),
        FIRST = safeSymbol("first"),
        SIZE = DESC ? safeSymbol("size") : "size",
        uid = 0,
        tmp = {};

    function getCollection(C, NAME, methods, commonMethods, isMap, isWeak) {
      var ADDER = isMap ? "set" : "add",
          proto = C && C[PROTOTYPE],
          O = {};
      function initFromIterable(that, iterable) {
        if (iterable != undefined) forOf(iterable, isMap, that[ADDER], that);
        return that;
      }
      function fixSVZ(key, chain) {
        var method = proto[key];
        if (framework) proto[key] = function (a, b) {
          var result = method.call(this, a === 0 ? 0 : a, b);
          return chain ? this : result;
        };
      }
      if (!isNative(C) || !(isWeak || !BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, "entries"))) {
        // create collection constructor
        C = isWeak ? function (iterable) {
          assertInstance(this, C, NAME);
          set(this, UID, uid++);
          initFromIterable(this, iterable);
        } : function (iterable) {
          var that = this;
          assertInstance(that, C, NAME);
          set(that, O1, create(null));
          set(that, SIZE, 0);
          set(that, LAST, undefined);
          set(that, FIRST, undefined);
          initFromIterable(that, iterable);
        };
        assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
        isWeak || !DESC || defineProperty(C[PROTOTYPE], "size", { get: function get() {
            return assertDefined(this[SIZE]);
          } });
      } else {
        var Native = C,
            inst = new C(),
            chain = inst[ADDER](isWeak ? {} : -0, 1),
            buggyZero;
        // wrap to init collections from iterable
        if (checkDangerIterClosing(function (O) {
          new C(O);
        })) {
          C = function (iterable) {
            assertInstance(this, C, NAME);
            return initFromIterable(new Native(), iterable);
          };
          C[PROTOTYPE] = proto;
          if (framework) proto[CONSTRUCTOR] = C;
        }
        isWeak || inst[FOR_EACH](function (val, key) {
          buggyZero = 1 / key === -Infinity;
        });
        // fix converting -0 key to +0
        if (buggyZero) {
          fixSVZ("delete");
          fixSVZ("has");
          isMap && fixSVZ("get");
        }
        // + fix .add & .set for chaining
        if (buggyZero || chain !== inst) fixSVZ(ADDER, true);
      }
      setToStringTag(C, NAME);
      setSpecies(C);

      O[NAME] = C;
      $define(GLOBAL + WRAP + FORCED * !isNative(C), O);

      // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
      isWeak || defineStdIterators(C, NAME, function (iterated, kind) {
        set(this, ITER, { o: iterated, k: kind });
      }, function () {
        var iter = this[ITER],
            kind = iter.k,
            entry = iter.l;
        // revert to the last existing entry
        while (entry && entry.r) entry = entry.p;
        // get next entry
        if (!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])) {
          // or finish the iteration
          iter.o = undefined;
          return iterResult(1);
        }
        // return step by kind
        if (kind == KEY) return iterResult(0, entry.k);
        if (kind == VALUE) return iterResult(0, entry.v);
        return iterResult(0, [entry.k, entry.v]);
      }, isMap ? KEY + VALUE : VALUE, !isMap);

      return C;
    }

    function fastKey(it, create) {
      // return primitive with prefix
      if (!isObject(it)) {
        return (typeof it == "string" ? "S" : "P") + it;
      } // can't set id to frozen object
      if (isFrozen(it)) {
        return "F";
      }if (!has(it, UID)) {
        // not necessary to add id
        if (!create) {
          return "E";
        } // add missing object id
        hidden(it, UID, ++uid);
        // return object id with prefix
      }return "O" + it[UID];
    }
    function getEntry(that, key) {
      // fast case
      var index = fastKey(key),
          entry;
      if (index != "F") {
        return that[O1][index];
      } // frozen object case
      for (entry = that[FIRST]; entry; entry = entry.n) {
        if (entry.k == key) {
          return entry;
        }
      }
    }
    function def(that, key, value) {
      var entry = getEntry(that, key),
          prev,
          index;
      // change existing entry
      if (entry) entry.v = value;
      // create new entry
      else {
        that[LAST] = entry = {
          i: index = fastKey(key, true), // <- index
          k: key, // <- key
          v: value, // <- value
          p: prev = that[LAST], // <- previous entry
          n: undefined, // <- next entry
          r: false // <- removed
        };
        if (!that[FIRST]) that[FIRST] = entry;
        if (prev) prev.n = entry;
        that[SIZE]++;
        // add to index
        if (index != "F") that[O1][index] = entry;
      }return that;
    }

    var collectionMethods = {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      "delete": function _delete(key) {
        var that = this,
            entry = getEntry(that, key);
        if (entry) {
          var next = entry.n,
              prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that[FIRST] == entry) that[FIRST] = next;
          if (that[LAST] == entry) that[LAST] = prev;
          that[SIZE]--;
        }return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */) {
        var f = ctx(callbackfn, arguments[1], 3),
            entry;
        while (entry = entry ? entry.n : this[FIRST]) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    };

    // 23.1 Map Objects
    Map = getCollection(Map, MAP, {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.v;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return def(this, key === 0 ? 0 : key, value);
      }
    }, collectionMethods, true);

    // 23.2 Set Objects
    Set = getCollection(Set, SET, {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return def(this, value = value === 0 ? 0 : value, value);
      }
    }, collectionMethods);

    function defWeak(that, key, value) {
      if (isFrozen(assertObject(key))) leakStore(that).set(key, value);else {
        has(key, WEAK) || hidden(key, WEAK, {});
        key[WEAK][that[UID]] = value;
      }return that;
    }
    function leakStore(that) {
      return that[LEAK] || hidden(that, LEAK, new Map())[LEAK];
    }

    var weakMethods = {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      "delete": function _delete(key) {
        if (!isObject(key)) {
          return false;
        }if (isFrozen(key)) {
          return leakStore(this)["delete"](key);
        }return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: (function (_has) {
        var _hasWrapper = function has(_x) {
          return _has.apply(this, arguments);
        };

        _hasWrapper.toString = function () {
          return _has.toString();
        };

        return _hasWrapper;
      })(function (key) {
        if (!isObject(key)) return false;
        if (isFrozen(key)) return leakStore(this).has(key);
        return has(key, WEAK) && has(key[WEAK], this[UID]);
      })
    };

    // 23.3 WeakMap Objects
    WeakMap = getCollection(WeakMap, WEAKMAP, {
      // 23.3.3.3 WeakMap.prototype.get(key)
      get: function get(key) {
        if (isObject(key)) {
          if (isFrozen(key)) {
            return leakStore(this).get(key);
          }if (has(key, WEAK)) {
            return key[WEAK][this[UID]];
          }
        }
      },
      // 23.3.3.5 WeakMap.prototype.set(key, value)
      set: function set(key, value) {
        return defWeak(this, key, value);
      }
    }, weakMethods, true, true);

    // IE11 WeakMap frozen keys fix
    if (framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7) {
      forEach.call(array("delete,has,get,set"), function (key) {
        var method = WeakMap[PROTOTYPE][key];
        WeakMap[PROTOTYPE][key] = function (a, b) {
          // store frozen objects on leaky map
          if (isObject(a) && isFrozen(a)) {
            var result = leakStore(this)[key](a, b);
            return key == "set" ? this : result;
            // store all the rest on native weakmap
          }return method.call(this, a, b);
        };
      });
    }

    // 23.4 WeakSet Objects
    WeakSet = getCollection(WeakSet, WEAKSET, {
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function add(value) {
        return defWeak(this, value, true);
      }
    }, weakMethods, false, true);
  })();

  /******************************************************************************
   * Module : es6.reflect                                                       *
   ******************************************************************************/

  !(function () {
    function Enumerate(iterated) {
      var keys = [],
          key;
      for (key in iterated) keys.push(key);
      set(this, ITER, { o: iterated, a: keys, i: 0 });
    }
    createIterator(Enumerate, OBJECT, function () {
      var iter = this[ITER],
          keys = iter.a,
          key;
      do {
        if (iter.i >= keys.length) return iterResult(1);
      } while (!((key = keys[iter.i++]) in iter.o));
      return iterResult(0, key);
    });

    function wrap(fn) {
      return function (it) {
        assertObject(it);
        try {
          return (fn.apply(undefined, arguments), true);
        } catch (e) {
          return false;
        }
      };
    }

    function reflectGet(_x, _x2) {
      var _arguments = arguments;
      var _again = true;

      _function: while (_again) {
        _again = false;
        var target = _x,
            propertyKey /*, receiver*/ = _x2;
        receiver = desc = proto = undefined;

        var receiver = _arguments.length < 3 ? target : _arguments[2],
            desc = getOwnDescriptor(assertObject(target), propertyKey),
            proto;
        if (desc) {
          return has(desc, "value") ? desc.value : desc.get === undefined ? undefined : desc.get.call(receiver);
        }if (isObject(proto = getPrototypeOf(target))) {
          _arguments = [_x = proto, _x2 = propertyKey, receiver];
          _again = true;
          continue _function;
        } else {
          return undefined;
        }
      }
    }
    function reflectSet(_x, _x2, _x3) {
      var _arguments = arguments;
      var _again = true;

      _function: while (_again) {
        _again = false;
        var target = _x,
            propertyKey = _x2,
            V /*, receiver*/ = _x3;
        receiver = ownDesc = existingDescriptor = proto = undefined;

        var receiver = _arguments.length < 4 ? target : _arguments[3],
            ownDesc = getOwnDescriptor(assertObject(target), propertyKey),
            existingDescriptor,
            proto;
        if (!ownDesc) {
          if (isObject(proto = getPrototypeOf(target))) {
            _arguments = [_x = proto, _x2 = propertyKey, _x3 = V, receiver];
            _again = true;
            continue _function;
          }
          ownDesc = descriptor(0);
        }
        if (has(ownDesc, "value")) {
          if (ownDesc.writable === false || !isObject(receiver)) {
            return false;
          }existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
          existingDescriptor.value = V;
          return (defineProperty(receiver, propertyKey, existingDescriptor), true);
        }
        return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
      }
    }
    var isExtensible = Object.isExtensible || returnIt;

    var reflect = {
      // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
      apply: ctx(call, apply, 3),
      // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
      construct: function construct(target, argumentsList /*, newTarget*/) {
        var proto = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE],
            instance = create(isObject(proto) ? proto : ObjectProto),
            result = apply.call(target, instance, argumentsList);
        return isObject(result) ? result : instance;
      },
      // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
      defineProperty: wrap(defineProperty),
      // 26.1.4 Reflect.deleteProperty(target, propertyKey)
      deleteProperty: function deleteProperty(target, propertyKey) {
        var desc = getOwnDescriptor(assertObject(target), propertyKey);
        return desc && !desc.configurable ? false : delete target[propertyKey];
      },
      // 26.1.5 Reflect.enumerate(target)
      enumerate: function enumerate(target) {
        return new Enumerate(assertObject(target));
      },
      // 26.1.6 Reflect.get(target, propertyKey [, receiver])
      get: reflectGet,
      // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
        return getOwnDescriptor(assertObject(target), propertyKey);
      },
      // 26.1.8 Reflect.getPrototypeOf(target)
      getPrototypeOf: (function (_getPrototypeOf) {
        var _getPrototypeOfWrapper = function getPrototypeOf(_x) {
          return _getPrototypeOf.apply(this, arguments);
        };

        _getPrototypeOfWrapper.toString = function () {
          return _getPrototypeOf.toString();
        };

        return _getPrototypeOfWrapper;
      })(function (target) {
        return getPrototypeOf(assertObject(target));
      }),
      // 26.1.9 Reflect.has(target, propertyKey)
      has: function has(target, propertyKey) {
        return propertyKey in target;
      },
      // 26.1.10 Reflect.isExtensible(target)
      isExtensible: (function (_isExtensible) {
        var _isExtensibleWrapper = function isExtensible(_x) {
          return _isExtensible.apply(this, arguments);
        };

        _isExtensibleWrapper.toString = function () {
          return _isExtensible.toString();
        };

        return _isExtensibleWrapper;
      })(function (target) {
        return !!isExtensible(assertObject(target));
      }),
      // 26.1.11 Reflect.ownKeys(target)
      ownKeys: ownKeys,
      // 26.1.12 Reflect.preventExtensions(target)
      preventExtensions: wrap(Object.preventExtensions || returnIt),
      // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
      set: reflectSet
    };
    // 26.1.14 Reflect.setPrototypeOf(target, proto)
    if (setPrototypeOf) reflect.setPrototypeOf = function (target, proto) {
      return (setPrototypeOf(assertObject(target), proto), true);
    };

    $define(GLOBAL, { Reflect: {} });
    $define(STATIC, "Reflect", reflect);
  })();

  /******************************************************************************
   * Module : es7.proposals                                                     *
   ******************************************************************************/

  !(function () {
    $define(PROTO, ARRAY, {
      // https://github.com/domenic/Array.prototype.includes
      includes: createArrayContains(true)
    });
    $define(PROTO, STRING, {
      // https://github.com/mathiasbynens/String.prototype.at
      at: createPointAt(true)
    });

    function createObjectToArray(isEntries) {
      return function (object) {
        var O = toObject(object),
            keys = getKeys(object),
            length = keys.length,
            i = 0,
            result = Array(length),
            key;
        if (isEntries) while (length > i) result[i] = [key = keys[i++], O[key]];else while (length > i) result[i] = O[keys[i++]];
        return result;
      };
    }
    $define(STATIC, OBJECT, {
      // https://gist.github.com/WebReflection/9353781
      getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
        var O = toObject(object),
            result = {};
        forEach.call(ownKeys(O), function (key) {
          defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
        });
        return result;
      },
      // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
      values: createObjectToArray(false),
      entries: createObjectToArray(true)
    });
    $define(STATIC, REGEXP, {
      // https://gist.github.com/kangax/9698100
      escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, "\\$1", true)
    });
  })();

  /******************************************************************************
   * Module : es7.abstract-refs                                                 *
   ******************************************************************************/

  // https://github.com/zenparsing/es-abstract-refs
  !(function (REFERENCE) {
    REFERENCE_GET = getWellKnownSymbol(REFERENCE + "Get", true);
    var REFERENCE_SET = getWellKnownSymbol(REFERENCE + SET, true),
        REFERENCE_DELETE = getWellKnownSymbol(REFERENCE + "Delete", true);

    $define(STATIC, SYMBOL, {
      referenceGet: REFERENCE_GET,
      referenceSet: REFERENCE_SET,
      referenceDelete: REFERENCE_DELETE
    });

    hidden(FunctionProto, REFERENCE_GET, returnThis);

    function setMapMethods(Constructor) {
      if (Constructor) {
        var MapProto = Constructor[PROTOTYPE];
        hidden(MapProto, REFERENCE_GET, MapProto.get);
        hidden(MapProto, REFERENCE_SET, MapProto.set);
        hidden(MapProto, REFERENCE_DELETE, MapProto["delete"]);
      }
    }
    setMapMethods(Map);
    setMapMethods(WeakMap);
  })("reference");

  /******************************************************************************
   * Module : js.array.statics                                                  *
   ******************************************************************************/

  // JavaScript 1.6 / Strawman array statics shim
  !(function (arrayStatics) {
    function setArrayStatics(keys, length) {
      forEach.call(array(keys), function (key) {
        if (key in ArrayProto) arrayStatics[key] = ctx(call, ArrayProto[key], length);
      });
    }
    setArrayStatics("pop,reverse,shift,keys,values,entries", 1);
    setArrayStatics("indexOf,every,some,forEach,map,filter,find,findIndex,includes", 3);
    setArrayStatics("join,slice,concat,push,splice,unshift,sort,lastIndexOf," + "reduce,reduceRight,copyWithin,fill,turn");
    $define(STATIC, ARRAY, arrayStatics);
  })({});

  /******************************************************************************
   * Module : web.dom.itarable                                                  *
   ******************************************************************************/

  !(function (NodeList) {
    if (framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])) {
      hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
    }
    Iterators.NodeList = Iterators[ARRAY];
  })(global.NodeList);
})(typeof self != "undefined" && self.Math === Math ? self : Function("return this")(), true);
/* ...args */ /* ...args */ /* ...args */ /* ...args */
// default node.js behavior

},{}],23:[function(require,module,exports){
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

"use strict";

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

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

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    return new Promise(function (resolve, reject) {
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
          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

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
          if (state === GenStateSuspendedStart && typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError("attempt to send " + JSON.stringify(arg) + " to newborn generator");
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
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

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

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
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

  runtime.keys = function (object) {
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
        var i = -1,
            next = function next() {
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

    reset: function reset() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName; hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20; ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
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

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg < finallyEntry.finallyLoc) {
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

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function _catch(tryLoc) {
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

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
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
typeof global === "object" ? global : typeof window === "object" ? window : undefined);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],24:[function(require,module,exports){
"use strict";

module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":21}],25:[function(require,module,exports){
"use strict";

module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":24}],26:[function(require,module,exports){
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

"use strict";

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
EventEmitter.prototype.setMaxListeners = function (n) {
  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (type) {
  var er, handler, len, args, i, listeners;

  if (!this._events) this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === "error") {
    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError("Uncaught, unspecified \"error\" event.");
    }
  }

  handler = this._events[type];

  if (isUndefined(handler)) return false;

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
        for (i = 1; i < len; i++) args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++) args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  var m;

  if (!isFunction(listener)) throw TypeError("listener must be a function");

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);else
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
      console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
      if (typeof console.trace === "function") {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (!isFunction(listener)) throw TypeError("listener must be a function");

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
EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;

  if (!isFunction(listener)) throw TypeError("listener must be a function");

  if (!this._events || !this._events[type]) return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener || isFunction(list.listener) && list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) this.emit("removeListener", type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener) this.emit("removeListener", type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;

  if (!this._events) return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === "removeListener") continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners("removeListener");
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  var ret;
  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type]) ret = 0;else if (isFunction(emitter._events[type])) ret = 1;else ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === "function";
}

function isNumber(arg) {
  return typeof arg === "number";
}

function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFx1c2Vyc1xcaGVrdG9yXFxkZXNrdG9wXFx3b3Jrc3BhY2VcXHRvdWNoc2hyb29tXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvYXBwLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL2dhbWUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvaW5wdXRtYW5hZ2VyLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL21haW4uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvbmV0d29ya21hbmFnZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9iYXNlLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL29iamVjdHMvbWluaW9uLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL29iamVjdHMvcGFydGljbGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9wbGF5ZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvc2NyZWVubWFuYWdlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9zY3JlZW5zL0Jhc2VTY3JlZW4uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvc2NyZWVucy9HYW1lU2NyZWVuLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NjcmVlbnMvTG9hZGluZ1NjcmVlbi5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9zY3JlZW5zL1N0YXJ0U2NyZWVuLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NvdW5kbWFuYWdlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL2NvbG9yLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvZHJhdy5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL21hdGguanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC9wcmVmaXhlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL3V0aWwuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL2xpYi9iYWJlbC9wb2x5ZmlsbC5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvc2hpbS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLWJhYmVsL3J1bnRpbWUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL3BvbHlmaWxsLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9wb2x5ZmlsbC5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNDTyxZQUFZLDJCQUFNLGdCQUFnQjs7SUFDbEMsY0FBYywyQkFBTSxrQkFBa0I7O0lBQ3RDLGFBQWEsMkJBQU0saUJBQWlCOztJQUV0QixHQUFHO0FBRVgsV0FGUSxHQUFHLEdBRVI7MEJBRkssR0FBRzs7QUFHcEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQzNDLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztB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Q0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLEFBQ3BELFdBQUssQ0FBQztBQUFFLGVBQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUM3QixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQUEsQUFDN0QsV0FBSyxDQUFDO0FBQUUsZUFBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUN0QyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQy9DLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFF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QUFPLEVBQUUsSUFBSSxFQUFFO0FBQ25ELE1BQUksR0FBRyxDQUFDO0FBQ1IsTUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUM1QyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQ0wsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN4QyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBRVIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3JDLFNBQU8sR0FBRyxDQUFDO0NBQ1osQ0FBQzs7QUFFRixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDdkIsU0FBTyxPQUFPLEdBQUcsS0FBSyxVQUFVLENBQUM7Q0FDbEM7O0FBRUQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3JCLFNBQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDO0NBQ2hDOztBQUVELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUNyQixTQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDO0NBQ2hEOztBQUVELFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtBQUN4QixTQUFPLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQztDQUN2QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcclxuaW1wb3J0IFNvdW5kTWFuYWdlciBmcm9tICcuL3NvdW5kbWFuYWdlcic7XHJcbmltcG9ydCBOZXR3b3JrTWFuYWdlciBmcm9tICcuL25ldHdvcmttYW5hZ2VyJztcclxuaW1wb3J0IFNjcmVlbk1hbmFnZXIgZnJvbSAnLi9zY3JlZW5tYW5hZ2VyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5uZXR3b3JrTWFuYWdlciA9IG5ldyBOZXR3b3JrTWFuYWdlcigpO1xyXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKCk7XHJcbiAgICB0aGlzLnNjcmVlbk1hbmFnZXIgPSBuZXcgU2NyZWVuTWFuYWdlcih0aGlzLm5ldHdvcmtNYW5hZ2VyLCB0aGlzLnNvdW5kTWFuYWdlcik7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5uZXR3b3JrTWFuYWdlci5pbml0KCk7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlci5pbml0KCk7XHJcbiAgICB0aGlzLnNjcmVlbk1hbmFnZXIuaW5pdCgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcGVyZm9ybWFuY2UgfSBmcm9tICcuL3V0aWwvcHJlZml4ZXInO1xyXG5pbXBvcnQgeyBkcmF3TGluZSwgZHJhd0NpcmNsZSB9IGZyb20gJy4vdXRpbC9kcmF3JztcclxuXHJcbmltcG9ydCBTb3VuZE1hbmFnZXIgZnJvbSAnLi9zb3VuZG1hbmFnZXInO1xyXG5pbXBvcnQgSW5wdXRNYW5hZ2VyIGZyb20gJy4vaW5wdXRtYW5hZ2VyJztcclxuaW1wb3J0IE5ldHdvcmtNYW5hZ2VyIGZyb20gJy4vbmV0d29ya21hbmFnZXInO1xyXG5cclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4vb2JqZWN0cy9wYXJ0aWNsZSc7XHJcbmltcG9ydCBQbGF5ZXIgZnJvbSAnLi9vYmplY3RzL3BsYXllcic7XHJcbmltcG9ydCBCYXNlIGZyb20gJy4vb2JqZWN0cy9iYXNlJztcclxuaW1wb3J0IE1pbmlvbiBmcm9tICcuL29iamVjdHMvbWluaW9uJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcbiAgICB0aGlzLmN0eCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5sYXN0X3RpbWUgPSAtMTtcclxuICAgIHRoaXMubm93ID0gLTE7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZF9iYXNlID0gbnVsbDtcclxuICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gbnVsbDtcclxuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5iYXNlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICB0aGlzLm1pbmlvbnMgPSBbXTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcblxyXG4gICAgdGhpcy5tZSA9IG51bGw7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gbnVsbDtcclxuICB9XHJcblxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKCkuaW5pdCgpO1xyXG4gICAgdGhpcy5uZXR3b3JrTWFuYWdlciA9IG5ldyBOZXR3b3JrTWFuYWdlcigpLmluaXQoKTtcclxuICAgIHRoaXMuaW5wdXRNYW5hZ2VyID0gbmV3IElucHV0TWFuYWdlcih0aGlzKS5pbml0KCk7XHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FudmFzJyk7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgdGhpcy5iaW5kRnVuY3Rpb25zKCk7XHJcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcclxuICAgIHRoaXMuc2V0dXBXaWVyZEFycmF5RnVuY3Rpb25zKCk7XHJcblxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGJpbmRGdW5jdGlvbnMoKSB7XHJcbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3AuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gIH1cclxuXHJcblxyXG4gIHNldHVwV2llcmRBcnJheUZ1bmN0aW9ucygpIHtcclxuICAgIHRoaXMucGxheWVycy5maW5kQnkgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xyXG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5sZW5ndGg7IGktLTsgKSB7XHJcbiAgICAgICAgaWYgKHRoaXNbaV1bcHJvcF0gPT09IHZhbHVlKSByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBsYXllcnMuYnlJRCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgICBpZiAodGhpc1tpXS5pZCA9PT0gaWQpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBtZXRob2QgdG8gYmFzZSBsaXN0XHJcbiAgICB0aGlzLmJhc2VzLmluZGV4QnlJRCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgICBpZih0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5iYXNlcy5ieUlEID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBmb3IodmFyIGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApe1xyXG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKSByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBNSU5JT05cclxuICAgIHRoaXMubWluaW9ucy5ieUlEID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBmb3IodmFyIGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApe1xyXG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKSByZXR1cm4gdGhpc1tpXTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG5cclxuICBzZXR1cChkYXRhKSB7XHJcbiAgICBsZXQgbHZsX25hbWUgPSBkYXRhLmxldmVsX25hbWU7XHJcbiAgICBsZXQgbXlfaWQgPSBkYXRhLm15X2lkO1xyXG4gICAgbGV0IHBsYXllcnMgPSBkYXRhLnBsYXllcnM7XHJcblxyXG4gICAgLy8gdGltZWQoJ0xldmVsOiAnICsgbHZsX25hbWUpO1xyXG5cclxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IGRhdGEuYmFzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBsZXQgYiA9IGRhdGEuYmFzZXNbaV07XHJcbiAgICAgIHRoaXMuYmFzZXMucHVzaChcclxuICAgICAgICBuZXcgQmFzZSh0aGlzLCBiLmlkLCBiLmxlZnQsIGIudG9wLCBiLnNjYWxlLCBiLnJlc291cmNlcywgYi5yZXNvdXJjZXNfbWF4KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gcGxheWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGxldCBwbGF5ZXJEYXRhID0gcGxheWVyc1tpXTtcclxuXHJcbiAgICAgIGxldCBwbGF5ZXIgPSBuZXcgUGxheWVyKFxyXG4gICAgICAgIHRoaXMsXHJcbiAgICAgICAgcGxheWVyRGF0YS5pZCxcclxuICAgICAgICBwbGF5ZXJEYXRhLm5hbWUsXHJcbiAgICAgICAgcGxheWVyRGF0YS5jb2xvclxyXG4gICAgICApO1xyXG5cclxuICAgICAgbGV0IHN0YXJ0U3RhdGVzID0gZGF0YS5zdGFydF9zdGF0ZVtpXTtcclxuICAgICAgc3RhcnRTdGF0ZXMuZm9yRWFjaChpID0+IHRoaXMuYmFzZXNbaV0uc2V0UGxheWVyKHBsYXllcikpO1xyXG5cclxuICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuXHJcbiAgICAgIGlmIChwbGF5ZXJEYXRhLmlkID09PSBteV9pZCl7XHJcbiAgICAgICAgdGhpcy5tZSA9IHBsYXllcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VuZCgnUExBWUVSLnJlYWR5Jyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLm5vdyA9IHRoaXMubGFzdF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcCk7XHJcbiAgfVxyXG5cclxuICBlbmQoKSB7XHJcbiAgICBpZih0aGlzLmFuaW1hdGlvbkZyYW1lKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lKTtcclxuXHJcbiAgICAvLyBDTEVBTiBVUCBHQU1FXHJcbiAgICB0aGlzLmJhc2VzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcnMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMubWUgPSBudWxsO1xyXG4gICAgdGhpcy5taW5pb25zLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIFRlbXBvcmFyeSBzb2x1dGlvbiB0byBoaWRlIG92ZXJsYXkgYW5kIGdvIGJhY2sgdG8gU1RBUlRcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgLy8gQ09OVFJPTExFUi5vdmVybGF5SGlkZSgpO1xyXG4gICAgICAvLyBDT05UUk9MTEVSLnNldFNjcmVlbignc3RhcnQnKTtcclxuICAgIH0sIDMwMDApO1xyXG4gIH1cclxuXHJcblxyXG4gIGxvb3AoKSB7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wKTtcclxuXHJcbiAgICBpZiAodGhpcy5kcmF3X3RpbWUpXHJcbiAgICAgIHRoaXMuZHJhd190aW1lID0gdGltZSAtIHRoaXMuZHJhd190aW1lO1xyXG5cclxuICAgIHRoaXMubm93ID0gdGltZTtcclxuICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSB0aGlzLmxhc3RfdGltZSkgLyAxMDAwLjA7XHJcbiAgICB0aGlzLmxhc3RfdGltZSA9IHRpbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVfdGltZSA9IHRpbWU7XHJcbiAgICB0aGlzLnVwZGF0ZShlbGFwc2VkKTtcclxuICAgIHRoaXMudXBkYXRlX3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMudXBkYXRlX3RpbWU7XHJcblxyXG4gICAgdGhpcy5kcmF3X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHRoaXMuZHJhdygpO1xyXG4gIH1cclxuXHJcblxyXG4gIHVwZGF0ZSh0aW1lKSB7XHJcbiAgICB0aGlzLmlucHV0TWFuYWdlci51cGRhdGUodGltZSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZHJhdyAoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcblxyXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy5taW5pb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGxldCBtID0gdGhpcy5taW5pb25zW2ldO1xyXG4gICAgICBpZiAobS5hY3RpdmUpIG0uZHJhdyhjdHgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERyYXcgbGluZSAvL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZF9iYXNlKXtcclxuICAgICAgbGV0IGIgPSB0aGlzLnNlbGVjdGVkX2Jhc2U7XHJcblxyXG4gICAgICBsZXQgeCwgeTtcclxuICAgICAgaWYgKHRoaXMudGFyZ2V0ZWRfYmFzZSl7XHJcbiAgICAgICAgeCA9IHRoaXMudGFyZ2V0ZWRfYmFzZS54O1xyXG4gICAgICAgIHkgPSB0aGlzLnRhcmdldGVkX2Jhc2UueTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4ID0gdGhpcy5pbnB1dE1hbmFnZXIucG9pbnRlci54O1xyXG4gICAgICAgIHkgPSB0aGlzLmlucHV0TWFuYWdlci5wb2ludGVyLnk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSAwLjM7XHJcbiAgICAgIGxldCBsaW5lX3NpemUgPSA1O1xyXG4gICAgICBsZXQgY29sb3IgPSB0aGlzLm1lLmNvbG9yIHx8ICcjQUFBJyA7XHJcbiAgICAgIGRyYXdMaW5lKGN0eCwgYi54LCBiLnksIHgsIHksIGNvbG9yLCBsaW5lX3NpemUpO1xyXG4gICAgICBkcmF3Q2lyY2xlKGN0eCwgeCwgeSwgbGluZV9zaXplIC8gMiwgY29sb3IpO1xyXG5cclxuICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLmJhc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgdGhpcy5iYXNlc1tpXS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICB0aGlzLnBhcnRpY2xlc1tpXS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kcmF3U2NvcmVCYXIoY3R4KTtcclxuICB9XHJcblxyXG4gIGRyYXdTY29yZUJhcihjdHgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgbGV0IHcgPSB3aWR0aCAvIDEuNTtcclxuICAgIGxldCBoID0gaGVpZ2h0IC8gMjA7XHJcbiAgICBsZXQgeCA9ICh3aWR0aCAvIDIpIC0gKHcgLyAyKTtcclxuICAgIGxldCB5ID0gKGhlaWdodCAvIDIwKSAtIChoIC8gMik7XHJcblxyXG4gICAgbGV0IHIgPSBbXTtcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgcltpXSA9IHRoaXMucGxheWVyc1tpXS50b3RhbFJlc291cmNlcygpO1xyXG4gICAgICB0b3RhbCArPSByW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB4dCA9IHg7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGxheWVyc1tpXS5jb2xvcjtcclxuICAgICAgbGV0IHd0ID0gKHJbaV0gLyB0b3RhbCkgKiB3O1xyXG4gICAgICBjdHguZmlsbFJlY3QoeHQsIHksIHd0LCBoKTtcclxuICAgICAgbGV0IHRleHQgPSB0aGlzLnBsYXllcnNbaV0ubmFtZSArICcgLSAnICsgcltpXTtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XHJcbiAgICAgIGN0eC5maWxsVGV4dCh0ZXh0LCB4dCArICh3dC8yKSAtIChjdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGgvMiksIHkrKGgvMikpO1xyXG5cclxuICAgICAgeHQgKz0gd3Q7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgICBjdHguc3Ryb2tlUmVjdCh4LCB5LCB3LCBoKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHJlc2l6ZSgpIHtcclxuICAgIHRoaXMud2lkdGggID0gdGhpcy5jYW52YXMud2lkdGggID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICB0aGlzLmJhc2VzLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcclxuICAgIHRoaXMubWluaW9ucy5mb3JFYWNoKGUgPT4gZS5yZXNpemUoKSk7XHJcbiAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGUgPT4gZS5yZXNpemUoKSk7XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIHRyeVNlbmRNaW5pb24odGFyZ2V0KSB7XHJcbiAgICB0YXJnZXQudGFyZ2V0ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy50YXJnZXRlZF9iYXNlID0gdGFyZ2V0O1xyXG5cclxuICAgIC8vIENhbGwgJ2NhblNlbmRNaW5pb24nIG9uIHNlbGVjdGVkX2Jhc2VcclxuICAgIC8vIFtDSEFOR0VEXSBBbGx3YXlzIGFzayBzZXJ2ZXIgdG8gc2VuZFxyXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRfYmFzZS5jYW5TZW5kTWluaW9uKCkgfHwgdHJ1ZSl7XHJcbiAgICAgIHRoaXMubmV0d29ya01hbmFnZXIuc2VuZCgnQkFTRS5taW5pb24nLCB7XHJcbiAgICAgICAgc291cmNlX2lkOiB0aGlzLnNlbGVjdGVkX2Jhc2UuaWQsXHJcbiAgICAgICAgdGFyZ2V0X2lkOiB0YXJnZXQuaWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRCeUlEKGxpc3QsIGlkKSB7XHJcbiAgICBmb3IgKGxldCBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSB7XHJcbiAgICAgIGxldCBpdGVtID0gbGlzdFtpXTtcclxuICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5pZCA9PSBpZCkge1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGhlaGVTY29wZUF3YXlTaWxseUltcGxlbWVudGF0aW9uKCkge1xyXG5cclxuXHJcblxyXG4gIC8vLy8vLy8vLy8vL1xyXG4gIC8vIEVWRU5UUyAvL1xyXG4gIC8vLy8vLy8vLy8vL1xyXG4gIC8qKlxyXG4gICAqIHsgRElTQ09OTkVDVElPTiB9XHJcbiAgICogQ2FsbGVkIHdoZW4gYSBwbGF5ZXIgZGlzY29ubmVjdHMgZnJvbSB0aGUgZ2FtZVxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUuZGlzY29ubmVjdGlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIHAgPSB0aGlzLnBsYXllcnMuZmluZEJ5KCdpZCcsIGRhdGEucGxheWVyX2lkKTtcclxuXHJcbiAgICBpZihwICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICBDT05UUk9MTEVSLm92ZXJsYXlNZXNzYWdlKFwiJ3swfScgZGlzY29ubmVjdGVkXCIuZm9ybWF0KHAubmFtZSkpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBCQVNFIFJFU09VUkNFUyB9XHJcbiAgICogV2hlbiBhIGJhc2UgZ290IHVwZGF0ZWQgcmVzb3VyY2VzIGZyb20gc2VydmVyXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5iYXNlUmVzb3VyY2VzID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgYiA9IEdBTUUuYmFzZXMuYnlJRChkYXRhLmJhc2VfaWQpO1xyXG5cclxuICAgIGlmKGIpXHJcbiAgICAgIGIucmVzb3VyY2VzID0gZGF0YS5yZXNvdXJjZXM7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IE5FVyBNSU5JT04gfVxyXG4gICAqIENhbGxlZCB3aGVuIHNlcnZlciBzZW5kcyBhIG5ldyBtaW5pb25cclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLm5ld01pbmlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIG0gPSBkYXRhLm1pbmlvbjtcclxuXHJcbiAgICB2YXIgc291cmNlID0gdGhpcy5iYXNlcy5ieUlEKG0uc291cmNlX2lkKTtcclxuICAgIHZhciB0YXJnZXQgPSB0aGlzLmJhc2VzLmJ5SUQobS50YXJnZXRfaWQpO1xyXG5cclxuICAgIHZhciBtaW5pb24gPSBuZXcgTWluaW9uKFxyXG4gICAgICBtLmlkLFxyXG4gICAgICBzb3VyY2UsXHJcbiAgICAgIHRhcmdldCxcclxuICAgICAgbS5zY2FsZVxyXG4gICAgKTtcclxuXHJcbiAgICBzb3VyY2Uuc2VuZE1pbmlvbigpO1xyXG5cclxuICAgIHRoaXMubWluaW9ucy5wdXNoKG1pbmlvbik7XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IE1JTklPTiBISVQgfVxyXG4gICAqIENhbGxlZCBieSBzZXJ2ZXIgd2hlbiBtaW5pb24gcmVhY2hlcyB0YXJnZXQgYmFzZVxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUubWluaW9uSGl0ID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgbWluaW9uX2lkID0gZGF0YS5taW5pb25faWQ7XHJcbiAgICB2YXIgbmV3X3BsYXllcl9pZCA9IGRhdGEubmV3X3BsYXllcl9pZDtcclxuICAgIHZhciByZXNvdXJjZXMgPSBkYXRhLnJlc291cmNlcztcclxuXHJcbiAgICAvLyBGZXRjaCBtaW5pb25cclxuICAgIHZhciBtaW5pb24gPSB0aGlzLm1pbmlvbnMuYnlJRChtaW5pb25faWQpO1xyXG5cclxuICAgIGlmKCFtaW5pb24pe1xyXG4gICAgICBhbGVydCgnTWluaW9uIGdvbmUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIG1pbmlvbi5kZWFkX2J5X3NlcnZlciA9IHRydWU7XHJcblxyXG4gICAgLy8gR2V0IHRhcmdldCBiYXNlXHJcbiAgICB2YXIgdGFyZ2V0ID0gbWluaW9uLnRhcmdldF9iYXNlO1xyXG4gICAgLy8gU2V0IHJlc291cmNlcyBmb3IgYmFzZVxyXG4gICAgdGFyZ2V0LnJlc291cmNlcyA9IHJlc291cmNlcztcclxuXHJcbiAgICBpZihuZXdfcGxheWVyX2lkICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICB2YXIgcGxheWVyID0gdGhpcy5wbGF5ZXJzLmJ5SUQobmV3X3BsYXllcl9pZCk7XHJcbiAgICAgIHRhcmdldC5zZXRQbGF5ZXIocGxheWVyKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiB7IFVQREFURSB9XHJcbiAgICogQHBhcmFtICB7TnVtYmVyfSB0ICAgRWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgdXBkYXRlIChzZWNvbmRzKVxyXG4gICAqL1xyXG4gIEdBTUUudXBkYXRlID0gZnVuY3Rpb24odCl7XHJcbiAgICB2YXIgaSwgbGVuLCBiLCBtLCBwO1xyXG5cclxuXHJcbiAgICAvLyBSZXNldCBob3ZlcmVkIGFuZCB0YXJnZXRlZFxyXG4gICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXRlZF9iYXNlID0gbnVsbDtcclxuXHJcblxyXG5cclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGIgPSB0aGlzLmJhc2VzW2ldO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGJhc2VcclxuICAgICAgYi51cGRhdGUodCk7XHJcblxyXG4gICAgICAvLyBSZXNldCBiYXNlIGhvdmVyZWQgJiB0YXJnZXRlZCBzdGF0ZVxyXG4gICAgICBiLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgYi50YXJnZXRlZCA9IGZhbHNlO1xyXG5cclxuXHJcbiAgICAgIC8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIC8vIENIRUNLIElOUFVUIC8vXHJcbiAgICAgIC8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIC8vIE1vdXNlIGlzIG92ZXIgYmFzZVxyXG4gICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgICAvLyBTZWUgaWYgdGhlcmUgaXMgYW55IHNlbGVjdGVkIGJhc2UgYW5kIGl0IGlzbid0IHRoZSBvbmUgdGVzdGVkXHJcbiAgICAgICAgaWYodGhpcy5zZWxlY3RlZF9iYXNlICYmIHRoaXMuc2VsZWN0ZWRfYmFzZSAhPT0gYil7XHJcbiAgICAgICAgICAvLyBTZXQgdGhlIGJhc2UgYXMgdGFyZ2V0ZWQgYW5kIHRyeSB0byBzZW5kXHJcbiAgICAgICAgICBHQU1FLnRyeVNlbmRNaW5pb24oYik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmFzZSBiZWxvbnMgdG8gJ21lJ1xyXG4gICAgICAgICAgaWYodGhpcy5tZS5iYXNlc19pZC5pbmRleE9mKGIuaWQpICE9PSAtMSl7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgYmFzZSBhcyBob3ZlcmVkXHJcbiAgICAgICAgICAgIGIuaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT0gLTEpe1xyXG4gICAgICAgIGlmKCFiLnNlbGVjdGVkICYmIHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAgICAgYi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gYjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIFVwZGF0ZSBtaW5pb25zXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMubWluaW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIG0gPSB0aGlzLm1pbmlvbnNbaV07XHJcbiAgICAgIGlmKG0uYWN0aXZlKXtcclxuICAgICAgICBtLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgICAgaWYoIW0uYWN0aXZlKXtcclxuICAgICAgICAgIFNPVU5ELnBsYXlSYW5kb21Tb3VuZCgpO1xyXG5cclxuICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2goXHJcbiAgICAgICAgICAgIG5ldyBQYXJ0aWNsZShtLnRhcmdldF9iYXNlLmxlZnQsIG0udGFyZ2V0X2Jhc2UudG9wLCBtLnRhcmdldF9iYXNlLnNjYWxlLCBtLnNvdXJjZV9iYXNlLmNvbG9yKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZihtLmRlYWRfYnlfc2VydmVyICYmICFtLmFjdGl2ZSl7XHJcbiAgICAgICAgdGhpcy5taW5pb25zLnNwbGljZShpLS0sIDEpO1xyXG4gICAgICAgIC0tbGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHBhdGljbGVzXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgcCA9IHRoaXMucGFydGljbGVzW2ldO1xyXG4gICAgICBwLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgIGlmKCFwLmFjdGl2ZSl7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGktLSwgMSk7XHJcbiAgICAgICAgLS1sZW47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgR0FNRS5zZW5kID0gZnVuY3Rpb24obXNnLCBkYXRhKXtcclxuICAgIE5FVC5zZW5kKG1zZywgZGF0YSk7XHJcbiAgfTtcclxuICBcclxuXHJcblxyXG5cclxuICAvKipcclxuICAgKiB7IFNUQVJUIFRPVUNIIH1cclxuICAgKi9cclxuICBHQU1FLnN0YXJ0VG91Y2ggPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGksIGIsIGxlbjtcclxuXHJcbiAgICBpZighR0FNRS5tZSlcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGZvcihpID0gMCwgbGVuID0gR0FNRS5tZS5iYXNlc19pZC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGIgPSBHQU1FLmJhc2VzW0dBTUUuYmFzZXMuaW5kZXhCeUlEKEdBTUUubWUuYmFzZXNfaWRbaV0pXTtcclxuXHJcbiAgICAgIGlmKHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAgIGIuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIEdBTUUuc2VsZWN0ZWRfYmFzZSA9IGI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiB7IEVORCBUT1VDSCB9XHJcbiAgICovXHJcbiAgR0FNRS5lbmRUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBpZihHQU1FLnNlbGVjdGVkX2Jhc2Upe1xyXG4gICAgICAvLyBBZGQgbmV3IG1pbmlvblxyXG4gICAgICBpZihHQU1FLnRhcmdldGVkX2Jhc2Upe1xyXG5cclxuICAgICAgfVxyXG4gICAgICBHQU1FLnNlbGVjdGVkX2Jhc2Uuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlID0gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG59IiwiXHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dE1hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMucG9pbnRlciA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgZG93bjogZmFsc2UsXHJcbiAgICAgIHRpbWVEb3duOiAwXHJcbiAgICB9O1xyXG4gICAgdGhpcy5sYXN0UG9pbnRlciA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucG9pbnRlcik7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBpbml0RXZlbnRzKCkge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMudXBkYXRlUG9zaXRpb24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMubGFzdFBvaW50ZXIgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBvaW50ZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLnBvaW50ZXIuZG93bikge1xyXG4gICAgICB0aGlzLnBvaW50ZXIudGltZURvd24gKz0gdGltZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9pbnRlci50aW1lRG93biA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IHRoaXMucG9pbnRlci54LFxyXG4gICAgICB5OiB0aGlzLnBvaW50ZXIueSxcclxuICAgICAgZG93bjogdGhpcy5wb2ludGVyLmRvd25cclxuICAgIH07XHJcbiAgfVxyXG5cclxuXHJcbiAgdHJhbnNsYXRlRXZlbnRDb29yZGluYXRlcyhldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LmNoYW5nZWRUb3VjaGVzKSB7XHJcbiAgICAgIHJldHVybiBbIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYLCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zaXRpb24oZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgbGV0IFsgcGFnZVgsIHBhZ2VZIF0gPSB0aGlzLnRyYW5zbGF0ZUV2ZW50Q29vcmRpbmF0ZXMoZXZlbnQpO1xyXG4gICAgWyB0aGlzLnBvaW50ZXIueCwgdGhpcy5wb2ludGVyLnkgXSA9IFsgcGFnZVgsIHBhZ2VZIF07XHJcbiAgfVxyXG5cclxuICBvblBvaW50ZXJEb3duKGV2ZW50KSB7XHJcbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcclxuICAgIHRoaXMucG9pbnRlci5kb3duID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIG9uUG9pbnRlclVwKGV2ZW50KSB7XHJcbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcclxuICAgIHRoaXMucG9pbnRlci5kb3duID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyaWdnZXIoJ3BvaW50ZXIudXAnKTtcclxuICB9XHJcblxyXG59IiwiXHJcbi8vIGluY2x1ZGVzIHNvbWUgYnJvd3NlciBwb2x5ZmlsbHNcclxucmVxdWlyZSgnYmFiZWxpZnkvcG9seWZpbGwnKTtcclxuXHJcbmltcG9ydCBHYW1lIGZyb20gJy4vZ2FtZSdcclxuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XHJcblxyXG4vLyB2YXIgZ2FtZSA9IHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKS5pbml0KCk7XHJcbnZhciBhcHAgPSB3aW5kb3cuYXBwID0gbmV3IEFwcCgpLmluaXQoKTtcclxuIiwiXHJcbi8vIHRlbXBcclxuZnVuY3Rpb24gdGltZWQoKSB7IGNvbnNvbGUubG9nKGFyZ3VtZW50c1swXSk7IH1cclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmV0d29ya01hbmFnZXIge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyLCBnYW1lKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XHJcbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLmNvbm5lY3QoKTtcclxuICAgIHRoaXMuc2V0dXBTb2NrZXRFdmVudEhhbmRsZXJzKCk7XHJcbiAgfVxyXG5cclxuICBjb25uZWN0KCkge1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCc6ODg4OCcsIHtcclxuICAgICAgICByZWNvbm5lY3Q6IHRydWVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb24oZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLnNvY2tldC5vbihldmVudCwgY2FsbGJhY2spO1xyXG4gIH1cclxuICBzZW5kKGV2ZW50LCBkYXRhKSB7XHJcbiAgICB0aGlzLnNvY2tldC5lbWl0KGV2ZW50LCBkYXRhKTtcclxuICB9XHJcblxyXG4gIHNldHVwU29ja2V0RXZlbnRIYW5kbGVycygpIHtcclxuICAgIGxldCBzb2NrZXQgPSB0aGlzLnNvY2tldDtcclxuXHJcbiAgICBzb2NrZXQub24oJ2Vycm9yJywgdGhpcy5vblNvY2tldEVycm9yLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3QuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBzb2NrZXQub24oJ1NFUlZFUi55b3VybmFtZScsIHRoaXMub25TZXJ2ZXJZb3VybmFtZS5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignU0VSVkVSLm51bV9wbGF5ZXJzJywgdGhpcy5vblNlcnZlck51bVBsYXllcnMuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ1NFUlZFUi5pbml0Z2FtZScsIHRoaXMub25TZXJ2ZXJJbml0Z2FtZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBzb2NrZXQub24oJ0dBTUUuc2V0dXAnLCB0aGlzLm9uR2FtZVNldHVwLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLnN0YXJ0JywgdGhpcy5vbkdhbWVTdGFydC5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignR0FNRS5lbmQnLCB0aGlzLm9uR2FtZUVuZC5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignR0FNRS5kaXNjb25uZWN0aW9uJywgdGhpcy5vbkdhbWVEaXNjb25uZWN0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLm1pbmlvbicsIHRoaXMub25HYW1lTWluaW9uLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignTUlOSU9OLmhpdCcsIHRoaXMub25NaW5pb25IaXQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdCQVNFLnJlc291cmNlcycsIHRoaXMub25CYXNlUmVzb3VyY2VzLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignbXkgcGxheWVyJywgdGhpcy5vbk15UGxheWVyLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignZy5wbGF5ZXJzJywgdGhpcy5vbkdQbGF5ZXJzLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbigncC5jb25uZWN0aW9uJywgdGhpcy5vblBDb25uZWN0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdwLmRpc2Nvbm5lY3Rpb24nLCB0aGlzLm9uUERpc2Nvbm5lY3Rpb24uYmluZCh0aGlzKSk7XHJcbiAgICBcclxuICAgIHNvY2tldC5vbignYi5taW5pb24nLCB0aGlzLm9uQk1pbmlvbi5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIHNlbmQobXNnLCBkYXRhKSB7XHJcbiAgICB0aGlzLnNvY2tldC5lbWl0KG1zZywgZGF0YSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgb25Tb2NrZXRFcnJvcigpIHtcclxuICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcclxuICAgICAgdGhpcy5jb250cm9sbGVyLm5vY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBvblNvY2tldENvbm5lY3QoKSB7XHJcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAvLyB0aGlzLmNvbnRyb2xsZXIuY29ubmVjdGVkKCk7XHJcbiAgfVxyXG4gIG9uU29ja2V0RGlzY29ubmVjdCgpIHtcclxuICAgIHRoaXMuY29uZWN0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHRoaXMuY29udHJvbGxlci5kaXNjb25uZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIG9uU2VydmVyWW91cm5hbWUoZGF0YSkge1xyXG4gICAgdGltZWQoYFlvdSBzaGFsbCBiZSBrbm93biBhcyAnJHtkYXRhLm5hbWV9J2ApO1xyXG4gIH1cclxuICBvblNlcnZlck51bVBsYXllcnMoZGF0YSkge1xyXG4gICAgdGltZWQoJ1BsYXllcnMgb25saW5lOiAnICsgZGF0YS5udW1fcGxheWVycyk7XHJcbiAgfVxyXG4gIG9uU2VydmVySW5pdGdhbWUoKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIuc3RhcnRnYW1lKCk7XHJcbiAgfVxyXG5cclxuICBvbkdhbWVTZXR1cChkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuc2V0dXAoZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5nYW1lLnN0YXJ0KCk7IFxyXG4gIH1cclxuICBvbkdhbWVFbmQoKSB7XHJcbiAgICB0aGlzLmdhbWUuZW5kKCk7XHJcbiAgfVxyXG4gIG9uR2FtZURpc2Nvbm5lY3Rpb24oZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLmRpc2Nvbm5lY3Rpb24oZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZU1pbmlvbihkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUubmV3TWluaW9uKGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgb25NaW5pb25IaXQoZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLm1pbmlvbkhpdChkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uQmFzZVJlc291cmNlcyhkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuYmFzZVJlc291cmNlcyhkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uTXlQbGF5ZXIoZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLm1lID0gbmV3IEJhc2UoZGF0YS5wbGF5ZXIuYXNwZWN0X2xlZnQsIGRhdGEucGxheWVyLmFzcGVjdF90b3AsIGRhdGEucGxheWVyLmFzcGVjdF9zaXplLCBkYXRhLnBsYXllci5jb2xvcik7XHJcbiAgICB0aGlzLmdhbWUubWUucGxheWVyX2lkID0gZGF0YS5wbGF5ZXIucGxheWVyX2lkO1xyXG4gICAgdGhpcy5nYW1lLmJhc2VzLnB1c2godGhpcy5nYW1lLm1lKTtcclxuICB9XHJcblxyXG4gIC8vIFByb2JhYmx5IHVudXNlZFxyXG4gIC8vIGxvZ2ljIHNlZW1zIHRvIGJlIHdyb25nXHJcbiAgb25HUGxheWVycyhkYXRhKSB7XHJcbiAgICBsZXQgcGxheWVycyA9IGRhdGEucGxheWVycztcclxuICAgIGxldCBiYXNlcyA9IHRoaXMuZ2FtZS5iYXNlcztcclxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBsZXQgaW5kZXggPSBnYW1lLmJhc2VzLmluZGV4QnlJRChwbGF5ZXJzW2ldLnBsYXllcl9pZCk7XHJcblxyXG4gICAgICAvLyBJZiBwbGF5ZXIgaXMgbm90IGluIGdhbWUgLT4gQWRkXHJcbiAgICAgIGlmKGluZGV4ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxldCBiYXNlID0gbmV3IEJhc2UocGxheWVyc1tpXS5hc3BlY3RfbGVmdCwgcGxheWVyc1tpXS5hc3BlY3RfdG9wLCBwbGF5ZXJzW2ldLmFzcGVjdF9zaXplLCBwbGF5ZXJzW2ldLmNvbG9yKTtcclxuICAgICAgICBiYXNlLnBsYXllcl9pZCA9IHBsYXllcnNbaV0ucGxheWVyX2lkO1xyXG4gICAgICAgIEdBTUUuYmFzZXMucHVzaChiYXNlKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBFbHNlIHNldCB2YWx1ZXMgY29ycmVjdFxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsZXQgYmFzZSA9IGJhc2VzW2luZGV4XTtcclxuICAgICAgICBiYXNlLmFzcGVjdF9sZWZ0ID0gcGxheWVyc1tpXS5hc3BlY3RfbGVmdDtcclxuICAgICAgICBiYXNlLmFzcGVjdF90b3AgPSBwbGF5ZXJzW2ldLmFzcGVjdF90b3A7XHJcbiAgICAgICAgYmFzZS5hc3BlY3Rfc2l6ZSA9IHBsYXllcnNbaV0uYXNwZWN0X3NpemU7XHJcbiAgICAgICAgYmFzZS5jb2xvciA9IHBsYXllcnNbaV0uY29sb3I7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsIHJlc2l6ZSB0byBmaXggYXNwZWN0c1xyXG4gICAgdGhpcy5nYW1lLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgb25QQ29ubmVjdGlvbihkYXRhKSB7XHJcbiAgICBpZihkYXRhLnBsYXllci5wbGF5ZXJfaWQgIT09IHRoaXMuZ2FtZS5tZS5wbGF5ZXJfaWQpe1xyXG4gICAgICB2YXIgYiA9IG5ldyBCYXNlKGRhdGEucGxheWVyLmFzcGVjdF9sZWZ0LCBkYXRhLnBsYXllci5hc3BlY3RfdG9wLCBkYXRhLnBsYXllci5hc3BlY3Rfc2l6ZSwgZGF0YS5wbGF5ZXIuY29sb3IpO1xyXG4gICAgICBiLnBsYXllcl9pZCA9IGRhdGEucGxheWVyLnBsYXllcl9pZDtcclxuICAgICAgdGhpcy5nYW1lLmJhc2VzLnB1c2goYik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBTZWVtcyB0byBiZSB1bnVzZWQsIGxvZ2ljIHNlZW1zIHdyb25nXHJcbiAgb25QRGlzY29ubmVjdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS5wbGF5ZXJfaWQpO1xyXG4gICAgaWYoaSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgdGhpcy5nYW1lLmJhc2VzLnNwbGljZShpLCAxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uQk1pbmlvbihkYXRhKSB7XHJcbiAgICBsZXQgZ2FtZSA9IHRoaXMuZ2FtZTtcclxuICAgIGxldCBiYXNlcyA9IGdhbWUuYmFzZXM7XHJcbiAgICBsZXQgc291cmNlQmFzZSA9IGdhbWUuZ2V0QnlJRChiYXNlcywgZGF0YS5zb3VyY2VfaWQpO1xyXG4gICAgbGV0IHRhcmdldEJhc2UgPSBnYW1lLmdldEJ5SUQoYmFzZXMsIGRhdGEudGFyZ2V0X2lkKTtcclxuXHJcbiAgICBpZiAoISFzb3VyY2VCYXNlICYmICEhdGFyZ2V0QmFzZSkge1xyXG4gICAgICBnYW1lLm1pbmlvbnMucHVzaChcclxuICAgICAgICBuZXcgTWluaW9uKHNvdXJjZUJhc2UsIHRhcmdldEJhc2UpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyIHNvdXJjZV9pbmRleCA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS5zb3VyY2VfaWQpO1xyXG4gICAgLy8gdmFyIHRhcmdldF9pbmRleCA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS50YXJnZXRfaWQpO1xyXG5cclxuICAgIC8vIGlmKHNvdXJjZV9pbmRleCAhPT0gdW5kZWZpbmVkICYmIHRhcmdldF9pbmRleCAhPT0gdW5kZWZpbmVkKXtcclxuICAgIC8vICAgICB0aGlzLmdhbWUubWluaW9ucy5wdXNoKFxyXG4gICAgLy8gICAgICAgbmV3IE1pbmlvbih0aGlzLmdhbWUuYmFzZXNbc291cmNlX2luZGV4XSwgdGhpcy5nYW1lLmJhc2VzW3RhcmdldF9pbmRleF0pXHJcbiAgICAvLyAgICAgKTtcclxuICAgIC8vIH1cclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IHsgZHJhd0NpcmNsZSB9IGZyb20gJy4uL3V0aWwvZHJhdyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGdhbWUsIGlkLCBsZWZ0LCB0b3AsIHNjYWxlLCByZXNvdXJjZXMsIHJlc291cmNlc19tYXgpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gICAgdGhpcy54ID0gLTE7XHJcbiAgICB0aGlzLnkgPSAtMTtcclxuICAgIHRoaXMuc2l6ZSA9IC0xO1xyXG5cclxuICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnRvcCA9IHRvcDtcclxuICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCAwLjE7XHJcbiAgICB0aGlzLnNoYWRvd19zaXplID0gMzA7XHJcblxyXG4gICAgdGhpcy5jb2xvciA9ICcjQUFBQUFBJztcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudGFyZ2V0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnNwYXduX2RlbGF5ID0gMDtcclxuICAgIHRoaXMuc3Bhd25fZGVsYXlfbWF4ID0gMC41O1xyXG5cclxuICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzIHx8IDA7XHJcbiAgICB0aGlzLnJlc291cmNlc19tYXggPSByZXNvdXJjZXNfbWF4O1xyXG5cclxuICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHVwZGF0ZSh0aW1lKSB7XHJcbiAgICBpZih0aGlzLnNwYXduX2RlbGF5ID4gMClcclxuICAgICAgdGhpcy5zcGF3bl9kZWxheSAtPSB0aW1lO1xyXG4gIH1cclxuXHJcbiAgZHJhdyhjdHgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcblxyXG5cclxuICAgIGlmICh0aGlzLmhvdmVyZWQpe1xyXG4gICAgICBjdHguc2hhZG93Q29sb3IgPSB0aGlzLmNvbG9yO1xyXG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkKXtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gdGhpcy5jb2xvcjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAyMDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2lyY2xlKGN0eCwgdGhpcy54LCB0aGlzLnksIHRoaXMuc2l6ZSwgdGhpcy5jb2xvciwgJ2ZpbGwnKTtcclxuXHJcbiAgICAvLyBEcmF3IHRleHRcclxuICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgdmFyIHRleHQgPSB0aGlzLnJlc291cmNlcyArICgodGhpcy5wbGF5ZXIpPyAnLycgKyB0aGlzLnJlc291cmNlc19tYXggOiAnJyk7XHJcbiAgICB2YXIgbSA9IGN0eC5tZWFzdXJlVGV4dCh0ZXh0KTtcclxuICAgIGN0eC5maWxsVGV4dCh0ZXh0LCB0aGlzLnggLSBtLndpZHRoLzIsIHRoaXMueSk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcblxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICBpZiAodGhpcy5nYW1lLndpZHRoID4gdGhpcy5nYW1lLmhlaWdodCkge1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmdhbWUud2lkdGggKiB0aGlzLmxlZnQ7XHJcbiAgICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnRvcDtcclxuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMuc2NhbGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5nYW1lLndpZHRoICogdGhpcy50b3ApO1xyXG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy5sZWZ0O1xyXG4gICAgICB0aGlzLnNpemUgPSB0aGlzLmdhbWUud2lkdGggKiB0aGlzLnNjYWxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0UGxheWVyKHBsYXllcikge1xyXG4gICAgaWYgKHRoaXMucGxheWVyKXtcclxuICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQmFzZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbG9yID0gcGxheWVyLmNvbG9yO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnBsYXllci5hZGRCYXNlKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgY2FuU2VuZE1pbmlvbigpIHtcclxuICAgIHJldHVybiAodGhpcy5zcGF3bl9kZWxheSA8PSAwLjApO1xyXG4gIH1cclxuXHJcbiAgc2VuZE1pbmlvbigpIHtcclxuICAgIHRoaXMuc3Bhd25fZGVsYXkgPSB0aGlzLnNwYXduX2RlbGF5X21heDtcclxuICAgIC0tdGhpcy5yZXNvdXJjZXM7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBwb2ludEluQ2lyY2xlLCB2ZWNEaXN0YW5jZSB9IGZyb20gJy4uL3V0aWwvbWF0aCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pb24ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihpZCwgc291cmNlLCB0YXJnZXQsIHNjYWxlKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gICAgdGhpcy5zb3VyY2VfYmFzZSA9IHNvdXJjZTtcclxuICAgIHRoaXMudGFyZ2V0X2Jhc2UgPSB0YXJnZXQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy5zb3VyY2VfYmFzZS54O1xyXG4gICAgdGhpcy55ID0gdGhpcy5zb3VyY2VfYmFzZS55O1xyXG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlIHx8IDAuMDE7XHJcbiAgICB0aGlzLnNpemUgPSAxMDtcclxuICAgIHRoaXMuY29sb3IgPSB0aGlzLnNvdXJjZV9iYXNlLmNvbG9yO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVhZF9ieV9zZXJ2ZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB0aGlzLmFjdGl2ZV90aW1lID0gMDtcclxuXHJcbiAgICB0aGlzLnNwZWVkID0gMztcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMuYWN0aXZlX3RpbWUgKz0gdDtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnNvdXJjZV9iYXNlLnggKyB0aGlzLnZlbF94ICogdGhpcy5hY3RpdmVfdGltZTtcclxuICAgIHRoaXMueSA9IHRoaXMuc291cmNlX2Jhc2UueSArIHRoaXMudmVsX3kgKiB0aGlzLmFjdGl2ZV90aW1lO1xyXG5cclxuICAgIGlmKHBvaW50SW5DaXJjbGUodGhpcy54LCB0aGlzLnksIHRoaXMudGFyZ2V0X2Jhc2UueCwgdGhpcy50YXJnZXRfYmFzZS55LCB0aGlzLnRhcmdldF9iYXNlLnNpemUpKXtcclxuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXcoY3R4KSB7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUsIE1hdGguUEkqMiwgZmFsc2UpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcblxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICBsZXQgZGVsdGFfc3BlZWQgPSAoKEdBTUUud2lkdGggPiBHQU1FLmhlaWdodCk/IEdBTUUud2lkdGggOiBHQU1FLmhlaWdodCkgLyB0aGlzLnNwZWVkO1xyXG5cclxuICAgIGxldCBkaXN0YW5jZSA9IHZlY0Rpc3RhbmNlKHRoaXMuc291cmNlX2Jhc2UueCwgdGhpcy5zb3VyY2VfYmFzZS55LCB0aGlzLnRhcmdldF9iYXNlLngsIHRoaXMudGFyZ2V0X2Jhc2UueSk7XHJcbiAgICBsZXQgZGlzdGFuY2VfeCA9IHRoaXMudGFyZ2V0X2Jhc2UueCAtIHRoaXMuc291cmNlX2Jhc2UueDtcclxuICAgIGxldCBkaXN0YW5jZV95ID0gdGhpcy50YXJnZXRfYmFzZS55IC0gdGhpcy5zb3VyY2VfYmFzZS55O1xyXG5cclxuICAgIHRoaXMudmVsX3ggPSAoZGlzdGFuY2VfeCAvIE1hdGguYWJzKChkaXN0YW5jZSAvIGRlbHRhX3NwZWVkKSkpIHx8IDA7XHJcbiAgICB0aGlzLnZlbF95ID0gKGRpc3RhbmNlX3kgLyBNYXRoLmFicygoZGlzdGFuY2UgLyBkZWx0YV9zcGVlZCkpKSB8fCAwO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9ICgoR0FNRS53aWR0aCA+IEdBTUUuaGVpZ2h0KT8gR0FNRS5oZWlnaHQgOiBHQU1FLndpZHRoKSAqIHRoaXMuc2NhbGU7XHJcbiAgfVxyXG5cclxufTsiLCJcclxuaW1wb3J0IHsgaGV4Y29sb3JUb1JHQiB9IGZyb20gJy4uL3V0aWwvY29sb3InO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnRpY2xlIHtcclxuICBcclxuICBjb25zdHVjdG9yKGdhbWUsIGxlZnQsIHRvcCwgc2NhbGUsIGNvbG9yKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMueCA9IC0xO1xyXG4gICAgdGhpcy55ID0gLTE7XHJcbiAgICB0aGlzLnNpemUgPSAtMTtcclxuXHJcbiAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgdGhpcy50b3AgPSB0b3A7XHJcbiAgICB0aGlzLnNjYWxlID0gc2NhbGUgfHwgMC4wMTtcclxuXHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3IgfHwgJyNBQUFBQUEnO1xyXG4gICAgdGhpcy5yZ2JhID0gaGV4Y29sb3JUb1JHQih0aGlzLmNvbG9yKTtcclxuICAgIHRoaXMucmdiYVszXSA9IDEuMDtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLmxpdmVfY291bnQgPSAwLjA7XHJcblxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuICB9XHJcblxyXG5cclxuICB1cGRhdGUodGltZSkge1xyXG4gICAgdGhpcy5saXZlX2NvdW50ICs9IHRpbWU7XHJcbiAgICB0aGlzLnJnYmFbM10gLT0gdGltZSAqIDAuNTtcclxuXHJcbiAgICBpZiAodGhpcy5yZ2JhWzNdIDwgMClcclxuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICB9XHJcblxyXG5cclxuICBkcmF3KGN0eCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICBsZXQgW3IsIGcsIGIsIGFdID0gdGhpcy5yZ2JhO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYmEoJHtyfSwke2d9LCR7Yn0sJHthfSlgO1xyXG5cclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMuc2l6ZSArICh0aGlzLmxpdmVfY291bnQgKiAxMCksIE1hdGguUEkqMiwgZmFsc2UpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA+IHRoaXMuZ2FtZS5oZWlnaHQpIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5sZWZ0O1xyXG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy50b3A7XHJcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnNjYWxlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMudG9wKTtcclxuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMubGVmdDtcclxuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5zY2FsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG59IiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGdhbWUsIGlkLCBuYW1lLCBjb2xvcikge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgIHRoaXMuYmFzZXNfaWQgPSBbXTtcclxuICB9XHJcblxyXG4gIGFkZEJhc2UoYmFzZSkge1xyXG4gICAgaWYoIXRoaXMuYmFzZXNfaWQuY29udGFpbnMoYmFzZS5pZCkpXHJcbiAgICAgIHRoaXMuYmFzZXNfaWQucHVzaChiYXNlLmlkKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUJhc2UoYmFzZSkge1xyXG4gICAgbGV0IGkgPSB0aGlzLmJhc2VzX2lkLmluZGV4T2YoYmFzZS5pZCk7XHJcbiAgICBpZihpICE9PSAtMSlcclxuICAgICAgdGhpcy5iYXNlc19pZC5zcGxpY2UoaSwgMSk7XHJcbiAgfVxyXG5cclxuICB0b3RhbFJlc291cmNlcygpIHtcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcblxyXG4gICAgZm9yKGxldCBpID0gdGhpcy5iYXNlc19pZC5sZW5ndGg7IGktLTsgKXtcclxuICAgICAgbGV0IGJhc2UgPSB0aGlzLmdhbWUuZ2V0QnlJRCh0aGlzLmdhbWUuYmFzZXMsIHRoaXMuYmFzZXNfaWRbaV0pO1xyXG4gICAgICB0b3RhbCArPSBiYXNlLnJlc291cmNlcztcclxuICAgIH1cclxuICAgIHJldHVybiB0b3RhbDtcclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IExvYWRpbmdTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL0xvYWRpbmdTY3JlZW4nO1xyXG5pbXBvcnQgU3RhcnRTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL1N0YXJ0U2NyZWVuJztcclxuaW1wb3J0IEdhbWVTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL0dhbWVTY3JlZW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyZWVuTWFuYWdlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtNYW5hZ2VyLCBzb3VuZE1hbmFnZXIpIHtcclxuICAgIHRoaXMubmV0d29ya01hbmFnZXIgPSBuZXR3b3JrTWFuYWdlcjtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxuICAgIHRoaXMuc2NyZWVucyA9IFtdO1xyXG4gICAgdGhpcy5hY3RpdmVTY3JlZW4gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMuaW5pdERPTSgpO1xyXG4gICAgdGhpcy5pbml0U2NyZWVucygpO1xyXG4gICAgdGhpcy5pbml0TmV0d29yaygpO1xyXG5cclxuICAgIHRoaXMuc2V0U2NyZWVuKHRoaXMuc2NyZWVucy5sb2FkaW5nKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGluaXRET00oKSB7XHJcbiAgICB0aGlzLiRlbCA9ICQoJ1tkYXRhLXNjcmVlbi1jb250YWluZXJdJyk7XHJcbiAgfVxyXG5cclxuICBpbml0U2NyZWVucygpIHtcclxuICAgIHRoaXMuc2NyZWVucyA9IHtcclxuICAgICAgJ2xvYWRpbmcnOiBuZXcgTG9hZGluZ1NjcmVlbih0aGlzLm5ldHdvcmtNYW5hZ2VyLCB0aGlzLnNvdW5kTWFuYWdlciksXHJcbiAgICAgICdzdGFydCc6IG5ldyBTdGFydFNjcmVlbih0aGlzLm5ldHdvcmtNYW5hZ2VyLCB0aGlzLnNvdW5kTWFuYWdlciksXHJcbiAgICAgICdnYW1lJzogbmV3IEdhbWVTY3JlZW4odGhpcy5uZXR3b3JrTWFuYWdlciwgdGhpcy5zb3VuZE1hbmFnZXIpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaW5pdE5ldHdvcmsoKSB7XHJcbiAgICBsZXQgbmV0d29ya01hbmFnZXIgPSB0aGlzLm5ldHdvcmtNYW5hZ2VyO1xyXG5cclxuICAgIG5ldHdvcmtNYW5hZ2VyLm9uKCdjb25uZWN0JywgKCkgPT4gdGhpcy5zZXRTY3JlZW4odGhpcy5zY3JlZW5zLnN0YXJ0KSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgc2V0U2NyZWVuKHNjcmVlbikge1xyXG4gICAgaWYgKHRoaXMuYWN0aXZlU2NyZWVuKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLmRlYWN0aXZhdGUoKTtcclxuICAgICAgdGhpcy5hY3RpdmVTY3JlZW4udW5yZW5kZXJET00oKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFjdGl2ZVNjcmVlbiA9IHNjcmVlbjtcclxuICAgIHRoaXMuYWN0aXZlU2NyZWVuLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXJET00odGhpcy4kZWwpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcblxyXG4vKiogVE9ET1xyXG4gKlxyXG4gKiB7IEdBTUUgfVxyXG4gKiAtICAgIEdldCBpbmZvcm1hdGlvbiBhYm91dCBwbGF5ZXJzIGluIGdhbWUgKERPTkUpXHJcbiAqICAgICAgICAgU2F2ZSBwbGF5ZXJzIGluIHNvbWUgbGlzdCAoRE9ORSlcclxuICogLSAgICBHZXQgaW5mb3JtYXRpb24gYWJvdXQgZ2FtZSAoRE9ORSlcclxuICogLSAgICBCaW5kIGxpc3RlbmVycyBmb3IgZ2FtZVxyXG4gKiAgICAgICAgIFNhdmUgbGlzdGVuZXIgdG8gYmUgYWJsZSB0byByZW1vdmVcclxuICogLSAgICBDb3VudCBkb3duIHN0YXJ0IC0+IHN0YXJ0IGdhbWVcclxuICogLSAgICBHYW1lIGxvZ2ljXHJcbiAqL1xyXG5cclxudmFyIENPTlRST0xMRVIgPSB7XHJcbiAgICBjdXJyZW50X3NjcmVlbjogbnVsbFxyXG59O1xyXG4vKipcclxuICogeyBJTklUIH1cclxuICovXHJcbkNPTlRST0xMRVIuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBORVQuaW5pdCgpO1xyXG4gICAgR0FNRS5pbml0KCk7XHJcblxyXG4gICAgQ09OVFJPTExFUi5jdXJyZW50X3NjcmVlbiA9ICdsb2FkaW5nJztcclxuXHJcbiAgICBDT05UUk9MTEVSLmJpbmRldmVudHMoKTtcclxufTtcclxuLyoqXHJcbiAqIHsgQklORCBFVkVOVFMgfVxyXG4gKiBCaW5kcyBsaXN0ZW5lcnMgYW5kIGZsb3cgbG9naWNcclxuICovXHJcbkNPTlRST0xMRVIuYmluZGV2ZW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnNcclxuICAgIERPTS5vbignI2J0bl9wbGF5JywgJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBDT05UUk9MTEVSLnJlcXVlc3RQbGF5KCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB7IFJFU1VRRVNUIFBMQVkgfVxyXG4gKiBDYWxsZWQgd2hlbiBjbGllbnQgY2xpY2tzICdQbGF5J1xyXG4gKi9cclxuQ09OVFJPTExFUi5yZXF1ZXN0UGxheSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBORVQuc2VuZCgnQ0xJRU5ULnBsYXknKTtcclxuICAgIENPTlRST0xMRVIuc2V0U2NyZWVuKCd3YWl0aW5nJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogeyBTRVQgU0NSRUVOIH1cclxuICogU2V0cyB0aGUgYWN0aXZlIHNjcmVlblxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNjcmVlbiAgTmFtZSBmb3IgdGhlIHNjcmVlbiwgZS5nIGdhbWUvc3RhcnQvbG9hZGluZywgIU5PVCBIVE1MLURPTS1pZCwgZS5nICNzY3JlZW5fZ2FtZSFcclxuICovXHJcbkNPTlRST0xMRVIuc2V0U2NyZWVuID0gZnVuY3Rpb24oc2NyZWVuKXtcclxuICAgIHZhciBzID0gRE9NKCcjc2NyZWVuXycgKyBzY3JlZW4pO1xyXG4gICAgaWYocyl7XHJcbiAgICAgICAgaWYoQ09OVFJPTExFUi5jdXJyZW50X3NjcmVlbilcclxuICAgICAgICAgICAgRE9NLmFkZENsYXNzKCcjc2NyZWVuXycgKyBDT05UUk9MTEVSLmN1cnJlbnRfc2NyZWVuLCAnaGlkZGVuJyk7XHJcbiAgICAgICAgQ09OVFJPTExFUi5jdXJyZW50X3NjcmVlbiA9IHNjcmVlbjtcclxuICAgICAgICBET00ucmVtb3ZlQ2xhc3MocywgJ2hpZGRlbicpO1xyXG4gICAgfVxyXG59O1xyXG4vKipcclxuICogeyBPVkVSTEFZIE1FU1NBR0UgfVxyXG4gKiBEaXNwbGF5cyBhbiBvdmVybGF5IG1lc3NhZ2VcclxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcclxuICovXHJcbkNPTlRST0xMRVIub3ZlcmxheU1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xyXG4gICAgRE9NLnJlbW92ZUNsYXNzKCcjb3ZlcmxheScsICdoaWRkZW4nKTtcclxuICAgIERPTS50ZXh0KCcjb3ZlcmxheV9tZXNzYWdlJywgXCI8aDI+ezB9PC9oMj5cIi5mb3JtYXQobXNnKSk7XHJcbn07XHJcbi8qKlxyXG4gKiB7IE9WRVJMQVkgSElERSB9XHJcbiAqIEhpZGVzIHRoZSBvdmVybGF5XHJcbiAqL1xyXG5DT05UUk9MTEVSLm92ZXJsYXlIaWRlID0gZnVuY3Rpb24oKXtcclxuICAgIERPTS5hZGRDbGFzcygnI292ZXJsYXknLCAnaGlkZGVuJyk7XHJcbn07XHJcbi8qKlxyXG4gKiB7IENPTk5FQ1RFRCB9XHJcbiAqL1xyXG5DT05UUk9MTEVSLmNvbm5lY3RlZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aW1lZCgnQ29ubmVjdGVkIScpO1xyXG4gICAgQ09OVFJPTExFUi5zZXRTY3JlZW4oJ3N0YXJ0Jyk7XHJcbn07XHJcbi8qKiBcclxuICogeyBOTyBDT05ORUNUfVxyXG4gKiBDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXJcclxuICovXHJcbkNPTlRST0xMRVIubm9jb25uZWN0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRpbWVkKCdDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXIhJyk7XHJcbiAgICBDT05UUk9MTEVSLnNldFNjcmVlbignbm9jb25uZWN0Jyk7XHJcbn07XHJcbi8qKlxyXG4gKiB7IERJU0NPTk5FQ1RFRCB9XHJcbiAqL1xyXG5DT05UUk9MTEVSLmRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aW1lZCgnRGlzY29ubmVjdGVkIGZyb20gc2VydmVyIScpO1xyXG4gICAgQ09OVFJPTExFUi5zZXRTY3JlZW4oJ25vY29ubmVjdCcpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHsgU1RBUlQgR0FNRSB9XHJcbiAqIFN0YXJ0cyBnYW1lXHJcbiAqL1xyXG5DT05UUk9MTEVSLnN0YXJ0Z2FtZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBDT05UUk9MTEVSLnNldFNjcmVlbignZ2FtZScpO1xyXG59O1xyXG5cclxuXHJcbiIsIlxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VTY3JlZW4ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihuZXR3b3JrTWFuYWdlciwgc291bmRNYW5hZ2VyKSB7XHJcbiAgICB0aGlzLm5ldHdvcmtNYW5hZ2VyID0gbmV0d29ya01hbmFnZXI7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJlbmRlckRPTSgkcGFyZW50LCB0ZW1wbGF0ZSkge1xyXG4gICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgIHRoaXMuJGVsID0gJCh0ZW1wbGF0ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiRlbCA9ICQoJzxkaXY+Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgJHBhcmVudC5odG1sKHRoaXMuJGVsKTtcclxuICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgdW5yZW5kZXJET00oKSB7XHJcbiAgICB0aGlzLiRlbC5vZmYoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMoKSB7XHJcbiAgICBmb3IgKHZhciBkZWZpbml0aW9uIGluIHRoaXMuZXZlbnRzKSB7XHJcbiAgICAgIGxldCBzcGxpdCA9IGRlZmluaXRpb24uc3BsaXQoJyAnKTtcclxuICAgICAgbGV0IGV2ZW50ID0gc3BsaXRbMF07XHJcbiAgICAgIGxldCBzZWxlY3RvciA9IHNwbGl0LnNsaWNlKDEpLmpvaW4oJyAnKTtcclxuICAgICAgbGV0IGNhbGxiYWNrID0gdGhpc1t0aGlzLmV2ZW50c1tkZWZpbml0aW9uXV0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpLm9uKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwiXHJcbmltcG9ydCBCYXNlU2NyZWVuIGZyb20gJy4vQmFzZVNjcmVlbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuIGV4dGVuZHMgQmFzZVNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5zb2NrZXRFdmVudHMgPSB7XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGUoKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgcmVuZGVyRE9NKCRlbCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gIGBcclxuICAgICAgPGRpdiBpZD1cInNjcmVlbl9nYW1lXCIgY2xhc3M9XCJzY3JlZW5cIj5cclxuICAgICAgICA8Y2FudmFzIGlkPVwiY2FudmFzXCIgd2lkdGg9XCI2MDBcIiBoZWlnaHQ9XCI0MDBcIj5cclxuICAgICAgICAgIDxwPllvdXIgYnJvd3NlciBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGUgQ2FudmFzLWVsZW1lbnQgOiguPC9wPlxyXG4gICAgICAgIDwvY2FudmFzPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbiAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgQmFzZVNjcmVlbiBmcm9tICcuL0Jhc2VTY3JlZW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZGluZ1NjcmVlbiBleHRlbmRzIEJhc2VTY3JlZW4ge1xyXG5cclxuICByZW5kZXJET00oJHBhcmVudCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gYFxyXG4gICAgICA8ZGl2IGlkPVwic2NyZWVuX2xvYWRpbmdcIiBjbGFzcz1cInNjcmVlblwiPlxyXG4gICAgICAgIDxoMj5Mb2FkaW5nPC9oMj5cclxuICAgICAgICA8aW1nIHNyYz1cInJlcy9pbWFnZXMvd2FpdGluZy5naWZcIiBhbHQ9XCJcIj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIHN1cGVyLnJlbmRlckRPTSgkcGFyZW50LCB0ZW1wbGF0ZSk7XHJcbiAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgQmFzZVNjcmVlbiBmcm9tICcuL0Jhc2VTY3JlZW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhcnRTY3JlZW4gZXh0ZW5kcyBCYXNlU2NyZWVuIHtcclxuXHJcbiAgY29uc3RydWN0b3IobmV0d29ya01hbmFnZXIsIHNvdW5kTWFuYWdlcikge1xyXG4gICAgc3VwZXIobmV0d29ya01hbmFnZXIsIHNvdW5kTWFuYWdlcik7XHJcblxyXG4gICAgdGhpcy5ldmVudHMgPSB7XHJcbiAgICAgICdjbGljayAjYnRuX3BsYXknOiAnb25QbGF5Q2xpY2snXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyRE9NKCRwYXJlbnQpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGBcclxuICAgICAgPGRpdiBpZD1cInNjcmVlbl9zdGFydFwiIGNsYXNzPVwic2NyZWVuXCI+XHJcbiAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bl9wbGF5XCI+UGxheTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgc3VwZXIucmVuZGVyRE9NKCRwYXJlbnQsIHRlbXBsYXRlKTtcclxuICB9XHJcblxyXG5cclxuICBvblBsYXlDbGljayhldmVudCkge1xyXG4gICAgYWxlcnQoKTtcclxuICB9XHJcblxyXG59IiwiXHJcblxyXG5pbXBvcnQgeyByYW5kb21SYW5nZUludCB9IGZyb20gJy4vdXRpbC91dGlsLmpzJztcclxuaW1wb3J0IHsgQXVkaW9Db250ZXh0IH0gZnJvbSAnLi91dGlsL3ByZWZpeGVyLmpzJztcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmN0eCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xyXG4gICAgdGhpcy5zb3VuZF9uYW1lcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBpZiAoIUF1ZGlvQ29udGV4dCkge1xyXG4gICAgICB0aHJvdyBcIkF1ZGlvQ29udGV4dCBub3Qgc3VwcG9ydGVkIGJ5IGJyb3dzZXJcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuXHJcbiAgICB0aGlzLmluaXRTb3VuZHMoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG5cclxuICBpbml0U291bmRzKCkgeyAgXHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9jNC53YXYnLCAnYzQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Q0LndhdicsICdkNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTQud2F2JywgJ2U0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9mNC53YXYnLCAnZjQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2c0LndhdicsICdnNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTQud2F2JywgJ2E0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9iNC53YXYnLCAnYjQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2M1LndhdicsICdjNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDUud2F2JywgJ2Q1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9lNS53YXYnLCAnZTUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Y1LndhdicsICdmNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZzUud2F2JywgJ2c1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9hNS53YXYnLCAnYTUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2I1LndhdicsICdiNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzYud2F2JywgJ2M2Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9kNi53YXYnLCAnZDYnKTtcclxuICB9XHJcblxyXG5cclxuICBsb2FkU291bmQodXJsLCBuYW1lKSB7XHJcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuICAgIFxyXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jdHguZGVjb2RlQXVkaW9EYXRhKHhoci5yZXNwb25zZSwgKGJ1ZmZlcikgPT4ge1xyXG4gICAgICAgIHRoaXMuc291bmRfbmFtZXMucHVzaChuYW1lKTtcclxuICAgICAgICB0aGlzLnNvdW5kc1tuYW1lXSA9IGJ1ZmZlcjtcclxuXHJcbiAgICAgICAgaWYoJ3RvdWNoc3RhcnQnIGluIHdpbmRvdyAmJiB0aGlzLnN0YXJ0dXBfZXZlbnQgPT09IG51bGwpe1xyXG4gICAgICAgICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXlSYW5kb21Tb3VuZCgpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHBsYXlTb3VuZChuYW1lKSB7XHJcbiAgICBpZiAoIXRoaXMuc291bmRzW25hbWVdKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHNvdW5kID0gdGhpcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICBzb3VuZC5idWZmZXIgPSB0aGlzLnNvdW5kc1tuYW1lXTtcclxuXHJcbiAgICBsZXQgZ2FpbiA9IHRoaXMuY3JlYXRlR2Fpbk5vZGUoMC44LCAwLjAsIDAuNCk7XHJcblxyXG4gICAgc291bmQuY29ubmVjdChnYWluKTtcclxuICAgIGdhaW4uY29ubmVjdCh0aGlzLmN0eC5kZXN0aW5hdGlvbik7XHJcblxyXG4gICAgc291bmQuc3RhcnQoMCk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVHYWluTm9kZShzdGFydCwgZW5kLCB0aW1lKSB7XHJcbiAgICBsZXQgbm9kZSA9IHRoaXMuY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIGxldCBub3cgPSB0aGlzLmN0eC5jdXJyZW50VGltZTtcclxuXHJcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoc3RhcnQsIG5vdyk7XHJcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZW5kLCBub3cgKyB0aW1lKTtcclxuXHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9XHJcblxyXG4gIHBsYXlSYW5kb21Tb3VuZCgpIHtcclxuICAgIHRoaXMucGxheVNvdW5kKHRoaXMuc291bmRfbmFtZXNbcmFuZG9tUmFuZ2VJbnQoMCwgdGhpcy5zb3VuZF9uYW1lcy5sZW5ndGgpXSk7XHJcbiAgfVxyXG59IiwiZnVuY3Rpb24gaGV4Y2hhclRvRGVjKGhleHZhbCl7XHJcbiAgICB2YXIgYyA9IGhleHZhbC50b1VwcGVyQ2FzZSgpLmNoYXJDb2RlQXQoMCk7XHJcbiAgICByZXR1cm4gKGMgPCA2MCk/IChjLTQ4KSA6IChjLTU1KTtcclxufVxyXG5mdW5jdGlvbiBoZXhjb2xvclRvUkdCKGhleCl7XHJcbiAgICBoZXggPSBoZXgucmVwbGFjZSgnIycsICcnKTtcclxuICAgIHZhciByZ2IgPSBbXTtcclxuICAgIHZhciBpbmMgPSAoaGV4Lmxlbmd0aCA8IDYpPyAxIDogMjtcclxuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGhleC5sZW5ndGg7IGkgPCBsZW47IGkrPWluYyl7XHJcbiAgICAgICAgLy8gdmFyIHYgPSBoZXguc3Vic3RyKGksIGluYyk7XHJcbiAgICAgICAgcmdiLnB1c2gocGFyc2VJbnQoaGV4LnN1YnN0cihpLCBpbmMpLCAxNikpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJnYjtcclxufVxyXG5cclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBoZXhjaGFyVG9EZWMsXHJcbiAgICBoZXhjb2xvclRvUkdCXHJcbn07IiwiXHJcbmZ1bmN0aW9uIGRyYXdMaW5lKGN0eCwgeDEsIHkxLCB4MiwgeTIsIGNvbG9yLCB3aWR0aCl7XHJcblxyXG4gIGlmKGNvbG9yKSBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICBpZih3aWR0aCkgY3R4LmxpbmVXaWR0aCA9IHdpZHRoO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdDaXJjbGUoY3R4LCB4LCB5LCByLCBjb2xvciwgc3R5bGUgPSAnZmlsbCcpe1xyXG5cclxuICBpZihjb2xvcikgY3R4W3N0eWxlKydTdHlsZSddID0gY29sb3I7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHguYXJjKHgsIHksIHIsIE1hdGguUEkqMiwgZmFsc2UpO1xyXG4gIGN0eFtzdHlsZV0oKTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGRyYXdMaW5lLFxyXG4gIGRyYXdDaXJjbGVcclxufSIsIlxyXG5mdW5jdGlvbiB2ZWNEaXN0YW5jZVNxKHgxLCB5MSwgeDIsIHkyKXtcclxuICAgIHJldHVybiBNYXRoLnBvdyh4MS14MiwgMikgKyBNYXRoLnBvdyh5MS15MiwgMik7XHJcbn1cclxuZnVuY3Rpb24gdmVjRGlzdGFuY2UoeDEsIHkxLCB4MiwgeTIpe1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCh2ZWNEaXN0YW5jZVNxKHgxLCB5MSwgeDIsIHkyKSk7XHJcbn1cclxuZnVuY3Rpb24gcG9pbnRJbkNpcmNsZShweCwgcHksIGN4LCBjeSwgY3Ipe1xyXG4gICAgcmV0dXJuICh2ZWNEaXN0YW5jZVNxKHB4LCBweSwgY3gsIGN5KSA8IE1hdGgucG93KGNyLCAyKSk7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICB2ZWNEaXN0YW5jZVNxLFxyXG4gIHZlY0Rpc3RhbmNlLFxyXG4gIHBvaW50SW5DaXJjbGVcclxufTsiLCJcclxuZXhwb3J0IGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDAvNjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbmV4cG9ydCBsZXQgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0O1xyXG5cclxuXHJcbmV4cG9ydCBsZXQgcGVyZm9ybWFuY2UgPSB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcclxucGVyZm9ybWFuY2Uubm93ID0gcGVyZm9ybWFuY2Uubm93IHx8XHJcbiAgICAgICAgICAgICAgICAgIHBlcmZvcm1hbmNlLndlYmtpdE5vdyB8fFxyXG4gICAgICAgICAgICAgICAgICBwZXJmb3JtYW5jZS5tb3pOb3cgfHxcclxuICAgICAgICAgICAgICAgICAgcGVyZm9ybWFuY2UubXNOb3cgfHxcclxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpOyB9O1xyXG5cclxuXHJcbmV4cG9ydCBsZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fFxyXG4gICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fFxyXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm1vekF1ZGlvQ29udGV4dCB8fFxyXG4gICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xyXG5cclxuXHJcbi8qbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lLFxyXG4gIHBlcmZvcm1hbmNlLFxyXG4gIEF1ZGlvQ29udGV4dFxyXG59OyovIiwiXHJcbmZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KXtcclxuICAgIHJldHVybiAoKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikpICsgbWluKTtcclxufVxyXG5mdW5jdGlvbiByYW5kb21SYW5nZUludChtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSkgKyBtaW4pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kb21SYW5nZSxcclxuICByYW5kb21SYW5nZUludFxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmIChnbG9iYWwuX2JhYmVsUG9seWZpbGwpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwib25seSBvbmUgaW5zdGFuY2Ugb2YgYmFiZWwvcG9seWZpbGwgaXMgYWxsb3dlZFwiKTtcbn1cbmdsb2JhbC5fYmFiZWxQb2x5ZmlsbCA9IHRydWU7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL3NoaW1cIik7XG5cbnJlcXVpcmUoXCJyZWdlbmVyYXRvci1iYWJlbC9ydW50aW1lXCIpOyIsIi8qKlxuICogQ29yZS5qcyAwLjYuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanNcbiAqIExpY2Vuc2U6IGh0dHA6Ly9yb2NrLm1pdC1saWNlbnNlLm9yZ1xuICogwqkgMjAxNSBEZW5pcyBQdXNoa2FyZXZcbiAqL1xuIWZ1bmN0aW9uKGdsb2JhbCwgZnJhbWV3b3JrLCB1bmRlZmluZWQpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb21tb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8vIFNob3J0Y3V0cyBmb3IgW1tDbGFzc11dICYgcHJvcGVydHkgbmFtZXNcclxudmFyIE9CSkVDVCAgICAgICAgICA9ICdPYmplY3QnXHJcbiAgLCBGVU5DVElPTiAgICAgICAgPSAnRnVuY3Rpb24nXHJcbiAgLCBBUlJBWSAgICAgICAgICAgPSAnQXJyYXknXHJcbiAgLCBTVFJJTkcgICAgICAgICAgPSAnU3RyaW5nJ1xyXG4gICwgTlVNQkVSICAgICAgICAgID0gJ051bWJlcidcclxuICAsIFJFR0VYUCAgICAgICAgICA9ICdSZWdFeHAnXHJcbiAgLCBEQVRFICAgICAgICAgICAgPSAnRGF0ZSdcclxuICAsIE1BUCAgICAgICAgICAgICA9ICdNYXAnXHJcbiAgLCBTRVQgICAgICAgICAgICAgPSAnU2V0J1xyXG4gICwgV0VBS01BUCAgICAgICAgID0gJ1dlYWtNYXAnXHJcbiAgLCBXRUFLU0VUICAgICAgICAgPSAnV2Vha1NldCdcclxuICAsIFNZTUJPTCAgICAgICAgICA9ICdTeW1ib2wnXHJcbiAgLCBQUk9NSVNFICAgICAgICAgPSAnUHJvbWlzZSdcclxuICAsIE1BVEggICAgICAgICAgICA9ICdNYXRoJ1xyXG4gICwgQVJHVU1FTlRTICAgICAgID0gJ0FyZ3VtZW50cydcclxuICAsIFBST1RPVFlQRSAgICAgICA9ICdwcm90b3R5cGUnXHJcbiAgLCBDT05TVFJVQ1RPUiAgICAgPSAnY29uc3RydWN0b3InXHJcbiAgLCBUT19TVFJJTkcgICAgICAgPSAndG9TdHJpbmcnXHJcbiAgLCBUT19TVFJJTkdfVEFHICAgPSBUT19TVFJJTkcgKyAnVGFnJ1xyXG4gICwgVE9fTE9DQUxFICAgICAgID0gJ3RvTG9jYWxlU3RyaW5nJ1xyXG4gICwgSEFTX09XTiAgICAgICAgID0gJ2hhc093blByb3BlcnR5J1xyXG4gICwgRk9SX0VBQ0ggICAgICAgID0gJ2ZvckVhY2gnXHJcbiAgLCBJVEVSQVRPUiAgICAgICAgPSAnaXRlcmF0b3InXHJcbiAgLCBGRl9JVEVSQVRPUiAgICAgPSAnQEAnICsgSVRFUkFUT1JcclxuICAsIFBST0NFU1MgICAgICAgICA9ICdwcm9jZXNzJ1xyXG4gICwgQ1JFQVRFX0VMRU1FTlQgID0gJ2NyZWF0ZUVsZW1lbnQnXHJcbiAgLy8gQWxpYXNlcyBnbG9iYWwgb2JqZWN0cyBhbmQgcHJvdG90eXBlc1xyXG4gICwgRnVuY3Rpb24gICAgICAgID0gZ2xvYmFsW0ZVTkNUSU9OXVxyXG4gICwgT2JqZWN0ICAgICAgICAgID0gZ2xvYmFsW09CSkVDVF1cclxuICAsIEFycmF5ICAgICAgICAgICA9IGdsb2JhbFtBUlJBWV1cclxuICAsIFN0cmluZyAgICAgICAgICA9IGdsb2JhbFtTVFJJTkddXHJcbiAgLCBOdW1iZXIgICAgICAgICAgPSBnbG9iYWxbTlVNQkVSXVxyXG4gICwgUmVnRXhwICAgICAgICAgID0gZ2xvYmFsW1JFR0VYUF1cclxuICAsIERhdGUgICAgICAgICAgICA9IGdsb2JhbFtEQVRFXVxyXG4gICwgTWFwICAgICAgICAgICAgID0gZ2xvYmFsW01BUF1cclxuICAsIFNldCAgICAgICAgICAgICA9IGdsb2JhbFtTRVRdXHJcbiAgLCBXZWFrTWFwICAgICAgICAgPSBnbG9iYWxbV0VBS01BUF1cclxuICAsIFdlYWtTZXQgICAgICAgICA9IGdsb2JhbFtXRUFLU0VUXVxyXG4gICwgU3ltYm9sICAgICAgICAgID0gZ2xvYmFsW1NZTUJPTF1cclxuICAsIE1hdGggICAgICAgICAgICA9IGdsb2JhbFtNQVRIXVxyXG4gICwgVHlwZUVycm9yICAgICAgID0gZ2xvYmFsLlR5cGVFcnJvclxyXG4gICwgUmFuZ2VFcnJvciAgICAgID0gZ2xvYmFsLlJhbmdlRXJyb3JcclxuICAsIHNldFRpbWVvdXQgICAgICA9IGdsb2JhbC5zZXRUaW1lb3V0XHJcbiAgLCBzZXRJbW1lZGlhdGUgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXHJcbiAgLCBjbGVhckltbWVkaWF0ZSAgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGVcclxuICAsIHBhcnNlSW50ICAgICAgICA9IGdsb2JhbC5wYXJzZUludFxyXG4gICwgaXNGaW5pdGUgICAgICAgID0gZ2xvYmFsLmlzRmluaXRlXHJcbiAgLCBwcm9jZXNzICAgICAgICAgPSBnbG9iYWxbUFJPQ0VTU11cclxuICAsIG5leHRUaWNrICAgICAgICA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5uZXh0VGlja1xyXG4gICwgZG9jdW1lbnQgICAgICAgID0gZ2xvYmFsLmRvY3VtZW50XHJcbiAgLCBodG1sICAgICAgICAgICAgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcclxuICAsIG5hdmlnYXRvciAgICAgICA9IGdsb2JhbC5uYXZpZ2F0b3JcclxuICAsIGRlZmluZSAgICAgICAgICA9IGdsb2JhbC5kZWZpbmVcclxuICAsIGNvbnNvbGUgICAgICAgICA9IGdsb2JhbC5jb25zb2xlIHx8IHt9XHJcbiAgLCBBcnJheVByb3RvICAgICAgPSBBcnJheVtQUk9UT1RZUEVdXHJcbiAgLCBPYmplY3RQcm90byAgICAgPSBPYmplY3RbUFJPVE9UWVBFXVxyXG4gICwgRnVuY3Rpb25Qcm90byAgID0gRnVuY3Rpb25bUFJPVE9UWVBFXVxyXG4gICwgSW5maW5pdHkgICAgICAgID0gMSAvIDBcclxuICAsIERPVCAgICAgICAgICAgICA9ICcuJztcclxuXHJcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcmUtanMtaXNvYmplY3RcclxuZnVuY3Rpb24gaXNPYmplY3QoaXQpe1xyXG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcclxufVxyXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gdHlwZW9mIGl0ID09ICdmdW5jdGlvbic7XHJcbn1cclxuLy8gTmF0aXZlIGZ1bmN0aW9uP1xyXG52YXIgaXNOYXRpdmUgPSBjdHgoLy4vLnRlc3QsIC9cXFtuYXRpdmUgY29kZVxcXVxccypcXH1cXHMqJC8sIDEpO1xyXG5cclxuLy8gT2JqZWN0IGludGVybmFsIFtbQ2xhc3NdXSBvciB0b1N0cmluZ1RhZ1xyXG4vLyBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nXHJcbnZhciB0b1N0cmluZyA9IE9iamVjdFByb3RvW1RPX1NUUklOR107XHJcbmZ1bmN0aW9uIHNldFRvU3RyaW5nVGFnKGl0LCB0YWcsIHN0YXQpe1xyXG4gIGlmKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdFtQUk9UT1RZUEVdLCBTWU1CT0xfVEFHKSloaWRkZW4oaXQsIFNZTUJPTF9UQUcsIHRhZyk7XHJcbn1cclxuZnVuY3Rpb24gY29mKGl0KXtcclxuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xyXG59XHJcbmZ1bmN0aW9uIGNsYXNzb2YoaXQpe1xyXG4gIHZhciBPLCBUO1xyXG4gIHJldHVybiBpdCA9PSB1bmRlZmluZWQgPyBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiAnTnVsbCdcclxuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtTWU1CT0xfVEFHXSkgPT0gJ3N0cmluZycgPyBUIDogY29mKE8pO1xyXG59XHJcblxyXG4vLyBGdW5jdGlvblxyXG52YXIgY2FsbCAgPSBGdW5jdGlvblByb3RvLmNhbGxcclxuICAsIGFwcGx5ID0gRnVuY3Rpb25Qcm90by5hcHBseVxyXG4gICwgUkVGRVJFTkNFX0dFVDtcclxuLy8gUGFydGlhbCBhcHBseVxyXG5mdW5jdGlvbiBwYXJ0KC8qIC4uLmFyZ3MgKi8pe1xyXG4gIHZhciBmbiAgICAgPSBhc3NlcnRGdW5jdGlvbih0aGlzKVxyXG4gICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGFyZ3MgICA9IEFycmF5KGxlbmd0aClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBfICAgICAgPSBwYXRoLl9cclxuICAgICwgaG9sZGVyID0gZmFsc2U7XHJcbiAgd2hpbGUobGVuZ3RoID4gaSlpZigoYXJnc1tpXSA9IGFyZ3VtZW50c1tpKytdKSA9PT0gXylob2xkZXIgPSB0cnVlO1xyXG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgIHZhciB0aGF0ICAgID0gdGhpc1xyXG4gICAgICAsIF9sZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgaSA9IDAsIGogPSAwLCBfYXJncztcclxuICAgIGlmKCFob2xkZXIgJiYgIV9sZW5ndGgpcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhhdCk7XHJcbiAgICBfYXJncyA9IGFyZ3Muc2xpY2UoKTtcclxuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGk7IGkrKylpZihfYXJnc1tpXSA9PT0gXylfYXJnc1tpXSA9IGFyZ3VtZW50c1tqKytdO1xyXG4gICAgd2hpbGUoX2xlbmd0aCA+IGopX2FyZ3MucHVzaChhcmd1bWVudHNbaisrXSk7XHJcbiAgICByZXR1cm4gaW52b2tlKGZuLCBfYXJncywgdGhhdCk7XHJcbiAgfVxyXG59XHJcbi8vIE9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xyXG5mdW5jdGlvbiBjdHgoZm4sIHRoYXQsIGxlbmd0aCl7XHJcbiAgYXNzZXJ0RnVuY3Rpb24oZm4pO1xyXG4gIGlmKH5sZW5ndGggJiYgdGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcclxuICBzd2l0Y2gobGVuZ3RoKXtcclxuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcclxuICAgIH1cclxuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcclxuICAgIH1cclxuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcclxuICAgIH1cclxuICB9IHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG59XHJcbi8vIEZhc3QgYXBwbHlcclxuLy8gaHR0cDovL2pzcGVyZi5sbmtpdC5jb20vZmFzdC1hcHBseS81XHJcbmZ1bmN0aW9uIGludm9rZShmbiwgYXJncywgdGhhdCl7XHJcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xyXG4gIHN3aXRjaChhcmdzLmxlbmd0aCB8IDApe1xyXG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XHJcbiAgICBjYXNlIDE6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XHJcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSk7XHJcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XHJcbiAgICBjYXNlIDQ6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XHJcbiAgICBjYXNlIDU6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSk7XHJcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xyXG59XHJcblxyXG4vLyBPYmplY3Q6XHJcbnZhciBjcmVhdGUgICAgICAgICAgID0gT2JqZWN0LmNyZWF0ZVxyXG4gICwgZ2V0UHJvdG90eXBlT2YgICA9IE9iamVjdC5nZXRQcm90b3R5cGVPZlxyXG4gICwgc2V0UHJvdG90eXBlT2YgICA9IE9iamVjdC5zZXRQcm90b3R5cGVPZlxyXG4gICwgZGVmaW5lUHJvcGVydHkgICA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxyXG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXHJcbiAgLCBnZXRPd25EZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvclxyXG4gICwgZ2V0S2V5cyAgICAgICAgICA9IE9iamVjdC5rZXlzXHJcbiAgLCBnZXROYW1lcyAgICAgICAgID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcclxuICAsIGdldFN5bWJvbHMgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzXHJcbiAgLCBpc0Zyb3plbiAgICAgICAgID0gT2JqZWN0LmlzRnJvemVuXHJcbiAgLCBoYXMgICAgICAgICAgICAgID0gY3R4KGNhbGwsIE9iamVjdFByb3RvW0hBU19PV05dLCAyKVxyXG4gIC8vIER1bW15LCBmaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmcgaW4gZXM1IG1vZHVsZVxyXG4gICwgRVM1T2JqZWN0ICAgICAgICA9IE9iamVjdFxyXG4gICwgRGljdDtcclxuZnVuY3Rpb24gdG9PYmplY3QoaXQpe1xyXG4gIHJldHVybiBFUzVPYmplY3QoYXNzZXJ0RGVmaW5lZChpdCkpO1xyXG59XHJcbmZ1bmN0aW9uIHJldHVybkl0KGl0KXtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gcmV0dXJuVGhpcygpe1xyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcbmZ1bmN0aW9uIGdldChvYmplY3QsIGtleSl7XHJcbiAgaWYoaGFzKG9iamVjdCwga2V5KSlyZXR1cm4gb2JqZWN0W2tleV07XHJcbn1cclxuZnVuY3Rpb24gb3duS2V5cyhpdCl7XHJcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICByZXR1cm4gZ2V0U3ltYm9scyA/IGdldE5hbWVzKGl0KS5jb25jYXQoZ2V0U3ltYm9scyhpdCkpIDogZ2V0TmFtZXMoaXQpO1xyXG59XHJcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcclxudmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odGFyZ2V0LCBzb3VyY2Upe1xyXG4gIHZhciBUID0gT2JqZWN0KGFzc2VydERlZmluZWQodGFyZ2V0KSlcclxuICAgICwgbCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgaSA9IDE7XHJcbiAgd2hpbGUobCA+IGkpe1xyXG4gICAgdmFyIFMgICAgICA9IEVTNU9iamVjdChhcmd1bWVudHNbaSsrXSlcclxuICAgICAgLCBrZXlzICAgPSBnZXRLZXlzKFMpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBqICAgICAgPSAwXHJcbiAgICAgICwga2V5O1xyXG4gICAgd2hpbGUobGVuZ3RoID4gailUW2tleSA9IGtleXNbaisrXV0gPSBTW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBUO1xyXG59XHJcbmZ1bmN0aW9uIGtleU9mKG9iamVjdCwgZWwpe1xyXG4gIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAsIGtleXMgICA9IGdldEtleXMoTylcclxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICwgaW5kZXggID0gMFxyXG4gICAgLCBrZXk7XHJcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcclxufVxyXG5cclxuLy8gQXJyYXlcclxuLy8gYXJyYXkoJ3N0cjEsc3RyMixzdHIzJykgPT4gWydzdHIxJywgJ3N0cjInLCAnc3RyMyddXHJcbmZ1bmN0aW9uIGFycmF5KGl0KXtcclxuICByZXR1cm4gU3RyaW5nKGl0KS5zcGxpdCgnLCcpO1xyXG59XHJcbnZhciBwdXNoICAgID0gQXJyYXlQcm90by5wdXNoXHJcbiAgLCB1bnNoaWZ0ID0gQXJyYXlQcm90by51bnNoaWZ0XHJcbiAgLCBzbGljZSAgID0gQXJyYXlQcm90by5zbGljZVxyXG4gICwgc3BsaWNlICA9IEFycmF5UHJvdG8uc3BsaWNlXHJcbiAgLCBpbmRleE9mID0gQXJyYXlQcm90by5pbmRleE9mXHJcbiAgLCBmb3JFYWNoID0gQXJyYXlQcm90b1tGT1JfRUFDSF07XHJcbi8qXHJcbiAqIDAgLT4gZm9yRWFjaFxyXG4gKiAxIC0+IG1hcFxyXG4gKiAyIC0+IGZpbHRlclxyXG4gKiAzIC0+IHNvbWVcclxuICogNCAtPiBldmVyeVxyXG4gKiA1IC0+IGZpbmRcclxuICogNiAtPiBmaW5kSW5kZXhcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5TWV0aG9kKHR5cGUpe1xyXG4gIHZhciBpc01hcCAgICAgICA9IHR5cGUgPT0gMVxyXG4gICAgLCBpc0ZpbHRlciAgICA9IHR5cGUgPT0gMlxyXG4gICAgLCBpc1NvbWUgICAgICA9IHR5cGUgPT0gM1xyXG4gICAgLCBpc0V2ZXJ5ICAgICA9IHR5cGUgPT0gNFxyXG4gICAgLCBpc0ZpbmRJbmRleCA9IHR5cGUgPT0gNlxyXG4gICAgLCBub2hvbGVzICAgICA9IHR5cGUgPT0gNSB8fCBpc0ZpbmRJbmRleDtcclxuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHZhciBPICAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCB0aGF0ICAgPSBhcmd1bWVudHNbMV1cclxuICAgICAgLCBzZWxmICAgPSBFUzVPYmplY3QoTylcclxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcclxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChzZWxmLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSAwXHJcbiAgICAgICwgcmVzdWx0ID0gaXNNYXAgPyBBcnJheShsZW5ndGgpIDogaXNGaWx0ZXIgPyBbXSA6IHVuZGVmaW5lZFxyXG4gICAgICAsIHZhbCwgcmVzO1xyXG4gICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihub2hvbGVzIHx8IGluZGV4IGluIHNlbGYpe1xyXG4gICAgICB2YWwgPSBzZWxmW2luZGV4XTtcclxuICAgICAgcmVzID0gZih2YWwsIGluZGV4LCBPKTtcclxuICAgICAgaWYodHlwZSl7XHJcbiAgICAgICAgaWYoaXNNYXApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAgLy8gbWFwXHJcbiAgICAgICAgZWxzZSBpZihyZXMpc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVcclxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbDsgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kXHJcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgICAgICAgLy8gZmluZEluZGV4XHJcbiAgICAgICAgICBjYXNlIDI6IHJlc3VsdC5wdXNoKHZhbCk7ICAgICAgICAgICAgICAgLy8gZmlsdGVyXHJcbiAgICAgICAgfSBlbHNlIGlmKGlzRXZlcnkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAgLy8gZXZlcnlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlzRmluZEluZGV4ID8gLTEgOiBpc1NvbWUgfHwgaXNFdmVyeSA/IGlzRXZlcnkgOiByZXN1bHQ7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5Q29udGFpbnMoaXNDb250YWlucyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpO1xyXG4gICAgaWYoaXNDb250YWlucyAmJiBlbCAhPSBlbCl7XHJcbiAgICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoc2FtZU5hTihPW2luZGV4XSkpcmV0dXJuIGlzQ29udGFpbnMgfHwgaW5kZXg7XHJcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihpc0NvbnRhaW5zIHx8IGluZGV4IGluIE8pe1xyXG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIGlzQ29udGFpbnMgfHwgaW5kZXg7XHJcbiAgICB9IHJldHVybiAhaXNDb250YWlucyAmJiAtMTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJpYyhBLCBCKXtcclxuICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIHZzIGlzRnVuY3Rpb25cclxuICByZXR1cm4gdHlwZW9mIEEgPT0gJ2Z1bmN0aW9uJyA/IEEgOiBCO1xyXG59XHJcblxyXG4vLyBNYXRoXHJcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gMHgxZmZmZmZmZmZmZmZmZiAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXHJcbiAgLCBwb3cgICAgPSBNYXRoLnBvd1xyXG4gICwgYWJzICAgID0gTWF0aC5hYnNcclxuICAsIGNlaWwgICA9IE1hdGguY2VpbFxyXG4gICwgZmxvb3IgID0gTWF0aC5mbG9vclxyXG4gICwgbWF4ICAgID0gTWF0aC5tYXhcclxuICAsIG1pbiAgICA9IE1hdGgubWluXHJcbiAgLCByYW5kb20gPSBNYXRoLnJhbmRvbVxyXG4gICwgdHJ1bmMgID0gTWF0aC50cnVuYyB8fCBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHJldHVybiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XHJcbiAgICB9XHJcbi8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXHJcbmZ1bmN0aW9uIHNhbWVOYU4obnVtYmVyKXtcclxuICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcclxufVxyXG4vLyA3LjEuNCBUb0ludGVnZXJcclxuZnVuY3Rpb24gdG9JbnRlZ2VyKGl0KXtcclxuICByZXR1cm4gaXNOYU4oaXQpID8gMCA6IHRydW5jKGl0KTtcclxufVxyXG4vLyA3LjEuMTUgVG9MZW5ndGhcclxuZnVuY3Rpb24gdG9MZW5ndGgoaXQpe1xyXG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgTUFYX1NBRkVfSU5URUdFUikgOiAwO1xyXG59XHJcbmZ1bmN0aW9uIHRvSW5kZXgoaW5kZXgsIGxlbmd0aCl7XHJcbiAgdmFyIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcclxuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcclxufVxyXG5mdW5jdGlvbiBseihudW0pe1xyXG4gIHJldHVybiBudW0gPiA5ID8gbnVtIDogJzAnICsgbnVtO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVSZXBsYWNlcihyZWdFeHAsIHJlcGxhY2UsIGlzU3RhdGljKXtcclxuICB2YXIgcmVwbGFjZXIgPSBpc09iamVjdChyZXBsYWNlKSA/IGZ1bmN0aW9uKHBhcnQpe1xyXG4gICAgcmV0dXJuIHJlcGxhY2VbcGFydF07XHJcbiAgfSA6IHJlcGxhY2U7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBTdHJpbmcoaXNTdGF0aWMgPyBpdCA6IHRoaXMpLnJlcGxhY2UocmVnRXhwLCByZXBsYWNlcik7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZVBvaW50QXQodG9TdHJpbmcpe1xyXG4gIHJldHVybiBmdW5jdGlvbihwb3Mpe1xyXG4gICAgdmFyIHMgPSBTdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcclxuICAgICAgLCBsID0gcy5sZW5ndGhcclxuICAgICAgLCBhLCBiO1xyXG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiB0b1N0cmluZyA/ICcnIDogdW5kZWZpbmVkO1xyXG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcclxuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXHJcbiAgICAgID8gdG9TdHJpbmcgPyBzLmNoYXJBdChpKSA6IGFcclxuICAgICAgOiB0b1N0cmluZyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcclxuICB9XHJcbn1cclxuXHJcbi8vIEFzc2VydGlvbiAmIGVycm9yc1xyXG52YXIgUkVEVUNFX0VSUk9SID0gJ1JlZHVjZSBvZiBlbXB0eSBvYmplY3Qgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XHJcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0RGVmaW5lZChpdCl7XHJcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcignRnVuY3Rpb24gY2FsbGVkIG9uIG51bGwgb3IgdW5kZWZpbmVkJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydEZ1bmN0aW9uKGl0KXtcclxuICBhc3NlcnQoaXNGdW5jdGlvbihpdCksIGl0LCAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnRPYmplY3QoaXQpe1xyXG4gIGFzc2VydChpc09iamVjdChpdCksIGl0LCAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydEluc3RhbmNlKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XHJcbiAgYXNzZXJ0KGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IsIG5hbWUsIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcclxufVxyXG5cclxuLy8gUHJvcGVydHkgZGVzY3JpcHRvcnMgJiBTeW1ib2xcclxuZnVuY3Rpb24gZGVzY3JpcHRvcihiaXRtYXAsIHZhbHVlKXtcclxuICByZXR1cm4ge1xyXG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxyXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxyXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxyXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xyXG4gIHJldHVybiBvYmplY3Q7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlRGVmaW5lcihiaXRtYXApe1xyXG4gIHJldHVybiBERVNDID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwgZGVzY3JpcHRvcihiaXRtYXAsIHZhbHVlKSk7XHJcbiAgfSA6IHNpbXBsZVNldDtcclxufVxyXG5mdW5jdGlvbiB1aWQoa2V5KXtcclxuICByZXR1cm4gU1lNQk9MICsgJygnICsga2V5ICsgJylfJyArICgrK3NpZCArIHJhbmRvbSgpKVtUT19TVFJJTkddKDM2KTtcclxufVxyXG5mdW5jdGlvbiBnZXRXZWxsS25vd25TeW1ib2wobmFtZSwgc2V0dGVyKXtcclxuICByZXR1cm4gKFN5bWJvbCAmJiBTeW1ib2xbbmFtZV0pIHx8IChzZXR0ZXIgPyBTeW1ib2wgOiBzYWZlU3ltYm9sKShTWU1CT0wgKyBET1QgKyBuYW1lKTtcclxufVxyXG4vLyBUaGUgZW5naW5lIHdvcmtzIGZpbmUgd2l0aCBkZXNjcmlwdG9ycz8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eS5cclxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyIH19KS5hID09IDI7XHJcbiAgICAgIH0gY2F0Y2goZSl7fVxyXG4gICAgfSgpXHJcbiAgLCBzaWQgICAgPSAwXHJcbiAgLCBoaWRkZW4gPSBjcmVhdGVEZWZpbmVyKDEpXHJcbiAgLCBzZXQgICAgPSBTeW1ib2wgPyBzaW1wbGVTZXQgOiBoaWRkZW5cclxuICAsIHNhZmVTeW1ib2wgPSBTeW1ib2wgfHwgdWlkO1xyXG5mdW5jdGlvbiBhc3NpZ25IaWRkZW4odGFyZ2V0LCBzcmMpe1xyXG4gIGZvcih2YXIga2V5IGluIHNyYyloaWRkZW4odGFyZ2V0LCBrZXksIHNyY1trZXldKTtcclxuICByZXR1cm4gdGFyZ2V0O1xyXG59XHJcblxyXG52YXIgU1lNQk9MX1VOU0NPUEFCTEVTID0gZ2V0V2VsbEtub3duU3ltYm9sKCd1bnNjb3BhYmxlcycpXHJcbiAgLCBBcnJheVVuc2NvcGFibGVzICAgPSBBcnJheVByb3RvW1NZTUJPTF9VTlNDT1BBQkxFU10gfHwge31cclxuICAsIFNZTUJPTF9UQUcgICAgICAgICA9IGdldFdlbGxLbm93blN5bWJvbChUT19TVFJJTkdfVEFHKVxyXG4gICwgU1lNQk9MX1NQRUNJRVMgICAgID0gZ2V0V2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJylcclxuICAsIFNZTUJPTF9JVEVSQVRPUjtcclxuZnVuY3Rpb24gc2V0U3BlY2llcyhDKXtcclxuICBpZihERVNDICYmIChmcmFtZXdvcmsgfHwgIWlzTmF0aXZlKEMpKSlkZWZpbmVQcm9wZXJ0eShDLCBTWU1CT0xfU1BFQ0lFUywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiByZXR1cm5UaGlzXHJcbiAgfSk7XHJcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29tbW9uLmV4cG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIE5PREUgPSBjb2YocHJvY2VzcykgPT0gUFJPQ0VTU1xyXG4gICwgY29yZSA9IHt9XHJcbiAgLCBwYXRoID0gZnJhbWV3b3JrID8gZ2xvYmFsIDogY29yZVxyXG4gICwgb2xkICA9IGdsb2JhbC5jb3JlXHJcbiAgLCBleHBvcnRHbG9iYWxcclxuICAvLyB0eXBlIGJpdG1hcFxyXG4gICwgRk9SQ0VEID0gMVxyXG4gICwgR0xPQkFMID0gMlxyXG4gICwgU1RBVElDID0gNFxyXG4gICwgUFJPVE8gID0gOFxyXG4gICwgQklORCAgID0gMTZcclxuICAsIFdSQVAgICA9IDMyO1xyXG5mdW5jdGlvbiAkZGVmaW5lKHR5cGUsIG5hbWUsIHNvdXJjZSl7XHJcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxyXG4gICAgLCBpc0dsb2JhbCA9IHR5cGUgJiBHTE9CQUxcclxuICAgICwgdGFyZ2V0ICAgPSBpc0dsb2JhbCA/IGdsb2JhbCA6ICh0eXBlICYgU1RBVElDKVxyXG4gICAgICAgID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCBPYmplY3RQcm90bylbUFJPVE9UWVBFXVxyXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XHJcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcclxuICBmb3Ioa2V5IGluIHNvdXJjZSl7XHJcbiAgICAvLyB0aGVyZSBpcyBhIHNpbWlsYXIgbmF0aXZlXHJcbiAgICBvd24gPSAhKHR5cGUgJiBGT1JDRUQpICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0XHJcbiAgICAgICYmICghaXNGdW5jdGlvbih0YXJnZXRba2V5XSkgfHwgaXNOYXRpdmUodGFyZ2V0W2tleV0pKTtcclxuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXHJcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xyXG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXHJcbiAgICBpZighZnJhbWV3b3JrICYmIGlzR2xvYmFsICYmICFpc0Z1bmN0aW9uKHRhcmdldFtrZXldKSlleHAgPSBzb3VyY2Vba2V5XTtcclxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XHJcbiAgICBlbHNlIGlmKHR5cGUgJiBCSU5EICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xyXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcclxuICAgIGVsc2UgaWYodHlwZSAmIFdSQVAgJiYgIWZyYW1ld29yayAmJiB0YXJnZXRba2V5XSA9PSBvdXQpe1xyXG4gICAgICBleHAgPSBmdW5jdGlvbihwYXJhbSl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBvdXQgPyBuZXcgb3V0KHBhcmFtKSA6IG91dChwYXJhbSk7XHJcbiAgICAgIH1cclxuICAgICAgZXhwW1BST1RPVFlQRV0gPSBvdXRbUFJPVE9UWVBFXTtcclxuICAgIH0gZWxzZSBleHAgPSB0eXBlICYgUFJPVE8gJiYgaXNGdW5jdGlvbihvdXQpID8gY3R4KGNhbGwsIG91dCkgOiBvdXQ7XHJcbiAgICAvLyBleHRlbmQgZ2xvYmFsXHJcbiAgICBpZihmcmFtZXdvcmsgJiYgdGFyZ2V0ICYmICFvd24pe1xyXG4gICAgICBpZihpc0dsb2JhbCl0YXJnZXRba2V5XSA9IG91dDtcclxuICAgICAgZWxzZSBkZWxldGUgdGFyZ2V0W2tleV0gJiYgaGlkZGVuKHRhcmdldCwga2V5LCBvdXQpO1xyXG4gICAgfVxyXG4gICAgLy8gZXhwb3J0XHJcbiAgICBpZihleHBvcnRzW2tleV0gIT0gb3V0KWhpZGRlbihleHBvcnRzLCBrZXksIGV4cCk7XHJcbiAgfVxyXG59XHJcbi8vIENvbW1vbkpTIGV4cG9ydFxyXG5pZih0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKW1vZHVsZS5leHBvcnRzID0gY29yZTtcclxuLy8gUmVxdWlyZUpTIGV4cG9ydFxyXG5lbHNlIGlmKGlzRnVuY3Rpb24oZGVmaW5lKSAmJiBkZWZpbmUuYW1kKWRlZmluZShmdW5jdGlvbigpe3JldHVybiBjb3JlfSk7XHJcbi8vIEV4cG9ydCB0byBnbG9iYWwgb2JqZWN0XHJcbmVsc2UgZXhwb3J0R2xvYmFsID0gdHJ1ZTtcclxuaWYoZXhwb3J0R2xvYmFsIHx8IGZyYW1ld29yayl7XHJcbiAgY29yZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKXtcclxuICAgIGdsb2JhbC5jb3JlID0gb2xkO1xyXG4gICAgcmV0dXJuIGNvcmU7XHJcbiAgfVxyXG4gIGdsb2JhbC5jb3JlID0gY29yZTtcclxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb21tb24uaXRlcmF0b3JzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5TWU1CT0xfSVRFUkFUT1IgPSBnZXRXZWxsS25vd25TeW1ib2woSVRFUkFUT1IpO1xyXG52YXIgSVRFUiAgPSBzYWZlU3ltYm9sKCdpdGVyJylcclxuICAsIEtFWSAgID0gMVxyXG4gICwgVkFMVUUgPSAyXHJcbiAgLCBJdGVyYXRvcnMgPSB7fVxyXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fVxyXG4gICAgLy8gU2FmYXJpIGhhcyBieWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxyXG4gICwgQlVHR1lfSVRFUkFUT1JTID0gJ2tleXMnIGluIEFycmF5UHJvdG8gJiYgISgnbmV4dCcgaW4gW10ua2V5cygpKTtcclxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcclxuc2V0SXRlcmF0b3IoSXRlcmF0b3JQcm90b3R5cGUsIHJldHVyblRoaXMpO1xyXG5mdW5jdGlvbiBzZXRJdGVyYXRvcihPLCB2YWx1ZSl7XHJcbiAgaGlkZGVuKE8sIFNZTUJPTF9JVEVSQVRPUiwgdmFsdWUpO1xyXG4gIC8vIEFkZCBpdGVyYXRvciBmb3IgRkYgaXRlcmF0b3IgcHJvdG9jb2xcclxuICBGRl9JVEVSQVRPUiBpbiBBcnJheVByb3RvICYmIGhpZGRlbihPLCBGRl9JVEVSQVRPUiwgdmFsdWUpO1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZUl0ZXJhdG9yKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0LCBwcm90byl7XHJcbiAgQ29uc3RydWN0b3JbUFJPVE9UWVBFXSA9IGNyZWF0ZShwcm90byB8fCBJdGVyYXRvclByb3RvdHlwZSwge25leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCl9KTtcclxuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcclxufVxyXG5mdW5jdGlvbiBkZWZpbmVJdGVyYXRvcihDb25zdHJ1Y3RvciwgTkFNRSwgdmFsdWUsIERFRkFVTFQpe1xyXG4gIHZhciBwcm90byA9IENvbnN0cnVjdG9yW1BST1RPVFlQRV1cclxuICAgICwgaXRlciAgPSBnZXQocHJvdG8sIFNZTUJPTF9JVEVSQVRPUikgfHwgZ2V0KHByb3RvLCBGRl9JVEVSQVRPUikgfHwgKERFRkFVTFQgJiYgZ2V0KHByb3RvLCBERUZBVUxUKSkgfHwgdmFsdWU7XHJcbiAgaWYoZnJhbWV3b3JrKXtcclxuICAgIC8vIERlZmluZSBpdGVyYXRvclxyXG4gICAgc2V0SXRlcmF0b3IocHJvdG8sIGl0ZXIpO1xyXG4gICAgaWYoaXRlciAhPT0gdmFsdWUpe1xyXG4gICAgICB2YXIgaXRlclByb3RvID0gZ2V0UHJvdG90eXBlT2YoaXRlci5jYWxsKG5ldyBDb25zdHJ1Y3RvcikpO1xyXG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXHJcbiAgICAgIHNldFRvU3RyaW5nVGFnKGl0ZXJQcm90bywgTkFNRSArICcgSXRlcmF0b3InLCB0cnVlKTtcclxuICAgICAgLy8gRkYgZml4XHJcbiAgICAgIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpICYmIHNldEl0ZXJhdG9yKGl0ZXJQcm90bywgcmV0dXJuVGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcclxuICBJdGVyYXRvcnNbTkFNRV0gPSBpdGVyO1xyXG4gIC8vIEZGICYgdjggZml4XHJcbiAgSXRlcmF0b3JzW05BTUUgKyAnIEl0ZXJhdG9yJ10gPSByZXR1cm5UaGlzO1xyXG4gIHJldHVybiBpdGVyO1xyXG59XHJcbmZ1bmN0aW9uIGRlZmluZVN0ZEl0ZXJhdG9ycyhCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VUKXtcclxuICBmdW5jdGlvbiBjcmVhdGVJdGVyKGtpbmQpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNyZWF0ZUl0ZXJhdG9yKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcclxuICB2YXIgZW50cmllcyA9IGNyZWF0ZUl0ZXIoS0VZK1ZBTFVFKVxyXG4gICAgLCB2YWx1ZXMgID0gY3JlYXRlSXRlcihWQUxVRSk7XHJcbiAgaWYoREVGQVVMVCA9PSBWQUxVRSl2YWx1ZXMgPSBkZWZpbmVJdGVyYXRvcihCYXNlLCBOQU1FLCB2YWx1ZXMsICd2YWx1ZXMnKTtcclxuICBlbHNlIGVudHJpZXMgPSBkZWZpbmVJdGVyYXRvcihCYXNlLCBOQU1FLCBlbnRyaWVzLCAnZW50cmllcycpO1xyXG4gIGlmKERFRkFVTFQpe1xyXG4gICAgJGRlZmluZShQUk9UTyArIEZPUkNFRCAqIEJVR0dZX0lURVJBVE9SUywgTkFNRSwge1xyXG4gICAgICBlbnRyaWVzOiBlbnRyaWVzLFxyXG4gICAgICBrZXlzOiBJU19TRVQgPyB2YWx1ZXMgOiBjcmVhdGVJdGVyKEtFWSksXHJcbiAgICAgIHZhbHVlczogdmFsdWVzXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gaXRlclJlc3VsdChkb25lLCB2YWx1ZSl7XHJcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XHJcbn1cclxuZnVuY3Rpb24gaXNJdGVyYWJsZShpdCl7XHJcbiAgdmFyIE8gICAgICA9IE9iamVjdChpdClcclxuICAgICwgU3ltYm9sID0gZ2xvYmFsW1NZTUJPTF1cclxuICAgICwgaGFzRXh0ID0gKFN5bWJvbCAmJiBTeW1ib2xbSVRFUkFUT1JdIHx8IEZGX0lURVJBVE9SKSBpbiBPO1xyXG4gIHJldHVybiBoYXNFeHQgfHwgU1lNQk9MX0lURVJBVE9SIGluIE8gfHwgaGFzKEl0ZXJhdG9ycywgY2xhc3NvZihPKSk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0SXRlcmF0b3IoaXQpe1xyXG4gIHZhciBTeW1ib2wgID0gZ2xvYmFsW1NZTUJPTF1cclxuICAgICwgZXh0ICAgICA9IGl0W1N5bWJvbCAmJiBTeW1ib2xbSVRFUkFUT1JdIHx8IEZGX0lURVJBVE9SXVxyXG4gICAgLCBnZXRJdGVyID0gZXh0IHx8IGl0W1NZTUJPTF9JVEVSQVRPUl0gfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcclxuICByZXR1cm4gYXNzZXJ0T2JqZWN0KGdldEl0ZXIuY2FsbChpdCkpO1xyXG59XHJcbmZ1bmN0aW9uIHN0ZXBDYWxsKGZuLCB2YWx1ZSwgZW50cmllcyl7XHJcbiAgcmV0dXJuIGVudHJpZXMgPyBpbnZva2UoZm4sIHZhbHVlKSA6IGZuKHZhbHVlKTtcclxufVxyXG5mdW5jdGlvbiBjaGVja0Rhbmdlckl0ZXJDbG9zaW5nKGZuKXtcclxuICB2YXIgZGFuZ2VyID0gdHJ1ZTtcclxuICB2YXIgTyA9IHtcclxuICAgIG5leHQ6IGZ1bmN0aW9uKCl7IHRocm93IDEgfSxcclxuICAgICdyZXR1cm4nOiBmdW5jdGlvbigpeyBkYW5nZXIgPSBmYWxzZSB9XHJcbiAgfTtcclxuICBPW1NZTUJPTF9JVEVSQVRPUl0gPSByZXR1cm5UaGlzO1xyXG4gIHRyeSB7XHJcbiAgICBmbihPKTtcclxuICB9IGNhdGNoKGUpe31cclxuICByZXR1cm4gZGFuZ2VyO1xyXG59XHJcbmZ1bmN0aW9uIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3Ipe1xyXG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XHJcbiAgaWYocmV0ICE9PSB1bmRlZmluZWQpcmV0LmNhbGwoaXRlcmF0b3IpO1xyXG59XHJcbmZ1bmN0aW9uIHNhZmVJdGVyQ2xvc2UoZXhlYywgaXRlcmF0b3Ipe1xyXG4gIHRyeSB7XHJcbiAgICBleGVjKGl0ZXJhdG9yKTtcclxuICB9IGNhdGNoKGUpe1xyXG4gICAgY2xvc2VJdGVyYXRvcihpdGVyYXRvcik7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBmb3JPZihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xyXG4gIHNhZmVJdGVyQ2xvc2UoZnVuY3Rpb24oaXRlcmF0b3Ipe1xyXG4gICAgdmFyIGYgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcclxuICAgICAgLCBzdGVwO1xyXG4gICAgd2hpbGUoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKWlmKHN0ZXBDYWxsKGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpID09PSBmYWxzZSl7XHJcbiAgICAgIHJldHVybiBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKTtcclxuICAgIH1cclxuICB9LCBnZXRJdGVyYXRvcihpdGVyYWJsZSkpO1xyXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5zeW1ib2wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cclxuIWZ1bmN0aW9uKFRBRywgU3ltYm9sUmVnaXN0cnksIEFsbFN5bWJvbHMsIHNldHRlcil7XHJcbiAgLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXHJcbiAgaWYoIWlzTmF0aXZlKFN5bWJvbCkpe1xyXG4gICAgU3ltYm9sID0gZnVuY3Rpb24oZGVzY3JpcHRpb24pe1xyXG4gICAgICBhc3NlcnQoISh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSwgU1lNQk9MICsgJyBpcyBub3QgYSAnICsgQ09OU1RSVUNUT1IpO1xyXG4gICAgICB2YXIgdGFnID0gdWlkKGRlc2NyaXB0aW9uKVxyXG4gICAgICAgICwgc3ltID0gc2V0KGNyZWF0ZShTeW1ib2xbUFJPVE9UWVBFXSksIFRBRywgdGFnKTtcclxuICAgICAgQWxsU3ltYm9sc1t0YWddID0gc3ltO1xyXG4gICAgICBERVNDICYmIHNldHRlciAmJiBkZWZpbmVQcm9wZXJ0eShPYmplY3RQcm90bywgdGFnLCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgaGlkZGVuKHRoaXMsIHRhZywgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBzeW07XHJcbiAgICB9XHJcbiAgICBoaWRkZW4oU3ltYm9sW1BST1RPVFlQRV0sIFRPX1NUUklORywgZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIHRoaXNbVEFHXTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAkZGVmaW5lKEdMT0JBTCArIFdSQVAsIHtTeW1ib2w6IFN5bWJvbH0pO1xyXG4gIFxyXG4gIHZhciBzeW1ib2xTdGF0aWNzID0ge1xyXG4gICAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXHJcbiAgICAnZm9yJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxyXG4gICAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxyXG4gICAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9IFN5bWJvbChrZXkpO1xyXG4gICAgfSxcclxuICAgIC8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxyXG4gICAgaXRlcmF0b3I6IFNZTUJPTF9JVEVSQVRPUiB8fCBnZXRXZWxsS25vd25TeW1ib2woSVRFUkFUT1IpLFxyXG4gICAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXHJcbiAgICBrZXlGb3I6IHBhcnQuY2FsbChrZXlPZiwgU3ltYm9sUmVnaXN0cnkpLFxyXG4gICAgLy8gMTkuNC4yLjEwIFN5bWJvbC5zcGVjaWVzXHJcbiAgICBzcGVjaWVzOiBTWU1CT0xfU1BFQ0lFUyxcclxuICAgIC8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcclxuICAgIHRvU3RyaW5nVGFnOiBTWU1CT0xfVEFHID0gZ2V0V2VsbEtub3duU3ltYm9sKFRPX1NUUklOR19UQUcsIHRydWUpLFxyXG4gICAgLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xyXG4gICAgdW5zY29wYWJsZXM6IFNZTUJPTF9VTlNDT1BBQkxFUyxcclxuICAgIHB1cmU6IHNhZmVTeW1ib2wsXHJcbiAgICBzZXQ6IHNldCxcclxuICAgIHVzZVNldHRlcjogZnVuY3Rpb24oKXtzZXR0ZXIgPSB0cnVlfSxcclxuICAgIHVzZVNpbXBsZTogZnVuY3Rpb24oKXtzZXR0ZXIgPSBmYWxzZX1cclxuICB9O1xyXG4gIC8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxyXG4gIC8vIDE5LjQuMi4zIFN5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVcclxuICAvLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcclxuICAvLyAxOS40LjIuOCBTeW1ib2wucmVwbGFjZVxyXG4gIC8vIDE5LjQuMi45IFN5bWJvbC5zZWFyY2hcclxuICAvLyAxOS40LjIuMTEgU3ltYm9sLnNwbGl0XHJcbiAgLy8gMTkuNC4yLjEyIFN5bWJvbC50b1ByaW1pdGl2ZVxyXG4gIGZvckVhY2guY2FsbChhcnJheSgnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwbGl0LHRvUHJpbWl0aXZlJyksXHJcbiAgICBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gZ2V0V2VsbEtub3duU3ltYm9sKGl0KTtcclxuICAgIH1cclxuICApO1xyXG4gICRkZWZpbmUoU1RBVElDLCBTWU1CT0wsIHN5bWJvbFN0YXRpY3MpO1xyXG4gIFxyXG4gIHNldFRvU3RyaW5nVGFnKFN5bWJvbCwgU1lNQk9MKTtcclxuICBcclxuICAkZGVmaW5lKFNUQVRJQyArIEZPUkNFRCAqICFpc05hdGl2ZShTeW1ib2wpLCBPQkpFQ1QsIHtcclxuICAgIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXHJcbiAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHZhciBuYW1lcyA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSksIHJlc3VsdCA9IFtdLCBrZXksIGkgPSAwO1xyXG4gICAgICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSxcclxuICAgIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcclxuICAgIGdldE93blByb3BlcnR5U3ltYm9sczogZnVuY3Rpb24oaXQpe1xyXG4gICAgICB2YXIgbmFtZXMgPSBnZXROYW1lcyh0b09iamVjdChpdCkpLCByZXN1bHQgPSBbXSwga2V5LCBpID0gMDtcclxuICAgICAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSloYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICAvLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXHJcbiAgc2V0VG9TdHJpbmdUYWcoTWF0aCwgTUFUSCwgdHJ1ZSk7XHJcbiAgLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cclxuICBzZXRUb1N0cmluZ1RhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTtcclxufShzYWZlU3ltYm9sKCd0YWcnKSwge30sIHt9LCB0cnVlKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm9iamVjdC5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgdmFyIG9iamVjdFN0YXRpYyA9IHtcclxuICAgIC8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXHJcbiAgICBhc3NpZ246IGFzc2lnbixcclxuICAgIC8vIDE5LjEuMy4xMCBPYmplY3QuaXModmFsdWUxLCB2YWx1ZTIpXHJcbiAgICBpczogZnVuY3Rpb24oeCwgeSl7XHJcbiAgICAgIHJldHVybiB4ID09PSB5ID8geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHkgOiB4ICE9IHggJiYgeSAhPSB5O1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLy8gMTkuMS4zLjE5IE9iamVjdC5zZXRQcm90b3R5cGVPZihPLCBwcm90bylcclxuICAvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29ya3Mgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXHJcbiAgJ19fcHJvdG9fXycgaW4gT2JqZWN0UHJvdG8gJiYgZnVuY3Rpb24oYnVnZ3ksIHNldCl7XHJcbiAgICB0cnkge1xyXG4gICAgICBzZXQgPSBjdHgoY2FsbCwgZ2V0T3duRGVzY3JpcHRvcihPYmplY3RQcm90bywgJ19fcHJvdG9fXycpLnNldCwgMik7XHJcbiAgICAgIHNldCh7fSwgQXJyYXlQcm90byk7XHJcbiAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWUgfVxyXG4gICAgb2JqZWN0U3RhdGljLnNldFByb3RvdHlwZU9mID0gc2V0UHJvdG90eXBlT2YgPSBzZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbihPLCBwcm90byl7XHJcbiAgICAgIGFzc2VydE9iamVjdChPKTtcclxuICAgICAgYXNzZXJ0KHByb3RvID09PSBudWxsIHx8IGlzT2JqZWN0KHByb3RvKSwgcHJvdG8sIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcclxuICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcclxuICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xyXG4gICAgICByZXR1cm4gTztcclxuICAgIH1cclxuICB9KCk7XHJcbiAgJGRlZmluZShTVEFUSUMsIE9CSkVDVCwgb2JqZWN0U3RhdGljKTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnByb3RvdHlwZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24odG1wKXtcclxuICAvLyAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcclxuICB0bXBbU1lNQk9MX1RBR10gPSBET1Q7XHJcbiAgaWYoY29mKHRtcCkgIT0gRE9UKWhpZGRlbihPYmplY3RQcm90bywgVE9fU1RSSU5HLCBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xyXG4gIH0pO1xyXG59KHt9KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgLy8gT2JqZWN0IHN0YXRpYyBtZXRob2RzIGFjY2VwdCBwcmltaXRpdmVzXHJcbiAgZnVuY3Rpb24gd3JhcE9iamVjdE1ldGhvZChrZXksIE1PREUpe1xyXG4gICAgdmFyIGZuICA9IE9iamVjdFtrZXldXHJcbiAgICAgICwgZXhwID0gY29yZVtPQkpFQ1RdW2tleV1cclxuICAgICAgLCBmICAgPSAwXHJcbiAgICAgICwgbyAgID0ge307XHJcbiAgICBpZighZXhwIHx8IGlzTmF0aXZlKGV4cCkpe1xyXG4gICAgICBvW2tleV0gPSBNT0RFID09IDEgPyBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xyXG4gICAgICB9IDogTU9ERSA9PSAyID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiB0cnVlO1xyXG4gICAgICB9IDogTU9ERSA9PSAzID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBmYWxzZTtcclxuICAgICAgfSA6IE1PREUgPT0gNCA/IGZ1bmN0aW9uKGl0LCBrZXkpe1xyXG4gICAgICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XHJcbiAgICAgIH0gOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSk7XHJcbiAgICAgIH07XHJcbiAgICAgIHRyeSB7IGZuKERPVCkgfVxyXG4gICAgICBjYXRjaChlKXsgZiA9IDEgfVxyXG4gICAgICAkZGVmaW5lKFNUQVRJQyArIEZPUkNFRCAqIGYsIE9CSkVDVCwgbyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2ZyZWV6ZScsIDEpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ3NlYWwnLCAxKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdwcmV2ZW50RXh0ZW5zaW9ucycsIDEpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2lzRnJvemVuJywgMik7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnaXNTZWFsZWQnLCAyKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdpc0V4dGVuc2libGUnLCAzKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCA0KTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdnZXRQcm90b3R5cGVPZicpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2tleXMnKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdnZXRPd25Qcm9wZXJ0eU5hbWVzJyk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LmZ1bmN0aW9uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKE5BTUUpe1xyXG4gIC8vIDE5LjIuNC4yIG5hbWVcclxuICBOQU1FIGluIEZ1bmN0aW9uUHJvdG8gfHwgKERFU0MgJiYgZGVmaW5lUHJvcGVydHkoRnVuY3Rpb25Qcm90bywgTkFNRSwge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgbWF0Y2ggPSBTdHJpbmcodGhpcykubWF0Y2goL15cXHMqZnVuY3Rpb24gKFteIChdKikvKVxyXG4gICAgICAgICwgbmFtZSAgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XHJcbiAgICAgIGhhcyh0aGlzLCBOQU1FKSB8fCBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBOQU1FLCBkZXNjcmlwdG9yKDUsIG5hbWUpKTtcclxuICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICB9LFxyXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIGhhcyh0aGlzLCBOQU1FKSB8fCBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBOQU1FLCBkZXNjcmlwdG9yKDAsIHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgfSkpO1xyXG59KCduYW1lJyk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5udW1iZXIuY29uc3RydWN0b3IgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbk51bWJlcignMG8xJykgJiYgTnVtYmVyKCcwYjEnKSB8fCBmdW5jdGlvbihfTnVtYmVyLCBOdW1iZXJQcm90byl7XHJcbiAgZnVuY3Rpb24gdG9OdW1iZXIoaXQpe1xyXG4gICAgaWYoaXNPYmplY3QoaXQpKWl0ID0gdG9QcmltaXRpdmUoaXQpO1xyXG4gICAgaWYodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIgJiYgaXQuY2hhckNvZGVBdCgwKSA9PSA0OCl7XHJcbiAgICAgIHZhciBiaW5hcnkgPSBmYWxzZTtcclxuICAgICAgc3dpdGNoKGl0LmNoYXJDb2RlQXQoMSkpe1xyXG4gICAgICAgIGNhc2UgNjYgOiBjYXNlIDk4ICA6IGJpbmFyeSA9IHRydWU7XHJcbiAgICAgICAgY2FzZSA3OSA6IGNhc2UgMTExIDogcmV0dXJuIHBhcnNlSW50KGl0LnNsaWNlKDIpLCBiaW5hcnkgPyAyIDogOCk7XHJcbiAgICAgIH1cclxuICAgIH0gcmV0dXJuICtpdDtcclxuICB9XHJcbiAgZnVuY3Rpb24gdG9QcmltaXRpdmUoaXQpe1xyXG4gICAgdmFyIGZuLCB2YWw7XHJcbiAgICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudmFsdWVPZikgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xyXG4gICAgaWYoaXNGdW5jdGlvbihmbiA9IGl0W1RPX1NUUklOR10pICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICAgIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIG51bWJlclwiKTtcclxuICB9XHJcbiAgTnVtYmVyID0gZnVuY3Rpb24gTnVtYmVyKGl0KXtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgTnVtYmVyID8gbmV3IF9OdW1iZXIodG9OdW1iZXIoaXQpKSA6IHRvTnVtYmVyKGl0KTtcclxuICB9XHJcbiAgZm9yRWFjaC5jYWxsKERFU0MgPyBnZXROYW1lcyhfTnVtYmVyKVxyXG4gIDogYXJyYXkoJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZJyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICBrZXkgaW4gTnVtYmVyIHx8IGRlZmluZVByb3BlcnR5KE51bWJlciwga2V5LCBnZXRPd25EZXNjcmlwdG9yKF9OdW1iZXIsIGtleSkpO1xyXG4gIH0pO1xyXG4gIE51bWJlcltQUk9UT1RZUEVdID0gTnVtYmVyUHJvdG87XHJcbiAgTnVtYmVyUHJvdG9bQ09OU1RSVUNUT1JdID0gTnVtYmVyO1xyXG4gIGhpZGRlbihnbG9iYWwsIE5VTUJFUiwgTnVtYmVyKTtcclxufShOdW1iZXIsIE51bWJlcltQUk9UT1RZUEVdKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm51bWJlci5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGlzSW50ZWdlcil7XHJcbiAgJGRlZmluZShTVEFUSUMsIE5VTUJFUiwge1xyXG4gICAgLy8gMjAuMS4yLjEgTnVtYmVyLkVQU0lMT05cclxuICAgIEVQU0lMT046IHBvdygyLCAtNTIpLFxyXG4gICAgLy8gMjAuMS4yLjIgTnVtYmVyLmlzRmluaXRlKG51bWJlcilcclxuICAgIGlzRmluaXRlOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHJldHVybiB0eXBlb2YgaXQgPT0gJ251bWJlcicgJiYgaXNGaW5pdGUoaXQpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxyXG4gICAgaXNJbnRlZ2VyOiBpc0ludGVnZXIsXHJcbiAgICAvLyAyMC4xLjIuNCBOdW1iZXIuaXNOYU4obnVtYmVyKVxyXG4gICAgaXNOYU46IHNhbWVOYU4sXHJcbiAgICAvLyAyMC4xLjIuNSBOdW1iZXIuaXNTYWZlSW50ZWdlcihudW1iZXIpXHJcbiAgICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbihudW1iZXIpe1xyXG4gICAgICByZXR1cm4gaXNJbnRlZ2VyKG51bWJlcikgJiYgYWJzKG51bWJlcikgPD0gTUFYX1NBRkVfSU5URUdFUjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4xLjIuNiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gICAgTUFYX1NBRkVfSU5URUdFUjogTUFYX1NBRkVfSU5URUdFUixcclxuICAgIC8vIDIwLjEuMi4xMCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxyXG4gICAgTUlOX1NBRkVfSU5URUdFUjogLU1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgICAvLyAyMC4xLjIuMTIgTnVtYmVyLnBhcnNlRmxvYXQoc3RyaW5nKVxyXG4gICAgcGFyc2VGbG9hdDogcGFyc2VGbG9hdCxcclxuICAgIC8vIDIwLjEuMi4xMyBOdW1iZXIucGFyc2VJbnQoc3RyaW5nLCByYWRpeClcclxuICAgIHBhcnNlSW50OiBwYXJzZUludFxyXG4gIH0pO1xyXG4vLyAyMC4xLjIuMyBOdW1iZXIuaXNJbnRlZ2VyKG51bWJlcilcclxufShOdW1iZXIuaXNJbnRlZ2VyIHx8IGZ1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gIWlzT2JqZWN0KGl0KSAmJiBpc0Zpbml0ZShpdCkgJiYgZmxvb3IoaXQpID09PSBpdDtcclxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5tYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVDTUFTY3JpcHQgNiBzaGltXHJcbiFmdW5jdGlvbigpe1xyXG4gIC8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcclxuICB2YXIgRSAgICA9IE1hdGguRVxyXG4gICAgLCBleHAgID0gTWF0aC5leHBcclxuICAgICwgbG9nICA9IE1hdGgubG9nXHJcbiAgICAsIHNxcnQgPSBNYXRoLnNxcnRcclxuICAgICwgc2lnbiA9IE1hdGguc2lnbiB8fCBmdW5jdGlvbih4KXtcclxuICAgICAgICByZXR1cm4gKHggPSAreCkgPT0gMCB8fCB4ICE9IHggPyB4IDogeCA8IDAgPyAtMSA6IDE7XHJcbiAgICAgIH07XHJcbiAgXHJcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gIGZ1bmN0aW9uIGFzaW5oKHgpe1xyXG4gICAgcmV0dXJuICFpc0Zpbml0ZSh4ID0gK3gpIHx8IHggPT0gMCA/IHggOiB4IDwgMCA/IC1hc2luaCgteCkgOiBsb2coeCArIHNxcnQoeCAqIHggKyAxKSk7XHJcbiAgfVxyXG4gIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbiAgZnVuY3Rpb24gZXhwbTEoeCl7XHJcbiAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiB4ID4gLTFlLTYgJiYgeCA8IDFlLTYgPyB4ICsgeCAqIHggLyAyIDogZXhwKHgpIC0gMTtcclxuICB9XHJcbiAgICBcclxuICAkZGVmaW5lKFNUQVRJQywgTUFUSCwge1xyXG4gICAgLy8gMjAuMi4yLjMgTWF0aC5hY29zaCh4KVxyXG4gICAgYWNvc2g6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPSAreCkgPCAxID8gTmFOIDogaXNGaW5pdGUoeCkgPyBsb2coeCAvIEUgKyBzcXJ0KHggKyAxKSAqIHNxcnQoeCAtIDEpIC8gRSkgKyAxIDogeDtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbiAgICBhc2luaDogYXNpbmgsXHJcbiAgICAvLyAyMC4yLjIuNyBNYXRoLmF0YW5oKHgpXHJcbiAgICBhdGFuaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IGxvZygoMSArIHgpIC8gKDEgLSB4KSkgLyAyO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi45IE1hdGguY2JydCh4KVxyXG4gICAgY2JydDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiBzaWduKHggPSAreCkgKiBwb3coYWJzKHgpLCAxIC8gMyk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjExIE1hdGguY2x6MzIoeClcclxuICAgIGNsejMyOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID4+Pj0gMCkgPyAzMiAtIHhbVE9fU1RSSU5HXSgyKS5sZW5ndGggOiAzMjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTIgTWF0aC5jb3NoKHgpXHJcbiAgICBjb3NoOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIChleHAoeCA9ICt4KSArIGV4cCgteCkpIC8gMjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxyXG4gICAgZXhwbTE6IGV4cG0xLFxyXG4gICAgLy8gMjAuMi4yLjE2IE1hdGguZnJvdW5kKHgpXHJcbiAgICAvLyBUT0RPOiBmYWxsYmFjayBmb3IgSUU5LVxyXG4gICAgZnJvdW5kOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoW3hdKVswXTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTcgTWF0aC5oeXBvdChbdmFsdWUxWywgdmFsdWUyWywg4oCmIF1dXSlcclxuICAgIGh5cG90OiBmdW5jdGlvbih2YWx1ZTEsIHZhbHVlMil7XHJcbiAgICAgIHZhciBzdW0gID0gMFxyXG4gICAgICAgICwgbGVuMSA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgICAsIGxlbjIgPSBsZW4xXHJcbiAgICAgICAgLCBhcmdzID0gQXJyYXkobGVuMSlcclxuICAgICAgICAsIGxhcmcgPSAtSW5maW5pdHlcclxuICAgICAgICAsIGFyZztcclxuICAgICAgd2hpbGUobGVuMS0tKXtcclxuICAgICAgICBhcmcgPSBhcmdzW2xlbjFdID0gK2FyZ3VtZW50c1tsZW4xXTtcclxuICAgICAgICBpZihhcmcgPT0gSW5maW5pdHkgfHwgYXJnID09IC1JbmZpbml0eSlyZXR1cm4gSW5maW5pdHk7XHJcbiAgICAgICAgaWYoYXJnID4gbGFyZylsYXJnID0gYXJnO1xyXG4gICAgICB9XHJcbiAgICAgIGxhcmcgPSBhcmcgfHwgMTtcclxuICAgICAgd2hpbGUobGVuMi0tKXN1bSArPSBwb3coYXJnc1tsZW4yXSAvIGxhcmcsIDIpO1xyXG4gICAgICByZXR1cm4gbGFyZyAqIHNxcnQoc3VtKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTggTWF0aC5pbXVsKHgsIHkpXHJcbiAgICBpbXVsOiBmdW5jdGlvbih4LCB5KXtcclxuICAgICAgdmFyIFVJbnQxNiA9IDB4ZmZmZlxyXG4gICAgICAgICwgeG4gPSAreFxyXG4gICAgICAgICwgeW4gPSAreVxyXG4gICAgICAgICwgeGwgPSBVSW50MTYgJiB4blxyXG4gICAgICAgICwgeWwgPSBVSW50MTYgJiB5bjtcclxuICAgICAgcmV0dXJuIDAgfCB4bCAqIHlsICsgKChVSW50MTYgJiB4biA+Pj4gMTYpICogeWwgKyB4bCAqIChVSW50MTYgJiB5biA+Pj4gMTYpIDw8IDE2ID4+PiAwKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjAgTWF0aC5sb2cxcCh4KVxyXG4gICAgbG9nMXA6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPSAreCkgPiAtMWUtOCAmJiB4IDwgMWUtOCA/IHggLSB4ICogeCAvIDIgOiBsb2coMSArIHgpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yMSBNYXRoLmxvZzEwKHgpXHJcbiAgICBsb2cxMDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMTA7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjIyIE1hdGgubG9nMih4KVxyXG4gICAgbG9nMjogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXHJcbiAgICBzaWduOiBzaWduLFxyXG4gICAgLy8gMjAuMi4yLjMwIE1hdGguc2luaCh4KVxyXG4gICAgc2luaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoYWJzKHggPSAreCkgPCAxKSA/IChleHBtMSh4KSAtIGV4cG0xKC14KSkgLyAyIDogKGV4cCh4IC0gMSkgLSBleHAoLXggLSAxKSkgKiAoRSAvIDIpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4zMyBNYXRoLnRhbmgoeClcclxuICAgIHRhbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICB2YXIgYSA9IGV4cG0xKHggPSAreClcclxuICAgICAgICAsIGIgPSBleHBtMSgteCk7XHJcbiAgICAgIHJldHVybiBhID09IEluZmluaXR5ID8gMSA6IGIgPT0gSW5maW5pdHkgPyAtMSA6IChhIC0gYikgLyAoZXhwKHgpICsgZXhwKC14KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjM0IE1hdGgudHJ1bmMoeClcclxuICAgIHRydW5jOiB0cnVuY1xyXG4gIH0pO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5zdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihmcm9tQ2hhckNvZGUpe1xyXG4gIGZ1bmN0aW9uIGFzc2VydE5vdFJlZ0V4cChpdCl7XHJcbiAgICBpZihjb2YoaXQpID09IFJFR0VYUCl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICB9XHJcbiAgXHJcbiAgJGRlZmluZShTVEFUSUMsIFNUUklORywge1xyXG4gICAgLy8gMjEuMS4yLjIgU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cylcclxuICAgIGZyb21Db2RlUG9pbnQ6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICB2YXIgcmVzID0gW11cclxuICAgICAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgICAsIGkgICA9IDBcclxuICAgICAgICAsIGNvZGVcclxuICAgICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgICAgY29kZSA9ICthcmd1bWVudHNbaSsrXTtcclxuICAgICAgICBpZih0b0luZGV4KGNvZGUsIDB4MTBmZmZmKSAhPT0gY29kZSl0aHJvdyBSYW5nZUVycm9yKGNvZGUgKyAnIGlzIG5vdCBhIHZhbGlkIGNvZGUgcG9pbnQnKTtcclxuICAgICAgICByZXMucHVzaChjb2RlIDwgMHgxMDAwMFxyXG4gICAgICAgICAgPyBmcm9tQ2hhckNvZGUoY29kZSlcclxuICAgICAgICAgIDogZnJvbUNoYXJDb2RlKCgoY29kZSAtPSAweDEwMDAwKSA+PiAxMCkgKyAweGQ4MDAsIGNvZGUgJSAweDQwMCArIDB4ZGMwMClcclxuICAgICAgICApO1xyXG4gICAgICB9IHJldHVybiByZXMuam9pbignJyk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4yLjQgU3RyaW5nLnJhdyhjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucylcclxuICAgIHJhdzogZnVuY3Rpb24oY2FsbFNpdGUpe1xyXG4gICAgICB2YXIgcmF3ID0gdG9PYmplY3QoY2FsbFNpdGUucmF3KVxyXG4gICAgICAgICwgbGVuID0gdG9MZW5ndGgocmF3Lmxlbmd0aClcclxuICAgICAgICAsIHNsbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgICAsIHJlcyA9IFtdXHJcbiAgICAgICAgLCBpICAgPSAwO1xyXG4gICAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgICByZXMucHVzaChTdHJpbmcocmF3W2krK10pKTtcclxuICAgICAgICBpZihpIDwgc2xuKXJlcy5wdXNoKFN0cmluZyhhcmd1bWVudHNbaV0pKTtcclxuICAgICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gICRkZWZpbmUoUFJPVE8sIFNUUklORywge1xyXG4gICAgLy8gMjEuMS4zLjMgU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdChwb3MpXHJcbiAgICBjb2RlUG9pbnRBdDogY3JlYXRlUG9pbnRBdChmYWxzZSksXHJcbiAgICAvLyAyMS4xLjMuNiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKHNlYXJjaFN0cmluZyBbLCBlbmRQb3NpdGlvbl0pXHJcbiAgICBlbmRzV2l0aDogZnVuY3Rpb24oc2VhcmNoU3RyaW5nIC8qLCBlbmRQb3NpdGlvbiA9IEBsZW5ndGggKi8pe1xyXG4gICAgICBhc3NlcnROb3RSZWdFeHAoc2VhcmNoU3RyaW5nKTtcclxuICAgICAgdmFyIHRoYXQgPSBTdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGVuZFBvc2l0aW9uID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgLCBsZW4gPSB0b0xlbmd0aCh0aGF0Lmxlbmd0aClcclxuICAgICAgICAsIGVuZCA9IGVuZFBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBsZW4gOiBtaW4odG9MZW5ndGgoZW5kUG9zaXRpb24pLCBsZW4pO1xyXG4gICAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XHJcbiAgICAgIHJldHVybiB0aGF0LnNsaWNlKGVuZCAtIHNlYXJjaFN0cmluZy5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cmluZztcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjMuNyBTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKHNlYXJjaFN0cmluZywgcG9zaXRpb24gPSAwKVxyXG4gICAgaW5jbHVkZXM6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcclxuICAgICAgYXNzZXJ0Tm90UmVnRXhwKHNlYXJjaFN0cmluZyk7XHJcbiAgICAgIHJldHVybiAhIX5TdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSkuaW5kZXhPZihzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4zLjEzIFN0cmluZy5wcm90b3R5cGUucmVwZWF0KGNvdW50KVxyXG4gICAgcmVwZWF0OiBmdW5jdGlvbihjb3VudCl7XHJcbiAgICAgIHZhciBzdHIgPSBTdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIHJlcyA9ICcnXHJcbiAgICAgICAgLCBuICAgPSB0b0ludGVnZXIoY291bnQpO1xyXG4gICAgICBpZigwID4gbiB8fCBuID09IEluZmluaXR5KXRocm93IFJhbmdlRXJyb3IoXCJDb3VudCBjYW4ndCBiZSBuZWdhdGl2ZVwiKTtcclxuICAgICAgZm9yKDtuID4gMDsgKG4gPj4+PSAxKSAmJiAoc3RyICs9IHN0cikpaWYobiAmIDEpcmVzICs9IHN0cjtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjMuMTggU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKHNlYXJjaFN0cmluZyBbLCBwb3NpdGlvbiBdKVxyXG4gICAgc3RhcnRzV2l0aDogZnVuY3Rpb24oc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xyXG4gICAgICBhc3NlcnROb3RSZWdFeHAoc2VhcmNoU3RyaW5nKTtcclxuICAgICAgdmFyIHRoYXQgID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBpbmRleCA9IHRvTGVuZ3RoKG1pbihhcmd1bWVudHNbMV0sIHRoYXQubGVuZ3RoKSk7XHJcbiAgICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgICAgcmV0dXJuIHRoYXQuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoU3RyaW5nLmxlbmd0aCkgPT09IHNlYXJjaFN0cmluZztcclxuICAgIH1cclxuICB9KTtcclxufShTdHJpbmcuZnJvbUNoYXJDb2RlKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LmFycmF5LnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgJGRlZmluZShTVEFUSUMgKyBGT1JDRUQgKiBjaGVja0Rhbmdlckl0ZXJDbG9zaW5nKEFycmF5LmZyb20pLCBBUlJBWSwge1xyXG4gICAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZnJvbTogZnVuY3Rpb24oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xyXG4gICAgICB2YXIgTyAgICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKGFycmF5TGlrZSkpXHJcbiAgICAgICAgLCBtYXBmbiAgID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxyXG4gICAgICAgICwgZiAgICAgICA9IG1hcHBpbmcgPyBjdHgobWFwZm4sIGFyZ3VtZW50c1syXSwgMikgOiB1bmRlZmluZWRcclxuICAgICAgICAsIGluZGV4ICAgPSAwXHJcbiAgICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcDtcclxuICAgICAgaWYoaXNJdGVyYWJsZShPKSl7XHJcbiAgICAgICAgcmVzdWx0ID0gbmV3IChnZW5lcmljKHRoaXMsIEFycmF5KSk7XHJcbiAgICAgICAgc2FmZUl0ZXJDbG9zZShmdW5jdGlvbihpdGVyYXRvcil7XHJcbiAgICAgICAgICBmb3IoOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xyXG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGYoc3RlcC52YWx1ZSwgaW5kZXgpIDogc3RlcC52YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBnZXRJdGVyYXRvcihPKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0ID0gbmV3IChnZW5lcmljKHRoaXMsIEFycmF5KSkobGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpKTtcclxuICAgICAgICBmb3IoOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XHJcbiAgICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGYoT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXN1bHQubGVuZ3RoID0gaW5kZXg7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgJGRlZmluZShTVEFUSUMsIEFSUkFZLCB7XHJcbiAgICAvLyAyMi4xLjIuMyBBcnJheS5vZiggLi4uaXRlbXMpXHJcbiAgICBvZjogZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICAgIHZhciBpbmRleCAgPSAwXHJcbiAgICAgICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCByZXN1bHQgPSBuZXcgKGdlbmVyaWModGhpcywgQXJyYXkpKShsZW5ndGgpO1xyXG4gICAgICB3aGlsZShsZW5ndGggPiBpbmRleClyZXN1bHRbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4KytdO1xyXG4gICAgICByZXN1bHQubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIHNldFNwZWNpZXMoQXJyYXkpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5hcnJheS5wcm90b3R5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gICRkZWZpbmUoUFJPVE8sIEFSUkFZLCB7XHJcbiAgICAvLyAyMi4xLjMuMyBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbih0YXJnZXQsIHN0YXJ0LCBlbmQgPSB0aGlzLmxlbmd0aClcclxuICAgIGNvcHlXaXRoaW46IGZ1bmN0aW9uKHRhcmdldCAvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICAgIHZhciBPICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgbGVuICAgPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgICAsIHRvICAgID0gdG9JbmRleCh0YXJnZXQsIGxlbilcclxuICAgICAgICAsIGZyb20gID0gdG9JbmRleChzdGFydCwgbGVuKVxyXG4gICAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgICAsIGZpbiAgID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB0b0luZGV4KGVuZCwgbGVuKVxyXG4gICAgICAgICwgY291bnQgPSBtaW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pXHJcbiAgICAgICAgLCBpbmMgICA9IDE7XHJcbiAgICAgIGlmKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCl7XHJcbiAgICAgICAgaW5jICA9IC0xO1xyXG4gICAgICAgIGZyb20gPSBmcm9tICsgY291bnQgLSAxO1xyXG4gICAgICAgIHRvICAgPSB0byArIGNvdW50IC0gMTtcclxuICAgICAgfVxyXG4gICAgICB3aGlsZShjb3VudC0tID4gMCl7XHJcbiAgICAgICAgaWYoZnJvbSBpbiBPKU9bdG9dID0gT1tmcm9tXTtcclxuICAgICAgICBlbHNlIGRlbGV0ZSBPW3RvXTtcclxuICAgICAgICB0byArPSBpbmM7XHJcbiAgICAgICAgZnJvbSArPSBpbmM7XHJcbiAgICAgIH0gcmV0dXJuIE87XHJcbiAgICB9LFxyXG4gICAgLy8gMjIuMS4zLjYgQXJyYXkucHJvdG90eXBlLmZpbGwodmFsdWUsIHN0YXJ0ID0gMCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgICBmaWxsOiBmdW5jdGlvbih2YWx1ZSAvKiwgc3RhcnQgPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcclxuICAgICAgdmFyIE8gICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGFyZ3VtZW50c1sxXSwgbGVuZ3RoKVxyXG4gICAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXHJcbiAgICAgICAgLCBlbmRQb3MgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW5kZXgoZW5kLCBsZW5ndGgpO1xyXG4gICAgICB3aGlsZShlbmRQb3MgPiBpbmRleClPW2luZGV4KytdID0gdmFsdWU7XHJcbiAgICAgIHJldHVybiBPO1xyXG4gICAgfSxcclxuICAgIC8vIDIyLjEuMy44IEFycmF5LnByb3RvdHlwZS5maW5kKHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZpbmQ6IGNyZWF0ZUFycmF5TWV0aG9kKDUpLFxyXG4gICAgLy8gMjIuMS4zLjkgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmaW5kSW5kZXg6IGNyZWF0ZUFycmF5TWV0aG9kKDYpXHJcbiAgfSk7XHJcbiAgXHJcbiAgaWYoZnJhbWV3b3JrKXtcclxuICAgIC8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cclxuICAgIGZvckVhY2guY2FsbChhcnJheSgnZmluZCxmaW5kSW5kZXgsZmlsbCxjb3B5V2l0aGluLGVudHJpZXMsa2V5cyx2YWx1ZXMnKSwgZnVuY3Rpb24oaXQpe1xyXG4gICAgICBBcnJheVVuc2NvcGFibGVzW2l0XSA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIFNZTUJPTF9VTlNDT1BBQkxFUyBpbiBBcnJheVByb3RvIHx8IGhpZGRlbihBcnJheVByb3RvLCBTWU1CT0xfVU5TQ09QQUJMRVMsIEFycmF5VW5zY29wYWJsZXMpO1xyXG4gIH1cclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuaXRlcmF0b3JzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oYXQpe1xyXG4gIC8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcclxuICAvLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxyXG4gIC8vIDIyLjEuMy4yOSBBcnJheS5wcm90b3R5cGUudmFsdWVzKClcclxuICAvLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxuICBkZWZpbmVTdGRJdGVyYXRvcnMoQXJyYXksIEFSUkFZLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XHJcbiAgICBzZXQodGhpcywgSVRFUiwge286IHRvT2JqZWN0KGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xyXG4gIC8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxyXG4gIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAgICwgTyAgICAgPSBpdGVyLm9cclxuICAgICAgLCBraW5kICA9IGl0ZXIua1xyXG4gICAgICAsIGluZGV4ID0gaXRlci5pKys7XHJcbiAgICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XHJcbiAgICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcclxuICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMSk7XHJcbiAgICB9XHJcbiAgICBpZihraW5kID09IEtFWSkgIHJldHVybiBpdGVyUmVzdWx0KDAsIGluZGV4KTtcclxuICAgIGlmKGtpbmQgPT0gVkFMVUUpcmV0dXJuIGl0ZXJSZXN1bHQoMCwgT1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XHJcbiAgfSwgVkFMVUUpO1xyXG4gIFxyXG4gIC8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcclxuICBJdGVyYXRvcnNbQVJHVU1FTlRTXSA9IEl0ZXJhdG9yc1tBUlJBWV07XHJcbiAgXHJcbiAgLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG4gIGRlZmluZVN0ZEl0ZXJhdG9ycyhTdHJpbmcsIFNUUklORywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtvOiBTdHJpbmcoaXRlcmF0ZWQpLCBpOiAwfSk7XHJcbiAgLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxyXG4gIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAgICwgTyAgICAgPSBpdGVyLm9cclxuICAgICAgLCBpbmRleCA9IGl0ZXIuaVxyXG4gICAgICAsIHBvaW50O1xyXG4gICAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIGl0ZXJSZXN1bHQoMSk7XHJcbiAgICBwb2ludCA9IGF0LmNhbGwoTywgaW5kZXgpO1xyXG4gICAgaXRlci5pICs9IHBvaW50Lmxlbmd0aDtcclxuICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIHBvaW50KTtcclxuICB9KTtcclxufShjcmVhdGVQb2ludEF0KHRydWUpKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnJlZ2V4cCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuREVTQyAmJiAhZnVuY3Rpb24oUmVnRXhwUHJvdG8sIF9SZWdFeHApeyAgXHJcbiAgLy8gUmVnRXhwIGFsbG93cyBhIHJlZ2V4IHdpdGggZmxhZ3MgYXMgdGhlIHBhdHRlcm5cclxuICBpZighZnVuY3Rpb24oKXt0cnl7cmV0dXJuIFJlZ0V4cCgvYS9nLCAnaScpID09ICcvYS9pJ31jYXRjaChlKXt9fSgpKXtcclxuICAgIFJlZ0V4cCA9IGZ1bmN0aW9uIFJlZ0V4cChwYXR0ZXJuLCBmbGFncyl7XHJcbiAgICAgIHJldHVybiBuZXcgX1JlZ0V4cChjb2YocGF0dGVybikgPT0gUkVHRVhQICYmIGZsYWdzICE9PSB1bmRlZmluZWRcclxuICAgICAgICA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVybiwgZmxhZ3MpO1xyXG4gICAgfVxyXG4gICAgZm9yRWFjaC5jYWxsKGdldE5hbWVzKF9SZWdFeHApLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBrZXkgaW4gUmVnRXhwIHx8IGRlZmluZVByb3BlcnR5KFJlZ0V4cCwga2V5LCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIF9SZWdFeHBba2V5XSB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24oaXQpeyBfUmVnRXhwW2tleV0gPSBpdCB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBSZWdFeHBQcm90b1tDT05TVFJVQ1RPUl0gPSBSZWdFeHA7XHJcbiAgICBSZWdFeHBbUFJPVE9UWVBFXSA9IFJlZ0V4cFByb3RvO1xyXG4gICAgaGlkZGVuKGdsb2JhbCwgUkVHRVhQLCBSZWdFeHApO1xyXG4gIH1cclxuICBcclxuICAvLyAyMS4yLjUuMyBnZXQgUmVnRXhwLnByb3RvdHlwZS5mbGFncygpXHJcbiAgaWYoLy4vZy5mbGFncyAhPSAnZycpZGVmaW5lUHJvcGVydHkoUmVnRXhwUHJvdG8sICdmbGFncycsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogY3JlYXRlUmVwbGFjZXIoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxyXG4gIH0pO1xyXG4gIFxyXG4gIHNldFNwZWNpZXMoUmVnRXhwKTtcclxufShSZWdFeHBbUFJPVE9UWVBFXSwgUmVnRXhwKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogd2ViLmltbWVkaWF0ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gc2V0SW1tZWRpYXRlIHNoaW1cclxuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgZWxzZTpcclxuaXNGdW5jdGlvbihzZXRJbW1lZGlhdGUpICYmIGlzRnVuY3Rpb24oY2xlYXJJbW1lZGlhdGUpIHx8IGZ1bmN0aW9uKE9OUkVBRFlTVEFURUNIQU5HRSl7XHJcbiAgdmFyIHBvc3RNZXNzYWdlICAgICAgPSBnbG9iYWwucG9zdE1lc3NhZ2VcclxuICAgICwgYWRkRXZlbnRMaXN0ZW5lciA9IGdsb2JhbC5hZGRFdmVudExpc3RlbmVyXHJcbiAgICAsIE1lc3NhZ2VDaGFubmVsICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcclxuICAgICwgY291bnRlciAgICAgICAgICA9IDBcclxuICAgICwgcXVldWUgICAgICAgICAgICA9IHt9XHJcbiAgICAsIGRlZmVyLCBjaGFubmVsLCBwb3J0O1xyXG4gIHNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uKGZuKXtcclxuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xyXG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcclxuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xyXG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBkZWZlcihjb3VudGVyKTtcclxuICAgIHJldHVybiBjb3VudGVyO1xyXG4gIH1cclxuICBjbGVhckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGlkKXtcclxuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHJ1bihpZCl7XHJcbiAgICBpZihoYXMocXVldWUsIGlkKSl7XHJcbiAgICAgIHZhciBmbiA9IHF1ZXVlW2lkXTtcclxuICAgICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICAgICAgZm4oKTtcclxuICAgIH1cclxuICB9XHJcbiAgZnVuY3Rpb24gbGlzdG5lcihldmVudCl7XHJcbiAgICBydW4oZXZlbnQuZGF0YSk7XHJcbiAgfVxyXG4gIC8vIE5vZGUuanMgMC44LVxyXG4gIGlmKE5PREUpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIG5leHRUaWNrKHBhcnQuY2FsbChydW4sIGlkKSk7XHJcbiAgICB9XHJcbiAgLy8gTW9kZXJuIGJyb3dzZXJzLCBza2lwIGltcGxlbWVudGF0aW9uIGZvciBXZWJXb3JrZXJzXHJcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgb2JqZWN0XHJcbiAgfSBlbHNlIGlmKGFkZEV2ZW50TGlzdGVuZXIgJiYgaXNGdW5jdGlvbihwb3N0TWVzc2FnZSkgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBwb3N0TWVzc2FnZShpZCwgJyonKTtcclxuICAgIH1cclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0bmVyLCBmYWxzZSk7XHJcbiAgLy8gV2ViV29ya2Vyc1xyXG4gIH0gZWxzZSBpZihpc0Z1bmN0aW9uKE1lc3NhZ2VDaGFubmVsKSl7XHJcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xyXG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XHJcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RuZXI7XHJcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcclxuICAvLyBJRTgtXHJcbiAgfSBlbHNlIGlmKGRvY3VtZW50ICYmIE9OUkVBRFlTVEFURUNIQU5HRSBpbiBkb2N1bWVudFtDUkVBVEVfRUxFTUVOVF0oJ3NjcmlwdCcpKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBodG1sLmFwcGVuZENoaWxkKGRvY3VtZW50W0NSRUFURV9FTEVNRU5UXSgnc2NyaXB0JykpW09OUkVBRFlTVEFURUNIQU5HRV0gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgcnVuKGlkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXHJcbiAgfSBlbHNlIHtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBzZXRUaW1lb3V0KHJ1biwgMCwgaWQpO1xyXG4gICAgfVxyXG4gIH1cclxufSgnb25yZWFkeXN0YXRlY2hhbmdlJyk7XHJcbiRkZWZpbmUoR0xPQkFMICsgQklORCwge1xyXG4gIHNldEltbWVkaWF0ZTogICBzZXRJbW1lZGlhdGUsXHJcbiAgY2xlYXJJbW1lZGlhdGU6IGNsZWFySW1tZWRpYXRlXHJcbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYucHJvbWlzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFUzYgcHJvbWlzZXMgc2hpbVxyXG4vLyBCYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vZ2V0aWZ5L25hdGl2ZS1wcm9taXNlLW9ubHkvXHJcbiFmdW5jdGlvbihQcm9taXNlLCB0ZXN0KXtcclxuICBpc0Z1bmN0aW9uKFByb21pc2UpICYmIGlzRnVuY3Rpb24oUHJvbWlzZS5yZXNvbHZlKVxyXG4gICYmIFByb21pc2UucmVzb2x2ZSh0ZXN0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24oKXt9KSkgPT0gdGVzdFxyXG4gIHx8IGZ1bmN0aW9uKGFzYXAsIFJFQ09SRCl7XHJcbiAgICBmdW5jdGlvbiBpc1RoZW5hYmxlKGl0KXtcclxuICAgICAgdmFyIHRoZW47XHJcbiAgICAgIGlmKGlzT2JqZWN0KGl0KSl0aGVuID0gaXQudGhlbjtcclxuICAgICAgcmV0dXJuIGlzRnVuY3Rpb24odGhlbikgPyB0aGVuIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2Upe1xyXG4gICAgICB2YXIgcmVjb3JkID0gcHJvbWlzZVtSRUNPUkRdXHJcbiAgICAgICAgLCBjaGFpbiAgPSByZWNvcmQuY1xyXG4gICAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAgICwgcmVhY3Q7XHJcbiAgICAgIGlmKHJlY29yZC5oKXJldHVybiB0cnVlO1xyXG4gICAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXtcclxuICAgICAgICByZWFjdCA9IGNoYWluW2krK107XHJcbiAgICAgICAgaWYocmVhY3QuZmFpbCB8fCBoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHJlYWN0LlApKXJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBub3RpZnkocmVjb3JkLCByZWplY3Qpe1xyXG4gICAgICB2YXIgY2hhaW4gPSByZWNvcmQuYztcclxuICAgICAgaWYocmVqZWN0IHx8IGNoYWluLmxlbmd0aClhc2FwKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHByb21pc2UgPSByZWNvcmQucFxyXG4gICAgICAgICAgLCB2YWx1ZSAgID0gcmVjb3JkLnZcclxuICAgICAgICAgICwgb2sgICAgICA9IHJlY29yZC5zID09IDFcclxuICAgICAgICAgICwgaSAgICAgICA9IDA7XHJcbiAgICAgICAgaWYocmVqZWN0ICYmICFoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2UpKXtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoIWhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocHJvbWlzZSkpe1xyXG4gICAgICAgICAgICAgIGlmKE5PREUpe1xyXG4gICAgICAgICAgICAgICAgaWYoIXByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpKXtcclxuICAgICAgICAgICAgICAgICAgLy8gZGVmYXVsdCBub2RlLmpzIGJlaGF2aW9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oY29uc29sZS5lcnJvcikpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgMWUzKTtcclxuICAgICAgICB9IGVsc2Ugd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSkhZnVuY3Rpb24ocmVhY3Qpe1xyXG4gICAgICAgICAgdmFyIGNiID0gb2sgPyByZWFjdC5vayA6IHJlYWN0LmZhaWxcclxuICAgICAgICAgICAgLCByZXQsIHRoZW47XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZihjYil7XHJcbiAgICAgICAgICAgICAgaWYoIW9rKXJlY29yZC5oID0gdHJ1ZTtcclxuICAgICAgICAgICAgICByZXQgPSBjYiA9PT0gdHJ1ZSA/IHZhbHVlIDogY2IodmFsdWUpO1xyXG4gICAgICAgICAgICAgIGlmKHJldCA9PT0gcmVhY3QuUCl7XHJcbiAgICAgICAgICAgICAgICByZWFjdC5yZWooVHlwZUVycm9yKFBST01JU0UgKyAnLWNoYWluIGN5Y2xlJykpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZih0aGVuID0gaXNUaGVuYWJsZShyZXQpKXtcclxuICAgICAgICAgICAgICAgIHRoZW4uY2FsbChyZXQsIHJlYWN0LnJlcywgcmVhY3QucmVqKTtcclxuICAgICAgICAgICAgICB9IGVsc2UgcmVhY3QucmVzKHJldCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSByZWFjdC5yZWoodmFsdWUpO1xyXG4gICAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICByZWFjdC5yZWooZXJyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KGNoYWluW2krK10pO1xyXG4gICAgICAgIGNoYWluLmxlbmd0aCA9IDA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSl7XHJcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzXHJcbiAgICAgICAgLCB0aGVuLCB3cmFwcGVyO1xyXG4gICAgICBpZihyZWNvcmQuZClyZXR1cm47XHJcbiAgICAgIHJlY29yZC5kID0gdHJ1ZTtcclxuICAgICAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZih0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpe1xyXG4gICAgICAgICAgd3JhcHBlciA9IHtyOiByZWNvcmQsIGQ6IGZhbHNlfTsgLy8gd3JhcFxyXG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgocmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eChyZWplY3QsIHdyYXBwZXIsIDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcclxuICAgICAgICAgIHJlY29yZC5zID0gMTtcclxuICAgICAgICAgIG5vdGlmeShyZWNvcmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgIHJlamVjdC5jYWxsKHdyYXBwZXIgfHwge3I6IHJlY29yZCwgZDogZmFsc2V9LCBlcnIpOyAvLyB3cmFwXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSl7XHJcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzO1xyXG4gICAgICBpZihyZWNvcmQuZClyZXR1cm47XHJcbiAgICAgIHJlY29yZC5kID0gdHJ1ZTtcclxuICAgICAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcclxuICAgICAgcmVjb3JkLnMgPSAyO1xyXG4gICAgICBub3RpZnkocmVjb3JkLCB0cnVlKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldENvbnN0cnVjdG9yKEMpe1xyXG4gICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChDKVtTWU1CT0xfU1BFQ0lFU107XHJcbiAgICAgIHJldHVybiBTICE9IHVuZGVmaW5lZCA/IFMgOiBDO1xyXG4gICAgfVxyXG4gICAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcclxuICAgIFByb21pc2UgPSBmdW5jdGlvbihleGVjdXRvcil7XHJcbiAgICAgIGFzc2VydEZ1bmN0aW9uKGV4ZWN1dG9yKTtcclxuICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgUHJvbWlzZSwgUFJPTUlTRSk7XHJcbiAgICAgIHZhciByZWNvcmQgPSB7XHJcbiAgICAgICAgcDogdGhpcywgICAgICAvLyBwcm9taXNlXHJcbiAgICAgICAgYzogW10sICAgICAgICAvLyBjaGFpblxyXG4gICAgICAgIHM6IDAsICAgICAgICAgLy8gc3RhdGVcclxuICAgICAgICBkOiBmYWxzZSwgICAgIC8vIGRvbmVcclxuICAgICAgICB2OiB1bmRlZmluZWQsIC8vIHZhbHVlXHJcbiAgICAgICAgaDogZmFsc2UgICAgICAvLyBoYW5kbGVkIHJlamVjdGlvblxyXG4gICAgICB9O1xyXG4gICAgICBoaWRkZW4odGhpcywgUkVDT1JELCByZWNvcmQpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGV4ZWN1dG9yKGN0eChyZXNvbHZlLCByZWNvcmQsIDEpLCBjdHgocmVqZWN0LCByZWNvcmQsIDEpKTtcclxuICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgIHJlamVjdC5jYWxsKHJlY29yZCwgZXJyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzaWduSGlkZGVuKFByb21pc2VbUFJPVE9UWVBFXSwge1xyXG4gICAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxyXG4gICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCl7XHJcbiAgICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoYXNzZXJ0T2JqZWN0KHRoaXMpW0NPTlNUUlVDVE9SXSlbU1lNQk9MX1NQRUNJRVNdO1xyXG4gICAgICAgIHZhciByZWFjdCA9IHtcclxuICAgICAgICAgIG9rOiAgIGlzRnVuY3Rpb24ob25GdWxmaWxsZWQpID8gb25GdWxmaWxsZWQgOiB0cnVlLFxyXG4gICAgICAgICAgZmFpbDogaXNGdW5jdGlvbihvblJlamVjdGVkKSAgPyBvblJlamVjdGVkICA6IGZhbHNlXHJcbiAgICAgICAgfSAsIFAgPSByZWFjdC5QID0gbmV3IChTICE9IHVuZGVmaW5lZCA/IFMgOiBQcm9taXNlKShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgcmVhY3QucmVzID0gYXNzZXJ0RnVuY3Rpb24ocmVzb2x2ZSk7XHJcbiAgICAgICAgICByZWFjdC5yZWogPSBhc3NlcnRGdW5jdGlvbihyZWplY3QpO1xyXG4gICAgICAgIH0pLCByZWNvcmQgPSB0aGlzW1JFQ09SRF07XHJcbiAgICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XHJcbiAgICAgICAgcmVjb3JkLnMgJiYgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgICAgcmV0dXJuIFA7XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXHJcbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBhc3NpZ25IaWRkZW4oUHJvbWlzZSwge1xyXG4gICAgICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcclxuICAgICAgYWxsOiBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgdmFyIFByb21pc2UgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxyXG4gICAgICAgICAgLCB2YWx1ZXMgID0gW107XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIHB1c2gsIHZhbHVlcyk7XHJcbiAgICAgICAgICB2YXIgcmVtYWluaW5nID0gdmFsdWVzLmxlbmd0aFxyXG4gICAgICAgICAgICAsIHJlc3VsdHMgICA9IEFycmF5KHJlbWFpbmluZyk7XHJcbiAgICAgICAgICBpZihyZW1haW5pbmcpZm9yRWFjaC5jYWxsKHZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZSwgaW5kZXgpe1xyXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB9LCByZWplY3QpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBlbHNlIHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcclxuICAgICAgcmFjZTogZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgIHZhciBQcm9taXNlID0gZ2V0Q29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xyXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXHJcbiAgICAgIHJlamVjdDogZnVuY3Rpb24ocil7XHJcbiAgICAgICAgcmV0dXJuIG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICByZWplY3Qocik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxyXG4gICAgICByZXNvbHZlOiBmdW5jdGlvbih4KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoeCkgJiYgUkVDT1JEIGluIHggJiYgZ2V0UHJvdG90eXBlT2YoeCkgPT09IHRoaXNbUFJPVE9UWVBFXVxyXG4gICAgICAgICAgPyB4IDogbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgICAgcmVzb2x2ZSh4KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KG5leHRUaWNrIHx8IHNldEltbWVkaWF0ZSwgc2FmZVN5bWJvbCgncmVjb3JkJykpO1xyXG4gIHNldFRvU3RyaW5nVGFnKFByb21pc2UsIFBST01JU0UpO1xyXG4gIHNldFNwZWNpZXMoUHJvbWlzZSk7XHJcbiAgJGRlZmluZShHTE9CQUwgKyBGT1JDRUQgKiAhaXNOYXRpdmUoUHJvbWlzZSksIHtQcm9taXNlOiBQcm9taXNlfSk7XHJcbn0oZ2xvYmFsW1BST01JU0VdKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LmNvbGxlY3Rpb25zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IGNvbGxlY3Rpb25zIHNoaW1cclxuIWZ1bmN0aW9uKCl7XHJcbiAgdmFyIFVJRCAgID0gc2FmZVN5bWJvbCgndWlkJylcclxuICAgICwgTzEgICAgPSBzYWZlU3ltYm9sKCdPMScpXHJcbiAgICAsIFdFQUsgID0gc2FmZVN5bWJvbCgnd2VhaycpXHJcbiAgICAsIExFQUsgID0gc2FmZVN5bWJvbCgnbGVhaycpXHJcbiAgICAsIExBU1QgID0gc2FmZVN5bWJvbCgnbGFzdCcpXHJcbiAgICAsIEZJUlNUID0gc2FmZVN5bWJvbCgnZmlyc3QnKVxyXG4gICAgLCBTSVpFICA9IERFU0MgPyBzYWZlU3ltYm9sKCdzaXplJykgOiAnc2l6ZSdcclxuICAgICwgdWlkICAgPSAwXHJcbiAgICAsIHRtcCAgID0ge307XHJcbiAgXHJcbiAgZnVuY3Rpb24gZ2V0Q29sbGVjdGlvbihDLCBOQU1FLCBtZXRob2RzLCBjb21tb25NZXRob2RzLCBpc01hcCwgaXNXZWFrKXtcclxuICAgIHZhciBBRERFUiA9IGlzTWFwID8gJ3NldCcgOiAnYWRkJ1xyXG4gICAgICAsIHByb3RvID0gQyAmJiBDW1BST1RPVFlQRV1cclxuICAgICAgLCBPICAgICA9IHt9O1xyXG4gICAgZnVuY3Rpb24gaW5pdEZyb21JdGVyYWJsZSh0aGF0LCBpdGVyYWJsZSl7XHJcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgaXNNYXAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgICAgcmV0dXJuIHRoYXQ7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBmaXhTVlooa2V5LCBjaGFpbil7XHJcbiAgICAgIHZhciBtZXRob2QgPSBwcm90b1trZXldO1xyXG4gICAgICBpZihmcmFtZXdvcmspcHJvdG9ba2V5XSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpO1xyXG4gICAgICAgIHJldHVybiBjaGFpbiA/IHRoaXMgOiByZXN1bHQ7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZighaXNOYXRpdmUoQykgfHwgIShpc1dlYWsgfHwgKCFCVUdHWV9JVEVSQVRPUlMgJiYgaGFzKHByb3RvLCBGT1JfRUFDSCkgJiYgaGFzKHByb3RvLCAnZW50cmllcycpKSkpe1xyXG4gICAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxyXG4gICAgICBDID0gaXNXZWFrXHJcbiAgICAgICAgPyBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIEMsIE5BTUUpO1xyXG4gICAgICAgICAgICBzZXQodGhpcywgVUlELCB1aWQrKyk7XHJcbiAgICAgICAgICAgIGluaXRGcm9tSXRlcmFibGUodGhpcywgaXRlcmFibGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIDogZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGFzc2VydEluc3RhbmNlKHRoYXQsIEMsIE5BTUUpO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgTzEsIGNyZWF0ZShudWxsKSk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBTSVpFLCAwKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIExBU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgaW5pdEZyb21JdGVyYWJsZSh0aGF0LCBpdGVyYWJsZSk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICBhc3NpZ25IaWRkZW4oYXNzaWduSGlkZGVuKENbUFJPVE9UWVBFXSwgbWV0aG9kcyksIGNvbW1vbk1ldGhvZHMpO1xyXG4gICAgICBpc1dlYWsgfHwgIURFU0MgfHwgZGVmaW5lUHJvcGVydHkoQ1tQUk9UT1RZUEVdLCAnc2l6ZScsIHtnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIGFzc2VydERlZmluZWQodGhpc1tTSVpFXSk7XHJcbiAgICAgIH19KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBOYXRpdmUgPSBDXHJcbiAgICAgICAgLCBpbnN0ICAgPSBuZXcgQ1xyXG4gICAgICAgICwgY2hhaW4gID0gaW5zdFtBRERFUl0oaXNXZWFrID8ge30gOiAtMCwgMSlcclxuICAgICAgICAsIGJ1Z2d5WmVybztcclxuICAgICAgLy8gd3JhcCB0byBpbml0IGNvbGxlY3Rpb25zIGZyb20gaXRlcmFibGVcclxuICAgICAgaWYoY2hlY2tEYW5nZXJJdGVyQ2xvc2luZyhmdW5jdGlvbihPKXsgbmV3IEMoTykgfSkpe1xyXG4gICAgICAgIEMgPSBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgICAgIHJldHVybiBpbml0RnJvbUl0ZXJhYmxlKG5ldyBOYXRpdmUsIGl0ZXJhYmxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ1tQUk9UT1RZUEVdID0gcHJvdG87XHJcbiAgICAgICAgaWYoZnJhbWV3b3JrKXByb3RvW0NPTlNUUlVDVE9SXSA9IEM7XHJcbiAgICAgIH1cclxuICAgICAgaXNXZWFrIHx8IGluc3RbRk9SX0VBQ0hdKGZ1bmN0aW9uKHZhbCwga2V5KXtcclxuICAgICAgICBidWdneVplcm8gPSAxIC8ga2V5ID09PSAtSW5maW5pdHk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyBmaXggY29udmVydGluZyAtMCBrZXkgdG8gKzBcclxuICAgICAgaWYoYnVnZ3laZXJvKXtcclxuICAgICAgICBmaXhTVlooJ2RlbGV0ZScpO1xyXG4gICAgICAgIGZpeFNWWignaGFzJyk7XHJcbiAgICAgICAgaXNNYXAgJiYgZml4U1ZaKCdnZXQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyArIGZpeCAuYWRkICYgLnNldCBmb3IgY2hhaW5pbmdcclxuICAgICAgaWYoYnVnZ3laZXJvIHx8IGNoYWluICE9PSBpbnN0KWZpeFNWWihBRERFUiwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBzZXRUb1N0cmluZ1RhZyhDLCBOQU1FKTtcclxuICAgIHNldFNwZWNpZXMoQyk7XHJcbiAgICBcclxuICAgIE9bTkFNRV0gPSBDO1xyXG4gICAgJGRlZmluZShHTE9CQUwgKyBXUkFQICsgRk9SQ0VEICogIWlzTmF0aXZlKEMpLCBPKTtcclxuICAgIFxyXG4gICAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXHJcbiAgICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXHJcbiAgICBpc1dlYWsgfHwgZGVmaW5lU3RkSXRlcmF0b3JzKEMsIE5BTUUsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazoga2luZH0pO1xyXG4gICAgfSwgZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAgICwga2luZCAgPSBpdGVyLmtcclxuICAgICAgICAsIGVudHJ5ID0gaXRlci5sO1xyXG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcclxuICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XHJcbiAgICAgIGlmKCFpdGVyLm8gfHwgIShpdGVyLmwgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IGl0ZXIub1tGSVJTVF0pKXtcclxuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxyXG4gICAgICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXHJcbiAgICAgIGlmKGtpbmQgPT0gS0VZKSAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgZW50cnkuayk7XHJcbiAgICAgIGlmKGtpbmQgPT0gVkFMVUUpcmV0dXJuIGl0ZXJSZXN1bHQoMCwgZW50cnkudik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTsgICBcclxuICAgIH0sIGlzTWFwID8gS0VZK1ZBTFVFIDogVkFMVUUsICFpc01hcCk7XHJcbiAgICBcclxuICAgIHJldHVybiBDO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBmYXN0S2V5KGl0LCBjcmVhdGUpe1xyXG4gICAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxyXG4gICAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcclxuICAgIC8vIGNhbid0IHNldCBpZCB0byBmcm96ZW4gb2JqZWN0XHJcbiAgICBpZihpc0Zyb3plbihpdCkpcmV0dXJuICdGJztcclxuICAgIGlmKCFoYXMoaXQsIFVJRCkpe1xyXG4gICAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBpZFxyXG4gICAgICBpZighY3JlYXRlKXJldHVybiAnRSc7XHJcbiAgICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxyXG4gICAgICBoaWRkZW4oaXQsIFVJRCwgKyt1aWQpO1xyXG4gICAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxyXG4gICAgfSByZXR1cm4gJ08nICsgaXRbVUlEXTtcclxuICB9XHJcbiAgZnVuY3Rpb24gZ2V0RW50cnkodGhhdCwga2V5KXtcclxuICAgIC8vIGZhc3QgY2FzZVxyXG4gICAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcclxuICAgIGlmKGluZGV4ICE9ICdGJylyZXR1cm4gdGhhdFtPMV1baW5kZXhdO1xyXG4gICAgLy8gZnJvemVuIG9iamVjdCBjYXNlXHJcbiAgICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICAgIGlmKGVudHJ5LmsgPT0ga2V5KXJldHVybiBlbnRyeTtcclxuICAgIH1cclxuICB9XHJcbiAgZnVuY3Rpb24gZGVmKHRoYXQsIGtleSwgdmFsdWUpe1xyXG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxyXG4gICAgICAsIHByZXYsIGluZGV4O1xyXG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XHJcbiAgICBpZihlbnRyeSllbnRyeS52ID0gdmFsdWU7XHJcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhhdFtMQVNUXSA9IGVudHJ5ID0ge1xyXG4gICAgICAgIGk6IGluZGV4ID0gZmFzdEtleShrZXksIHRydWUpLCAvLyA8LSBpbmRleFxyXG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcclxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcclxuICAgICAgICBwOiBwcmV2ID0gdGhhdFtMQVNUXSwgICAgICAgICAgLy8gPC0gcHJldmlvdXMgZW50cnlcclxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxyXG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXHJcbiAgICAgIH07XHJcbiAgICAgIGlmKCF0aGF0W0ZJUlNUXSl0aGF0W0ZJUlNUXSA9IGVudHJ5O1xyXG4gICAgICBpZihwcmV2KXByZXYubiA9IGVudHJ5O1xyXG4gICAgICB0aGF0W1NJWkVdKys7XHJcbiAgICAgIC8vIGFkZCB0byBpbmRleFxyXG4gICAgICBpZihpbmRleCAhPSAnRicpdGhhdFtPMV1baW5kZXhdID0gZW50cnk7XHJcbiAgICB9IHJldHVybiB0aGF0O1xyXG4gIH1cclxuXHJcbiAgdmFyIGNvbGxlY3Rpb25NZXRob2RzID0ge1xyXG4gICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXHJcbiAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcclxuICAgIGNsZWFyOiBmdW5jdGlvbigpe1xyXG4gICAgICBmb3IodmFyIHRoYXQgPSB0aGlzLCBkYXRhID0gdGhhdFtPMV0sIGVudHJ5ID0gdGhhdFtGSVJTVF07IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xyXG4gICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcclxuICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcclxuICAgICAgfVxyXG4gICAgICB0aGF0W0ZJUlNUXSA9IHRoYXRbTEFTVF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgIHRoYXRbU0laRV0gPSAwO1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcclxuICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcclxuICAgICAgICAsIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcclxuICAgICAgaWYoZW50cnkpe1xyXG4gICAgICAgIHZhciBuZXh0ID0gZW50cnkublxyXG4gICAgICAgICAgLCBwcmV2ID0gZW50cnkucDtcclxuICAgICAgICBkZWxldGUgdGhhdFtPMV1bZW50cnkuaV07XHJcbiAgICAgICAgZW50cnkuciA9IHRydWU7XHJcbiAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xyXG4gICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcclxuICAgICAgICBpZih0aGF0W0ZJUlNUXSA9PSBlbnRyeSl0aGF0W0ZJUlNUXSA9IG5leHQ7XHJcbiAgICAgICAgaWYodGhhdFtMQVNUXSA9PSBlbnRyeSl0aGF0W0xBU1RdID0gcHJldjtcclxuICAgICAgICB0aGF0W1NJWkVdLS07XHJcbiAgICAgIH0gcmV0dXJuICEhZW50cnk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICAvLyAyMy4xLjMuNSBNYXAucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXHJcbiAgICAgICAgLCBlbnRyeTtcclxuICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzW0ZJUlNUXSl7XHJcbiAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcclxuICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcclxuICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyAyMy4xIE1hcCBPYmplY3RzXHJcbiAgTWFwID0gZ2V0Q29sbGVjdGlvbihNYXAsIE1BUCwge1xyXG4gICAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGlzLCBrZXkpO1xyXG4gICAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxyXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZih0aGlzLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfSwgY29sbGVjdGlvbk1ldGhvZHMsIHRydWUpO1xyXG4gIFxyXG4gIC8vIDIzLjIgU2V0IE9iamVjdHNcclxuICBTZXQgPSBnZXRDb2xsZWN0aW9uKFNldCwgU0VULCB7XHJcbiAgICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICAgIGFkZDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmKHRoaXMsIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcclxuICAgIH1cclxuICB9LCBjb2xsZWN0aW9uTWV0aG9kcyk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gZGVmV2Vhayh0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIGlmKGlzRnJvemVuKGFzc2VydE9iamVjdChrZXkpKSlsZWFrU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgZWxzZSB7XHJcbiAgICAgIGhhcyhrZXksIFdFQUspIHx8IGhpZGRlbihrZXksIFdFQUssIHt9KTtcclxuICAgICAga2V5W1dFQUtdW3RoYXRbVUlEXV0gPSB2YWx1ZTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGxlYWtTdG9yZSh0aGF0KXtcclxuICAgIHJldHVybiB0aGF0W0xFQUtdIHx8IGhpZGRlbih0aGF0LCBMRUFLLCBuZXcgTWFwKVtMRUFLXTtcclxuICB9XHJcbiAgXHJcbiAgdmFyIHdlYWtNZXRob2RzID0ge1xyXG4gICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcclxuICAgIC8vIDIzLjQuMy4zIFdlYWtTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKVsnZGVsZXRlJ10oa2V5KTtcclxuICAgICAgcmV0dXJuIGhhcyhrZXksIFdFQUspICYmIGhhcyhrZXlbV0VBS10sIHRoaXNbVUlEXSkgJiYgZGVsZXRlIGtleVtXRUFLXVt0aGlzW1VJRF1dO1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjMuMy40IFdlYWtNYXAucHJvdG90eXBlLmhhcyhrZXkpXHJcbiAgICAvLyAyMy40LjMuNCBXZWFrU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmhhcyhrZXkpO1xyXG4gICAgICByZXR1cm4gaGFzKGtleSwgV0VBSykgJiYgaGFzKGtleVtXRUFLXSwgdGhpc1tVSURdKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIC8vIDIzLjMgV2Vha01hcCBPYmplY3RzXHJcbiAgV2Vha01hcCA9IGdldENvbGxlY3Rpb24oV2Vha01hcCwgV0VBS01BUCwge1xyXG4gICAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoaXNPYmplY3Qoa2V5KSl7XHJcbiAgICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmdldChrZXkpO1xyXG4gICAgICAgIGlmKGhhcyhrZXksIFdFQUspKXJldHVybiBrZXlbV0VBS11bdGhpc1tVSURdXTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxyXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZldlYWsodGhpcywga2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfSwgd2Vha01ldGhvZHMsIHRydWUsIHRydWUpO1xyXG4gIFxyXG4gIC8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcclxuICBpZihmcmFtZXdvcmsgJiYgbmV3IFdlYWtNYXAoKS5zZXQoT2JqZWN0LmZyZWV6ZSh0bXApLCA3KS5nZXQodG1wKSAhPSA3KXtcclxuICAgIGZvckVhY2guY2FsbChhcnJheSgnZGVsZXRlLGhhcyxnZXQsc2V0JyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBtZXRob2QgPSBXZWFrTWFwW1BST1RPVFlQRV1ba2V5XTtcclxuICAgICAgV2Vha01hcFtQUk9UT1RZUEVdW2tleV0gPSBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBsZWFreSBtYXBcclxuICAgICAgICBpZihpc09iamVjdChhKSAmJiBpc0Zyb3plbihhKSl7XHJcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gbGVha1N0b3JlKHRoaXMpW2tleV0oYSwgYik7XHJcbiAgICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcclxuICAgICAgICAvLyBzdG9yZSBhbGwgdGhlIHJlc3Qgb24gbmF0aXZlIHdlYWttYXBcclxuICAgICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvLyAyMy40IFdlYWtTZXQgT2JqZWN0c1xyXG4gIFdlYWtTZXQgPSBnZXRDb2xsZWN0aW9uKFdlYWtTZXQsIFdFQUtTRVQsIHtcclxuICAgIC8vIDIzLjQuMy4xIFdlYWtTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICAgIGFkZDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmV2Vhayh0aGlzLCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfSwgd2Vha01ldGhvZHMsIGZhbHNlLCB0cnVlKTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYucmVmbGVjdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICBmdW5jdGlvbiBFbnVtZXJhdGUoaXRlcmF0ZWQpe1xyXG4gICAgdmFyIGtleXMgPSBbXSwga2V5O1xyXG4gICAgZm9yKGtleSBpbiBpdGVyYXRlZClrZXlzLnB1c2goa2V5KTtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGE6IGtleXMsIGk6IDB9KTtcclxuICB9XHJcbiAgY3JlYXRlSXRlcmF0b3IoRW51bWVyYXRlLCBPQkpFQ1QsIGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaXRlciA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBrZXlzID0gaXRlci5hXHJcbiAgICAgICwga2V5O1xyXG4gICAgZG8ge1xyXG4gICAgICBpZihpdGVyLmkgPj0ga2V5cy5sZW5ndGgpcmV0dXJuIGl0ZXJSZXN1bHQoMSk7XHJcbiAgICB9IHdoaWxlKCEoKGtleSA9IGtleXNbaXRlci5pKytdKSBpbiBpdGVyLm8pKTtcclxuICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIGtleSk7XHJcbiAgfSk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gd3JhcChmbil7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oaXQpe1xyXG4gICAgICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyksIHRydWU7XHJcbiAgICAgIH0gY2F0Y2goZSl7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHJlZmxlY3RHZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcclxuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdXHJcbiAgICAgICwgZGVzYyA9IGdldE93bkRlc2NyaXB0b3IoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KSwgcHJvdG87XHJcbiAgICBpZihkZXNjKXJldHVybiBoYXMoZGVzYywgJ3ZhbHVlJylcclxuICAgICAgPyBkZXNjLnZhbHVlXHJcbiAgICAgIDogZGVzYy5nZXQgPT09IHVuZGVmaW5lZFxyXG4gICAgICAgID8gdW5kZWZpbmVkXHJcbiAgICAgICAgOiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcclxuICAgIHJldHVybiBpc09iamVjdChwcm90byA9IGdldFByb3RvdHlwZU9mKHRhcmdldCkpXHJcbiAgICAgID8gcmVmbGVjdEdldChwcm90bywgcHJvcGVydHlLZXksIHJlY2VpdmVyKVxyXG4gICAgICA6IHVuZGVmaW5lZDtcclxuICB9XHJcbiAgZnVuY3Rpb24gcmVmbGVjdFNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWLyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cclxuICAgICAgLCBvd25EZXNjICA9IGdldE93bkRlc2NyaXB0b3IoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KVxyXG4gICAgICAsIGV4aXN0aW5nRGVzY3JpcHRvciwgcHJvdG87XHJcbiAgICBpZighb3duRGVzYyl7XHJcbiAgICAgIGlmKGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG90eXBlT2YodGFyZ2V0KSkpe1xyXG4gICAgICAgIHJldHVybiByZWZsZWN0U2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgViwgcmVjZWl2ZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIG93bkRlc2MgPSBkZXNjcmlwdG9yKDApO1xyXG4gICAgfVxyXG4gICAgaWYoaGFzKG93bkRlc2MsICd2YWx1ZScpKXtcclxuICAgICAgaWYob3duRGVzYy53cml0YWJsZSA9PT0gZmFsc2UgfHwgIWlzT2JqZWN0KHJlY2VpdmVyKSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvciA9IGdldE93bkRlc2NyaXB0b3IocmVjZWl2ZXIsIHByb3BlcnR5S2V5KSB8fCBkZXNjcmlwdG9yKDApO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IudmFsdWUgPSBWO1xyXG4gICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkocmVjZWl2ZXIsIHByb3BlcnR5S2V5LCBleGlzdGluZ0Rlc2NyaXB0b3IpLCB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG93bkRlc2Muc2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgPyBmYWxzZVxyXG4gICAgICA6IChvd25EZXNjLnNldC5jYWxsKHJlY2VpdmVyLCBWKSwgdHJ1ZSk7XHJcbiAgfVxyXG4gIHZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IHJldHVybkl0O1xyXG4gIFxyXG4gIHZhciByZWZsZWN0ID0ge1xyXG4gICAgLy8gMjYuMS4xIFJlZmxlY3QuYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpXHJcbiAgICBhcHBseTogY3R4KGNhbGwsIGFwcGx5LCAzKSxcclxuICAgIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcclxuICAgIGNvbnN0cnVjdDogZnVuY3Rpb24odGFyZ2V0LCBhcmd1bWVudHNMaXN0IC8qLCBuZXdUYXJnZXQqLyl7XHJcbiAgICAgIHZhciBwcm90byAgICA9IGFzc2VydEZ1bmN0aW9uKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdKVtQUk9UT1RZUEVdXHJcbiAgICAgICAgLCBpbnN0YW5jZSA9IGNyZWF0ZShpc09iamVjdChwcm90bykgPyBwcm90byA6IE9iamVjdFByb3RvKVxyXG4gICAgICAgICwgcmVzdWx0ICAgPSBhcHBseS5jYWxsKHRhcmdldCwgaW5zdGFuY2UsIGFyZ3VtZW50c0xpc3QpO1xyXG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IGluc3RhbmNlO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuMyBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpXHJcbiAgICBkZWZpbmVQcm9wZXJ0eTogd3JhcChkZWZpbmVQcm9wZXJ0eSksXHJcbiAgICAvLyAyNi4xLjQgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gICAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgICB2YXIgZGVzYyA9IGdldE93bkRlc2NyaXB0b3IoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICAgICAgcmV0dXJuIGRlc2MgJiYgIWRlc2MuY29uZmlndXJhYmxlID8gZmFsc2UgOiBkZWxldGUgdGFyZ2V0W3Byb3BlcnR5S2V5XTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjUgUmVmbGVjdC5lbnVtZXJhdGUodGFyZ2V0KVxyXG4gICAgZW51bWVyYXRlOiBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgICByZXR1cm4gbmV3IEVudW1lcmF0ZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS42IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlLZXkgWywgcmVjZWl2ZXJdKVxyXG4gICAgZ2V0OiByZWZsZWN0R2V0LFxyXG4gICAgLy8gMjYuMS43IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuOCBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldClcclxuICAgIGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgICByZXR1cm4gZ2V0UHJvdG90eXBlT2YoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuOSBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gICAgaGFzOiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjEwIFJlZmxlY3QuaXNFeHRlbnNpYmxlKHRhcmdldClcclxuICAgIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgcmV0dXJuICEhaXNFeHRlbnNpYmxlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXHJcbiAgICBvd25LZXlzOiBvd25LZXlzLFxyXG4gICAgLy8gMjYuMS4xMiBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRhcmdldClcclxuICAgIHByZXZlbnRFeHRlbnNpb25zOiB3cmFwKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyB8fCByZXR1cm5JdCksXHJcbiAgICAvLyAyNi4xLjEzIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYgWywgcmVjZWl2ZXJdKVxyXG4gICAgc2V0OiByZWZsZWN0U2V0XHJcbiAgfVxyXG4gIC8vIDI2LjEuMTQgUmVmbGVjdC5zZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKVxyXG4gIGlmKHNldFByb3RvdHlwZU9mKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbih0YXJnZXQsIHByb3RvKXtcclxuICAgIHJldHVybiBzZXRQcm90b3R5cGVPZihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvdG8pLCB0cnVlO1xyXG4gIH07XHJcbiAgXHJcbiAgJGRlZmluZShHTE9CQUwsIHtSZWZsZWN0OiB7fX0pO1xyXG4gICRkZWZpbmUoU1RBVElDLCAnUmVmbGVjdCcsIHJlZmxlY3QpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNy5wcm9wb3NhbHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gICRkZWZpbmUoUFJPVE8sIEFSUkFZLCB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZG9tZW5pYy9BcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcclxuICAgIGluY2x1ZGVzOiBjcmVhdGVBcnJheUNvbnRhaW5zKHRydWUpXHJcbiAgfSk7XHJcbiAgJGRlZmluZShQUk9UTywgU1RSSU5HLCB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XHJcbiAgICBhdDogY3JlYXRlUG9pbnRBdCh0cnVlKVxyXG4gIH0pO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdFRvQXJyYXkoaXNFbnRyaWVzKXtcclxuICAgIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAgICwga2V5cyAgID0gZ2V0S2V5cyhvYmplY3QpXHJcbiAgICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAgICwgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgICAgICwga2V5O1xyXG4gICAgICBpZihpc0VudHJpZXMpd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBba2V5ID0ga2V5c1tpKytdLCBPW2tleV1dO1xyXG4gICAgICBlbHNlIHdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gT1trZXlzW2krK11dO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH1cclxuICAkZGVmaW5lKFNUQVRJQywgT0JKRUNULCB7XHJcbiAgICAvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzkzNTM3ODFcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM6IGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAgICAgLCByZXN1bHQgPSB7fTtcclxuICAgICAgZm9yRWFjaC5jYWxsKG93bktleXMoTyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgZGVmaW5lUHJvcGVydHkocmVzdWx0LCBrZXksIGRlc2NyaXB0b3IoMCwgZ2V0T3duRGVzY3JpcHRvcihPLCBrZXkpKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yd2FsZHJvbi90YzM5LW5vdGVzL2Jsb2IvbWFzdGVyL2VzNi8yMDE0LTA0L2Fwci05Lm1kIzUxLW9iamVjdGVudHJpZXMtb2JqZWN0dmFsdWVzXHJcbiAgICB2YWx1ZXM6ICBjcmVhdGVPYmplY3RUb0FycmF5KGZhbHNlKSxcclxuICAgIGVudHJpZXM6IGNyZWF0ZU9iamVjdFRvQXJyYXkodHJ1ZSlcclxuICB9KTtcclxuICAkZGVmaW5lKFNUQVRJQywgUkVHRVhQLCB7XHJcbiAgICAvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYW5nYXgvOTY5ODEwMFxyXG4gICAgZXNjYXBlOiBjcmVhdGVSZXBsYWNlcigvKFtcXFxcXFwtW1xcXXt9KCkqKz8uLF4kfF0pL2csICdcXFxcJDEnLCB0cnVlKVxyXG4gIH0pO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNy5hYnN0cmFjdC1yZWZzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96ZW5wYXJzaW5nL2VzLWFic3RyYWN0LXJlZnNcclxuIWZ1bmN0aW9uKFJFRkVSRU5DRSl7XHJcbiAgUkVGRVJFTkNFX0dFVCA9IGdldFdlbGxLbm93blN5bWJvbChSRUZFUkVOQ0UrJ0dldCcsIHRydWUpO1xyXG4gIHZhciBSRUZFUkVOQ0VfU0VUID0gZ2V0V2VsbEtub3duU3ltYm9sKFJFRkVSRU5DRStTRVQsIHRydWUpXHJcbiAgICAsIFJFRkVSRU5DRV9ERUxFVEUgPSBnZXRXZWxsS25vd25TeW1ib2woUkVGRVJFTkNFKydEZWxldGUnLCB0cnVlKTtcclxuICBcclxuICAkZGVmaW5lKFNUQVRJQywgU1lNQk9MLCB7XHJcbiAgICByZWZlcmVuY2VHZXQ6IFJFRkVSRU5DRV9HRVQsXHJcbiAgICByZWZlcmVuY2VTZXQ6IFJFRkVSRU5DRV9TRVQsXHJcbiAgICByZWZlcmVuY2VEZWxldGU6IFJFRkVSRU5DRV9ERUxFVEVcclxuICB9KTtcclxuICBcclxuICBoaWRkZW4oRnVuY3Rpb25Qcm90bywgUkVGRVJFTkNFX0dFVCwgcmV0dXJuVGhpcyk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0TWFwTWV0aG9kcyhDb25zdHJ1Y3Rvcil7XHJcbiAgICBpZihDb25zdHJ1Y3Rvcil7XHJcbiAgICAgIHZhciBNYXBQcm90byA9IENvbnN0cnVjdG9yW1BST1RPVFlQRV07XHJcbiAgICAgIGhpZGRlbihNYXBQcm90bywgUkVGRVJFTkNFX0dFVCwgTWFwUHJvdG8uZ2V0KTtcclxuICAgICAgaGlkZGVuKE1hcFByb3RvLCBSRUZFUkVOQ0VfU0VULCBNYXBQcm90by5zZXQpO1xyXG4gICAgICBoaWRkZW4oTWFwUHJvdG8sIFJFRkVSRU5DRV9ERUxFVEUsIE1hcFByb3RvWydkZWxldGUnXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldE1hcE1ldGhvZHMoTWFwKTtcclxuICBzZXRNYXBNZXRob2RzKFdlYWtNYXApO1xyXG59KCdyZWZlcmVuY2UnKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDoganMuYXJyYXkuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gSmF2YVNjcmlwdCAxLjYgLyBTdHJhd21hbiBhcnJheSBzdGF0aWNzIHNoaW1cclxuIWZ1bmN0aW9uKGFycmF5U3RhdGljcyl7XHJcbiAgZnVuY3Rpb24gc2V0QXJyYXlTdGF0aWNzKGtleXMsIGxlbmd0aCl7XHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoa2V5cyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKGtleSBpbiBBcnJheVByb3RvKWFycmF5U3RhdGljc1trZXldID0gY3R4KGNhbGwsIEFycmF5UHJvdG9ba2V5XSwgbGVuZ3RoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBzZXRBcnJheVN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcclxuICBzZXRBcnJheVN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcclxuICBzZXRBcnJheVN0YXRpY3MoJ2pvaW4sc2xpY2UsY29uY2F0LHB1c2gsc3BsaWNlLHVuc2hpZnQsc29ydCxsYXN0SW5kZXhPZiwnICtcclxuICAgICAgICAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xyXG4gICRkZWZpbmUoU1RBVElDLCBBUlJBWSwgYXJyYXlTdGF0aWNzKTtcclxufSh7fSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IHdlYi5kb20uaXRhcmFibGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihOb2RlTGlzdCl7XHJcbiAgaWYoZnJhbWV3b3JrICYmIE5vZGVMaXN0ICYmICEoU1lNQk9MX0lURVJBVE9SIGluIE5vZGVMaXN0W1BST1RPVFlQRV0pKXtcclxuICAgIGhpZGRlbihOb2RlTGlzdFtQUk9UT1RZUEVdLCBTWU1CT0xfSVRFUkFUT1IsIEl0ZXJhdG9yc1tBUlJBWV0pO1xyXG4gIH1cclxuICBJdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnNbQVJSQVldO1xyXG59KGdsb2JhbC5Ob2RlTGlzdCk7XG59KHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpLCB0cnVlKTsiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciBpdGVyYXRvclN5bWJvbCA9XG4gICAgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IEdlbmVyYXRvcihpbm5lckZuLCBvdXRlckZuLCBzZWxmIHx8IG51bGwsIHRyeUxvY3NMaXN0IHx8IFtdKTtcbiAgfVxuICBydW50aW1lLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPSBHZW5lcmF0b3IucHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbmVyYXRvciA9IHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpO1xuICAgICAgdmFyIGNhbGxOZXh0ID0gc3RlcC5iaW5kKGdlbmVyYXRvci5uZXh0KTtcbiAgICAgIHZhciBjYWxsVGhyb3cgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yW1widGhyb3dcIl0pO1xuXG4gICAgICBmdW5jdGlvbiBzdGVwKGFyZykge1xuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2godGhpcywgbnVsbCwgYXJnKTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbmZvLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaW5mby52YWx1ZSkudGhlbihjYWxsTmV4dCwgY2FsbFRocm93KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsTmV4dCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBnZW5lcmF0b3IgPSBvdXRlckZuID8gT2JqZWN0LmNyZWF0ZShvdXRlckZuLnByb3RvdHlwZSkgOiB0aGlzO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QpO1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0sXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvcixcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIExpa2UgcmV0dXJuaW5nIGdlbmVyYXRvci50aHJvdyh1bmNhdWdodCksIGJ1dCB3aXRob3V0IHRoZVxuICAgICAgICAgICAgLy8gb3ZlcmhlYWQgb2YgYW4gZXh0cmEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG5cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERlbGVnYXRlIGdlbmVyYXRvciByYW4gYW5kIGhhbmRsZWQgaXRzIG93biBleGNlcHRpb25zIHNvXG4gICAgICAgICAgLy8gcmVnYXJkbGVzcyBvZiB3aGF0IHRoZSBtZXRob2Qgd2FzLCB3ZSBjb250aW51ZSBhcyBpZiBpdCBpc1xuICAgICAgICAgIC8vIFwibmV4dFwiIHdpdGggYW4gdW5kZWZpbmVkIGFyZy5cbiAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG4gICAgICAgICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ICYmXG4gICAgICAgICAgICAgIHR5cGVvZiBhcmcgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgIFwiYXR0ZW1wdCB0byBzZW5kIFwiICsgSlNPTi5zdHJpbmdpZnkoYXJnKSArIFwiIHRvIG5ld2Jvcm4gZ2VuZXJhdG9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkKSB7XG4gICAgICAgICAgICBjb250ZXh0LnNlbnQgPSBhcmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjb250ZXh0LnNlbnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBhcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIHZhciBpbmZvID0ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmRlbGVnYXRlICYmIG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuXG4gICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24ocmVjb3JkLmFyZyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yLm5leHQgPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwibmV4dFwiKTtcbiAgICBnZW5lcmF0b3JbXCJ0aHJvd1wiXSA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJ0aHJvd1wiKTtcbiAgICBnZW5lcmF0b3JbXCJyZXR1cm5cIl0gPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwicmV0dXJuXCIpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICB0aGlzLnNlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgLy8gUHJlLWluaXRpYWxpemUgYXQgbGVhc3QgMjAgdGVtcG9yYXJ5IHZhcmlhYmxlcyB0byBlbmFibGUgaGlkZGVuXG4gICAgICAvLyBjbGFzcyBvcHRpbWl6YXRpb25zIGZvciBzaW1wbGUgZ2VuZXJhdG9ycy5cbiAgICAgIGZvciAodmFyIHRlbXBJbmRleCA9IDAsIHRlbXBOYW1lO1xuICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCB0ZW1wTmFtZSA9IFwidFwiICsgdGVtcEluZGV4KSB8fCB0ZW1wSW5kZXggPCAyMDtcbiAgICAgICAgICAgKyt0ZW1wSW5kZXgpIHtcbiAgICAgICAgdGhpc1t0ZW1wTmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG4gICAgICAgIHJldHVybiAhIWNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPCBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDogdGhpc1xuKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2JhYmVsL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZS9wb2x5ZmlsbFwiKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
