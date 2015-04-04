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

},{"./networkmanager":5,"./screenmanager":10,"./soundmanager":17}],2:[function(require,module,exports){
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

var InputManager = _interopRequire(require("./inputmanager"));

var Particle = _interopRequire(require("./objects/particle"));

var Player = _interopRequire(require("./objects/player"));

var Base = _interopRequire(require("./objects/base"));

var Minion = _interopRequire(require("./objects/minion"));

var Game = (function () {
  function Game(networkManager, soundManager) {
    _classCallCheck(this, Game);

    this.networkManager = networkManager;
    this.soundManager = soundManager;

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

},{"./inputmanager":3,"./objects/base":6,"./objects/minion":7,"./objects/particle":8,"./objects/player":9,"./util/draw":19,"./util/prefixer":21}],3:[function(require,module,exports){
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

},{"events":28}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// includes some browser polyfills
require("babelify/polyfill");

var Game = _interopRequire(require("./game"));

var App = _interopRequire(require("./app"));

// var game = window.game = new Game().init();
var app = window.app = new App().init();

},{"./app":1,"./game":2,"babelify/polyfill":27}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// temp
function timed() {
  console.log(arguments[0]);
}

var EventEmitter = require("events").EventEmitter;

var NetworkManager = (function (_EventEmitter) {
  function NetworkManager(controller, game) {
    _classCallCheck(this, NetworkManager);

    this.controller = controller;
    this.game = game;

    this.socket = null;
    this.connected = false;
  }

  _inherits(NetworkManager, _EventEmitter);

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
    off: {
      value: function off(event, callback) {
        this.socket.removeListener(event, callback);
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
          // this.controller.noconnect();
          this.emit("noconnection");
        }
      }
    },
    onSocketConnect: {
      value: function onSocketConnect() {
        this.connected = true;
        this.emit("connect");
        // this.controller.connected();
      }
    },
    onSocketDisconnect: {
      value: function onSocketDisconnect() {
        this.conected = false;
        this.emit("disconnect");
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
})(EventEmitter);

module.exports = NetworkManager;

},{"events":28}],6:[function(require,module,exports){
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

},{"../util/draw":19}],7:[function(require,module,exports){
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

},{"../util/math":20}],8:[function(require,module,exports){
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

},{"../util/color":18}],9:[function(require,module,exports){
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

var NoConnectionScreen = _interopRequire(require("./screens/NoConnectionScreen"));

var LobbyScreen = _interopRequire(require("./screens/LobbyScreen"));

var ScreenManager = (function () {
    function ScreenManager(networkManager, soundManager) {
        _classCallCheck(this, ScreenManager);

        this.networkManager = networkManager;
        this.soundManager = soundManager;

        this.screens = {};
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
                var _this = this;

                this.screens = {};

                this.screens.loading = new LoadingScreen(this.networkManager, this.soundManager);
                this.screens.start = new StartScreen(this.networkManager, this.soundManager);
                this.screens.game = new GameScreen(this.networkManager, this.soundManager);
                this.screens.noConnection = new NoConnectionScreen(this.networkManager, this.soundManager);
                this.screens.lobby = new LobbyScreen(this.networkManager, this.soundManager);

                for (var screenName in this.screens) {
                    var _screen = this.screens[screenName];
                    _screen.on("requestScreen", function (data) {
                        _this.setScreen(data.screen);
                    });
                }
            }
        },
        initNetwork: {
            value: function initNetwork() {
                var _this = this;

                var networkManager = this.networkManager;

                networkManager.on("connect", function () {
                    return _this.setScreen(_this.screens.start);
                });
                networkManager.on("disconnect noconnection", function () {
                    return _this.setScreen(_this.screens.noConnection);
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

function scoopDeDoopAwayWithControloler() {

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
}

},{"./screens/GameScreen":12,"./screens/LoadingScreen":13,"./screens/LobbyScreen":14,"./screens/NoConnectionScreen":15,"./screens/StartScreen":16}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var BaseScreen = (function (_EventEmitter) {
  function BaseScreen(networkManager, soundManager) {
    _classCallCheck(this, BaseScreen);

    this.networkManager = networkManager;
    this.soundManager = soundManager;

    this.active = false;
  }

  _inherits(BaseScreen, _EventEmitter);

  _createClass(BaseScreen, {
    activate: {
      value: function activate() {
        this.active = true;

        this.bindNetworkEvents();
      }
    },
    deactivate: {
      value: function deactivate() {
        this.active = false;

        this.unbindNetworkEvents();
      }
    },
    renderDOM: {
      value: function renderDOM($parent, template) {
        if (this.$el) {
          this.unrenderDOM();
        }

        if (template) {
          this.$el = $(template);
        } else {
          this.$el = $("<div>");
        }

        $parent.html(this.$el);
        this.bindDOMEvents();
      }
    },
    unrenderDOM: {
      value: function unrenderDOM() {
        if (!this.$el) {
          console.warn("Unrender screen which has no $el");
        }

        this.unbindDOMEvents();
      }
    },
    bindDOMEvents: {
      value: function bindDOMEvents() {
        if (!this.domEvents) {
          return;
        }for (var definition in this.domEvents) {
          var split = definition.split(" ");
          var _event = split[0];
          var selector = split.slice(1).join(" ");
          var callback = this[this.domEvents[definition]];

          this.$el.find(selector).on(_event, callback.bind(this));
        }
      }
    },
    unbindDOMEvents: {
      value: function unbindDOMEvents() {
        this.$el.off();
      }
    },
    bindNetworkEvents: {
      value: function bindNetworkEvents() {
        if (!this.networkEvents) {
          return;
        }this._networkEventHandlers = [];

        for (var _event in this.networkEvents) {
          var handler = this[this.networkEvents[_event]].bind(this);

          this._networkEventHandlers.push({ event: _event, handler: handler });

          this.networkManager.on(_event, handler);
        }
      }
    },
    unbindNetworkEvents: {
      value: function unbindNetworkEvents() {
        var _this = this;

        this._networkEventHandlers.forEach(function (networkEvent) {
          _this.networkManager.off(networkEvent.event, networkEvent.handler);
        });
      }
    },
    requestScreen: {
      value: function requestScreen(screen) {
        this.emit("requestScreen", { screen: screen });
      }
    }
  });

  return BaseScreen;
})(EventEmitter);

module.exports = BaseScreen;

},{"events":28}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = _interopRequire(require("./BaseScreen"));

var GameScreen = (function (_BaseScreen) {
  function GameScreen() {
    _classCallCheck(this, GameScreen);
  }

  _inherits(GameScreen, _BaseScreen);

  _createClass(GameScreen, {
    activate: {
      value: function activate() {}
    },
    renderDOM: {
      value: function renderDOM($parent) {
        var gameTemplate = "\n      <h1 style=\"position:fixed; top:40%; width:100%; left:0; text-align:center;\">GAME</h1>\n      <div id=\"screen_game\" class=\"screen\">\n        <canvas id=\"canvas\" width=\"600\" height=\"400\">\n          <p>Your browser doesn't seem to support the Canvas-element :(.</p>\n        </canvas>\n      </div>\n    ";

        _get(Object.getPrototypeOf(GameScreen.prototype), "renderDOM", this).call(this, $parent, gameTemplate);
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

var LobbyScreen = (function (_BaseScreen) {
  function LobbyScreen() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, LobbyScreen);

    _get(Object.getPrototypeOf(LobbyScreen.prototype), "apply", this).call(this, this, args);

    this.networkEvents = {
      "SERVER.initgame": onGameInit
    };
  }

  _inherits(LobbyScreen, _BaseScreen);

  _createClass(LobbyScreen, {
    renderDOM: {
      value: function renderDOM($parent) {
        var template = "\n      <div id=\"screen_waiting\" class=\"screen\">\n        <h2>Waiting for opponent!</h2>\n        <img src=\"res/images/waiting.gif\" alt=\"\">\n      </div>\n    ";

        _get(Object.getPrototypeOf(LobbyScreen.prototype), "renderDOM", this).call(this, $parent, template);
      }
    },
    onGameInit: {
      value: function onGameInit() {
        this.requestScreen("game");
      }
    }
  });

  return LobbyScreen;
})(BaseScreen);

module.exports = LobbyScreen;

},{"./BaseScreen":11}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseScreen = _interopRequire(require("./BaseScreen"));

var NoConnectionScreen = (function (_BaseScreen) {
  function NoConnectionScreen() {
    _classCallCheck(this, NoConnectionScreen);

    if (_BaseScreen != null) {
      _BaseScreen.apply(this, arguments);
    }
  }

  _inherits(NoConnectionScreen, _BaseScreen);

  _createClass(NoConnectionScreen, {
    renderDOM: {
      value: function renderDOM($parent) {
        var template = "\n      <div id=\"screen_noconnect\" class=\"screen hidden\">\n        <img src=\"res/images/surprised.png\" alt=\"\" style=\"width:20%\">\n        <h2>Can't connect!</h2>\n      </div>\n    ";

        _get(Object.getPrototypeOf(NoConnectionScreen.prototype), "renderDOM", this).call(this, $parent, template);
      }
    }
  });

  return NoConnectionScreen;
})(BaseScreen);

module.exports = NoConnectionScreen;

},{"./BaseScreen":11}],16:[function(require,module,exports){
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

    this.domEvents = {
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
      value: function onPlayClick() {
        this.requestScreen("lobby");
      }
    }
  });

  return StartScreen;
})(BaseScreen);

module.exports = StartScreen;

},{"./BaseScreen":11}],17:[function(require,module,exports){
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

},{"./util/prefixer.js":21,"./util/util.js":22}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":24,"regenerator-babel/runtime":25}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
"use strict";

module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":23}],27:[function(require,module,exports){
"use strict";

module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":26}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFx1c2Vyc1xcaGVrdG9yXFxkZXNrdG9wXFx3b3Jrc3BhY2VcXHRvdWNoc2hyb29tXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvYXBwLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL2dhbWUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvaW5wdXRtYW5hZ2VyLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL21haW4uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvbmV0d29ya21hbmFnZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9iYXNlLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL29iamVjdHMvbWluaW9uLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL29iamVjdHMvcGFydGljbGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9wbGF5ZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvc2NyZWVubWFuYWdlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9zY3JlZW5zL0Jhc2VTY3JlZW4uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvc2NyZWVucy9HYW1lU2NyZWVuLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NjcmVlbnMvTG9hZGluZ1NjcmVlbi5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9zY3JlZW5zL0xvYmJ5U2NyZWVuLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NjcmVlbnMvTm9Db25uZWN0aW9uU2NyZWVuLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3NjcmVlbnMvU3RhcnRTY3JlZW4uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvc291bmRtYW5hZ2VyLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvY29sb3IuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC9kcmF3LmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvbWF0aC5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL3ByZWZpeGVyLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvdXRpbC5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9zaGltLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItYmFiZWwvcnVudGltZS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvcG9seWZpbGwuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L3BvbHlmaWxsLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0NPLFlBQVksMkJBQU0sZ0JBQWdCOztJQUNsQyxj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QUFDLEdBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxBQUMzQyxXQUFLLENBQUM7QUFBRSxlQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUNwQixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxBQUNwRCxXQUFLLENBQUM7QUFBRSxlQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDN0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLEFBQzdELFdBQUssQ0FBQztBQUFFLGVBQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDdEMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJ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RyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBRTNCLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25DLFNBQU8sR0FBRyxDQUFDO0NBQ1osQ0FBQzs7QUFFRixZQUFZLENBQUMsYUFBYSxHQUFHLFVBQVMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNuRCxNQUFJLEdBQUcsQ0FBQztBQUNSLE1BQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDNUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUNMLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDeEMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUVSLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNyQyxTQUFPLEdBQUcsQ0FBQztDQUNaLENBQUM7O0FBRUYsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ3ZCLFNBQU8sT0FBTyxHQUFHLEtBQUssVUFBVSxDQUFDO0NBQ2xDOztBQUVELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUNyQixTQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQztDQUNoQzs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDckIsU0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQztDQUNoRDs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDeEIsU0FBTyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUM7Q0FDdkIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXHJcbmltcG9ydCBTb3VuZE1hbmFnZXIgZnJvbSAnLi9zb3VuZG1hbmFnZXInO1xyXG5pbXBvcnQgTmV0d29ya01hbmFnZXIgZnJvbSAnLi9uZXR3b3JrbWFuYWdlcic7XHJcbmltcG9ydCBTY3JlZW5NYW5hZ2VyIGZyb20gJy4vc2NyZWVubWFuYWdlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHAge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubmV0d29ya01hbmFnZXIgPSBuZXcgTmV0d29ya01hbmFnZXIoKTtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcigpO1xyXG4gICAgdGhpcy5zY3JlZW5NYW5hZ2VyID0gbmV3IFNjcmVlbk1hbmFnZXIodGhpcy5uZXR3b3JrTWFuYWdlciwgdGhpcy5zb3VuZE1hbmFnZXIpO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMubmV0d29ya01hbmFnZXIuaW5pdCgpO1xyXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIuaW5pdCgpO1xyXG4gICAgdGhpcy5zY3JlZW5NYW5hZ2VyLmluaXQoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHBlcmZvcm1hbmNlIH0gZnJvbSAnLi91dGlsL3ByZWZpeGVyJztcclxuaW1wb3J0IHsgZHJhd0xpbmUsIGRyYXdDaXJjbGUgfSBmcm9tICcuL3V0aWwvZHJhdyc7XHJcblxyXG5pbXBvcnQgSW5wdXRNYW5hZ2VyIGZyb20gJy4vaW5wdXRtYW5hZ2VyJztcclxuXHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuL29iamVjdHMvcGFydGljbGUnO1xyXG5pbXBvcnQgUGxheWVyIGZyb20gJy4vb2JqZWN0cy9wbGF5ZXInO1xyXG5pbXBvcnQgQmFzZSBmcm9tICcuL29iamVjdHMvYmFzZSc7XHJcbmltcG9ydCBNaW5pb24gZnJvbSAnLi9vYmplY3RzL21pbmlvbic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtNYW5hZ2VyLCBzb3VuZE1hbmFnZXIpIHsgICAgXHJcbiAgICB0aGlzLm5ldHdvcmtNYW5hZ2VyID0gbmV0d29ya01hbmFnZXI7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcbiAgICB0aGlzLmN0eCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5sYXN0X3RpbWUgPSAtMTtcclxuICAgIHRoaXMubm93ID0gLTE7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZF9iYXNlID0gbnVsbDtcclxuICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gbnVsbDtcclxuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5iYXNlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICB0aGlzLm1pbmlvbnMgPSBbXTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcblxyXG4gICAgdGhpcy5tZSA9IG51bGw7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gbnVsbDtcclxuICB9XHJcblxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMpLmluaXQoKTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYW52YXMnKTtcclxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICB0aGlzLmJpbmRGdW5jdGlvbnMoKTtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG4gICAgdGhpcy5zZXR1cFdpZXJkQXJyYXlGdW5jdGlvbnMoKTtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgYmluZEZ1bmN0aW9ucygpIHtcclxuICAgIHRoaXMubG9vcCA9IHRoaXMubG9vcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgc2V0dXBXaWVyZEFycmF5RnVuY3Rpb25zKCkge1xyXG4gICAgdGhpcy5wbGF5ZXJzLmZpbmRCeSA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgICBpZiAodGhpc1tpXVtwcm9wXSA9PT0gdmFsdWUpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucGxheWVycy5ieUlEID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgZm9yIChsZXQgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xyXG4gICAgICAgIGlmICh0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIHRoaXNbaV07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIG1ldGhvZCB0byBiYXNlIGxpc3RcclxuICAgIHRoaXMuYmFzZXMuaW5kZXhCeUlEID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xyXG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKSByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmJhc2VzLmJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvcih2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE1JTklPTlxyXG4gICAgdGhpcy5taW5pb25zLmJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvcih2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcblxyXG4gIHNldHVwKGRhdGEpIHtcclxuICAgIGxldCBsdmxfbmFtZSA9IGRhdGEubGV2ZWxfbmFtZTtcclxuICAgIGxldCBteV9pZCA9IGRhdGEubXlfaWQ7XHJcbiAgICBsZXQgcGxheWVycyA9IGRhdGEucGxheWVycztcclxuXHJcbiAgICAvLyB0aW1lZCgnTGV2ZWw6ICcgKyBsdmxfbmFtZSk7XHJcblxyXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gZGF0YS5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGxldCBiID0gZGF0YS5iYXNlc1tpXTtcclxuICAgICAgdGhpcy5iYXNlcy5wdXNoKFxyXG4gICAgICAgIG5ldyBCYXNlKHRoaXMsIGIuaWQsIGIubGVmdCwgYi50b3AsIGIuc2NhbGUsIGIucmVzb3VyY2VzLCBiLnJlc291cmNlc19tYXgpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBwbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgbGV0IHBsYXllckRhdGEgPSBwbGF5ZXJzW2ldO1xyXG5cclxuICAgICAgbGV0IHBsYXllciA9IG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICBwbGF5ZXJEYXRhLmlkLFxyXG4gICAgICAgIHBsYXllckRhdGEubmFtZSxcclxuICAgICAgICBwbGF5ZXJEYXRhLmNvbG9yXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBsZXQgc3RhcnRTdGF0ZXMgPSBkYXRhLnN0YXJ0X3N0YXRlW2ldO1xyXG4gICAgICBzdGFydFN0YXRlcy5mb3JFYWNoKGkgPT4gdGhpcy5iYXNlc1tpXS5zZXRQbGF5ZXIocGxheWVyKSk7XHJcblxyXG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG5cclxuICAgICAgaWYgKHBsYXllckRhdGEuaWQgPT09IG15X2lkKXtcclxuICAgICAgICB0aGlzLm1lID0gcGxheWVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZW5kKCdQTEFZRVIucmVhZHknKTtcclxuICB9XHJcblxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMubm93ID0gdGhpcy5sYXN0X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wKTtcclxuICB9XHJcblxyXG4gIGVuZCgpIHtcclxuICAgIGlmKHRoaXMuYW5pbWF0aW9uRnJhbWUpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xyXG5cclxuICAgIC8vIENMRUFOIFVQIEdBTUVcclxuICAgIHRoaXMuYmFzZXMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMucGxheWVycy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5tZSA9IG51bGw7XHJcbiAgICB0aGlzLm1pbmlvbnMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMucGFydGljbGVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgLy8gVGVtcG9yYXJ5IHNvbHV0aW9uIHRvIGhpZGUgb3ZlcmxheSBhbmQgZ28gYmFjayB0byBTVEFSVFxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAvLyBDT05UUk9MTEVSLm92ZXJsYXlIaWRlKCk7XHJcbiAgICAgIC8vIENPTlRST0xMRVIuc2V0U2NyZWVuKCdzdGFydCcpO1xyXG4gICAgfSwgMzAwMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgbG9vcCgpIHtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3ApO1xyXG5cclxuICAgIGlmICh0aGlzLmRyYXdfdGltZSlcclxuICAgICAgdGhpcy5kcmF3X3RpbWUgPSB0aW1lIC0gdGhpcy5kcmF3X3RpbWU7XHJcblxyXG4gICAgdGhpcy5ub3cgPSB0aW1lO1xyXG4gICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIHRoaXMubGFzdF90aW1lKSAvIDEwMDAuMDtcclxuICAgIHRoaXMubGFzdF90aW1lID0gdGltZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZV90aW1lID0gdGltZTtcclxuICAgIHRoaXMudXBkYXRlKGVsYXBzZWQpO1xyXG4gICAgdGhpcy51cGRhdGVfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy51cGRhdGVfdGltZTtcclxuXHJcbiAgICB0aGlzLmRyYXdfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdGhpcy5kcmF3KCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnVwZGF0ZSh0aW1lKTtcclxuICB9XHJcblxyXG5cclxuICBkcmF3ICgpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuXHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLm1pbmlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgbGV0IG0gPSB0aGlzLm1pbmlvbnNbaV07XHJcbiAgICAgIGlmIChtLmFjdGl2ZSkgbS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gRHJhdyBsaW5lIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy9cclxuICAgIGlmICh0aGlzLnNlbGVjdGVkX2Jhc2Upe1xyXG4gICAgICBsZXQgYiA9IHRoaXMuc2VsZWN0ZWRfYmFzZTtcclxuXHJcbiAgICAgIGxldCB4LCB5O1xyXG4gICAgICBpZiAodGhpcy50YXJnZXRlZF9iYXNlKXtcclxuICAgICAgICB4ID0gdGhpcy50YXJnZXRlZF9iYXNlLng7XHJcbiAgICAgICAgeSA9IHRoaXMudGFyZ2V0ZWRfYmFzZS55O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHggPSB0aGlzLmlucHV0TWFuYWdlci5wb2ludGVyLng7XHJcbiAgICAgICAgeSA9IHRoaXMuaW5wdXRNYW5hZ2VyLnBvaW50ZXIueTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMztcclxuICAgICAgbGV0IGxpbmVfc2l6ZSA9IDU7XHJcbiAgICAgIGxldCBjb2xvciA9IHRoaXMubWUuY29sb3IgfHwgJyNBQUEnIDtcclxuICAgICAgZHJhd0xpbmUoY3R4LCBiLngsIGIueSwgeCwgeSwgY29sb3IsIGxpbmVfc2l6ZSk7XHJcbiAgICAgIGRyYXdDaXJjbGUoY3R4LCB4LCB5LCBsaW5lX3NpemUgLyAyLCBjb2xvcik7XHJcblxyXG4gICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHRoaXMuYmFzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICB0aGlzLmJhc2VzW2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHRoaXMucGFydGljbGVzW2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRyYXdTY29yZUJhcihjdHgpO1xyXG4gIH1cclxuXHJcbiAgZHJhd1Njb3JlQmFyKGN0eCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICBsZXQgdyA9IHdpZHRoIC8gMS41O1xyXG4gICAgbGV0IGggPSBoZWlnaHQgLyAyMDtcclxuICAgIGxldCB4ID0gKHdpZHRoIC8gMikgLSAodyAvIDIpO1xyXG4gICAgbGV0IHkgPSAoaGVpZ2h0IC8gMjApIC0gKGggLyAyKTtcclxuXHJcbiAgICBsZXQgciA9IFtdO1xyXG4gICAgbGV0IHRvdGFsID0gMDtcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICByW2ldID0gdGhpcy5wbGF5ZXJzW2ldLnRvdGFsUmVzb3VyY2VzKCk7XHJcbiAgICAgIHRvdGFsICs9IHJbaV07XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHh0ID0geDtcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wbGF5ZXJzW2ldLmNvbG9yO1xyXG4gICAgICBsZXQgd3QgPSAocltpXSAvIHRvdGFsKSAqIHc7XHJcbiAgICAgIGN0eC5maWxsUmVjdCh4dCwgeSwgd3QsIGgpO1xyXG4gICAgICBsZXQgdGV4dCA9IHRoaXMucGxheWVyc1tpXS5uYW1lICsgJyAtICcgKyByW2ldO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIHh0ICsgKHd0LzIpIC0gKGN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aC8yKSwgeSsoaC8yKSk7XHJcblxyXG4gICAgICB4dCArPSB3dDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuICAgIGN0eC5zdHJva2VSZWN0KHgsIHksIHcsIGgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgdGhpcy53aWR0aCAgPSB0aGlzLmNhbnZhcy53aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuYmFzZXMuZm9yRWFjaChlID0+IGUucmVzaXplKCkpO1xyXG4gICAgdGhpcy5taW5pb25zLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcclxuICAgIHRoaXMucGFydGljbGVzLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcclxuICB9XHJcblxyXG5cclxuXHJcbiAgdHJ5U2VuZE1pbmlvbih0YXJnZXQpIHtcclxuICAgIHRhcmdldC50YXJnZXRlZCA9IHRydWU7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSB0YXJnZXQ7XHJcblxyXG4gICAgLy8gQ2FsbCAnY2FuU2VuZE1pbmlvbicgb24gc2VsZWN0ZWRfYmFzZVxyXG4gICAgLy8gW0NIQU5HRURdIEFsbHdheXMgYXNrIHNlcnZlciB0byBzZW5kXHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZF9iYXNlLmNhblNlbmRNaW5pb24oKSB8fCB0cnVlKXtcclxuICAgICAgdGhpcy5uZXR3b3JrTWFuYWdlci5zZW5kKCdCQVNFLm1pbmlvbicsIHtcclxuICAgICAgICBzb3VyY2VfaWQ6IHRoaXMuc2VsZWN0ZWRfYmFzZS5pZCxcclxuICAgICAgICB0YXJnZXRfaWQ6IHRhcmdldC5pZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEJ5SUQobGlzdCwgaWQpIHtcclxuICAgIGZvciAobGV0IGkgPSBsaXN0Lmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgbGV0IGl0ZW0gPSBsaXN0W2ldO1xyXG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLmlkID09IGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gaGVoZVNjb3BlQXdheVNpbGx5SW1wbGVtZW50YXRpb24oKSB7XHJcblxyXG5cclxuXHJcbiAgLy8vLy8vLy8vLy8vXHJcbiAgLy8gRVZFTlRTIC8vXHJcbiAgLy8vLy8vLy8vLy8vXHJcbiAgLyoqXHJcbiAgICogeyBESVNDT05ORUNUSU9OIH1cclxuICAgKiBDYWxsZWQgd2hlbiBhIHBsYXllciBkaXNjb25uZWN0cyBmcm9tIHRoZSBnYW1lXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5kaXNjb25uZWN0aW9uID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgcCA9IHRoaXMucGxheWVycy5maW5kQnkoJ2lkJywgZGF0YS5wbGF5ZXJfaWQpO1xyXG5cclxuICAgIGlmKHAgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgIENPTlRST0xMRVIub3ZlcmxheU1lc3NhZ2UoXCInezB9JyBkaXNjb25uZWN0ZWRcIi5mb3JtYXQocC5uYW1lKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiB7IEJBU0UgUkVTT1VSQ0VTIH1cclxuICAgKiBXaGVuIGEgYmFzZSBnb3QgdXBkYXRlZCByZXNvdXJjZXMgZnJvbSBzZXJ2ZXJcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLmJhc2VSZXNvdXJjZXMgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBiID0gR0FNRS5iYXNlcy5ieUlEKGRhdGEuYmFzZV9pZCk7XHJcblxyXG4gICAgaWYoYilcclxuICAgICAgYi5yZXNvdXJjZXMgPSBkYXRhLnJlc291cmNlcztcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgTkVXIE1JTklPTiB9XHJcbiAgICogQ2FsbGVkIHdoZW4gc2VydmVyIHNlbmRzIGEgbmV3IG1pbmlvblxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUubmV3TWluaW9uID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgbSA9IGRhdGEubWluaW9uO1xyXG5cclxuICAgIHZhciBzb3VyY2UgPSB0aGlzLmJhc2VzLmJ5SUQobS5zb3VyY2VfaWQpO1xyXG4gICAgdmFyIHRhcmdldCA9IHRoaXMuYmFzZXMuYnlJRChtLnRhcmdldF9pZCk7XHJcblxyXG4gICAgdmFyIG1pbmlvbiA9IG5ldyBNaW5pb24oXHJcbiAgICAgIG0uaWQsXHJcbiAgICAgIHNvdXJjZSxcclxuICAgICAgdGFyZ2V0LFxyXG4gICAgICBtLnNjYWxlXHJcbiAgICApO1xyXG5cclxuICAgIHNvdXJjZS5zZW5kTWluaW9uKCk7XHJcblxyXG4gICAgdGhpcy5taW5pb25zLnB1c2gobWluaW9uKTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgTUlOSU9OIEhJVCB9XHJcbiAgICogQ2FsbGVkIGJ5IHNlcnZlciB3aGVuIG1pbmlvbiByZWFjaGVzIHRhcmdldCBiYXNlXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5taW5pb25IaXQgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBtaW5pb25faWQgPSBkYXRhLm1pbmlvbl9pZDtcclxuICAgIHZhciBuZXdfcGxheWVyX2lkID0gZGF0YS5uZXdfcGxheWVyX2lkO1xyXG4gICAgdmFyIHJlc291cmNlcyA9IGRhdGEucmVzb3VyY2VzO1xyXG5cclxuICAgIC8vIEZldGNoIG1pbmlvblxyXG4gICAgdmFyIG1pbmlvbiA9IHRoaXMubWluaW9ucy5ieUlEKG1pbmlvbl9pZCk7XHJcblxyXG4gICAgaWYoIW1pbmlvbil7XHJcbiAgICAgIGFsZXJ0KCdNaW5pb24gZ29uZScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbWluaW9uLmRlYWRfYnlfc2VydmVyID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBHZXQgdGFyZ2V0IGJhc2VcclxuICAgIHZhciB0YXJnZXQgPSBtaW5pb24udGFyZ2V0X2Jhc2U7XHJcbiAgICAvLyBTZXQgcmVzb3VyY2VzIGZvciBiYXNlXHJcbiAgICB0YXJnZXQucmVzb3VyY2VzID0gcmVzb3VyY2VzO1xyXG5cclxuICAgIGlmKG5ld19wbGF5ZXJfaWQgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllcnMuYnlJRChuZXdfcGxheWVyX2lkKTtcclxuICAgICAgdGFyZ2V0LnNldFBsYXllcihwbGF5ZXIpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHsgVVBEQVRFIH1cclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHQgICBFbGFwc2VkIHRpbWUgc2luY2UgbGFzdCB1cGRhdGUgKHNlY29uZHMpXHJcbiAgICovXHJcbiAgR0FNRS51cGRhdGUgPSBmdW5jdGlvbih0KXtcclxuICAgIHZhciBpLCBsZW4sIGIsIG0sIHA7XHJcblxyXG5cclxuICAgIC8vIFJlc2V0IGhvdmVyZWQgYW5kIHRhcmdldGVkXHJcbiAgICB0aGlzLmhvdmVyZWRfYmFzZSA9IG51bGw7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSBudWxsO1xyXG5cclxuXHJcblxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLmJhc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgYiA9IHRoaXMuYmFzZXNbaV07XHJcblxyXG4gICAgICAvLyBVcGRhdGUgYmFzZVxyXG4gICAgICBiLnVwZGF0ZSh0KTtcclxuXHJcbiAgICAgIC8vIFJlc2V0IGJhc2UgaG92ZXJlZCAmIHRhcmdldGVkIHN0YXRlXHJcbiAgICAgIGIuaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICBiLnRhcmdldGVkID0gZmFsc2U7XHJcblxyXG5cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgLy8gQ0hFQ0sgSU5QVVQgLy9cclxuICAgICAgLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgLy8gTW91c2UgaXMgb3ZlciBiYXNlXHJcbiAgICAgIGlmKHBvaW50SW5DaXJjbGUoVE9VQ0gueCwgVE9VQ0gueSwgYi54LCBiLnksIGIuc2l6ZSkpe1xyXG4gICAgICAgIC8vIFNlZSBpZiB0aGVyZSBpcyBhbnkgc2VsZWN0ZWQgYmFzZSBhbmQgaXQgaXNuJ3QgdGhlIG9uZSB0ZXN0ZWRcclxuICAgICAgICBpZih0aGlzLnNlbGVjdGVkX2Jhc2UgJiYgdGhpcy5zZWxlY3RlZF9iYXNlICE9PSBiKXtcclxuICAgICAgICAgIC8vIFNldCB0aGUgYmFzZSBhcyB0YXJnZXRlZCBhbmQgdHJ5IHRvIHNlbmRcclxuICAgICAgICAgIEdBTUUudHJ5U2VuZE1pbmlvbihiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBiYXNlIGJlbG9ucyB0byAnbWUnXHJcbiAgICAgICAgICBpZih0aGlzLm1lLmJhc2VzX2lkLmluZGV4T2YoYi5pZCkgIT09IC0xKXtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBiYXNlIGFzIGhvdmVyZWRcclxuICAgICAgICAgICAgYi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKHRoaXMubWUuYmFzZXNfaWQuaW5kZXhPZihiLmlkKSAhPSAtMSl7XHJcbiAgICAgICAgaWYoIWIuc2VsZWN0ZWQgJiYgcG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XHJcbiAgICAgICAgICBiLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8gVXBkYXRlIG1pbmlvbnNcclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5taW5pb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgbSA9IHRoaXMubWluaW9uc1tpXTtcclxuICAgICAgaWYobS5hY3RpdmUpe1xyXG4gICAgICAgIG0udXBkYXRlKHQpO1xyXG5cclxuICAgICAgICBpZighbS5hY3RpdmUpe1xyXG4gICAgICAgICAgU09VTkQucGxheVJhbmRvbVNvdW5kKCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChcclxuICAgICAgICAgICAgbmV3IFBhcnRpY2xlKG0udGFyZ2V0X2Jhc2UubGVmdCwgbS50YXJnZXRfYmFzZS50b3AsIG0udGFyZ2V0X2Jhc2Uuc2NhbGUsIG0uc291cmNlX2Jhc2UuY29sb3IpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG0uZGVhZF9ieV9zZXJ2ZXIgJiYgIW0uYWN0aXZlKXtcclxuICAgICAgICB0aGlzLm1pbmlvbnMuc3BsaWNlKGktLSwgMSk7XHJcbiAgICAgICAgLS1sZW47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgcGF0aWNsZXNcclxuICAgIGZvcihpID0gMCwgbGVuID0gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBwID0gdGhpcy5wYXJ0aWNsZXNbaV07XHJcbiAgICAgIHAudXBkYXRlKHQpO1xyXG5cclxuICAgICAgaWYoIXAuYWN0aXZlKXtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaS0tLCAxKTtcclxuICAgICAgICAtLWxlbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICBHQU1FLnNlbmQgPSBmdW5jdGlvbihtc2csIGRhdGEpe1xyXG4gICAgTkVULnNlbmQobXNnLCBkYXRhKTtcclxuICB9O1xyXG4gIFxyXG5cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIHsgU1RBUlQgVE9VQ0ggfVxyXG4gICAqL1xyXG4gIEdBTUUuc3RhcnRUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaSwgYiwgbGVuO1xyXG5cclxuICAgIGlmKCFHQU1FLm1lKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSBHQU1FLm1lLmJhc2VzX2lkLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgYiA9IEdBTUUuYmFzZXNbR0FNRS5iYXNlcy5pbmRleEJ5SUQoR0FNRS5tZS5iYXNlc19pZFtpXSldO1xyXG5cclxuICAgICAgaWYocG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XHJcbiAgICAgICAgYi5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlID0gYjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHsgRU5EIFRPVUNIIH1cclxuICAgKi9cclxuICBHQU1FLmVuZFRvdWNoID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKEdBTUUuc2VsZWN0ZWRfYmFzZSl7XHJcbiAgICAgIC8vIEFkZCBuZXcgbWluaW9uXHJcbiAgICAgIGlmKEdBTUUudGFyZ2V0ZWRfYmFzZSl7XHJcblxyXG4gICAgICB9XHJcbiAgICAgIEdBTUUuc2VsZWN0ZWRfYmFzZS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbn0iLCJcclxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0TWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy5wb2ludGVyID0ge1xyXG4gICAgICB4OiAwLFxyXG4gICAgICB5OiAwLFxyXG4gICAgICBkb3duOiBmYWxzZSxcclxuICAgICAgdGltZURvd246IDBcclxuICAgIH07XHJcbiAgICB0aGlzLmxhc3RQb2ludGVyID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wb2ludGVyKTtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy51cGRhdGVQb3NpdGlvbi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMudXBkYXRlUG9zaXRpb24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUodGltZSkge1xyXG4gICAgdGhpcy5sYXN0UG9pbnRlciA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucG9pbnRlcik7XHJcblxyXG4gICAgaWYgKHRoaXMucG9pbnRlci5kb3duKSB7XHJcbiAgICAgIHRoaXMucG9pbnRlci50aW1lRG93biArPSB0aW1lO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2ludGVyLnRpbWVEb3duID0gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldFN0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogdGhpcy5wb2ludGVyLngsXHJcbiAgICAgIHk6IHRoaXMucG9pbnRlci55LFxyXG4gICAgICBkb3duOiB0aGlzLnBvaW50ZXIuZG93blxyXG4gICAgfTtcclxuICB9XHJcblxyXG5cclxuICB0cmFuc2xhdGVFdmVudENvb3JkaW5hdGVzKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQuY2hhbmdlZFRvdWNoZXMpIHtcclxuICAgICAgcmV0dXJuIFsgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3NpdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBsZXQgWyBwYWdlWCwgcGFnZVkgXSA9IHRoaXMudHJhbnNsYXRlRXZlbnRDb29yZGluYXRlcyhldmVudCk7XHJcbiAgICBbIHRoaXMucG9pbnRlci54LCB0aGlzLnBvaW50ZXIueSBdID0gWyBwYWdlWCwgcGFnZVkgXTtcclxuICB9XHJcblxyXG4gIG9uUG9pbnRlckRvd24oZXZlbnQpIHtcclxuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oZXZlbnQpO1xyXG4gICAgdGhpcy5wb2ludGVyLmRvd24gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgb25Qb2ludGVyVXAoZXZlbnQpIHtcclxuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oZXZlbnQpO1xyXG4gICAgdGhpcy5wb2ludGVyLmRvd24gPSBmYWxzZTtcclxuICAgIHRoaXMudHJpZ2dlcigncG9pbnRlci51cCcpO1xyXG4gIH1cclxuXHJcbn0iLCJcclxuLy8gaW5jbHVkZXMgc29tZSBicm93c2VyIHBvbHlmaWxsc1xyXG5yZXF1aXJlKCdiYWJlbGlmeS9wb2x5ZmlsbCcpO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lJ1xyXG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJztcclxuXHJcbi8vIHZhciBnYW1lID0gd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpLmluaXQoKTtcclxudmFyIGFwcCA9IHdpbmRvdy5hcHAgPSBuZXcgQXBwKCkuaW5pdCgpO1xyXG4iLCJcclxuLy8gdGVtcFxyXG5mdW5jdGlvbiB0aW1lZCgpIHsgY29uc29sZS5sb2coYXJndW1lbnRzWzBdKTsgfVxyXG5cclxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ldHdvcmtNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY29udHJvbGxlciwgZ2FtZSkge1xyXG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5jb25uZWN0KCk7XHJcbiAgICB0aGlzLnNldHVwU29ja2V0RXZlbnRIYW5kbGVycygpO1xyXG4gIH1cclxuXHJcbiAgY29ubmVjdCgpIHtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnOjg4ODgnLCB7XHJcbiAgICAgICAgcmVjb25uZWN0OiB0cnVlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG9mZihldmVudCwgY2FsbGJhY2spIHtcclxuICAgIHRoaXMuc29ja2V0LnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgIHRoaXMuc29ja2V0Lm9uKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgfVxyXG4gIHNlbmQoZXZlbnQsIGRhdGEpIHtcclxuICAgIHRoaXMuc29ja2V0LmVtaXQoZXZlbnQsIGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBTb2NrZXRFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgbGV0IHNvY2tldCA9IHRoaXMuc29ja2V0O1xyXG5cclxuICAgIHNvY2tldC5vbignZXJyb3InLCB0aGlzLm9uU29ja2V0RXJyb3IuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0Q29ubmVjdC5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignU0VSVkVSLnlvdXJuYW1lJywgdGhpcy5vblNlcnZlcllvdXJuYW1lLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdTRVJWRVIubnVtX3BsYXllcnMnLCB0aGlzLm9uU2VydmVyTnVtUGxheWVycy5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignU0VSVkVSLmluaXRnYW1lJywgdGhpcy5vblNlcnZlckluaXRnYW1lLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignR0FNRS5zZXR1cCcsIHRoaXMub25HYW1lU2V0dXAuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ0dBTUUuc3RhcnQnLCB0aGlzLm9uR2FtZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLmVuZCcsIHRoaXMub25HYW1lRW5kLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLmRpc2Nvbm5lY3Rpb24nLCB0aGlzLm9uR2FtZURpc2Nvbm5lY3Rpb24uYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ0dBTUUubWluaW9uJywgdGhpcy5vbkdhbWVNaW5pb24uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdNSU5JT04uaGl0JywgdGhpcy5vbk1pbmlvbkhpdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBzb2NrZXQub24oJ0JBU0UucmVzb3VyY2VzJywgdGhpcy5vbkJhc2VSZXNvdXJjZXMuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdteSBwbGF5ZXInLCB0aGlzLm9uTXlQbGF5ZXIuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdnLnBsYXllcnMnLCB0aGlzLm9uR1BsYXllcnMuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdwLmNvbm5lY3Rpb24nLCB0aGlzLm9uUENvbm5lY3Rpb24uYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ3AuZGlzY29ubmVjdGlvbicsIHRoaXMub25QRGlzY29ubmVjdGlvbi5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgc29ja2V0Lm9uKCdiLm1pbmlvbicsIHRoaXMub25CTWluaW9uLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgc2VuZChtc2csIGRhdGEpIHtcclxuICAgIHRoaXMuc29ja2V0LmVtaXQobXNnLCBkYXRhKTtcclxuICB9XHJcblxyXG5cclxuICBvblNvY2tldEVycm9yKCkge1xyXG4gICAgaWYgKCF0aGlzLmNvbm5lY3RlZCkge1xyXG4gICAgICAvLyB0aGlzLmNvbnRyb2xsZXIubm9jb25uZWN0KCk7XHJcbiAgICAgIHRoaXMuZW1pdCgnbm9jb25uZWN0aW9uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9uU29ja2V0Q29ubmVjdCgpIHtcclxuICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcclxuICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xyXG4gICAgLy8gdGhpcy5jb250cm9sbGVyLmNvbm5lY3RlZCgpO1xyXG4gIH1cclxuICBvblNvY2tldERpc2Nvbm5lY3QoKSB7XHJcbiAgICB0aGlzLmNvbmVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3QnKTtcclxuICAgIC8vIHRoaXMuY29udHJvbGxlci5kaXNjb25uZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIG9uU2VydmVyWW91cm5hbWUoZGF0YSkge1xyXG4gICAgdGltZWQoYFlvdSBzaGFsbCBiZSBrbm93biBhcyAnJHtkYXRhLm5hbWV9J2ApO1xyXG4gIH1cclxuICBvblNlcnZlck51bVBsYXllcnMoZGF0YSkge1xyXG4gICAgdGltZWQoJ1BsYXllcnMgb25saW5lOiAnICsgZGF0YS5udW1fcGxheWVycyk7XHJcbiAgfVxyXG4gIG9uU2VydmVySW5pdGdhbWUoKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIuc3RhcnRnYW1lKCk7XHJcbiAgfVxyXG5cclxuICBvbkdhbWVTZXR1cChkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuc2V0dXAoZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5nYW1lLnN0YXJ0KCk7IFxyXG4gIH1cclxuICBvbkdhbWVFbmQoKSB7XHJcbiAgICB0aGlzLmdhbWUuZW5kKCk7XHJcbiAgfVxyXG4gIG9uR2FtZURpc2Nvbm5lY3Rpb24oZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLmRpc2Nvbm5lY3Rpb24oZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZU1pbmlvbihkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUubmV3TWluaW9uKGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgb25NaW5pb25IaXQoZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLm1pbmlvbkhpdChkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uQmFzZVJlc291cmNlcyhkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuYmFzZVJlc291cmNlcyhkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uTXlQbGF5ZXIoZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLm1lID0gbmV3IEJhc2UoZGF0YS5wbGF5ZXIuYXNwZWN0X2xlZnQsIGRhdGEucGxheWVyLmFzcGVjdF90b3AsIGRhdGEucGxheWVyLmFzcGVjdF9zaXplLCBkYXRhLnBsYXllci5jb2xvcik7XHJcbiAgICB0aGlzLmdhbWUubWUucGxheWVyX2lkID0gZGF0YS5wbGF5ZXIucGxheWVyX2lkO1xyXG4gICAgdGhpcy5nYW1lLmJhc2VzLnB1c2godGhpcy5nYW1lLm1lKTtcclxuICB9XHJcblxyXG4gIC8vIFByb2JhYmx5IHVudXNlZFxyXG4gIC8vIGxvZ2ljIHNlZW1zIHRvIGJlIHdyb25nXHJcbiAgb25HUGxheWVycyhkYXRhKSB7XHJcbiAgICBsZXQgcGxheWVycyA9IGRhdGEucGxheWVycztcclxuICAgIGxldCBiYXNlcyA9IHRoaXMuZ2FtZS5iYXNlcztcclxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBsZXQgaW5kZXggPSBnYW1lLmJhc2VzLmluZGV4QnlJRChwbGF5ZXJzW2ldLnBsYXllcl9pZCk7XHJcblxyXG4gICAgICAvLyBJZiBwbGF5ZXIgaXMgbm90IGluIGdhbWUgLT4gQWRkXHJcbiAgICAgIGlmKGluZGV4ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxldCBiYXNlID0gbmV3IEJhc2UocGxheWVyc1tpXS5hc3BlY3RfbGVmdCwgcGxheWVyc1tpXS5hc3BlY3RfdG9wLCBwbGF5ZXJzW2ldLmFzcGVjdF9zaXplLCBwbGF5ZXJzW2ldLmNvbG9yKTtcclxuICAgICAgICBiYXNlLnBsYXllcl9pZCA9IHBsYXllcnNbaV0ucGxheWVyX2lkO1xyXG4gICAgICAgIEdBTUUuYmFzZXMucHVzaChiYXNlKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBFbHNlIHNldCB2YWx1ZXMgY29ycmVjdFxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsZXQgYmFzZSA9IGJhc2VzW2luZGV4XTtcclxuICAgICAgICBiYXNlLmFzcGVjdF9sZWZ0ID0gcGxheWVyc1tpXS5hc3BlY3RfbGVmdDtcclxuICAgICAgICBiYXNlLmFzcGVjdF90b3AgPSBwbGF5ZXJzW2ldLmFzcGVjdF90b3A7XHJcbiAgICAgICAgYmFzZS5hc3BlY3Rfc2l6ZSA9IHBsYXllcnNbaV0uYXNwZWN0X3NpemU7XHJcbiAgICAgICAgYmFzZS5jb2xvciA9IHBsYXllcnNbaV0uY29sb3I7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsIHJlc2l6ZSB0byBmaXggYXNwZWN0c1xyXG4gICAgdGhpcy5nYW1lLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgb25QQ29ubmVjdGlvbihkYXRhKSB7XHJcbiAgICBpZihkYXRhLnBsYXllci5wbGF5ZXJfaWQgIT09IHRoaXMuZ2FtZS5tZS5wbGF5ZXJfaWQpe1xyXG4gICAgICB2YXIgYiA9IG5ldyBCYXNlKGRhdGEucGxheWVyLmFzcGVjdF9sZWZ0LCBkYXRhLnBsYXllci5hc3BlY3RfdG9wLCBkYXRhLnBsYXllci5hc3BlY3Rfc2l6ZSwgZGF0YS5wbGF5ZXIuY29sb3IpO1xyXG4gICAgICBiLnBsYXllcl9pZCA9IGRhdGEucGxheWVyLnBsYXllcl9pZDtcclxuICAgICAgdGhpcy5nYW1lLmJhc2VzLnB1c2goYik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBTZWVtcyB0byBiZSB1bnVzZWQsIGxvZ2ljIHNlZW1zIHdyb25nXHJcbiAgb25QRGlzY29ubmVjdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgaSA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS5wbGF5ZXJfaWQpO1xyXG4gICAgaWYoaSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgdGhpcy5nYW1lLmJhc2VzLnNwbGljZShpLCAxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uQk1pbmlvbihkYXRhKSB7XHJcbiAgICBsZXQgZ2FtZSA9IHRoaXMuZ2FtZTtcclxuICAgIGxldCBiYXNlcyA9IGdhbWUuYmFzZXM7XHJcbiAgICBsZXQgc291cmNlQmFzZSA9IGdhbWUuZ2V0QnlJRChiYXNlcywgZGF0YS5zb3VyY2VfaWQpO1xyXG4gICAgbGV0IHRhcmdldEJhc2UgPSBnYW1lLmdldEJ5SUQoYmFzZXMsIGRhdGEudGFyZ2V0X2lkKTtcclxuXHJcbiAgICBpZiAoISFzb3VyY2VCYXNlICYmICEhdGFyZ2V0QmFzZSkge1xyXG4gICAgICBnYW1lLm1pbmlvbnMucHVzaChcclxuICAgICAgICBuZXcgTWluaW9uKHNvdXJjZUJhc2UsIHRhcmdldEJhc2UpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyIHNvdXJjZV9pbmRleCA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS5zb3VyY2VfaWQpO1xyXG4gICAgLy8gdmFyIHRhcmdldF9pbmRleCA9IHRoaXMuZ2FtZS5iYXNlcy5pbmRleEJ5SUQoZGF0YS50YXJnZXRfaWQpO1xyXG5cclxuICAgIC8vIGlmKHNvdXJjZV9pbmRleCAhPT0gdW5kZWZpbmVkICYmIHRhcmdldF9pbmRleCAhPT0gdW5kZWZpbmVkKXtcclxuICAgIC8vICAgICB0aGlzLmdhbWUubWluaW9ucy5wdXNoKFxyXG4gICAgLy8gICAgICAgbmV3IE1pbmlvbih0aGlzLmdhbWUuYmFzZXNbc291cmNlX2luZGV4XSwgdGhpcy5nYW1lLmJhc2VzW3RhcmdldF9pbmRleF0pXHJcbiAgICAvLyAgICAgKTtcclxuICAgIC8vIH1cclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IHsgZHJhd0NpcmNsZSB9IGZyb20gJy4uL3V0aWwvZHJhdyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGdhbWUsIGlkLCBsZWZ0LCB0b3AsIHNjYWxlLCByZXNvdXJjZXMsIHJlc291cmNlc19tYXgpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gICAgdGhpcy54ID0gLTE7XHJcbiAgICB0aGlzLnkgPSAtMTtcclxuICAgIHRoaXMuc2l6ZSA9IC0xO1xyXG5cclxuICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICB0aGlzLnRvcCA9IHRvcDtcclxuICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCAwLjE7XHJcbiAgICB0aGlzLnNoYWRvd19zaXplID0gMzA7XHJcblxyXG4gICAgdGhpcy5jb2xvciA9ICcjQUFBQUFBJztcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudGFyZ2V0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnNwYXduX2RlbGF5ID0gMDtcclxuICAgIHRoaXMuc3Bhd25fZGVsYXlfbWF4ID0gMC41O1xyXG5cclxuICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzIHx8IDA7XHJcbiAgICB0aGlzLnJlc291cmNlc19tYXggPSByZXNvdXJjZXNfbWF4O1xyXG5cclxuICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHVwZGF0ZSh0aW1lKSB7XHJcbiAgICBpZih0aGlzLnNwYXduX2RlbGF5ID4gMClcclxuICAgICAgdGhpcy5zcGF3bl9kZWxheSAtPSB0aW1lO1xyXG4gIH1cclxuXHJcbiAgZHJhdyhjdHgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcblxyXG5cclxuICAgIGlmICh0aGlzLmhvdmVyZWQpe1xyXG4gICAgICBjdHguc2hhZG93Q29sb3IgPSB0aGlzLmNvbG9yO1xyXG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkKXtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gdGhpcy5jb2xvcjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAyMDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2lyY2xlKGN0eCwgdGhpcy54LCB0aGlzLnksIHRoaXMuc2l6ZSwgdGhpcy5jb2xvciwgJ2ZpbGwnKTtcclxuXHJcbiAgICAvLyBEcmF3IHRleHRcclxuICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgdmFyIHRleHQgPSB0aGlzLnJlc291cmNlcyArICgodGhpcy5wbGF5ZXIpPyAnLycgKyB0aGlzLnJlc291cmNlc19tYXggOiAnJyk7XHJcbiAgICB2YXIgbSA9IGN0eC5tZWFzdXJlVGV4dCh0ZXh0KTtcclxuICAgIGN0eC5maWxsVGV4dCh0ZXh0LCB0aGlzLnggLSBtLndpZHRoLzIsIHRoaXMueSk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcblxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICBpZiAodGhpcy5nYW1lLndpZHRoID4gdGhpcy5nYW1lLmhlaWdodCkge1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmdhbWUud2lkdGggKiB0aGlzLmxlZnQ7XHJcbiAgICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnRvcDtcclxuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMuc2NhbGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmdhbWUud2lkdGggLSAodGhpcy5nYW1lLndpZHRoICogdGhpcy50b3ApO1xyXG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy5sZWZ0O1xyXG4gICAgICB0aGlzLnNpemUgPSB0aGlzLmdhbWUud2lkdGggKiB0aGlzLnNjYWxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0UGxheWVyKHBsYXllcikge1xyXG4gICAgaWYgKHRoaXMucGxheWVyKXtcclxuICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQmFzZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbG9yID0gcGxheWVyLmNvbG9yO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnBsYXllci5hZGRCYXNlKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgY2FuU2VuZE1pbmlvbigpIHtcclxuICAgIHJldHVybiAodGhpcy5zcGF3bl9kZWxheSA8PSAwLjApO1xyXG4gIH1cclxuXHJcbiAgc2VuZE1pbmlvbigpIHtcclxuICAgIHRoaXMuc3Bhd25fZGVsYXkgPSB0aGlzLnNwYXduX2RlbGF5X21heDtcclxuICAgIC0tdGhpcy5yZXNvdXJjZXM7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBwb2ludEluQ2lyY2xlLCB2ZWNEaXN0YW5jZSB9IGZyb20gJy4uL3V0aWwvbWF0aCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pb24ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihpZCwgc291cmNlLCB0YXJnZXQsIHNjYWxlKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gICAgdGhpcy5zb3VyY2VfYmFzZSA9IHNvdXJjZTtcclxuICAgIHRoaXMudGFyZ2V0X2Jhc2UgPSB0YXJnZXQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy5zb3VyY2VfYmFzZS54O1xyXG4gICAgdGhpcy55ID0gdGhpcy5zb3VyY2VfYmFzZS55O1xyXG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlIHx8IDAuMDE7XHJcbiAgICB0aGlzLnNpemUgPSAxMDtcclxuICAgIHRoaXMuY29sb3IgPSB0aGlzLnNvdXJjZV9iYXNlLmNvbG9yO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVhZF9ieV9zZXJ2ZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB0aGlzLmFjdGl2ZV90aW1lID0gMDtcclxuXHJcbiAgICB0aGlzLnNwZWVkID0gMztcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMuYWN0aXZlX3RpbWUgKz0gdDtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnNvdXJjZV9iYXNlLnggKyB0aGlzLnZlbF94ICogdGhpcy5hY3RpdmVfdGltZTtcclxuICAgIHRoaXMueSA9IHRoaXMuc291cmNlX2Jhc2UueSArIHRoaXMudmVsX3kgKiB0aGlzLmFjdGl2ZV90aW1lO1xyXG5cclxuICAgIGlmKHBvaW50SW5DaXJjbGUodGhpcy54LCB0aGlzLnksIHRoaXMudGFyZ2V0X2Jhc2UueCwgdGhpcy50YXJnZXRfYmFzZS55LCB0aGlzLnRhcmdldF9iYXNlLnNpemUpKXtcclxuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXcoY3R4KSB7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUsIE1hdGguUEkqMiwgZmFsc2UpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcblxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICBsZXQgZGVsdGFfc3BlZWQgPSAoKEdBTUUud2lkdGggPiBHQU1FLmhlaWdodCk/IEdBTUUud2lkdGggOiBHQU1FLmhlaWdodCkgLyB0aGlzLnNwZWVkO1xyXG5cclxuICAgIGxldCBkaXN0YW5jZSA9IHZlY0Rpc3RhbmNlKHRoaXMuc291cmNlX2Jhc2UueCwgdGhpcy5zb3VyY2VfYmFzZS55LCB0aGlzLnRhcmdldF9iYXNlLngsIHRoaXMudGFyZ2V0X2Jhc2UueSk7XHJcbiAgICBsZXQgZGlzdGFuY2VfeCA9IHRoaXMudGFyZ2V0X2Jhc2UueCAtIHRoaXMuc291cmNlX2Jhc2UueDtcclxuICAgIGxldCBkaXN0YW5jZV95ID0gdGhpcy50YXJnZXRfYmFzZS55IC0gdGhpcy5zb3VyY2VfYmFzZS55O1xyXG5cclxuICAgIHRoaXMudmVsX3ggPSAoZGlzdGFuY2VfeCAvIE1hdGguYWJzKChkaXN0YW5jZSAvIGRlbHRhX3NwZWVkKSkpIHx8IDA7XHJcbiAgICB0aGlzLnZlbF95ID0gKGRpc3RhbmNlX3kgLyBNYXRoLmFicygoZGlzdGFuY2UgLyBkZWx0YV9zcGVlZCkpKSB8fCAwO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9ICgoR0FNRS53aWR0aCA+IEdBTUUuaGVpZ2h0KT8gR0FNRS5oZWlnaHQgOiBHQU1FLndpZHRoKSAqIHRoaXMuc2NhbGU7XHJcbiAgfVxyXG5cclxufTsiLCJcclxuaW1wb3J0IHsgaGV4Y29sb3JUb1JHQiB9IGZyb20gJy4uL3V0aWwvY29sb3InO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnRpY2xlIHtcclxuICBcclxuICBjb25zdHVjdG9yKGdhbWUsIGxlZnQsIHRvcCwgc2NhbGUsIGNvbG9yKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMueCA9IC0xO1xyXG4gICAgdGhpcy55ID0gLTE7XHJcbiAgICB0aGlzLnNpemUgPSAtMTtcclxuXHJcbiAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgdGhpcy50b3AgPSB0b3A7XHJcbiAgICB0aGlzLnNjYWxlID0gc2NhbGUgfHwgMC4wMTtcclxuXHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3IgfHwgJyNBQUFBQUEnO1xyXG4gICAgdGhpcy5yZ2JhID0gaGV4Y29sb3JUb1JHQih0aGlzLmNvbG9yKTtcclxuICAgIHRoaXMucmdiYVszXSA9IDEuMDtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLmxpdmVfY291bnQgPSAwLjA7XHJcblxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuICB9XHJcblxyXG5cclxuICB1cGRhdGUodGltZSkge1xyXG4gICAgdGhpcy5saXZlX2NvdW50ICs9IHRpbWU7XHJcbiAgICB0aGlzLnJnYmFbM10gLT0gdGltZSAqIDAuNTtcclxuXHJcbiAgICBpZiAodGhpcy5yZ2JhWzNdIDwgMClcclxuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICB9XHJcblxyXG5cclxuICBkcmF3KGN0eCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICBsZXQgW3IsIGcsIGIsIGFdID0gdGhpcy5yZ2JhO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYmEoJHtyfSwke2d9LCR7Yn0sJHthfSlgO1xyXG5cclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMuc2l6ZSArICh0aGlzLmxpdmVfY291bnQgKiAxMCksIE1hdGguUEkqMiwgZmFsc2UpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA+IHRoaXMuZ2FtZS5oZWlnaHQpIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5sZWZ0O1xyXG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy50b3A7XHJcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnNjYWxlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMudG9wKTtcclxuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMubGVmdDtcclxuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5zY2FsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG59IiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGdhbWUsIGlkLCBuYW1lLCBjb2xvcikge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgIHRoaXMuYmFzZXNfaWQgPSBbXTtcclxuICB9XHJcblxyXG4gIGFkZEJhc2UoYmFzZSkge1xyXG4gICAgaWYoIXRoaXMuYmFzZXNfaWQuY29udGFpbnMoYmFzZS5pZCkpXHJcbiAgICAgIHRoaXMuYmFzZXNfaWQucHVzaChiYXNlLmlkKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUJhc2UoYmFzZSkge1xyXG4gICAgbGV0IGkgPSB0aGlzLmJhc2VzX2lkLmluZGV4T2YoYmFzZS5pZCk7XHJcbiAgICBpZihpICE9PSAtMSlcclxuICAgICAgdGhpcy5iYXNlc19pZC5zcGxpY2UoaSwgMSk7XHJcbiAgfVxyXG5cclxuICB0b3RhbFJlc291cmNlcygpIHtcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcblxyXG4gICAgZm9yKGxldCBpID0gdGhpcy5iYXNlc19pZC5sZW5ndGg7IGktLTsgKXtcclxuICAgICAgbGV0IGJhc2UgPSB0aGlzLmdhbWUuZ2V0QnlJRCh0aGlzLmdhbWUuYmFzZXMsIHRoaXMuYmFzZXNfaWRbaV0pO1xyXG4gICAgICB0b3RhbCArPSBiYXNlLnJlc291cmNlcztcclxuICAgIH1cclxuICAgIHJldHVybiB0b3RhbDtcclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IExvYWRpbmdTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL0xvYWRpbmdTY3JlZW4nO1xyXG5pbXBvcnQgU3RhcnRTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL1N0YXJ0U2NyZWVuJztcclxuaW1wb3J0IEdhbWVTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL0dhbWVTY3JlZW4nO1xyXG5pbXBvcnQgTm9Db25uZWN0aW9uU2NyZWVuIGZyb20gJy4vc2NyZWVucy9Ob0Nvbm5lY3Rpb25TY3JlZW4nO1xyXG5pbXBvcnQgTG9iYnlTY3JlZW4gZnJvbSAnLi9zY3JlZW5zL0xvYmJ5U2NyZWVuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmVlbk1hbmFnZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihuZXR3b3JrTWFuYWdlciwgc291bmRNYW5hZ2VyKSB7XHJcbiAgICB0aGlzLm5ldHdvcmtNYW5hZ2VyID0gbmV0d29ya01hbmFnZXI7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbiAgICB0aGlzLnNjcmVlbnMgPSB7fTtcclxuICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLmluaXRET00oKTtcclxuICAgIHRoaXMuaW5pdFNjcmVlbnMoKTtcclxuICAgIHRoaXMuaW5pdE5ldHdvcmsoKTtcclxuXHJcbiAgICB0aGlzLnNldFNjcmVlbih0aGlzLnNjcmVlbnMubG9hZGluZyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBpbml0RE9NKCkge1xyXG4gICAgdGhpcy4kZWwgPSAkKCdbZGF0YS1zY3JlZW4tY29udGFpbmVyXScpO1xyXG4gIH1cclxuXHJcbiAgaW5pdFNjcmVlbnMoKSB7XHJcbiAgICB0aGlzLnNjcmVlbnMgPSB7fTtcclxuXHJcbiAgICB0aGlzLnNjcmVlbnMubG9hZGluZyA9IG5ldyBMb2FkaW5nU2NyZWVuKHRoaXMubmV0d29ya01hbmFnZXIsIHRoaXMuc291bmRNYW5hZ2VyKTtcclxuICAgIHRoaXMuc2NyZWVucy5zdGFydCA9IG5ldyBTdGFydFNjcmVlbih0aGlzLm5ldHdvcmtNYW5hZ2VyLCB0aGlzLnNvdW5kTWFuYWdlcik7XHJcbiAgICB0aGlzLnNjcmVlbnMuZ2FtZSA9IG5ldyBHYW1lU2NyZWVuKHRoaXMubmV0d29ya01hbmFnZXIsIHRoaXMuc291bmRNYW5hZ2VyKTtcclxuICAgIHRoaXMuc2NyZWVucy5ub0Nvbm5lY3Rpb24gPSBuZXcgTm9Db25uZWN0aW9uU2NyZWVuKHRoaXMubmV0d29ya01hbmFnZXIsIHRoaXMuc291bmRNYW5hZ2VyKTtcclxuICAgIHRoaXMuc2NyZWVucy5sb2JieSA9IG5ldyBMb2JieVNjcmVlbih0aGlzLm5ldHdvcmtNYW5hZ2VyLCB0aGlzLnNvdW5kTWFuYWdlcik7XHJcblxyXG4gICAgZm9yIChsZXQgc2NyZWVuTmFtZSBpbiB0aGlzLnNjcmVlbnMpIHtcclxuICAgICAgbGV0IHNjcmVlbiA9IHRoaXMuc2NyZWVuc1tzY3JlZW5OYW1lXTtcclxuICAgICAgc2NyZWVuLm9uKCdyZXF1ZXN0U2NyZWVuJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnNldFNjcmVlbihkYXRhLnNjcmVlbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaW5pdE5ldHdvcmsoKSB7XHJcbiAgICBsZXQgbmV0d29ya01hbmFnZXIgPSB0aGlzLm5ldHdvcmtNYW5hZ2VyO1xyXG5cclxuICAgIG5ldHdvcmtNYW5hZ2VyLm9uKCdjb25uZWN0JywgKCkgPT4gdGhpcy5zZXRTY3JlZW4odGhpcy5zY3JlZW5zLnN0YXJ0KSk7XHJcbiAgICBuZXR3b3JrTWFuYWdlci5vbignZGlzY29ubmVjdCBub2Nvbm5lY3Rpb24nLCAoKSA9PiB0aGlzLnNldFNjcmVlbih0aGlzLnNjcmVlbnMubm9Db25uZWN0aW9uKSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgc2V0U2NyZWVuKHNjcmVlbikge1xyXG4gICAgaWYgKHRoaXMuYWN0aXZlU2NyZWVuKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLmRlYWN0aXZhdGUoKTtcclxuICAgICAgdGhpcy5hY3RpdmVTY3JlZW4udW5yZW5kZXJET00oKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFjdGl2ZVNjcmVlbiA9IHNjcmVlbjtcclxuICAgIHRoaXMuYWN0aXZlU2NyZWVuLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXJET00odGhpcy4kZWwpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gc2Nvb3BEZURvb3BBd2F5V2l0aENvbnRyb2xvbGVyKCkge1xyXG5cclxuXHJcbi8qKiBUT0RPXHJcbiAqXHJcbiAqIHsgR0FNRSB9XHJcbiAqIC0gICAgR2V0IGluZm9ybWF0aW9uIGFib3V0IHBsYXllcnMgaW4gZ2FtZSAoRE9ORSlcclxuICogICAgICAgICBTYXZlIHBsYXllcnMgaW4gc29tZSBsaXN0IChET05FKVxyXG4gKiAtICAgIEdldCBpbmZvcm1hdGlvbiBhYm91dCBnYW1lIChET05FKVxyXG4gKiAtICAgIEJpbmQgbGlzdGVuZXJzIGZvciBnYW1lXHJcbiAqICAgICAgICAgU2F2ZSBsaXN0ZW5lciB0byBiZSBhYmxlIHRvIHJlbW92ZVxyXG4gKiAtICAgIENvdW50IGRvd24gc3RhcnQgLT4gc3RhcnQgZ2FtZVxyXG4gKiAtICAgIEdhbWUgbG9naWNcclxuICovXHJcblxyXG52YXIgQ09OVFJPTExFUiA9IHtcclxuICAgIGN1cnJlbnRfc2NyZWVuOiBudWxsXHJcbn07XHJcbi8qKlxyXG4gKiB7IElOSVQgfVxyXG4gKi9cclxuQ09OVFJPTExFUi5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIE5FVC5pbml0KCk7XHJcbiAgICBHQU1FLmluaXQoKTtcclxuXHJcbiAgICBDT05UUk9MTEVSLmN1cnJlbnRfc2NyZWVuID0gJ2xvYWRpbmcnO1xyXG5cclxuICAgIENPTlRST0xMRVIuYmluZGV2ZW50cygpO1xyXG59O1xyXG4vKipcclxuICogeyBCSU5EIEVWRU5UUyB9XHJcbiAqIEJpbmRzIGxpc3RlbmVycyBhbmQgZmxvdyBsb2dpY1xyXG4gKi9cclxuQ09OVFJPTExFUi5iaW5kZXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIC8vIFNldHVwIGxpc3RlbmVyc1xyXG4gICAgRE9NLm9uKCcjYnRuX3BsYXknLCAnY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIENPTlRST0xMRVIucmVxdWVzdFBsYXkoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHsgUkVTVVFFU1QgUExBWSB9XHJcbiAqIENhbGxlZCB3aGVuIGNsaWVudCBjbGlja3MgJ1BsYXknXHJcbiAqL1xyXG5DT05UUk9MTEVSLnJlcXVlc3RQbGF5ID0gZnVuY3Rpb24oKXtcclxuICAgIE5FVC5zZW5kKCdDTElFTlQucGxheScpO1xyXG4gICAgQ09OVFJPTExFUi5zZXRTY3JlZW4oJ3dhaXRpbmcnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB7IFNFVCBTQ1JFRU4gfVxyXG4gKiBTZXRzIHRoZSBhY3RpdmUgc2NyZWVuXHJcbiAqIEBwYXJhbSAge1N0cmluZ30gc2NyZWVuICBOYW1lIGZvciB0aGUgc2NyZWVuLCBlLmcgZ2FtZS9zdGFydC9sb2FkaW5nLCAhTk9UIEhUTUwtRE9NLWlkLCBlLmcgI3NjcmVlbl9nYW1lIVxyXG4gKi9cclxuQ09OVFJPTExFUi5zZXRTY3JlZW4gPSBmdW5jdGlvbihzY3JlZW4pe1xyXG4gICAgdmFyIHMgPSBET00oJyNzY3JlZW5fJyArIHNjcmVlbik7XHJcbiAgICBpZihzKXtcclxuICAgICAgICBpZihDT05UUk9MTEVSLmN1cnJlbnRfc2NyZWVuKVxyXG4gICAgICAgICAgICBET00uYWRkQ2xhc3MoJyNzY3JlZW5fJyArIENPTlRST0xMRVIuY3VycmVudF9zY3JlZW4sICdoaWRkZW4nKTtcclxuICAgICAgICBDT05UUk9MTEVSLmN1cnJlbnRfc2NyZWVuID0gc2NyZWVuO1xyXG4gICAgICAgIERPTS5yZW1vdmVDbGFzcyhzLCAnaGlkZGVuJyk7XHJcbiAgICB9XHJcbn07XHJcbi8qKlxyXG4gKiB7IE9WRVJMQVkgTUVTU0FHRSB9XHJcbiAqIERpc3BsYXlzIGFuIG92ZXJsYXkgbWVzc2FnZVxyXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1zZ1xyXG4gKi9cclxuQ09OVFJPTExFUi5vdmVybGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1zZyl7XHJcbiAgICBET00ucmVtb3ZlQ2xhc3MoJyNvdmVybGF5JywgJ2hpZGRlbicpO1xyXG4gICAgRE9NLnRleHQoJyNvdmVybGF5X21lc3NhZ2UnLCBcIjxoMj57MH08L2gyPlwiLmZvcm1hdChtc2cpKTtcclxufTtcclxuLyoqXHJcbiAqIHsgT1ZFUkxBWSBISURFIH1cclxuICogSGlkZXMgdGhlIG92ZXJsYXlcclxuICovXHJcbkNPTlRST0xMRVIub3ZlcmxheUhpZGUgPSBmdW5jdGlvbigpe1xyXG4gICAgRE9NLmFkZENsYXNzKCcjb3ZlcmxheScsICdoaWRkZW4nKTtcclxufTtcclxuLyoqXHJcbiAqIHsgQ09OTkVDVEVEIH1cclxuICovXHJcbkNPTlRST0xMRVIuY29ubmVjdGVkID0gZnVuY3Rpb24oKXtcclxuICAgIHRpbWVkKCdDb25uZWN0ZWQhJyk7XHJcbiAgICBDT05UUk9MTEVSLnNldFNjcmVlbignc3RhcnQnKTtcclxufTtcclxuLyoqIFxyXG4gKiB7IE5PIENPTk5FQ1R9XHJcbiAqIENvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlclxyXG4gKi9cclxuQ09OVFJPTExFUi5ub2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xyXG4gICAgdGltZWQoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlciEnKTtcclxuICAgIENPTlRST0xMRVIuc2V0U2NyZWVuKCdub2Nvbm5lY3QnKTtcclxufTtcclxuLyoqXHJcbiAqIHsgRElTQ09OTkVDVEVEIH1cclxuICovXHJcbkNPTlRST0xMRVIuZGlzY29ubmVjdGVkID0gZnVuY3Rpb24oKXtcclxuICAgIHRpbWVkKCdEaXNjb25uZWN0ZWQgZnJvbSBzZXJ2ZXIhJyk7XHJcbiAgICBDT05UUk9MTEVSLnNldFNjcmVlbignbm9jb25uZWN0Jyk7XHJcbn07XHJcblxyXG4vKipcclxuICogeyBTVEFSVCBHQU1FIH1cclxuICogU3RhcnRzIGdhbWVcclxuICovXHJcbkNPTlRST0xMRVIuc3RhcnRnYW1lID0gZnVuY3Rpb24oKXtcclxuICAgIENPTlRST0xMRVIuc2V0U2NyZWVuKCdnYW1lJyk7XHJcbn07XHJcblxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZVNjcmVlbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtNYW5hZ2VyLCBzb3VuZE1hbmFnZXIpIHtcclxuICAgIHRoaXMubmV0d29ya01hbmFnZXIgPSBuZXR3b3JrTWFuYWdlcjtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmJpbmROZXR3b3JrRXZlbnRzKCk7XHJcbiAgfVxyXG4gIGRlYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudW5iaW5kTmV0d29ya0V2ZW50cygpO1xyXG4gIH1cclxuXHJcblxyXG4gIHJlbmRlckRPTSgkcGFyZW50LCB0ZW1wbGF0ZSkge1xyXG4gICAgaWYgKHRoaXMuJGVsKSB7XHJcbiAgICAgIHRoaXMudW5yZW5kZXJET00oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgdGhpcy4kZWwgPSAkKHRlbXBsYXRlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGVsID0gJCgnPGRpdj4nKTtcclxuICAgIH1cclxuXHJcbiAgICAkcGFyZW50Lmh0bWwodGhpcy4kZWwpO1xyXG4gICAgdGhpcy5iaW5kRE9NRXZlbnRzKCk7XHJcbiAgfVxyXG4gIHVucmVuZGVyRE9NKCkge1xyXG4gICAgaWYgKCF0aGlzLiRlbCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ1VucmVuZGVyIHNjcmVlbiB3aGljaCBoYXMgbm8gJGVsJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51bmJpbmRET01FdmVudHMoKTtcclxuICB9XHJcblxyXG5cclxuICBiaW5kRE9NRXZlbnRzKCkge1xyXG4gICAgaWYgKCF0aGlzLmRvbUV2ZW50cykgcmV0dXJuO1xyXG5cclxuICAgIGZvciAodmFyIGRlZmluaXRpb24gaW4gdGhpcy5kb21FdmVudHMpIHtcclxuICAgICAgbGV0IHNwbGl0ID0gZGVmaW5pdGlvbi5zcGxpdCgnICcpO1xyXG4gICAgICBsZXQgZXZlbnQgPSBzcGxpdFswXTtcclxuICAgICAgbGV0IHNlbGVjdG9yID0gc3BsaXQuc2xpY2UoMSkuam9pbignICcpO1xyXG4gICAgICBsZXQgY2FsbGJhY2sgPSB0aGlzW3RoaXMuZG9tRXZlbnRzW2RlZmluaXRpb25dXTtcclxuXHJcbiAgICAgIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpLm9uKGV2ZW50LCBjYWxsYmFjay5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICB9XHJcbiAgdW5iaW5kRE9NRXZlbnRzKCkge1xyXG4gICAgdGhpcy4kZWwub2ZmKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgYmluZE5ldHdvcmtFdmVudHMoKSB7XHJcbiAgICBpZiAoIXRoaXMubmV0d29ya0V2ZW50cykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX25ldHdvcmtFdmVudEhhbmRsZXJzID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgZXZlbnQgaW4gdGhpcy5uZXR3b3JrRXZlbnRzKSB7XHJcbiAgICAgIGxldCBoYW5kbGVyID0gdGhpc1t0aGlzLm5ldHdvcmtFdmVudHNbZXZlbnRdXS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgdGhpcy5fbmV0d29ya0V2ZW50SGFuZGxlcnMucHVzaCh7IGV2ZW50LCBoYW5kbGVyIH0pO1xyXG5cclxuICAgICAgdGhpcy5uZXR3b3JrTWFuYWdlci5vbihldmVudCwgaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHVuYmluZE5ldHdvcmtFdmVudHMoKSB7XHJcbiAgICB0aGlzLl9uZXR3b3JrRXZlbnRIYW5kbGVycy5mb3JFYWNoKChuZXR3b3JrRXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5uZXR3b3JrTWFuYWdlci5vZmYobmV0d29ya0V2ZW50LmV2ZW50LCBuZXR3b3JrRXZlbnQuaGFuZGxlcik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICByZXF1ZXN0U2NyZWVuKHNjcmVlbikge1xyXG4gICAgdGhpcy5lbWl0KCdyZXF1ZXN0U2NyZWVuJywgeyBzY3JlZW4gfSk7XHJcbiAgfVxyXG59IiwiXHJcbmltcG9ydCBCYXNlU2NyZWVuIGZyb20gJy4vQmFzZVNjcmVlbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuIGV4dGVuZHMgQmFzZVNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuXHJcbiAgICBcclxuICB9XHJcblxyXG4gIGFjdGl2YXRlKCkge1xyXG5cclxuICB9XHJcblxyXG4gIHJlbmRlckRPTSgkcGFyZW50KSB7XHJcbiAgICBsZXQgZ2FtZVRlbXBsYXRlID0gIGBcclxuICAgICAgPGgxIHN0eWxlPVwicG9zaXRpb246Zml4ZWQ7IHRvcDo0MCU7IHdpZHRoOjEwMCU7IGxlZnQ6MDsgdGV4dC1hbGlnbjpjZW50ZXI7XCI+R0FNRTwvaDE+XHJcbiAgICAgIDxkaXYgaWQ9XCJzY3JlZW5fZ2FtZVwiIGNsYXNzPVwic2NyZWVuXCI+XHJcbiAgICAgICAgPGNhbnZhcyBpZD1cImNhbnZhc1wiIHdpZHRoPVwiNjAwXCIgaGVpZ2h0PVwiNDAwXCI+XHJcbiAgICAgICAgICA8cD5Zb3VyIGJyb3dzZXIgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhlIENhbnZhcy1lbGVtZW50IDooLjwvcD5cclxuICAgICAgICA8L2NhbnZhcz5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIHN1cGVyLnJlbmRlckRPTSgkcGFyZW50LCBnYW1lVGVtcGxhdGUpO1xyXG4gIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IEJhc2VTY3JlZW4gZnJvbSAnLi9CYXNlU2NyZWVuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYWRpbmdTY3JlZW4gZXh0ZW5kcyBCYXNlU2NyZWVuIHtcclxuXHJcbiAgcmVuZGVyRE9NKCRwYXJlbnQpIHtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IGBcclxuICAgICAgPGRpdiBpZD1cInNjcmVlbl9sb2FkaW5nXCIgY2xhc3M9XCJzY3JlZW5cIj5cclxuICAgICAgICA8aDI+TG9hZGluZzwvaDI+XHJcbiAgICAgICAgPGltZyBzcmM9XCJyZXMvaW1hZ2VzL3dhaXRpbmcuZ2lmXCIgYWx0PVwiXCI+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBzdXBlci5yZW5kZXJET00oJHBhcmVudCwgdGVtcGxhdGUpO1xyXG4gIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IEJhc2VTY3JlZW4gZnJvbSAnLi9CYXNlU2NyZWVuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYmJ5U2NyZWVuIGV4dGVuZHMgQmFzZVNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgIHN1cGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cclxuICAgIHRoaXMubmV0d29ya0V2ZW50cyA9IHtcclxuICAgICAgJ1NFUlZFUi5pbml0Z2FtZSc6IG9uR2FtZUluaXRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZW5kZXJET00oJHBhcmVudCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gYFxyXG4gICAgICA8ZGl2IGlkPVwic2NyZWVuX3dhaXRpbmdcIiBjbGFzcz1cInNjcmVlblwiPlxyXG4gICAgICAgIDxoMj5XYWl0aW5nIGZvciBvcHBvbmVudCE8L2gyPlxyXG4gICAgICAgIDxpbWcgc3JjPVwicmVzL2ltYWdlcy93YWl0aW5nLmdpZlwiIGFsdD1cIlwiPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgc3VwZXIucmVuZGVyRE9NKCRwYXJlbnQsIHRlbXBsYXRlKTtcclxuICB9XHJcblxyXG4gIG9uR2FtZUluaXQoKSB7XHJcbiAgICB0aGlzLnJlcXVlc3RTY3JlZW4oJ2dhbWUnKTtcclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IEJhc2VTY3JlZW4gZnJvbSAnLi9CYXNlU2NyZWVuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vQ29ubmVjdGlvblNjcmVlbiBleHRlbmRzIEJhc2VTY3JlZW4ge1xyXG5cclxuICByZW5kZXJET00oJHBhcmVudCkge1xyXG4gICAgbGV0IHRlbXBsYXRlID0gYFxyXG4gICAgICA8ZGl2IGlkPVwic2NyZWVuX25vY29ubmVjdFwiIGNsYXNzPVwic2NyZWVuIGhpZGRlblwiPlxyXG4gICAgICAgIDxpbWcgc3JjPVwicmVzL2ltYWdlcy9zdXJwcmlzZWQucG5nXCIgYWx0PVwiXCIgc3R5bGU9XCJ3aWR0aDoyMCVcIj5cclxuICAgICAgICA8aDI+Q2FuJ3QgY29ubmVjdCE8L2gyPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gICAgc3VwZXIucmVuZGVyRE9NKCRwYXJlbnQsIHRlbXBsYXRlKTtcclxuICB9XHJcbn0iLCJcclxuaW1wb3J0IEJhc2VTY3JlZW4gZnJvbSAnLi9CYXNlU2NyZWVuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXJ0U2NyZWVuIGV4dGVuZHMgQmFzZVNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtNYW5hZ2VyLCBzb3VuZE1hbmFnZXIpIHtcclxuICAgIHN1cGVyKG5ldHdvcmtNYW5hZ2VyLCBzb3VuZE1hbmFnZXIpO1xyXG5cclxuICAgIHRoaXMuZG9tRXZlbnRzID0ge1xyXG4gICAgICAnY2xpY2sgI2J0bl9wbGF5JzogJ29uUGxheUNsaWNrJ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlbmRlckRPTSgkcGFyZW50KSB7XHJcbiAgICBsZXQgdGVtcGxhdGUgPSBgXHJcbiAgICAgIDxkaXYgaWQ9XCJzY3JlZW5fc3RhcnRcIiBjbGFzcz1cInNjcmVlblwiPlxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJidG5fcGxheVwiPlBsYXk8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICAgIHN1cGVyLnJlbmRlckRPTSgkcGFyZW50LCB0ZW1wbGF0ZSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgb25QbGF5Q2xpY2soKSB7XHJcbiAgICB0aGlzLnJlcXVlc3RTY3JlZW4oJ2xvYmJ5Jyk7XHJcbiAgfVxyXG5cclxufSIsIlxyXG5cclxuaW1wb3J0IHsgcmFuZG9tUmFuZ2VJbnQgfSBmcm9tICcuL3V0aWwvdXRpbC5qcyc7XHJcbmltcG9ydCB7IEF1ZGlvQ29udGV4dCB9IGZyb20gJy4vdXRpbC9wcmVmaXhlci5qcyc7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvdW5kTWFuYWdlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jdHggPSBudWxsO1xyXG4gICAgdGhpcy5zb3VuZHMgPSBbXTtcclxuICAgIHRoaXMuc291bmRfbmFtZXMgPSBbXTtcclxuICAgIHRoaXMuc3RhcnR1cF9ldmVudCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgaWYgKCFBdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhyb3cgXCJBdWRpb0NvbnRleHQgbm90IHN1cHBvcnRlZCBieSBicm93c2VyXCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuXHJcbiAgaW5pdFNvdW5kcygpIHsgIFxyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzQud2F2JywgJ2M0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9kNC53YXYnLCAnZDQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2U0LndhdicsICdlNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZjQud2F2JywgJ2Y0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9nNC53YXYnLCAnZzQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2E0LndhdicsICdhNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYjQud2F2JywgJ2I0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9jNS53YXYnLCAnYzUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Q1LndhdicsICdkNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTUud2F2JywgJ2U1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9mNS53YXYnLCAnZjUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2c1LndhdicsICdnNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTUud2F2JywgJ2E1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9iNS53YXYnLCAnYjUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2M2LndhdicsICdjNicpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDYud2F2JywgJ2Q2Jyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgbG9hZFNvdW5kKHVybCwgbmFtZSkge1xyXG4gICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcbiAgICBcclxuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY3R4LmRlY29kZUF1ZGlvRGF0YSh4aHIucmVzcG9uc2UsIChidWZmZXIpID0+IHtcclxuICAgICAgICB0aGlzLnNvdW5kX25hbWVzLnB1c2gobmFtZSk7XHJcbiAgICAgICAgdGhpcy5zb3VuZHNbbmFtZV0gPSBidWZmZXI7XHJcblxyXG4gICAgICAgIGlmKCd0b3VjaHN0YXJ0JyBpbiB3aW5kb3cgJiYgdGhpcy5zdGFydHVwX2V2ZW50ID09PSBudWxsKXtcclxuICAgICAgICAgIHRoaXMuc3RhcnR1cF9ldmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU291bmQoKTtcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnN0YXJ0dXBfZXZlbnQsIGZhbHNlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxuICB9XHJcblxyXG5cclxuICBwbGF5U291bmQobmFtZSkge1xyXG4gICAgaWYgKCF0aGlzLnNvdW5kc1tuYW1lXSkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBzb3VuZCA9IHRoaXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgc291bmQuYnVmZmVyID0gdGhpcy5zb3VuZHNbbmFtZV07XHJcblxyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmNyZWF0ZUdhaW5Ob2RlKDAuOCwgMC4wLCAwLjQpO1xyXG5cclxuICAgIHNvdW5kLmNvbm5lY3QoZ2Fpbik7XHJcbiAgICBnYWluLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xyXG5cclxuICAgIHNvdW5kLnN0YXJ0KDApO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlR2Fpbk5vZGUoc3RhcnQsIGVuZCwgdGltZSkge1xyXG4gICAgbGV0IG5vZGUgPSB0aGlzLmN0eC5jcmVhdGVHYWluKCk7XHJcbiAgICBsZXQgbm93ID0gdGhpcy5jdHguY3VycmVudFRpbWU7XHJcblxyXG4gICAgbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHN0YXJ0LCBub3cpO1xyXG4gICAgbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGVuZCwgbm93ICsgdGltZSk7XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfVxyXG5cclxuICBwbGF5UmFuZG9tU291bmQoKSB7XHJcbiAgICB0aGlzLnBsYXlTb3VuZCh0aGlzLnNvdW5kX25hbWVzW3JhbmRvbVJhbmdlSW50KDAsIHRoaXMuc291bmRfbmFtZXMubGVuZ3RoKV0pO1xyXG4gIH1cclxufSIsImZ1bmN0aW9uIGhleGNoYXJUb0RlYyhoZXh2YWwpe1xyXG4gICAgdmFyIGMgPSBoZXh2YWwudG9VcHBlckNhc2UoKS5jaGFyQ29kZUF0KDApO1xyXG4gICAgcmV0dXJuIChjIDwgNjApPyAoYy00OCkgOiAoYy01NSk7XHJcbn1cclxuZnVuY3Rpb24gaGV4Y29sb3JUb1JHQihoZXgpe1xyXG4gICAgaGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICB2YXIgcmdiID0gW107XHJcbiAgICB2YXIgaW5jID0gKGhleC5sZW5ndGggPCA2KT8gMSA6IDI7XHJcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBoZXgubGVuZ3RoOyBpIDwgbGVuOyBpKz1pbmMpe1xyXG4gICAgICAgIC8vIHZhciB2ID0gaGV4LnN1YnN0cihpLCBpbmMpO1xyXG4gICAgICAgIHJnYi5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoaSwgaW5jKSwgMTYpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZ2I7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaGV4Y2hhclRvRGVjLFxyXG4gICAgaGV4Y29sb3JUb1JHQlxyXG59OyIsIlxyXG5mdW5jdGlvbiBkcmF3TGluZShjdHgsIHgxLCB5MSwgeDIsIHkyLCBjb2xvciwgd2lkdGgpe1xyXG5cclxuICBpZihjb2xvcikgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgaWYod2lkdGgpIGN0eC5saW5lV2lkdGggPSB3aWR0aDtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3Q2lyY2xlKGN0eCwgeCwgeSwgciwgY29sb3IsIHN0eWxlID0gJ2ZpbGwnKXtcclxuXHJcbiAgaWYoY29sb3IpIGN0eFtzdHlsZSsnU3R5bGUnXSA9IGNvbG9yO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmFyYyh4LCB5LCByLCBNYXRoLlBJKjIsIGZhbHNlKTtcclxuICBjdHhbc3R5bGVdKCk7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBkcmF3TGluZSxcclxuICBkcmF3Q2lyY2xlXHJcbn0iLCJcclxuZnVuY3Rpb24gdmVjRGlzdGFuY2VTcSh4MSwgeTEsIHgyLCB5Mil7XHJcbiAgICByZXR1cm4gTWF0aC5wb3coeDEteDIsIDIpICsgTWF0aC5wb3coeTEteTIsIDIpO1xyXG59XHJcbmZ1bmN0aW9uIHZlY0Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKXtcclxuICAgIHJldHVybiBNYXRoLnNxcnQodmVjRGlzdGFuY2VTcSh4MSwgeTEsIHgyLCB5MikpO1xyXG59XHJcbmZ1bmN0aW9uIHBvaW50SW5DaXJjbGUocHgsIHB5LCBjeCwgY3ksIGNyKXtcclxuICAgIHJldHVybiAodmVjRGlzdGFuY2VTcShweCwgcHksIGN4LCBjeSkgPCBNYXRoLnBvdyhjciwgMikpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdmVjRGlzdGFuY2VTcSxcclxuICB2ZWNEaXN0YW5jZSxcclxuICBwb2ludEluQ2lyY2xlXHJcbn07IiwiXHJcbmV4cG9ydCBsZXQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sod2luZG93LnBlcmZvcm1hbmNlLm5vdygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDAwLzYwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG5leHBvcnQgbGV0IGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dDtcclxuXHJcblxyXG5leHBvcnQgbGV0IHBlcmZvcm1hbmNlID0gd2luZG93LnBlcmZvcm1hbmNlID0ge307XHJcbnBlcmZvcm1hbmNlLm5vdyA9IHBlcmZvcm1hbmNlLm5vdyB8fFxyXG4gICAgICAgICAgICAgICAgICBwZXJmb3JtYW5jZS53ZWJraXROb3cgfHxcclxuICAgICAgICAgICAgICAgICAgcGVyZm9ybWFuY2UubW96Tm93IHx8XHJcbiAgICAgICAgICAgICAgICAgIHBlcmZvcm1hbmNlLm1zTm93IHx8XHJcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTsgfTtcclxuXHJcblxyXG5leHBvcnQgbGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pBdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcclxuXHJcblxyXG4vKm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZSxcclxuICBwZXJmb3JtYW5jZSxcclxuICBBdWRpb0NvbnRleHRcclxufTsqLyIsIlxyXG5mdW5jdGlvbiByYW5kb21SYW5nZShtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gKChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pKSArIG1pbik7XHJcbn1cclxuZnVuY3Rpb24gcmFuZG9tUmFuZ2VJbnQobWluLCBtYXgpe1xyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikpICsgbWluKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmFuZG9tUmFuZ2UsXHJcbiAgcmFuZG9tUmFuZ2VJbnRcclxufSIsIlwidXNlIHN0cmljdFwiO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9zaGltXCIpO1xuXG5yZXF1aXJlKFwicmVnZW5lcmF0b3ItYmFiZWwvcnVudGltZVwiKTsiLCIvKipcbiAqIENvcmUuanMgMC42LjFcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzXG4gKiBMaWNlbnNlOiBodHRwOi8vcm9jay5taXQtbGljZW5zZS5vcmdcbiAqIMKpIDIwMTUgRGVuaXMgUHVzaGthcmV2XG4gKi9cbiFmdW5jdGlvbihnbG9iYWwsIGZyYW1ld29yaywgdW5kZWZpbmVkKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29tbW9uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvLyBTaG9ydGN1dHMgZm9yIFtbQ2xhc3NdXSAmIHByb3BlcnR5IG5hbWVzXHJcbnZhciBPQkpFQ1QgICAgICAgICAgPSAnT2JqZWN0J1xyXG4gICwgRlVOQ1RJT04gICAgICAgID0gJ0Z1bmN0aW9uJ1xyXG4gICwgQVJSQVkgICAgICAgICAgID0gJ0FycmF5J1xyXG4gICwgU1RSSU5HICAgICAgICAgID0gJ1N0cmluZydcclxuICAsIE5VTUJFUiAgICAgICAgICA9ICdOdW1iZXInXHJcbiAgLCBSRUdFWFAgICAgICAgICAgPSAnUmVnRXhwJ1xyXG4gICwgREFURSAgICAgICAgICAgID0gJ0RhdGUnXHJcbiAgLCBNQVAgICAgICAgICAgICAgPSAnTWFwJ1xyXG4gICwgU0VUICAgICAgICAgICAgID0gJ1NldCdcclxuICAsIFdFQUtNQVAgICAgICAgICA9ICdXZWFrTWFwJ1xyXG4gICwgV0VBS1NFVCAgICAgICAgID0gJ1dlYWtTZXQnXHJcbiAgLCBTWU1CT0wgICAgICAgICAgPSAnU3ltYm9sJ1xyXG4gICwgUFJPTUlTRSAgICAgICAgID0gJ1Byb21pc2UnXHJcbiAgLCBNQVRIICAgICAgICAgICAgPSAnTWF0aCdcclxuICAsIEFSR1VNRU5UUyAgICAgICA9ICdBcmd1bWVudHMnXHJcbiAgLCBQUk9UT1RZUEUgICAgICAgPSAncHJvdG90eXBlJ1xyXG4gICwgQ09OU1RSVUNUT1IgICAgID0gJ2NvbnN0cnVjdG9yJ1xyXG4gICwgVE9fU1RSSU5HICAgICAgID0gJ3RvU3RyaW5nJ1xyXG4gICwgVE9fU1RSSU5HX1RBRyAgID0gVE9fU1RSSU5HICsgJ1RhZydcclxuICAsIFRPX0xPQ0FMRSAgICAgICA9ICd0b0xvY2FsZVN0cmluZydcclxuICAsIEhBU19PV04gICAgICAgICA9ICdoYXNPd25Qcm9wZXJ0eSdcclxuICAsIEZPUl9FQUNIICAgICAgICA9ICdmb3JFYWNoJ1xyXG4gICwgSVRFUkFUT1IgICAgICAgID0gJ2l0ZXJhdG9yJ1xyXG4gICwgRkZfSVRFUkFUT1IgICAgID0gJ0BAJyArIElURVJBVE9SXHJcbiAgLCBQUk9DRVNTICAgICAgICAgPSAncHJvY2VzcydcclxuICAsIENSRUFURV9FTEVNRU5UICA9ICdjcmVhdGVFbGVtZW50J1xyXG4gIC8vIEFsaWFzZXMgZ2xvYmFsIG9iamVjdHMgYW5kIHByb3RvdHlwZXNcclxuICAsIEZ1bmN0aW9uICAgICAgICA9IGdsb2JhbFtGVU5DVElPTl1cclxuICAsIE9iamVjdCAgICAgICAgICA9IGdsb2JhbFtPQkpFQ1RdXHJcbiAgLCBBcnJheSAgICAgICAgICAgPSBnbG9iYWxbQVJSQVldXHJcbiAgLCBTdHJpbmcgICAgICAgICAgPSBnbG9iYWxbU1RSSU5HXVxyXG4gICwgTnVtYmVyICAgICAgICAgID0gZ2xvYmFsW05VTUJFUl1cclxuICAsIFJlZ0V4cCAgICAgICAgICA9IGdsb2JhbFtSRUdFWFBdXHJcbiAgLCBEYXRlICAgICAgICAgICAgPSBnbG9iYWxbREFURV1cclxuICAsIE1hcCAgICAgICAgICAgICA9IGdsb2JhbFtNQVBdXHJcbiAgLCBTZXQgICAgICAgICAgICAgPSBnbG9iYWxbU0VUXVxyXG4gICwgV2Vha01hcCAgICAgICAgID0gZ2xvYmFsW1dFQUtNQVBdXHJcbiAgLCBXZWFrU2V0ICAgICAgICAgPSBnbG9iYWxbV0VBS1NFVF1cclxuICAsIFN5bWJvbCAgICAgICAgICA9IGdsb2JhbFtTWU1CT0xdXHJcbiAgLCBNYXRoICAgICAgICAgICAgPSBnbG9iYWxbTUFUSF1cclxuICAsIFR5cGVFcnJvciAgICAgICA9IGdsb2JhbC5UeXBlRXJyb3JcclxuICAsIFJhbmdlRXJyb3IgICAgICA9IGdsb2JhbC5SYW5nZUVycm9yXHJcbiAgLCBzZXRUaW1lb3V0ICAgICAgPSBnbG9iYWwuc2V0VGltZW91dFxyXG4gICwgc2V0SW1tZWRpYXRlICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxyXG4gICwgY2xlYXJJbW1lZGlhdGUgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXHJcbiAgLCBwYXJzZUludCAgICAgICAgPSBnbG9iYWwucGFyc2VJbnRcclxuICAsIGlzRmluaXRlICAgICAgICA9IGdsb2JhbC5pc0Zpbml0ZVxyXG4gICwgcHJvY2VzcyAgICAgICAgID0gZ2xvYmFsW1BST0NFU1NdXHJcbiAgLCBuZXh0VGljayAgICAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2tcclxuICAsIGRvY3VtZW50ICAgICAgICA9IGdsb2JhbC5kb2N1bWVudFxyXG4gICwgaHRtbCAgICAgICAgICAgID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcbiAgLCBuYXZpZ2F0b3IgICAgICAgPSBnbG9iYWwubmF2aWdhdG9yXHJcbiAgLCBkZWZpbmUgICAgICAgICAgPSBnbG9iYWwuZGVmaW5lXHJcbiAgLCBjb25zb2xlICAgICAgICAgPSBnbG9iYWwuY29uc29sZSB8fCB7fVxyXG4gICwgQXJyYXlQcm90byAgICAgID0gQXJyYXlbUFJPVE9UWVBFXVxyXG4gICwgT2JqZWN0UHJvdG8gICAgID0gT2JqZWN0W1BST1RPVFlQRV1cclxuICAsIEZ1bmN0aW9uUHJvdG8gICA9IEZ1bmN0aW9uW1BST1RPVFlQRV1cclxuICAsIEluZmluaXR5ICAgICAgICA9IDEgLyAwXHJcbiAgLCBET1QgICAgICAgICAgICAgPSAnLic7XHJcblxyXG4vLyBodHRwOi8vanNwZXJmLmNvbS9jb3JlLWpzLWlzb2JqZWN0XHJcbmZ1bmN0aW9uIGlzT2JqZWN0KGl0KXtcclxuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNGdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xyXG59XHJcbi8vIE5hdGl2ZSBmdW5jdGlvbj9cclxudmFyIGlzTmF0aXZlID0gY3R4KC8uLy50ZXN0LCAvXFxbbmF0aXZlIGNvZGVcXF1cXHMqXFx9XFxzKiQvLCAxKTtcclxuXHJcbi8vIE9iamVjdCBpbnRlcm5hbCBbW0NsYXNzXV0gb3IgdG9TdHJpbmdUYWdcclxuLy8gaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZ1xyXG52YXIgdG9TdHJpbmcgPSBPYmplY3RQcm90b1tUT19TVFJJTkddO1xyXG5mdW5jdGlvbiBzZXRUb1N0cmluZ1RhZyhpdCwgdGFnLCBzdGF0KXtcclxuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXRbUFJPVE9UWVBFXSwgU1lNQk9MX1RBRykpaGlkZGVuKGl0LCBTWU1CT0xfVEFHLCB0YWcpO1xyXG59XHJcbmZ1bmN0aW9uIGNvZihpdCl7XHJcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcclxufVxyXG5mdW5jdGlvbiBjbGFzc29mKGl0KXtcclxuICB2YXIgTywgVDtcclxuICByZXR1cm4gaXQgPT0gdW5kZWZpbmVkID8gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogJ051bGwnXHJcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbU1lNQk9MX1RBR10pID09ICdzdHJpbmcnID8gVCA6IGNvZihPKTtcclxufVxyXG5cclxuLy8gRnVuY3Rpb25cclxudmFyIGNhbGwgID0gRnVuY3Rpb25Qcm90by5jYWxsXHJcbiAgLCBhcHBseSA9IEZ1bmN0aW9uUHJvdG8uYXBwbHlcclxuICAsIFJFRkVSRU5DRV9HRVQ7XHJcbi8vIFBhcnRpYWwgYXBwbHlcclxuZnVuY3Rpb24gcGFydCgvKiAuLi5hcmdzICovKXtcclxuICB2YXIgZm4gICAgID0gYXNzZXJ0RnVuY3Rpb24odGhpcylcclxuICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzICAgPSBBcnJheShsZW5ndGgpXHJcbiAgICAsIGkgICAgICA9IDBcclxuICAgICwgXyAgICAgID0gcGF0aC5fXHJcbiAgICAsIGhvbGRlciA9IGZhbHNlO1xyXG4gIHdoaWxlKGxlbmd0aCA+IGkpaWYoKGFyZ3NbaV0gPSBhcmd1bWVudHNbaSsrXSkgPT09IF8paG9sZGVyID0gdHJ1ZTtcclxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICB2YXIgdGhhdCAgICA9IHRoaXNcclxuICAgICAgLCBfbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAsIGkgPSAwLCBqID0gMCwgX2FyZ3M7XHJcbiAgICBpZighaG9sZGVyICYmICFfbGVuZ3RoKXJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoYXQpO1xyXG4gICAgX2FyZ3MgPSBhcmdzLnNsaWNlKCk7XHJcbiAgICBpZihob2xkZXIpZm9yKDtsZW5ndGggPiBpOyBpKyspaWYoX2FyZ3NbaV0gPT09IF8pX2FyZ3NbaV0gPSBhcmd1bWVudHNbaisrXTtcclxuICAgIHdoaWxlKF9sZW5ndGggPiBqKV9hcmdzLnB1c2goYXJndW1lbnRzW2orK10pO1xyXG4gICAgcmV0dXJuIGludm9rZShmbiwgX2FyZ3MsIHRoYXQpO1xyXG4gIH1cclxufVxyXG4vLyBPcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcclxuZnVuY3Rpb24gY3R4KGZuLCB0aGF0LCBsZW5ndGgpe1xyXG4gIGFzc2VydEZ1bmN0aW9uKGZuKTtcclxuICBpZih+bGVuZ3RoICYmIHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XHJcbiAgc3dpdGNoKGxlbmd0aCl7XHJcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XHJcbiAgICB9XHJcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XHJcbiAgICB9XHJcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XHJcbiAgICB9XHJcbiAgfSByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gIH1cclxufVxyXG4vLyBGYXN0IGFwcGx5XHJcbi8vIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxyXG5mdW5jdGlvbiBpbnZva2UoZm4sIGFyZ3MsIHRoYXQpe1xyXG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcclxuICBzd2l0Y2goYXJncy5sZW5ndGggfCAwKXtcclxuICAgIGNhc2UgMDogcmV0dXJuIHVuID8gZm4oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xyXG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0pO1xyXG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xyXG4gICAgY2FzZSAzOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xyXG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pO1xyXG4gICAgY2FzZSA1OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pO1xyXG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcclxufVxyXG5cclxuLy8gT2JqZWN0OlxyXG52YXIgY3JlYXRlICAgICAgICAgICA9IE9iamVjdC5jcmVhdGVcclxuICAsIGdldFByb3RvdHlwZU9mICAgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2ZcclxuICAsIHNldFByb3RvdHlwZU9mICAgPSBPYmplY3Quc2V0UHJvdG90eXBlT2ZcclxuICAsIGRlZmluZVByb3BlcnR5ICAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcclxuICAsIGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllc1xyXG4gICwgZ2V0T3duRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JcclxuICAsIGdldEtleXMgICAgICAgICAgPSBPYmplY3Qua2V5c1xyXG4gICwgZ2V0TmFtZXMgICAgICAgICA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXHJcbiAgLCBnZXRTeW1ib2xzICAgICAgID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sc1xyXG4gICwgaXNGcm96ZW4gICAgICAgICA9IE9iamVjdC5pc0Zyb3plblxyXG4gICwgaGFzICAgICAgICAgICAgICA9IGN0eChjYWxsLCBPYmplY3RQcm90b1tIQVNfT1dOXSwgMilcclxuICAvLyBEdW1teSwgZml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGluIGVzNSBtb2R1bGVcclxuICAsIEVTNU9iamVjdCAgICAgICAgPSBPYmplY3RcclxuICAsIERpY3Q7XHJcbmZ1bmN0aW9uIHRvT2JqZWN0KGl0KXtcclxuICByZXR1cm4gRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5JdChpdCl7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIHJldHVyblRoaXMoKXtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5mdW5jdGlvbiBnZXQob2JqZWN0LCBrZXkpe1xyXG4gIGlmKGhhcyhvYmplY3QsIGtleSkpcmV0dXJuIG9iamVjdFtrZXldO1xyXG59XHJcbmZ1bmN0aW9uIG93bktleXMoaXQpe1xyXG4gIGFzc2VydE9iamVjdChpdCk7XHJcbiAgcmV0dXJuIGdldFN5bWJvbHMgPyBnZXROYW1lcyhpdCkuY29uY2F0KGdldFN5bWJvbHMoaXQpKSA6IGdldE5hbWVzKGl0KTtcclxufVxyXG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXHJcbnZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHRhcmdldCwgc291cmNlKXtcclxuICB2YXIgVCA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRhcmdldCkpXHJcbiAgICAsIGwgPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGkgPSAxO1xyXG4gIHdoaWxlKGwgPiBpKXtcclxuICAgIHZhciBTICAgICAgPSBFUzVPYmplY3QoYXJndW1lbnRzW2krK10pXHJcbiAgICAgICwga2V5cyAgID0gZ2V0S2V5cyhTKVxyXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAgICwgaiAgICAgID0gMFxyXG4gICAgICAsIGtleTtcclxuICAgIHdoaWxlKGxlbmd0aCA+IGopVFtrZXkgPSBrZXlzW2orK11dID0gU1trZXldO1xyXG4gIH1cclxuICByZXR1cm4gVDtcclxufVxyXG5mdW5jdGlvbiBrZXlPZihvYmplY3QsIGVsKXtcclxuICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgLCBrZXlzICAgPSBnZXRLZXlzKE8pXHJcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAsIGluZGV4ICA9IDBcclxuICAgICwga2V5O1xyXG4gIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKE9ba2V5ID0ga2V5c1tpbmRleCsrXV0gPT09IGVsKXJldHVybiBrZXk7XHJcbn1cclxuXHJcbi8vIEFycmF5XHJcbi8vIGFycmF5KCdzdHIxLHN0cjIsc3RyMycpID0+IFsnc3RyMScsICdzdHIyJywgJ3N0cjMnXVxyXG5mdW5jdGlvbiBhcnJheShpdCl7XHJcbiAgcmV0dXJuIFN0cmluZyhpdCkuc3BsaXQoJywnKTtcclxufVxyXG52YXIgcHVzaCAgICA9IEFycmF5UHJvdG8ucHVzaFxyXG4gICwgdW5zaGlmdCA9IEFycmF5UHJvdG8udW5zaGlmdFxyXG4gICwgc2xpY2UgICA9IEFycmF5UHJvdG8uc2xpY2VcclxuICAsIHNwbGljZSAgPSBBcnJheVByb3RvLnNwbGljZVxyXG4gICwgaW5kZXhPZiA9IEFycmF5UHJvdG8uaW5kZXhPZlxyXG4gICwgZm9yRWFjaCA9IEFycmF5UHJvdG9bRk9SX0VBQ0hdO1xyXG4vKlxyXG4gKiAwIC0+IGZvckVhY2hcclxuICogMSAtPiBtYXBcclxuICogMiAtPiBmaWx0ZXJcclxuICogMyAtPiBzb21lXHJcbiAqIDQgLT4gZXZlcnlcclxuICogNSAtPiBmaW5kXHJcbiAqIDYgLT4gZmluZEluZGV4XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVBcnJheU1ldGhvZCh0eXBlKXtcclxuICB2YXIgaXNNYXAgICAgICAgPSB0eXBlID09IDFcclxuICAgICwgaXNGaWx0ZXIgICAgPSB0eXBlID09IDJcclxuICAgICwgaXNTb21lICAgICAgPSB0eXBlID09IDNcclxuICAgICwgaXNFdmVyeSAgICAgPSB0eXBlID09IDRcclxuICAgICwgaXNGaW5kSW5kZXggPSB0eXBlID09IDZcclxuICAgICwgbm9ob2xlcyAgICAgPSB0eXBlID09IDUgfHwgaXNGaW5kSW5kZXg7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgdGhhdCAgID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgc2VsZiAgID0gRVM1T2JqZWN0KE8pXHJcbiAgICAgICwgZiAgICAgID0gY3R4KGNhbGxiYWNrZm4sIHRoYXQsIDMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gMFxyXG4gICAgICAsIHJlc3VsdCA9IGlzTWFwID8gQXJyYXkobGVuZ3RoKSA6IGlzRmlsdGVyID8gW10gOiB1bmRlZmluZWRcclxuICAgICAgLCB2YWwsIHJlcztcclxuICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYobm9ob2xlcyB8fCBpbmRleCBpbiBzZWxmKXtcclxuICAgICAgdmFsID0gc2VsZltpbmRleF07XHJcbiAgICAgIHJlcyA9IGYodmFsLCBpbmRleCwgTyk7XHJcbiAgICAgIGlmKHR5cGUpe1xyXG4gICAgICAgIGlmKGlzTWFwKXJlc3VsdFtpbmRleF0gPSByZXM7ICAgICAgICAgICAgIC8vIG1hcFxyXG4gICAgICAgIGVsc2UgaWYocmVzKXN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAvLyBzb21lXHJcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxyXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxyXG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgICAgICAgIC8vIGZpbHRlclxyXG4gICAgICAgIH0gZWxzZSBpZihpc0V2ZXJ5KXJldHVybiBmYWxzZTsgICAgICAgICAgIC8vIGV2ZXJ5XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpc0ZpbmRJbmRleCA/IC0xIDogaXNTb21lIHx8IGlzRXZlcnkgPyBpc0V2ZXJ5IDogcmVzdWx0O1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBjcmVhdGVBcnJheUNvbnRhaW5zKGlzQ29udGFpbnMpe1xyXG4gIHJldHVybiBmdW5jdGlvbihlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XHJcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcclxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGFyZ3VtZW50c1sxXSwgbGVuZ3RoKTtcclxuICAgIGlmKGlzQ29udGFpbnMgJiYgZWwgIT0gZWwpe1xyXG4gICAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKHNhbWVOYU4oT1tpbmRleF0pKXJldHVybiBpc0NvbnRhaW5zIHx8IGluZGV4O1xyXG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoaXNDb250YWlucyB8fCBpbmRleCBpbiBPKXtcclxuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBpc0NvbnRhaW5zIHx8IGluZGV4O1xyXG4gICAgfSByZXR1cm4gIWlzQ29udGFpbnMgJiYgLTE7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGdlbmVyaWMoQSwgQil7XHJcbiAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiB2cyBpc0Z1bmN0aW9uXHJcbiAgcmV0dXJuIHR5cGVvZiBBID09ICdmdW5jdGlvbicgPyBBIDogQjtcclxufVxyXG5cclxuLy8gTWF0aFxyXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmYgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG4gICwgcG93ICAgID0gTWF0aC5wb3dcclxuICAsIGFicyAgICA9IE1hdGguYWJzXHJcbiAgLCBjZWlsICAgPSBNYXRoLmNlaWxcclxuICAsIGZsb29yICA9IE1hdGguZmxvb3JcclxuICAsIG1heCAgICA9IE1hdGgubWF4XHJcbiAgLCBtaW4gICAgPSBNYXRoLm1pblxyXG4gICwgcmFuZG9tID0gTWF0aC5yYW5kb21cclxuICAsIHRydW5jICA9IE1hdGgudHJ1bmMgfHwgZnVuY3Rpb24oaXQpe1xyXG4gICAgICByZXR1cm4gKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xyXG4gICAgfVxyXG4vLyAyMC4xLjIuNCBOdW1iZXIuaXNOYU4obnVtYmVyKVxyXG5mdW5jdGlvbiBzYW1lTmFOKG51bWJlcil7XHJcbiAgcmV0dXJuIG51bWJlciAhPSBudW1iZXI7XHJcbn1cclxuLy8gNy4xLjQgVG9JbnRlZ2VyXHJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XHJcbiAgcmV0dXJuIGlzTmFOKGl0KSA/IDAgOiB0cnVuYyhpdCk7XHJcbn1cclxuLy8gNy4xLjE1IFRvTGVuZ3RoXHJcbmZ1bmN0aW9uIHRvTGVuZ3RoKGl0KXtcclxuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIE1BWF9TQUZFX0lOVEVHRVIpIDogMDtcclxufVxyXG5mdW5jdGlvbiB0b0luZGV4KGluZGV4LCBsZW5ndGgpe1xyXG4gIHZhciBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XHJcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XHJcbn1cclxuZnVuY3Rpb24gbHoobnVtKXtcclxuICByZXR1cm4gbnVtID4gOSA/IG51bSA6ICcwJyArIG51bTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUmVwbGFjZXIocmVnRXhwLCByZXBsYWNlLCBpc1N0YXRpYyl7XHJcbiAgdmFyIHJlcGxhY2VyID0gaXNPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcclxuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xyXG4gIH0gOiByZXBsYWNlO1xyXG4gIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBjcmVhdGVQb2ludEF0KHRvU3RyaW5nKXtcclxuICByZXR1cm4gZnVuY3Rpb24ocG9zKXtcclxuICAgIHZhciBzID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXHJcbiAgICAgICwgbCA9IHMubGVuZ3RoXHJcbiAgICAgICwgYSwgYjtcclxuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gdG9TdHJpbmcgPyAnJyA6IHVuZGVmaW5lZDtcclxuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XHJcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxyXG4gICAgICA/IHRvU3RyaW5nID8gcy5jaGFyQXQoaSkgOiBhXHJcbiAgICAgIDogdG9TdHJpbmcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBBc3NlcnRpb24gJiBlcnJvcnNcclxudmFyIFJFRFVDRV9FUlJPUiA9ICdSZWR1Y2Ugb2YgZW1wdHkgb2JqZWN0IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1zZzEsIG1zZzIpe1xyXG4gIGlmKCFjb25kaXRpb24pdGhyb3cgVHlwZUVycm9yKG1zZzIgPyBtc2cxICsgbXNnMiA6IG1zZzEpO1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydERlZmluZWQoaXQpe1xyXG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoJ0Z1bmN0aW9uIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnRGdW5jdGlvbihpdCl7XHJcbiAgYXNzZXJ0KGlzRnVuY3Rpb24oaXQpLCBpdCwgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0T2JqZWN0KGl0KXtcclxuICBhc3NlcnQoaXNPYmplY3QoaXQpLCBpdCwgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnRJbnN0YW5jZShpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xyXG4gIGFzc2VydChpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yLCBuYW1lLCBcIjogdXNlIHRoZSAnbmV3JyBvcGVyYXRvciFcIik7XHJcbn1cclxuXHJcbi8vIFByb3BlcnR5IGRlc2NyaXB0b3JzICYgU3ltYm9sXHJcbmZ1bmN0aW9uIGRlc2NyaXB0b3IoYml0bWFwLCB2YWx1ZSl7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcclxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcclxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcclxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gc2ltcGxlU2V0KG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcclxuICByZXR1cm4gb2JqZWN0O1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcclxuICByZXR1cm4gREVTQyA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIGRlc2NyaXB0b3IoYml0bWFwLCB2YWx1ZSkpO1xyXG4gIH0gOiBzaW1wbGVTZXQ7XHJcbn1cclxuZnVuY3Rpb24gdWlkKGtleSl7XHJcbiAgcmV0dXJuIFNZTUJPTCArICcoJyArIGtleSArICcpXycgKyAoKytzaWQgKyByYW5kb20oKSlbVE9fU1RSSU5HXSgzNik7XHJcbn1cclxuZnVuY3Rpb24gZ2V0V2VsbEtub3duU3ltYm9sKG5hbWUsIHNldHRlcil7XHJcbiAgcmV0dXJuIChTeW1ib2wgJiYgU3ltYm9sW25hbWVdKSB8fCAoc2V0dGVyID8gU3ltYm9sIDogc2FmZVN5bWJvbCkoU1lNQk9MICsgRE9UICsgbmFtZSk7XHJcbn1cclxuLy8gVGhlIGVuZ2luZSB3b3JrcyBmaW5lIHdpdGggZGVzY3JpcHRvcnM/IFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHkuXHJcbnZhciBERVNDID0gISFmdW5jdGlvbigpe1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gMiB9fSkuYSA9PSAyO1xyXG4gICAgICB9IGNhdGNoKGUpe31cclxuICAgIH0oKVxyXG4gICwgc2lkICAgID0gMFxyXG4gICwgaGlkZGVuID0gY3JlYXRlRGVmaW5lcigxKVxyXG4gICwgc2V0ICAgID0gU3ltYm9sID8gc2ltcGxlU2V0IDogaGlkZGVuXHJcbiAgLCBzYWZlU3ltYm9sID0gU3ltYm9sIHx8IHVpZDtcclxuZnVuY3Rpb24gYXNzaWduSGlkZGVuKHRhcmdldCwgc3JjKXtcclxuICBmb3IodmFyIGtleSBpbiBzcmMpaGlkZGVuKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XHJcbiAgcmV0dXJuIHRhcmdldDtcclxufVxyXG5cclxudmFyIFNZTUJPTF9VTlNDT1BBQkxFUyA9IGdldFdlbGxLbm93blN5bWJvbCgndW5zY29wYWJsZXMnKVxyXG4gICwgQXJyYXlVbnNjb3BhYmxlcyAgID0gQXJyYXlQcm90b1tTWU1CT0xfVU5TQ09QQUJMRVNdIHx8IHt9XHJcbiAgLCBTWU1CT0xfVEFHICAgICAgICAgPSBnZXRXZWxsS25vd25TeW1ib2woVE9fU1RSSU5HX1RBRylcclxuICAsIFNZTUJPTF9TUEVDSUVTICAgICA9IGdldFdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpXHJcbiAgLCBTWU1CT0xfSVRFUkFUT1I7XHJcbmZ1bmN0aW9uIHNldFNwZWNpZXMoQyl7XHJcbiAgaWYoREVTQyAmJiAoZnJhbWV3b3JrIHx8ICFpc05hdGl2ZShDKSkpZGVmaW5lUHJvcGVydHkoQywgU1lNQk9MX1NQRUNJRVMsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogcmV0dXJuVGhpc1xyXG4gIH0pO1xyXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbi5leHBvcnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBOT0RFID0gY29mKHByb2Nlc3MpID09IFBST0NFU1NcclxuICAsIGNvcmUgPSB7fVxyXG4gICwgcGF0aCA9IGZyYW1ld29yayA/IGdsb2JhbCA6IGNvcmVcclxuICAsIG9sZCAgPSBnbG9iYWwuY29yZVxyXG4gICwgZXhwb3J0R2xvYmFsXHJcbiAgLy8gdHlwZSBiaXRtYXBcclxuICAsIEZPUkNFRCA9IDFcclxuICAsIEdMT0JBTCA9IDJcclxuICAsIFNUQVRJQyA9IDRcclxuICAsIFBST1RPICA9IDhcclxuICAsIEJJTkQgICA9IDE2XHJcbiAgLCBXUkFQICAgPSAzMjtcclxuZnVuY3Rpb24gJGRlZmluZSh0eXBlLCBuYW1lLCBzb3VyY2Upe1xyXG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcclxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgR0xPQkFMXHJcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiAodHlwZSAmIFNUQVRJQylcclxuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwgT2JqZWN0UHJvdG8pW1BST1RPVFlQRV1cclxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xyXG4gIGlmKGlzR2xvYmFsKXNvdXJjZSA9IG5hbWU7XHJcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xyXG4gICAgLy8gdGhlcmUgaXMgYSBzaW1pbGFyIG5hdGl2ZVxyXG4gICAgb3duID0gISh0eXBlICYgRk9SQ0VEKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldFxyXG4gICAgICAmJiAoIWlzRnVuY3Rpb24odGFyZ2V0W2tleV0pIHx8IGlzTmF0aXZlKHRhcmdldFtrZXldKSk7XHJcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxyXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcclxuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xyXG4gICAgaWYoIWZyYW1ld29yayAmJiBpc0dsb2JhbCAmJiAhaXNGdW5jdGlvbih0YXJnZXRba2V5XSkpZXhwID0gc291cmNlW2tleV07XHJcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxyXG4gICAgZWxzZSBpZih0eXBlICYgQklORCAmJiBvd24pZXhwID0gY3R4KG91dCwgZ2xvYmFsKTtcclxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XHJcbiAgICBlbHNlIGlmKHR5cGUgJiBXUkFQICYmICFmcmFtZXdvcmsgJiYgdGFyZ2V0W2tleV0gPT0gb3V0KXtcclxuICAgICAgZXhwID0gZnVuY3Rpb24ocGFyYW0pe1xyXG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2Ygb3V0ID8gbmV3IG91dChwYXJhbSkgOiBvdXQocGFyYW0pO1xyXG4gICAgICB9XHJcbiAgICAgIGV4cFtQUk9UT1RZUEVdID0gb3V0W1BST1RPVFlQRV07XHJcbiAgICB9IGVsc2UgZXhwID0gdHlwZSAmIFBST1RPICYmIGlzRnVuY3Rpb24ob3V0KSA/IGN0eChjYWxsLCBvdXQpIDogb3V0O1xyXG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxyXG4gICAgaWYoZnJhbWV3b3JrICYmIHRhcmdldCAmJiAhb3duKXtcclxuICAgICAgaWYoaXNHbG9iYWwpdGFyZ2V0W2tleV0gPSBvdXQ7XHJcbiAgICAgIGVsc2UgZGVsZXRlIHRhcmdldFtrZXldICYmIGhpZGRlbih0YXJnZXQsIGtleSwgb3V0KTtcclxuICAgIH1cclxuICAgIC8vIGV4cG9ydFxyXG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCloaWRkZW4oZXhwb3J0cywga2V5LCBleHApO1xyXG4gIH1cclxufVxyXG4vLyBDb21tb25KUyBleHBvcnRcclxuaWYodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyltb2R1bGUuZXhwb3J0cyA9IGNvcmU7XHJcbi8vIFJlcXVpcmVKUyBleHBvcnRcclxuZWxzZSBpZihpc0Z1bmN0aW9uKGRlZmluZSkgJiYgZGVmaW5lLmFtZClkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gY29yZX0pO1xyXG4vLyBFeHBvcnQgdG8gZ2xvYmFsIG9iamVjdFxyXG5lbHNlIGV4cG9ydEdsb2JhbCA9IHRydWU7XHJcbmlmKGV4cG9ydEdsb2JhbCB8fCBmcmFtZXdvcmspe1xyXG4gIGNvcmUubm9Db25mbGljdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBnbG9iYWwuY29yZSA9IG9sZDtcclxuICAgIHJldHVybiBjb3JlO1xyXG4gIH1cclxuICBnbG9iYWwuY29yZSA9IGNvcmU7XHJcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29tbW9uLml0ZXJhdG9ycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuU1lNQk9MX0lURVJBVE9SID0gZ2V0V2VsbEtub3duU3ltYm9sKElURVJBVE9SKTtcclxudmFyIElURVIgID0gc2FmZVN5bWJvbCgnaXRlcicpXHJcbiAgLCBLRVkgICA9IDFcclxuICAsIFZBTFVFID0gMlxyXG4gICwgSXRlcmF0b3JzID0ge31cclxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge31cclxuICAgIC8vIFNhZmFyaSBoYXMgYnlnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcclxuICAsIEJVR0dZX0lURVJBVE9SUyA9ICdrZXlzJyBpbiBBcnJheVByb3RvICYmICEoJ25leHQnIGluIFtdLmtleXMoKSk7XHJcbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXHJcbnNldEl0ZXJhdG9yKEl0ZXJhdG9yUHJvdG90eXBlLCByZXR1cm5UaGlzKTtcclxuZnVuY3Rpb24gc2V0SXRlcmF0b3IoTywgdmFsdWUpe1xyXG4gIGhpZGRlbihPLCBTWU1CT0xfSVRFUkFUT1IsIHZhbHVlKTtcclxuICAvLyBBZGQgaXRlcmF0b3IgZm9yIEZGIGl0ZXJhdG9yIHByb3RvY29sXHJcbiAgRkZfSVRFUkFUT1IgaW4gQXJyYXlQcm90byAmJiBoaWRkZW4oTywgRkZfSVRFUkFUT1IsIHZhbHVlKTtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVJdGVyYXRvcihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCwgcHJvdG8pe1xyXG4gIENvbnN0cnVjdG9yW1BST1RPVFlQRV0gPSBjcmVhdGUocHJvdG8gfHwgSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpfSk7XHJcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIHZhbHVlLCBERUZBVUxUKXtcclxuICB2YXIgcHJvdG8gPSBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdXHJcbiAgICAsIGl0ZXIgID0gZ2V0KHByb3RvLCBTWU1CT0xfSVRFUkFUT1IpIHx8IGdldChwcm90bywgRkZfSVRFUkFUT1IpIHx8IChERUZBVUxUICYmIGdldChwcm90bywgREVGQVVMVCkpIHx8IHZhbHVlO1xyXG4gIGlmKGZyYW1ld29yayl7XHJcbiAgICAvLyBEZWZpbmUgaXRlcmF0b3JcclxuICAgIHNldEl0ZXJhdG9yKHByb3RvLCBpdGVyKTtcclxuICAgIGlmKGl0ZXIgIT09IHZhbHVlKXtcclxuICAgICAgdmFyIGl0ZXJQcm90byA9IGdldFByb3RvdHlwZU9mKGl0ZXIuY2FsbChuZXcgQ29uc3RydWN0b3IpKTtcclxuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xyXG4gICAgICBzZXRUb1N0cmluZ1RhZyhpdGVyUHJvdG8sIE5BTUUgKyAnIEl0ZXJhdG9yJywgdHJ1ZSk7XHJcbiAgICAgIC8vIEZGIGZpeFxyXG4gICAgICBoYXMocHJvdG8sIEZGX0lURVJBVE9SKSAmJiBzZXRJdGVyYXRvcihpdGVyUHJvdG8sIHJldHVyblRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XHJcbiAgSXRlcmF0b3JzW05BTUVdID0gaXRlcjtcclxuICAvLyBGRiAmIHY4IGZpeFxyXG4gIEl0ZXJhdG9yc1tOQU1FICsgJyBJdGVyYXRvciddID0gcmV0dXJuVGhpcztcclxuICByZXR1cm4gaXRlcjtcclxufVxyXG5mdW5jdGlvbiBkZWZpbmVTdGRJdGVyYXRvcnMoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCl7XHJcbiAgZnVuY3Rpb24gY3JlYXRlSXRlcihraW5kKXtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpO1xyXG4gICAgfVxyXG4gIH1cclxuICBjcmVhdGVJdGVyYXRvcihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XHJcbiAgdmFyIGVudHJpZXMgPSBjcmVhdGVJdGVyKEtFWStWQUxVRSlcclxuICAgICwgdmFsdWVzICA9IGNyZWF0ZUl0ZXIoVkFMVUUpO1xyXG4gIGlmKERFRkFVTFQgPT0gVkFMVUUpdmFsdWVzID0gZGVmaW5lSXRlcmF0b3IoQmFzZSwgTkFNRSwgdmFsdWVzLCAndmFsdWVzJyk7XHJcbiAgZWxzZSBlbnRyaWVzID0gZGVmaW5lSXRlcmF0b3IoQmFzZSwgTkFNRSwgZW50cmllcywgJ2VudHJpZXMnKTtcclxuICBpZihERUZBVUxUKXtcclxuICAgICRkZWZpbmUoUFJPVE8gKyBGT1JDRUQgKiBCVUdHWV9JVEVSQVRPUlMsIE5BTUUsIHtcclxuICAgICAgZW50cmllczogZW50cmllcyxcclxuICAgICAga2V5czogSVNfU0VUID8gdmFsdWVzIDogY3JlYXRlSXRlcihLRVkpLFxyXG4gICAgICB2YWx1ZXM6IHZhbHVlc1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGl0ZXJSZXN1bHQoZG9uZSwgdmFsdWUpe1xyXG4gIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xyXG59XHJcbmZ1bmN0aW9uIGlzSXRlcmFibGUoaXQpe1xyXG4gIHZhciBPICAgICAgPSBPYmplY3QoaXQpXHJcbiAgICAsIFN5bWJvbCA9IGdsb2JhbFtTWU1CT0xdXHJcbiAgICAsIGhhc0V4dCA9IChTeW1ib2wgJiYgU3ltYm9sW0lURVJBVE9SXSB8fCBGRl9JVEVSQVRPUikgaW4gTztcclxuICByZXR1cm4gaGFzRXh0IHx8IFNZTUJPTF9JVEVSQVRPUiBpbiBPIHx8IGhhcyhJdGVyYXRvcnMsIGNsYXNzb2YoTykpO1xyXG59XHJcbmZ1bmN0aW9uIGdldEl0ZXJhdG9yKGl0KXtcclxuICB2YXIgU3ltYm9sICA9IGdsb2JhbFtTWU1CT0xdXHJcbiAgICAsIGV4dCAgICAgPSBpdFtTeW1ib2wgJiYgU3ltYm9sW0lURVJBVE9SXSB8fCBGRl9JVEVSQVRPUl1cclxuICAgICwgZ2V0SXRlciA9IGV4dCB8fCBpdFtTWU1CT0xfSVRFUkFUT1JdIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XHJcbiAgcmV0dXJuIGFzc2VydE9iamVjdChnZXRJdGVyLmNhbGwoaXQpKTtcclxufVxyXG5mdW5jdGlvbiBzdGVwQ2FsbChmbiwgdmFsdWUsIGVudHJpZXMpe1xyXG4gIHJldHVybiBlbnRyaWVzID8gaW52b2tlKGZuLCB2YWx1ZSkgOiBmbih2YWx1ZSk7XHJcbn1cclxuZnVuY3Rpb24gY2hlY2tEYW5nZXJJdGVyQ2xvc2luZyhmbil7XHJcbiAgdmFyIGRhbmdlciA9IHRydWU7XHJcbiAgdmFyIE8gPSB7XHJcbiAgICBuZXh0OiBmdW5jdGlvbigpeyB0aHJvdyAxIH0sXHJcbiAgICAncmV0dXJuJzogZnVuY3Rpb24oKXsgZGFuZ2VyID0gZmFsc2UgfVxyXG4gIH07XHJcbiAgT1tTWU1CT0xfSVRFUkFUT1JdID0gcmV0dXJuVGhpcztcclxuICB0cnkge1xyXG4gICAgZm4oTyk7XHJcbiAgfSBjYXRjaChlKXt9XHJcbiAgcmV0dXJuIGRhbmdlcjtcclxufVxyXG5mdW5jdGlvbiBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKXtcclxuICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xyXG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKXJldC5jYWxsKGl0ZXJhdG9yKTtcclxufVxyXG5mdW5jdGlvbiBzYWZlSXRlckNsb3NlKGV4ZWMsIGl0ZXJhdG9yKXtcclxuICB0cnkge1xyXG4gICAgZXhlYyhpdGVyYXRvcik7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3IpO1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gZm9yT2YoaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcclxuICBzYWZlSXRlckNsb3NlKGZ1bmN0aW9uKGl0ZXJhdG9yKXtcclxuICAgIHZhciBmID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXHJcbiAgICAgICwgc3RlcDtcclxuICAgIHdoaWxlKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSlpZihzdGVwQ2FsbChmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKSA9PT0gZmFsc2Upe1xyXG4gICAgICByZXR1cm4gY2xvc2VJdGVyYXRvcihpdGVyYXRvcik7XHJcbiAgICB9XHJcbiAgfSwgZ2V0SXRlcmF0b3IoaXRlcmFibGUpKTtcclxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuc3ltYm9sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXHJcbiFmdW5jdGlvbihUQUcsIFN5bWJvbFJlZ2lzdHJ5LCBBbGxTeW1ib2xzLCBzZXR0ZXIpe1xyXG4gIC8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxyXG4gIGlmKCFpc05hdGl2ZShTeW1ib2wpKXtcclxuICAgIFN5bWJvbCA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uKXtcclxuICAgICAgYXNzZXJ0KCEodGhpcyBpbnN0YW5jZW9mIFN5bWJvbCksIFNZTUJPTCArICcgaXMgbm90IGEgJyArIENPTlNUUlVDVE9SKTtcclxuICAgICAgdmFyIHRhZyA9IHVpZChkZXNjcmlwdGlvbilcclxuICAgICAgICAsIHN5bSA9IHNldChjcmVhdGUoU3ltYm9sW1BST1RPVFlQRV0pLCBUQUcsIHRhZyk7XHJcbiAgICAgIEFsbFN5bWJvbHNbdGFnXSA9IHN5bTtcclxuICAgICAgREVTQyAmJiBzZXR0ZXIgJiYgZGVmaW5lUHJvcGVydHkoT2JqZWN0UHJvdG8sIHRhZywge1xyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgIGhpZGRlbih0aGlzLCB0YWcsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gc3ltO1xyXG4gICAgfVxyXG4gICAgaGlkZGVuKFN5bWJvbFtQUk9UT1RZUEVdLCBUT19TVFJJTkcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHJldHVybiB0aGlzW1RBR107XHJcbiAgICB9KTtcclxuICB9XHJcbiAgJGRlZmluZShHTE9CQUwgKyBXUkFQLCB7U3ltYm9sOiBTeW1ib2x9KTtcclxuICBcclxuICB2YXIgc3ltYm9sU3RhdGljcyA9IHtcclxuICAgIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxyXG4gICAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcclxuICAgICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cclxuICAgICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSBTeW1ib2woa2V5KTtcclxuICAgIH0sXHJcbiAgICAvLyAxOS40LjIuNCBTeW1ib2wuaXRlcmF0b3JcclxuICAgIGl0ZXJhdG9yOiBTWU1CT0xfSVRFUkFUT1IgfHwgZ2V0V2VsbEtub3duU3ltYm9sKElURVJBVE9SKSxcclxuICAgIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxyXG4gICAga2V5Rm9yOiBwYXJ0LmNhbGwoa2V5T2YsIFN5bWJvbFJlZ2lzdHJ5KSxcclxuICAgIC8vIDE5LjQuMi4xMCBTeW1ib2wuc3BlY2llc1xyXG4gICAgc3BlY2llczogU1lNQk9MX1NQRUNJRVMsXHJcbiAgICAvLyAxOS40LjIuMTMgU3ltYm9sLnRvU3RyaW5nVGFnXHJcbiAgICB0b1N0cmluZ1RhZzogU1lNQk9MX1RBRyA9IGdldFdlbGxLbm93blN5bWJvbChUT19TVFJJTkdfVEFHLCB0cnVlKSxcclxuICAgIC8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcclxuICAgIHVuc2NvcGFibGVzOiBTWU1CT0xfVU5TQ09QQUJMRVMsXHJcbiAgICBwdXJlOiBzYWZlU3ltYm9sLFxyXG4gICAgc2V0OiBzZXQsXHJcbiAgICB1c2VTZXR0ZXI6IGZ1bmN0aW9uKCl7c2V0dGVyID0gdHJ1ZX0sXHJcbiAgICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7c2V0dGVyID0gZmFsc2V9XHJcbiAgfTtcclxuICAvLyAxOS40LjIuMiBTeW1ib2wuaGFzSW5zdGFuY2VcclxuICAvLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXHJcbiAgLy8gMTkuNC4yLjYgU3ltYm9sLm1hdGNoXHJcbiAgLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2VcclxuICAvLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXHJcbiAgLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxyXG4gIC8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcclxuICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGxpdCx0b1ByaW1pdGl2ZScpLFxyXG4gICAgZnVuY3Rpb24oaXQpe1xyXG4gICAgICBzeW1ib2xTdGF0aWNzW2l0XSA9IGdldFdlbGxLbm93blN5bWJvbChpdCk7XHJcbiAgICB9XHJcbiAgKTtcclxuICAkZGVmaW5lKFNUQVRJQywgU1lNQk9MLCBzeW1ib2xTdGF0aWNzKTtcclxuICBcclxuICBzZXRUb1N0cmluZ1RhZyhTeW1ib2wsIFNZTUJPTCk7XHJcbiAgXHJcbiAgJGRlZmluZShTVEFUSUMgKyBGT1JDRUQgKiAhaXNOYXRpdmUoU3ltYm9sKSwgT0JKRUNULCB7XHJcbiAgICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxyXG4gICAgZ2V0T3duUHJvcGVydHlOYW1lczogZnVuY3Rpb24oaXQpe1xyXG4gICAgICB2YXIgbmFtZXMgPSBnZXROYW1lcyh0b09iamVjdChpdCkpLCByZXN1bHQgPSBbXSwga2V5LCBpID0gMDtcclxuICAgICAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSloYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sXHJcbiAgICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXHJcbiAgICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgdmFyIG5hbWVzID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKSwgcmVzdWx0ID0gW10sIGtleSwgaSA9IDA7XHJcbiAgICAgIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxyXG4gIHNldFRvU3RyaW5nVGFnKE1hdGgsIE1BVEgsIHRydWUpO1xyXG4gIC8vIDI0LjMuMyBKU09OW0BAdG9TdHJpbmdUYWddXHJcbiAgc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XHJcbn0oc2FmZVN5bWJvbCgndGFnJyksIHt9LCB7fSwgdHJ1ZSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5vYmplY3Quc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gIHZhciBvYmplY3RTdGF0aWMgPSB7XHJcbiAgICAvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxyXG4gICAgYXNzaWduOiBhc3NpZ24sXHJcbiAgICAvLyAxOS4xLjMuMTAgT2JqZWN0LmlzKHZhbHVlMSwgdmFsdWUyKVxyXG4gICAgaXM6IGZ1bmN0aW9uKHgsIHkpe1xyXG4gICAgICByZXR1cm4geCA9PT0geSA/IHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5IDogeCAhPSB4ICYmIHkgIT0geTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXHJcbiAgLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmtzIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxyXG4gICdfX3Byb3RvX18nIGluIE9iamVjdFByb3RvICYmIGZ1bmN0aW9uKGJ1Z2d5LCBzZXQpe1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0ID0gY3R4KGNhbGwsIGdldE93bkRlc2NyaXB0b3IoT2JqZWN0UHJvdG8sICdfX3Byb3RvX18nKS5zZXQsIDIpO1xyXG4gICAgICBzZXQoe30sIEFycmF5UHJvdG8pO1xyXG4gICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlIH1cclxuICAgIG9iamVjdFN0YXRpYy5zZXRQcm90b3R5cGVPZiA9IHNldFByb3RvdHlwZU9mID0gc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24oTywgcHJvdG8pe1xyXG4gICAgICBhc3NlcnRPYmplY3QoTyk7XHJcbiAgICAgIGFzc2VydChwcm90byA9PT0gbnVsbCB8fCBpc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XHJcbiAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XHJcbiAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcclxuICAgICAgcmV0dXJuIE87XHJcbiAgICB9XHJcbiAgfSgpO1xyXG4gICRkZWZpbmUoU1RBVElDLCBPQkpFQ1QsIG9iamVjdFN0YXRpYyk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm9iamVjdC5wcm90b3R5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKHRtcCl7XHJcbiAgLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXHJcbiAgdG1wW1NZTUJPTF9UQUddID0gRE9UO1xyXG4gIGlmKGNvZih0bXApICE9IERPVCloaWRkZW4oT2JqZWN0UHJvdG8sIFRPX1NUUklORywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiAnW29iamVjdCAnICsgY2xhc3NvZih0aGlzKSArICddJztcclxuICB9KTtcclxufSh7fSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gIC8vIE9iamVjdCBzdGF0aWMgbWV0aG9kcyBhY2NlcHQgcHJpbWl0aXZlc1xyXG4gIGZ1bmN0aW9uIHdyYXBPYmplY3RNZXRob2Qoa2V5LCBNT0RFKXtcclxuICAgIHZhciBmbiAgPSBPYmplY3Rba2V5XVxyXG4gICAgICAsIGV4cCA9IGNvcmVbT0JKRUNUXVtrZXldXHJcbiAgICAgICwgZiAgID0gMFxyXG4gICAgICAsIG8gICA9IHt9O1xyXG4gICAgaWYoIWV4cCB8fCBpc05hdGl2ZShleHApKXtcclxuICAgICAgb1trZXldID0gTU9ERSA9PSAxID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcclxuICAgICAgfSA6IE1PREUgPT0gMiA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcclxuICAgICAgfSA6IE1PREUgPT0gMyA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XHJcbiAgICAgIH0gOiBNT0RFID09IDQgPyBmdW5jdGlvbihpdCwga2V5KXtcclxuICAgICAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpLCBrZXkpO1xyXG4gICAgICB9IDogZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xyXG4gICAgICB9O1xyXG4gICAgICB0cnkgeyBmbihET1QpIH1cclxuICAgICAgY2F0Y2goZSl7IGYgPSAxIH1cclxuICAgICAgJGRlZmluZShTVEFUSUMgKyBGT1JDRUQgKiBmLCBPQkpFQ1QsIG8pO1xyXG4gICAgfVxyXG4gIH1cclxuICB3cmFwT2JqZWN0TWV0aG9kKCdmcmVlemUnLCAxKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdzZWFsJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgncHJldmVudEV4dGVuc2lvbnMnLCAxKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdpc0Zyb3plbicsIDIpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2lzU2VhbGVkJywgMik7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnaXNFeHRlbnNpYmxlJywgMyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgNCk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0UHJvdG90eXBlT2YnKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdrZXlzJyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlOYW1lcycpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5mdW5jdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihOQU1FKXtcclxuICAvLyAxOS4yLjQuMiBuYW1lXHJcbiAgTkFNRSBpbiBGdW5jdGlvblByb3RvIHx8IChERVNDICYmIGRlZmluZVByb3BlcnR5KEZ1bmN0aW9uUHJvdG8sIE5BTUUsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIG1hdGNoID0gU3RyaW5nKHRoaXMpLm1hdGNoKC9eXFxzKmZ1bmN0aW9uIChbXiAoXSopLylcclxuICAgICAgICAsIG5hbWUgID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xyXG4gICAgICBoYXModGhpcywgTkFNRSkgfHwgZGVmaW5lUHJvcGVydHkodGhpcywgTkFNRSwgZGVzY3JpcHRvcig1LCBuYW1lKSk7XHJcbiAgICAgIHJldHVybiBuYW1lO1xyXG4gICAgfSxcclxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICBoYXModGhpcywgTkFNRSkgfHwgZGVmaW5lUHJvcGVydHkodGhpcywgTkFNRSwgZGVzY3JpcHRvcigwLCB2YWx1ZSkpO1xyXG4gICAgfVxyXG4gIH0pKTtcclxufSgnbmFtZScpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYubnVtYmVyLmNvbnN0cnVjdG9yICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5OdW1iZXIoJzBvMScpICYmIE51bWJlcignMGIxJykgfHwgZnVuY3Rpb24oX051bWJlciwgTnVtYmVyUHJvdG8pe1xyXG4gIGZ1bmN0aW9uIHRvTnVtYmVyKGl0KXtcclxuICAgIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcclxuICAgIGlmKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyAmJiBpdC5sZW5ndGggPiAyICYmIGl0LmNoYXJDb2RlQXQoMCkgPT0gNDgpe1xyXG4gICAgICB2YXIgYmluYXJ5ID0gZmFsc2U7XHJcbiAgICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcclxuICAgICAgICBjYXNlIDY2IDogY2FzZSA5OCAgOiBiaW5hcnkgPSB0cnVlO1xyXG4gICAgICAgIGNhc2UgNzkgOiBjYXNlIDExMSA6IHJldHVybiBwYXJzZUludChpdC5zbGljZSgyKSwgYmluYXJ5ID8gMiA6IDgpO1xyXG4gICAgICB9XHJcbiAgICB9IHJldHVybiAraXQ7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHRvUHJpbWl0aXZlKGl0KXtcclxuICAgIHZhciBmbiwgdmFsO1xyXG4gICAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnZhbHVlT2YpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICAgIGlmKGlzRnVuY3Rpb24oZm4gPSBpdFtUT19TVFJJTkddKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XHJcbiAgICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XHJcbiAgfVxyXG4gIE51bWJlciA9IGZ1bmN0aW9uIE51bWJlcihpdCl7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIE51bWJlciA/IG5ldyBfTnVtYmVyKHRvTnVtYmVyKGl0KSkgOiB0b051bWJlcihpdCk7XHJcbiAgfVxyXG4gIGZvckVhY2guY2FsbChERVNDID8gZ2V0TmFtZXMoX051bWJlcilcclxuICA6IGFycmF5KCdNQVhfVkFMVUUsTUlOX1ZBTFVFLE5hTixORUdBVElWRV9JTkZJTklUWSxQT1NJVElWRV9JTkZJTklUWScpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAga2V5IGluIE51bWJlciB8fCBkZWZpbmVQcm9wZXJ0eShOdW1iZXIsIGtleSwgZ2V0T3duRGVzY3JpcHRvcihfTnVtYmVyLCBrZXkpKTtcclxuICB9KTtcclxuICBOdW1iZXJbUFJPVE9UWVBFXSA9IE51bWJlclByb3RvO1xyXG4gIE51bWJlclByb3RvW0NPTlNUUlVDVE9SXSA9IE51bWJlcjtcclxuICBoaWRkZW4oZ2xvYmFsLCBOVU1CRVIsIE51bWJlcik7XHJcbn0oTnVtYmVyLCBOdW1iZXJbUFJPVE9UWVBFXSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5udW1iZXIuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihpc0ludGVnZXIpe1xyXG4gICRkZWZpbmUoU1RBVElDLCBOVU1CRVIsIHtcclxuICAgIC8vIDIwLjEuMi4xIE51bWJlci5FUFNJTE9OXHJcbiAgICBFUFNJTE9OOiBwb3coMiwgLTUyKSxcclxuICAgIC8vIDIwLjEuMi4yIE51bWJlci5pc0Zpbml0ZShudW1iZXIpXHJcbiAgICBpc0Zpbml0ZTogZnVuY3Rpb24oaXQpe1xyXG4gICAgICByZXR1cm4gdHlwZW9mIGl0ID09ICdudW1iZXInICYmIGlzRmluaXRlKGl0KTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4xLjIuMyBOdW1iZXIuaXNJbnRlZ2VyKG51bWJlcilcclxuICAgIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxyXG4gICAgLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuICAgIGlzTmFOOiBzYW1lTmFOLFxyXG4gICAgLy8gMjAuMS4yLjUgTnVtYmVyLmlzU2FmZUludGVnZXIobnVtYmVyKVxyXG4gICAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24obnVtYmVyKXtcclxuICAgICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMS4yLjYgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcclxuICAgIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgICAvLyAyMC4xLjIuMTAgTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcclxuICAgIE1JTl9TQUZFX0lOVEVHRVI6IC1NQVhfU0FGRV9JTlRFR0VSLFxyXG4gICAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcclxuICAgIHBhcnNlRmxvYXQ6IHBhcnNlRmxvYXQsXHJcbiAgICAvLyAyMC4xLjIuMTMgTnVtYmVyLnBhcnNlSW50KHN0cmluZywgcmFkaXgpXHJcbiAgICBwYXJzZUludDogcGFyc2VJbnRcclxuICB9KTtcclxuLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXHJcbn0oTnVtYmVyLmlzSW50ZWdlciB8fCBmdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuICFpc09iamVjdChpdCkgJiYgaXNGaW5pdGUoaXQpICYmIGZsb29yKGl0KSA9PT0gaXQ7XHJcbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYubWF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFQ01BU2NyaXB0IDYgc2hpbVxyXG4hZnVuY3Rpb24oKXtcclxuICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXHJcbiAgdmFyIEUgICAgPSBNYXRoLkVcclxuICAgICwgZXhwICA9IE1hdGguZXhwXHJcbiAgICAsIGxvZyAgPSBNYXRoLmxvZ1xyXG4gICAgLCBzcXJ0ID0gTWF0aC5zcXJ0XHJcbiAgICAsIHNpZ24gPSBNYXRoLnNpZ24gfHwgZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgcmV0dXJuICh4ID0gK3gpID09IDAgfHwgeCAhPSB4ID8geCA6IHggPCAwID8gLTEgOiAxO1xyXG4gICAgICB9O1xyXG4gIFxyXG4gIC8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcclxuICBmdW5jdGlvbiBhc2luaCh4KXtcclxuICAgIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xyXG4gIH1cclxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxyXG4gIGZ1bmN0aW9uIGV4cG0xKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogeCA+IC0xZS02ICYmIHggPCAxZS02ID8geCArIHggKiB4IC8gMiA6IGV4cCh4KSAtIDE7XHJcbiAgfVxyXG4gICAgXHJcbiAgJGRlZmluZShTVEFUSUMsIE1BVEgsIHtcclxuICAgIC8vIDIwLjIuMi4zIE1hdGguYWNvc2goeClcclxuICAgIGFjb3NoOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpIDwgMSA/IE5hTiA6IGlzRmluaXRlKHgpID8gbG9nKHggLyBFICsgc3FydCh4ICsgMSkgKiBzcXJ0KHggLSAxKSAvIEUpICsgMSA6IHg7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gICAgYXNpbmg6IGFzaW5oLFxyXG4gICAgLy8gMjAuMi4yLjcgTWF0aC5hdGFuaCh4KVxyXG4gICAgYXRhbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiBsb2coKDEgKyB4KSAvICgxIC0geCkpIC8gMjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcclxuICAgIGNicnQ6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gc2lnbih4ID0gK3gpICogcG93KGFicyh4KSwgMSAvIDMpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xMSBNYXRoLmNsejMyKHgpXHJcbiAgICBjbHozMjogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA+Pj49IDApID8gMzIgLSB4W1RPX1NUUklOR10oMikubGVuZ3RoIDogMzI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjEyIE1hdGguY29zaCh4KVxyXG4gICAgY29zaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoZXhwKHggPSAreCkgKyBleHAoLXgpKSAvIDI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcclxuICAgIGV4cG0xOiBleHBtMSxcclxuICAgIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxyXG4gICAgLy8gVE9ETzogZmFsbGJhY2sgZm9yIElFOS1cclxuICAgIGZyb3VuZDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt4XSlbMF07XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE3IE1hdGguaHlwb3QoW3ZhbHVlMVssIHZhbHVlMlssIOKApiBdXV0pXHJcbiAgICBoeXBvdDogZnVuY3Rpb24odmFsdWUxLCB2YWx1ZTIpe1xyXG4gICAgICB2YXIgc3VtICA9IDBcclxuICAgICAgICAsIGxlbjEgPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCBsZW4yID0gbGVuMVxyXG4gICAgICAgICwgYXJncyA9IEFycmF5KGxlbjEpXHJcbiAgICAgICAgLCBsYXJnID0gLUluZmluaXR5XHJcbiAgICAgICAgLCBhcmc7XHJcbiAgICAgIHdoaWxlKGxlbjEtLSl7XHJcbiAgICAgICAgYXJnID0gYXJnc1tsZW4xXSA9ICthcmd1bWVudHNbbGVuMV07XHJcbiAgICAgICAgaWYoYXJnID09IEluZmluaXR5IHx8IGFyZyA9PSAtSW5maW5pdHkpcmV0dXJuIEluZmluaXR5O1xyXG4gICAgICAgIGlmKGFyZyA+IGxhcmcpbGFyZyA9IGFyZztcclxuICAgICAgfVxyXG4gICAgICBsYXJnID0gYXJnIHx8IDE7XHJcbiAgICAgIHdoaWxlKGxlbjItLSlzdW0gKz0gcG93KGFyZ3NbbGVuMl0gLyBsYXJnLCAyKTtcclxuICAgICAgcmV0dXJuIGxhcmcgKiBzcXJ0KHN1bSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE4IE1hdGguaW11bCh4LCB5KVxyXG4gICAgaW11bDogZnVuY3Rpb24oeCwgeSl7XHJcbiAgICAgIHZhciBVSW50MTYgPSAweGZmZmZcclxuICAgICAgICAsIHhuID0gK3hcclxuICAgICAgICAsIHluID0gK3lcclxuICAgICAgICAsIHhsID0gVUludDE2ICYgeG5cclxuICAgICAgICAsIHlsID0gVUludDE2ICYgeW47XHJcbiAgICAgIHJldHVybiAwIHwgeGwgKiB5bCArICgoVUludDE2ICYgeG4gPj4+IDE2KSAqIHlsICsgeGwgKiAoVUludDE2ICYgeW4gPj4+IDE2KSA8PCAxNiA+Pj4gMCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcclxuICAgIGxvZzFwOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpID4gLTFlLTggJiYgeCA8IDFlLTggPyB4IC0geCAqIHggLyAyIDogbG9nKDEgKyB4KTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjEgTWF0aC5sb2cxMCh4KVxyXG4gICAgbG9nMTA6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yMiBNYXRoLmxvZzIoeClcclxuICAgIGxvZzI6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gICAgc2lnbjogc2lnbixcclxuICAgIC8vIDIwLjIuMi4zMCBNYXRoLnNpbmgoeClcclxuICAgIHNpbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKGFicyh4ID0gK3gpIDwgMSkgPyAoZXhwbTEoeCkgLSBleHBtMSgteCkpIC8gMiA6IChleHAoeCAtIDEpIC0gZXhwKC14IC0gMSkpICogKEUgLyAyKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMzMgTWF0aC50YW5oKHgpXHJcbiAgICB0YW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXHJcbiAgICAgICAgLCBiID0gZXhwbTEoLXgpO1xyXG4gICAgICByZXR1cm4gYSA9PSBJbmZpbml0eSA/IDEgOiBiID09IEluZmluaXR5ID8gLTEgOiAoYSAtIGIpIC8gKGV4cCh4KSArIGV4cCgteCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4zNCBNYXRoLnRydW5jKHgpXHJcbiAgICB0cnVuYzogdHJ1bmNcclxuICB9KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuc3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oZnJvbUNoYXJDb2RlKXtcclxuICBmdW5jdGlvbiBhc3NlcnROb3RSZWdFeHAoaXQpe1xyXG4gICAgaWYoY29mKGl0KSA9PSBSRUdFWFApdGhyb3cgVHlwZUVycm9yKCk7XHJcbiAgfVxyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBTVFJJTkcsIHtcclxuICAgIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXHJcbiAgICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbih4KXtcclxuICAgICAgdmFyIHJlcyA9IFtdXHJcbiAgICAgICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCBpICAgPSAwXHJcbiAgICAgICAgLCBjb2RlXHJcbiAgICAgIHdoaWxlKGxlbiA+IGkpe1xyXG4gICAgICAgIGNvZGUgPSArYXJndW1lbnRzW2krK107XHJcbiAgICAgICAgaWYodG9JbmRleChjb2RlLCAweDEwZmZmZikgIT09IGNvZGUpdGhyb3cgUmFuZ2VFcnJvcihjb2RlICsgJyBpcyBub3QgYSB2YWxpZCBjb2RlIHBvaW50Jyk7XHJcbiAgICAgICAgcmVzLnB1c2goY29kZSA8IDB4MTAwMDBcclxuICAgICAgICAgID8gZnJvbUNoYXJDb2RlKGNvZGUpXHJcbiAgICAgICAgICA6IGZyb21DaGFyQ29kZSgoKGNvZGUgLT0gMHgxMDAwMCkgPj4gMTApICsgMHhkODAwLCBjb2RlICUgMHg0MDAgKyAweGRjMDApXHJcbiAgICAgICAgKTtcclxuICAgICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXHJcbiAgICByYXc6IGZ1bmN0aW9uKGNhbGxTaXRlKXtcclxuICAgICAgdmFyIHJhdyA9IHRvT2JqZWN0KGNhbGxTaXRlLnJhdylcclxuICAgICAgICAsIGxlbiA9IHRvTGVuZ3RoKHJhdy5sZW5ndGgpXHJcbiAgICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCByZXMgPSBbXVxyXG4gICAgICAgICwgaSAgID0gMDtcclxuICAgICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgICAgcmVzLnB1c2goU3RyaW5nKHJhd1tpKytdKSk7XHJcbiAgICAgICAgaWYoaSA8IHNsbilyZXMucHVzaChTdHJpbmcoYXJndW1lbnRzW2ldKSk7XHJcbiAgICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICAkZGVmaW5lKFBST1RPLCBTVFJJTkcsIHtcclxuICAgIC8vIDIxLjEuMy4zIFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQocG9zKVxyXG4gICAgY29kZVBvaW50QXQ6IGNyZWF0ZVBvaW50QXQoZmFsc2UpLFxyXG4gICAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxyXG4gICAgZW5kc1dpdGg6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgZW5kUG9zaXRpb24gPSBAbGVuZ3RoICovKXtcclxuICAgICAgYXNzZXJ0Tm90UmVnRXhwKHNlYXJjaFN0cmluZyk7XHJcbiAgICAgIHZhciB0aGF0ID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICwgbGVuID0gdG9MZW5ndGgodGhhdC5sZW5ndGgpXHJcbiAgICAgICAgLCBlbmQgPSBlbmRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gbGVuIDogbWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcclxuICAgICAgc2VhcmNoU3RyaW5nICs9ICcnO1xyXG4gICAgICByZXR1cm4gdGhhdC5zbGljZShlbmQgLSBzZWFyY2hTdHJpbmcubGVuZ3RoLCBlbmQpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4zLjcgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyhzZWFyY2hTdHJpbmcsIHBvc2l0aW9uID0gMClcclxuICAgIGluY2x1ZGVzOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICByZXR1cm4gISF+U3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy4xMyBTdHJpbmcucHJvdG90eXBlLnJlcGVhdChjb3VudClcclxuICAgIHJlcGVhdDogZnVuY3Rpb24oY291bnQpe1xyXG4gICAgICB2YXIgc3RyID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCByZXMgPSAnJ1xyXG4gICAgICAgICwgbiAgID0gdG9JbnRlZ2VyKGNvdW50KTtcclxuICAgICAgaWYoMCA+IG4gfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XHJcbiAgICAgIGZvcig7biA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKWlmKG4gJiAxKXJlcyArPSBzdHI7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcclxuICAgIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcclxuICAgICAgYXNzZXJ0Tm90UmVnRXhwKHNlYXJjaFN0cmluZyk7XHJcbiAgICAgIHZhciB0aGF0ICA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgaW5kZXggPSB0b0xlbmd0aChtaW4oYXJndW1lbnRzWzFdLCB0aGF0Lmxlbmd0aCkpO1xyXG4gICAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XHJcbiAgICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oU3RyaW5nLmZyb21DaGFyQ29kZSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5hcnJheS5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogY2hlY2tEYW5nZXJJdGVyQ2xvc2luZyhBcnJheS5mcm9tKSwgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZyb206IGZ1bmN0aW9uKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcclxuICAgICAgdmFyIE8gICAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZChhcnJheUxpa2UpKVxyXG4gICAgICAgICwgbWFwZm4gICA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcclxuICAgICAgICAsIGYgICAgICAgPSBtYXBwaW5nID8gY3R4KG1hcGZuLCBhcmd1bWVudHNbMl0sIDIpIDogdW5kZWZpbmVkXHJcbiAgICAgICAgLCBpbmRleCAgID0gMFxyXG4gICAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXA7XHJcbiAgICAgIGlmKGlzSXRlcmFibGUoTykpe1xyXG4gICAgICAgIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpO1xyXG4gICAgICAgIHNhZmVJdGVyQ2xvc2UoZnVuY3Rpb24oaXRlcmF0b3Ipe1xyXG4gICAgICAgICAgZm9yKDsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcclxuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKHN0ZXAudmFsdWUsIGluZGV4KSA6IHN0ZXAudmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZ2V0SXRlcmF0b3IoTykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpKGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKSk7XHJcbiAgICAgICAgZm9yKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xyXG4gICAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBBUlJBWSwge1xyXG4gICAgLy8gMjIuMS4yLjMgQXJyYXkub2YoIC4uLml0ZW1zKVxyXG4gICAgb2Y6IGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICB2YXIgaW5kZXggID0gMFxyXG4gICAgICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzdWx0ID0gbmV3IChnZW5lcmljKHRoaXMsIEFycmF5KSkobGVuZ3RoKTtcclxuICAgICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcclxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICBzZXRTcGVjaWVzKEFycmF5KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuYXJyYXkucHJvdG90eXBlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFBST1RPLCBBUlJBWSwge1xyXG4gICAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgICBjb3B5V2l0aGluOiBmdW5jdGlvbih0YXJnZXQgLyogPSAwICovLCBzdGFydCAvKiA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xyXG4gICAgICB2YXIgTyAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGxlbiAgID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXHJcbiAgICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcclxuICAgICAgICAsIGVuZCAgID0gYXJndW1lbnRzWzJdXHJcbiAgICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcclxuICAgICAgICAsIGNvdW50ID0gbWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxyXG4gICAgICAgICwgaW5jICAgPSAxO1xyXG4gICAgICBpZihmcm9tIDwgdG8gJiYgdG8gPCBmcm9tICsgY291bnQpe1xyXG4gICAgICAgIGluYyAgPSAtMTtcclxuICAgICAgICBmcm9tID0gZnJvbSArIGNvdW50IC0gMTtcclxuICAgICAgICB0byAgID0gdG8gKyBjb3VudCAtIDE7XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUoY291bnQtLSA+IDApe1xyXG4gICAgICAgIGlmKGZyb20gaW4gTylPW3RvXSA9IE9bZnJvbV07XHJcbiAgICAgICAgZWxzZSBkZWxldGUgT1t0b107XHJcbiAgICAgICAgdG8gKz0gaW5jO1xyXG4gICAgICAgIGZyb20gKz0gaW5jO1xyXG4gICAgICB9IHJldHVybiBPO1xyXG4gICAgfSxcclxuICAgIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gICAgZmlsbDogZnVuY3Rpb24odmFsdWUgLyosIHN0YXJ0ID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICAgIHZhciBPICAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcclxuICAgICAgICAsIGVuZCAgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAgICwgZW5kUG9zID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0luZGV4KGVuZCwgbGVuZ3RoKTtcclxuICAgICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xyXG4gICAgICByZXR1cm4gTztcclxuICAgIH0sXHJcbiAgICAvLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmaW5kOiBjcmVhdGVBcnJheU1ldGhvZCg1KSxcclxuICAgIC8vIDIyLjEuMy45IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZmluZEluZGV4OiBjcmVhdGVBcnJheU1ldGhvZCg2KVxyXG4gIH0pO1xyXG4gIFxyXG4gIGlmKGZyYW1ld29yayl7XHJcbiAgICAvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2ZpbmQsZmluZEluZGV4LGZpbGwsY29weVdpdGhpbixlbnRyaWVzLGtleXMsdmFsdWVzJyksIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgQXJyYXlVbnNjb3BhYmxlc1tpdF0gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBTWU1CT0xfVU5TQ09QQUJMRVMgaW4gQXJyYXlQcm90byB8fCBoaWRkZW4oQXJyYXlQcm90bywgU1lNQk9MX1VOU0NPUEFCTEVTLCBBcnJheVVuc2NvcGFibGVzKTtcclxuICB9XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lml0ZXJhdG9ycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGF0KXtcclxuICAvLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXHJcbiAgLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcclxuICAvLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXHJcbiAgLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbiAgZGVmaW5lU3RkSXRlcmF0b3JzKEFycmF5LCBBUlJBWSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtvOiB0b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcclxuICAvLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxuICB9LCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAgICwga2luZCAgPSBpdGVyLmtcclxuICAgICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xyXG4gICAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xyXG4gICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgIHJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgfVxyXG4gICAgaWYoa2luZCA9PSBLRVkpICByZXR1cm4gaXRlclJlc3VsdCgwLCBpbmRleCk7XHJcbiAgICBpZihraW5kID09IFZBTFVFKXJldHVybiBpdGVyUmVzdWx0KDAsIE9baW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xyXG4gIH0sIFZBTFVFKTtcclxuICBcclxuICAvLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXHJcbiAgSXRlcmF0b3JzW0FSR1VNRU5UU10gPSBJdGVyYXRvcnNbQVJSQVldO1xyXG4gIFxyXG4gIC8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxuICBkZWZpbmVTdGRJdGVyYXRvcnMoU3RyaW5nLCBTVFJJTkcsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogU3RyaW5nKGl0ZXJhdGVkKSwgaTogMH0pO1xyXG4gIC8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxuICB9LCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAgICwgaW5kZXggPSBpdGVyLmlcclxuICAgICAgLCBwb2ludDtcclxuICAgIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgcG9pbnQgPSBhdC5jYWxsKE8sIGluZGV4KTtcclxuICAgIGl0ZXIuaSArPSBwb2ludC5sZW5ndGg7XHJcbiAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBwb2ludCk7XHJcbiAgfSk7XHJcbn0oY3JlYXRlUG9pbnRBdCh0cnVlKSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5yZWdleHAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbkRFU0MgJiYgIWZ1bmN0aW9uKFJlZ0V4cFByb3RvLCBfUmVnRXhwKXsgIFxyXG4gIC8vIFJlZ0V4cCBhbGxvd3MgYSByZWdleCB3aXRoIGZsYWdzIGFzIHRoZSBwYXR0ZXJuXHJcbiAgaWYoIWZ1bmN0aW9uKCl7dHJ5e3JldHVybiBSZWdFeHAoL2EvZywgJ2knKSA9PSAnL2EvaSd9Y2F0Y2goZSl7fX0oKSl7XHJcbiAgICBSZWdFeHAgPSBmdW5jdGlvbiBSZWdFeHAocGF0dGVybiwgZmxhZ3Mpe1xyXG4gICAgICByZXR1cm4gbmV3IF9SZWdFeHAoY29mKHBhdHRlcm4pID09IFJFR0VYUCAmJiBmbGFncyAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm4sIGZsYWdzKTtcclxuICAgIH1cclxuICAgIGZvckVhY2guY2FsbChnZXROYW1lcyhfUmVnRXhwKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAga2V5IGluIFJlZ0V4cCB8fCBkZWZpbmVQcm9wZXJ0eShSZWdFeHAsIGtleSwge1xyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiBfUmVnRXhwW2tleV0gfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgX1JlZ0V4cFtrZXldID0gaXQgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgUmVnRXhwUHJvdG9bQ09OU1RSVUNUT1JdID0gUmVnRXhwO1xyXG4gICAgUmVnRXhwW1BST1RPVFlQRV0gPSBSZWdFeHBQcm90bztcclxuICAgIGhpZGRlbihnbG9iYWwsIFJFR0VYUCwgUmVnRXhwKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gMjEuMi41LjMgZ2V0IFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3MoKVxyXG4gIGlmKC8uL2cuZmxhZ3MgIT0gJ2cnKWRlZmluZVByb3BlcnR5KFJlZ0V4cFByb3RvLCAnZmxhZ3MnLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IGNyZWF0ZVJlcGxhY2VyKC9eLipcXC8oXFx3KikkLywgJyQxJylcclxuICB9KTtcclxuICBcclxuICBzZXRTcGVjaWVzKFJlZ0V4cCk7XHJcbn0oUmVnRXhwW1BST1RPVFlQRV0sIFJlZ0V4cCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IHdlYi5pbW1lZGlhdGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIHNldEltbWVkaWF0ZSBzaGltXHJcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIGVsc2U6XHJcbmlzRnVuY3Rpb24oc2V0SW1tZWRpYXRlKSAmJiBpc0Z1bmN0aW9uKGNsZWFySW1tZWRpYXRlKSB8fCBmdW5jdGlvbihPTlJFQURZU1RBVEVDSEFOR0Upe1xyXG4gIHZhciBwb3N0TWVzc2FnZSAgICAgID0gZ2xvYmFsLnBvc3RNZXNzYWdlXHJcbiAgICAsIGFkZEV2ZW50TGlzdGVuZXIgPSBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lclxyXG4gICAgLCBNZXNzYWdlQ2hhbm5lbCAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXHJcbiAgICAsIGNvdW50ZXIgICAgICAgICAgPSAwXHJcbiAgICAsIHF1ZXVlICAgICAgICAgICAgPSB7fVxyXG4gICAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcclxuICBzZXRJbW1lZGlhdGUgPSBmdW5jdGlvbihmbil7XHJcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcclxuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XHJcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcclxuICAgICAgaW52b2tlKGlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgZGVmZXIoY291bnRlcik7XHJcbiAgICByZXR1cm4gY291bnRlcjtcclxuICB9XHJcbiAgY2xlYXJJbW1lZGlhdGUgPSBmdW5jdGlvbihpZCl7XHJcbiAgICBkZWxldGUgcXVldWVbaWRdO1xyXG4gIH1cclxuICBmdW5jdGlvbiBydW4oaWQpe1xyXG4gICAgaWYoaGFzKHF1ZXVlLCBpZCkpe1xyXG4gICAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XHJcbiAgICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgICAgIGZuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xyXG4gICAgcnVuKGV2ZW50LmRhdGEpO1xyXG4gIH1cclxuICAvLyBOb2RlLmpzIDAuOC1cclxuICBpZihOT0RFKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBuZXh0VGljayhwYXJ0LmNhbGwocnVuLCBpZCkpO1xyXG4gICAgfVxyXG4gIC8vIE1vZGVybiBicm93c2Vycywgc2tpcCBpbXBsZW1lbnRhdGlvbiBmb3IgV2ViV29ya2Vyc1xyXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxyXG4gIH0gZWxzZSBpZihhZGRFdmVudExpc3RlbmVyICYmIGlzRnVuY3Rpb24ocG9zdE1lc3NhZ2UpICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XHJcbiAgICB9XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xyXG4gIC8vIFdlYldvcmtlcnNcclxuICB9IGVsc2UgaWYoaXNGdW5jdGlvbihNZXNzYWdlQ2hhbm5lbCkpe1xyXG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcclxuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xyXG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xyXG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XHJcbiAgLy8gSUU4LVxyXG4gIH0gZWxzZSBpZihkb2N1bWVudCAmJiBPTlJFQURZU1RBVEVDSEFOR0UgaW4gZG9jdW1lbnRbQ1JFQVRFX0VMRU1FTlRdKCdzY3JpcHQnKSl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgaHRtbC5hcHBlbmRDaGlsZChkb2N1bWVudFtDUkVBVEVfRUxFTUVOVF0oJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xyXG4gICAgICAgIHJ1bihpZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgc2V0VGltZW91dChydW4sIDAsIGlkKTtcclxuICAgIH1cclxuICB9XHJcbn0oJ29ucmVhZHlzdGF0ZWNoYW5nZScpO1xyXG4kZGVmaW5lKEdMT0JBTCArIEJJTkQsIHtcclxuICBzZXRJbW1lZGlhdGU6ICAgc2V0SW1tZWRpYXRlLFxyXG4gIGNsZWFySW1tZWRpYXRlOiBjbGVhckltbWVkaWF0ZVxyXG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnByb21pc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRVM2IHByb21pc2VzIHNoaW1cclxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2dldGlmeS9uYXRpdmUtcHJvbWlzZS1vbmx5L1xyXG4hZnVuY3Rpb24oUHJvbWlzZSwgdGVzdCl7XHJcbiAgaXNGdW5jdGlvbihQcm9taXNlKSAmJiBpc0Z1bmN0aW9uKFByb21pc2UucmVzb2x2ZSlcclxuICAmJiBQcm9taXNlLnJlc29sdmUodGVzdCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKCl7fSkpID09IHRlc3RcclxuICB8fCBmdW5jdGlvbihhc2FwLCBSRUNPUkQpe1xyXG4gICAgZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XHJcbiAgICAgIHZhciB0aGVuO1xyXG4gICAgICBpZihpc09iamVjdChpdCkpdGhlbiA9IGl0LnRoZW47XHJcbiAgICAgIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxyXG4gICAgICAgICwgY2hhaW4gID0gcmVjb3JkLmNcclxuICAgICAgICAsIGkgICAgICA9IDBcclxuICAgICAgICAsIHJlYWN0O1xyXG4gICAgICBpZihyZWNvcmQuaClyZXR1cm4gdHJ1ZTtcclxuICAgICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XHJcbiAgICAgICAgcmVhY3QgPSBjaGFpbltpKytdO1xyXG4gICAgICAgIGlmKHJlYWN0LmZhaWwgfHwgaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChyZWFjdC5QKSlyZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbm90aWZ5KHJlY29yZCwgcmVqZWN0KXtcclxuICAgICAgdmFyIGNoYWluID0gcmVjb3JkLmM7XHJcbiAgICAgIGlmKHJlamVjdCB8fCBjaGFpbi5sZW5ndGgpYXNhcChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBwcm9taXNlID0gcmVjb3JkLnBcclxuICAgICAgICAgICwgdmFsdWUgICA9IHJlY29yZC52XHJcbiAgICAgICAgICAsIG9rICAgICAgPSByZWNvcmQucyA9PSAxXHJcbiAgICAgICAgICAsIGkgICAgICAgPSAwO1xyXG4gICAgICAgIGlmKHJlamVjdCAmJiAhaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKSl7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKCFoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2UpKXtcclxuICAgICAgICAgICAgICBpZihOT0RFKXtcclxuICAgICAgICAgICAgICAgIGlmKCFwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKSl7XHJcbiAgICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgbm9kZS5qcyBiZWhhdmlvclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZihpc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIDFlMyk7XHJcbiAgICAgICAgfSBlbHNlIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpIWZ1bmN0aW9uKHJlYWN0KXtcclxuICAgICAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXHJcbiAgICAgICAgICAgICwgcmV0LCB0aGVuO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoY2Ipe1xyXG4gICAgICAgICAgICAgIGlmKCFvaylyZWNvcmQuaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcclxuICAgICAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xyXG4gICAgICAgICAgICAgICAgcmVhY3QucmVqKFR5cGVFcnJvcihQUk9NSVNFICsgJy1jaGFpbiBjeWNsZScpKTtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XHJcbiAgICAgICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHJlYWN0LnJlcyhyZXQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcclxuICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgcmVhY3QucmVqKGVycik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfShjaGFpbltpKytdKTtcclxuICAgICAgICBjaGFpbi5sZW5ndGggPSAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlc29sdmUodmFsdWUpe1xyXG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgICAgICwgdGhlbiwgd3JhcHBlcjtcclxuICAgICAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gICAgICByZWNvcmQuZCA9IHRydWU7XHJcbiAgICAgIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcclxuICAgICAgICAgIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcclxuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgocmVqZWN0LCB3cmFwcGVyLCAxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgICAgICAgICByZWNvcmQucyA9IDE7XHJcbiAgICAgICAgICBub3RpZnkocmVjb3JkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWplY3QuY2FsbCh3cmFwcGVyIHx8IHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZXJyKTsgLy8gd3JhcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpe1xyXG4gICAgICB2YXIgcmVjb3JkID0gdGhpcztcclxuICAgICAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gICAgICByZWNvcmQuZCA9IHRydWU7XHJcbiAgICAgIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgICAgIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgICAgIHJlY29yZC5zID0gMjtcclxuICAgICAgbm90aWZ5KHJlY29yZCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRDb25zdHJ1Y3RvcihDKXtcclxuICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1lNQk9MX1NQRUNJRVNdO1xyXG4gICAgICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcclxuICAgIH1cclxuICAgIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXHJcbiAgICBQcm9taXNlID0gZnVuY3Rpb24oZXhlY3V0b3Ipe1xyXG4gICAgICBhc3NlcnRGdW5jdGlvbihleGVjdXRvcik7XHJcbiAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIFByb21pc2UsIFBST01JU0UpO1xyXG4gICAgICB2YXIgcmVjb3JkID0ge1xyXG4gICAgICAgIHA6IHRoaXMsICAgICAgLy8gcHJvbWlzZVxyXG4gICAgICAgIGM6IFtdLCAgICAgICAgLy8gY2hhaW5cclxuICAgICAgICBzOiAwLCAgICAgICAgIC8vIHN0YXRlXHJcbiAgICAgICAgZDogZmFsc2UsICAgICAvLyBkb25lXHJcbiAgICAgICAgdjogdW5kZWZpbmVkLCAvLyB2YWx1ZVxyXG4gICAgICAgIGg6IGZhbHNlICAgICAgLy8gaGFuZGxlZCByZWplY3Rpb25cclxuICAgICAgfTtcclxuICAgICAgaGlkZGVuKHRoaXMsIFJFQ09SRCwgcmVjb3JkKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBleGVjdXRvcihjdHgocmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KHJlamVjdCwgcmVjb3JkLCAxKSk7XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWplY3QuY2FsbChyZWNvcmQsIGVycik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2lnbkhpZGRlbihQcm9taXNlW1BST1RPVFlQRV0sIHtcclxuICAgICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcclxuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xyXG4gICAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KGFzc2VydE9iamVjdCh0aGlzKVtDT05TVFJVQ1RPUl0pW1NZTUJPTF9TUEVDSUVTXTtcclxuICAgICAgICB2YXIgcmVhY3QgPSB7XHJcbiAgICAgICAgICBvazogICBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdHJ1ZSxcclxuICAgICAgICAgIGZhaWw6IGlzRnVuY3Rpb24ob25SZWplY3RlZCkgID8gb25SZWplY3RlZCAgOiBmYWxzZVxyXG4gICAgICAgIH0gLCBQID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUHJvbWlzZSkoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlc29sdmUpO1xyXG4gICAgICAgICAgcmVhY3QucmVqID0gYXNzZXJ0RnVuY3Rpb24ocmVqZWN0KTtcclxuICAgICAgICB9KSwgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xyXG4gICAgICAgIHJlY29yZC5jLnB1c2gocmVhY3QpO1xyXG4gICAgICAgIHJlY29yZC5zICYmIG5vdGlmeShyZWNvcmQpO1xyXG4gICAgICAgIHJldHVybiBQO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjUuMSBQcm9taXNlLnByb3RvdHlwZS5jYXRjaChvblJlamVjdGVkKVxyXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcclxuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgYXNzaWduSGlkZGVuKFByb21pc2UsIHtcclxuICAgICAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXHJcbiAgICAgIGFsbDogZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgIHZhciBQcm9taXNlID0gZ2V0Q29uc3RydWN0b3IodGhpcylcclxuICAgICAgICAgICwgdmFsdWVzICA9IFtdO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBwdXNoLCB2YWx1ZXMpO1xyXG4gICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHZhbHVlcy5sZW5ndGhcclxuICAgICAgICAgICAgLCByZXN1bHRzICAgPSBBcnJheShyZW1haW5pbmcpO1xyXG4gICAgICAgICAgaWYocmVtYWluaW5nKWZvckVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgfSwgcmVqZWN0KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgZWxzZSByZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXHJcbiAgICAgIHJhY2U6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICB2YXIgUHJvbWlzZSA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHByb21pc2UpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxyXG4gICAgICByZWplY3Q6IGZ1bmN0aW9uKHIpe1xyXG4gICAgICAgIHJldHVybiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgcmVqZWN0KHIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcclxuICAgICAgcmVzb2x2ZTogZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHgpICYmIFJFQ09SRCBpbiB4ICYmIGdldFByb3RvdHlwZU9mKHgpID09PSB0aGlzW1BST1RPVFlQRV1cclxuICAgICAgICAgID8geCA6IG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICAgIHJlc29sdmUoeCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfShuZXh0VGljayB8fCBzZXRJbW1lZGlhdGUsIHNhZmVTeW1ib2woJ3JlY29yZCcpKTtcclxuICBzZXRUb1N0cmluZ1RhZyhQcm9taXNlLCBQUk9NSVNFKTtcclxuICBzZXRTcGVjaWVzKFByb21pc2UpO1xyXG4gICRkZWZpbmUoR0xPQkFMICsgRk9SQ0VEICogIWlzTmF0aXZlKFByb21pc2UpLCB7UHJvbWlzZTogUHJvbWlzZX0pO1xyXG59KGdsb2JhbFtQUk9NSVNFXSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5jb2xsZWN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVDTUFTY3JpcHQgNiBjb2xsZWN0aW9ucyBzaGltXHJcbiFmdW5jdGlvbigpe1xyXG4gIHZhciBVSUQgICA9IHNhZmVTeW1ib2woJ3VpZCcpXHJcbiAgICAsIE8xICAgID0gc2FmZVN5bWJvbCgnTzEnKVxyXG4gICAgLCBXRUFLICA9IHNhZmVTeW1ib2woJ3dlYWsnKVxyXG4gICAgLCBMRUFLICA9IHNhZmVTeW1ib2woJ2xlYWsnKVxyXG4gICAgLCBMQVNUICA9IHNhZmVTeW1ib2woJ2xhc3QnKVxyXG4gICAgLCBGSVJTVCA9IHNhZmVTeW1ib2woJ2ZpcnN0JylcclxuICAgICwgU0laRSAgPSBERVNDID8gc2FmZVN5bWJvbCgnc2l6ZScpIDogJ3NpemUnXHJcbiAgICAsIHVpZCAgID0gMFxyXG4gICAgLCB0bXAgICA9IHt9O1xyXG4gIFxyXG4gIGZ1bmN0aW9uIGdldENvbGxlY3Rpb24oQywgTkFNRSwgbWV0aG9kcywgY29tbW9uTWV0aG9kcywgaXNNYXAsIGlzV2Vhayl7XHJcbiAgICB2YXIgQURERVIgPSBpc01hcCA/ICdzZXQnIDogJ2FkZCdcclxuICAgICAgLCBwcm90byA9IEMgJiYgQ1tQUk9UT1RZUEVdXHJcbiAgICAgICwgTyAgICAgPSB7fTtcclxuICAgIGZ1bmN0aW9uIGluaXRGcm9tSXRlcmFibGUodGhhdCwgaXRlcmFibGUpe1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIGlzTWFwLCB0aGF0W0FEREVSXSwgdGhhdCk7XHJcbiAgICAgIHJldHVybiB0aGF0O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZml4U1ZaKGtleSwgY2hhaW4pe1xyXG4gICAgICB2YXIgbWV0aG9kID0gcHJvdG9ba2V5XTtcclxuICAgICAgaWYoZnJhbWV3b3JrKXByb3RvW2tleV0gPSBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhLCBiKTtcclxuICAgICAgICByZXR1cm4gY2hhaW4gPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYoIWlzTmF0aXZlKEMpIHx8ICEoaXNXZWFrIHx8ICghQlVHR1lfSVRFUkFUT1JTICYmIGhhcyhwcm90bywgRk9SX0VBQ0gpICYmIGhhcyhwcm90bywgJ2VudHJpZXMnKSkpKXtcclxuICAgICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcclxuICAgICAgQyA9IGlzV2Vha1xyXG4gICAgICAgID8gZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgICAgICAgc2V0KHRoaXMsIFVJRCwgdWlkKyspO1xyXG4gICAgICAgICAgICBpbml0RnJvbUl0ZXJhYmxlKHRoaXMsIGl0ZXJhYmxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICA6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGF0LCBDLCBOQU1FKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIE8xLCBjcmVhdGUobnVsbCkpO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgU0laRSwgMCk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBMQVNULCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgRklSU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGluaXRGcm9tSXRlcmFibGUodGhhdCwgaXRlcmFibGUpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgYXNzaWduSGlkZGVuKGFzc2lnbkhpZGRlbihDW1BST1RPVFlQRV0sIG1ldGhvZHMpLCBjb21tb25NZXRob2RzKTtcclxuICAgICAgaXNXZWFrIHx8ICFERVNDIHx8IGRlZmluZVByb3BlcnR5KENbUFJPVE9UWVBFXSwgJ3NpemUnLCB7Z2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBhc3NlcnREZWZpbmVkKHRoaXNbU0laRV0pO1xyXG4gICAgICB9fSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgTmF0aXZlID0gQ1xyXG4gICAgICAgICwgaW5zdCAgID0gbmV3IENcclxuICAgICAgICAsIGNoYWluICA9IGluc3RbQURERVJdKGlzV2VhayA/IHt9IDogLTAsIDEpXHJcbiAgICAgICAgLCBidWdneVplcm87XHJcbiAgICAgIC8vIHdyYXAgdG8gaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXHJcbiAgICAgIGlmKGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoZnVuY3Rpb24oTyl7IG5ldyBDKE8pIH0pKXtcclxuICAgICAgICBDID0gZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgICByZXR1cm4gaW5pdEZyb21JdGVyYWJsZShuZXcgTmF0aXZlLCBpdGVyYWJsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIENbUFJPVE9UWVBFXSA9IHByb3RvO1xyXG4gICAgICAgIGlmKGZyYW1ld29yaylwcm90b1tDT05TVFJVQ1RPUl0gPSBDO1xyXG4gICAgICB9XHJcbiAgICAgIGlzV2VhayB8fCBpbnN0W0ZPUl9FQUNIXShmdW5jdGlvbih2YWwsIGtleSl7XHJcbiAgICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xyXG4gICAgICB9KTtcclxuICAgICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXHJcbiAgICAgIGlmKGJ1Z2d5WmVybyl7XHJcbiAgICAgICAgZml4U1ZaKCdkZWxldGUnKTtcclxuICAgICAgICBmaXhTVlooJ2hhcycpO1xyXG4gICAgICAgIGlzTWFwICYmIGZpeFNWWignZ2V0Jyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gKyBmaXggLmFkZCAmIC5zZXQgZm9yIGNoYWluaW5nXHJcbiAgICAgIGlmKGJ1Z2d5WmVybyB8fCBjaGFpbiAhPT0gaW5zdClmaXhTVlooQURERVIsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XHJcbiAgICBzZXRTcGVjaWVzKEMpO1xyXG4gICAgXHJcbiAgICBPW05BTUVdID0gQztcclxuICAgICRkZWZpbmUoR0xPQkFMICsgV1JBUCArIEZPUkNFRCAqICFpc05hdGl2ZShDKSwgTyk7XHJcbiAgICBcclxuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxyXG4gICAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxyXG4gICAgaXNXZWFrIHx8IGRlZmluZVN0ZEl0ZXJhdG9ycyhDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XHJcbiAgICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IGtpbmR9KTtcclxuICAgIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcclxuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxyXG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XHJcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cclxuICAgICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxyXG4gICAgICBpZihraW5kID09IEtFWSkgIHJldHVybiBpdGVyUmVzdWx0KDAsIGVudHJ5LmspO1xyXG4gICAgICBpZihraW5kID09IFZBTFVFKXJldHVybiBpdGVyUmVzdWx0KDAsIGVudHJ5LnYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7ICAgXHJcbiAgICB9LCBpc01hcCA/IEtFWStWQUxVRSA6IFZBTFVFLCAhaXNNYXApO1xyXG4gICAgXHJcbiAgICByZXR1cm4gQztcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZmFzdEtleShpdCwgY3JlYXRlKXtcclxuICAgIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcclxuICAgIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XHJcbiAgICAvLyBjYW4ndCBzZXQgaWQgdG8gZnJvemVuIG9iamVjdFxyXG4gICAgaWYoaXNGcm96ZW4oaXQpKXJldHVybiAnRic7XHJcbiAgICBpZighaGFzKGl0LCBVSUQpKXtcclxuICAgICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcclxuICAgICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xyXG4gICAgICAvLyBhZGQgbWlzc2luZyBvYmplY3QgaWRcclxuICAgICAgaGlkZGVuKGl0LCBVSUQsICsrdWlkKTtcclxuICAgIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcclxuICAgIH0gcmV0dXJuICdPJyArIGl0W1VJRF07XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XHJcbiAgICAvLyBmYXN0IGNhc2VcclxuICAgIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XHJcbiAgICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcclxuICAgIC8vIGZyb3plbiBvYmplY3QgY2FzZVxyXG4gICAgZm9yKGVudHJ5ID0gdGhhdFtGSVJTVF07IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xyXG4gICAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRlZih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcclxuICAgICAgLCBwcmV2LCBpbmRleDtcclxuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxyXG4gICAgaWYoZW50cnkpZW50cnkudiA9IHZhbHVlO1xyXG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoYXRbTEFTVF0gPSBlbnRyeSA9IHtcclxuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcclxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XHJcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXHJcbiAgICAgICAgcDogcHJldiA9IHRoYXRbTEFTVF0sICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XHJcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcclxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxyXG4gICAgICB9O1xyXG4gICAgICBpZighdGhhdFtGSVJTVF0pdGhhdFtGSVJTVF0gPSBlbnRyeTtcclxuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcclxuICAgICAgdGhhdFtTSVpFXSsrO1xyXG4gICAgICAvLyBhZGQgdG8gaW5kZXhcclxuICAgICAgaWYoaW5kZXggIT0gJ0YnKXRoYXRbTzFdW2luZGV4XSA9IGVudHJ5O1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9XHJcblxyXG4gIHZhciBjb2xsZWN0aW9uTWV0aG9kcyA9IHtcclxuICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXHJcbiAgICBjbGVhcjogZnVuY3Rpb24oKXtcclxuICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XHJcbiAgICAgIH1cclxuICAgICAgdGhhdFtGSVJTVF0gPSB0aGF0W0xBU1RdID0gdW5kZWZpbmVkO1xyXG4gICAgICB0aGF0W1NJWkVdID0gMDtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXHJcbiAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXHJcbiAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KXtcclxuICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cclxuICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XHJcbiAgICAgICAgZGVsZXRlIHRoYXRbTzFdW2VudHJ5LmldO1xyXG4gICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcclxuICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XHJcbiAgICAgICAgaWYodGhhdFtGSVJTVF0gPT0gZW50cnkpdGhhdFtGSVJTVF0gPSBuZXh0O1xyXG4gICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XHJcbiAgICAgICAgdGhhdFtTSVpFXS0tO1xyXG4gICAgICB9IHJldHVybiAhIWVudHJ5O1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdLCAzKVxyXG4gICAgICAgICwgZW50cnk7XHJcbiAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpc1tGSVJTVF0pe1xyXG4gICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XHJcbiAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXHJcbiAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8gMjMuMSBNYXAgT2JqZWN0c1xyXG4gIE1hcCA9IGdldENvbGxlY3Rpb24oTWFwLCBNQVAsIHtcclxuICAgIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5LnY7XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIGNvbGxlY3Rpb25NZXRob2RzLCB0cnVlKTtcclxuICBcclxuICAvLyAyMy4yIFNldCBPYmplY3RzXHJcbiAgU2V0ID0gZ2V0Q29sbGVjdGlvbihTZXQsIFNFVCwge1xyXG4gICAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXHJcbiAgICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfSwgY29sbGVjdGlvbk1ldGhvZHMpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIGRlZldlYWsodGhhdCwga2V5LCB2YWx1ZSl7XHJcbiAgICBpZihpc0Zyb3plbihhc3NlcnRPYmplY3Qoa2V5KSkpbGVha1N0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcclxuICAgIGVsc2Uge1xyXG4gICAgICBoYXMoa2V5LCBXRUFLKSB8fCBoaWRkZW4oa2V5LCBXRUFLLCB7fSk7XHJcbiAgICAgIGtleVtXRUFLXVt0aGF0W1VJRF1dID0gdmFsdWU7XHJcbiAgICB9IHJldHVybiB0aGF0O1xyXG4gIH1cclxuICBmdW5jdGlvbiBsZWFrU3RvcmUodGhhdCl7XHJcbiAgICByZXR1cm4gdGhhdFtMRUFLXSB8fCBoaWRkZW4odGhhdCwgTEVBSywgbmV3IE1hcClbTEVBS107XHJcbiAgfVxyXG4gIFxyXG4gIHZhciB3ZWFrTWV0aG9kcyA9IHtcclxuICAgIC8vIDIzLjMuMy4yIFdlYWtNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXHJcbiAgICAvLyAyMy40LjMuMyBXZWFrU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXHJcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XHJcbiAgICAgIHJldHVybiBoYXMoa2V5LCBXRUFLKSAmJiBoYXMoa2V5W1dFQUtdLCB0aGlzW1VJRF0pICYmIGRlbGV0ZSBrZXlbV0VBS11bdGhpc1tVSURdXTtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5oYXMoa2V5KTtcclxuICAgICAgcmV0dXJuIGhhcyhrZXksIFdFQUspICYmIGhhcyhrZXlbV0VBS10sIHRoaXNbVUlEXSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBcclxuICAvLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xyXG4gIFdlYWtNYXAgPSBnZXRDb2xsZWN0aW9uKFdlYWtNYXAsIFdFQUtNQVAsIHtcclxuICAgIC8vIDIzLjMuMy4zIFdlYWtNYXAucHJvdG90eXBlLmdldChrZXkpXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKGlzT2JqZWN0KGtleSkpe1xyXG4gICAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5nZXQoa2V5KTtcclxuICAgICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbVUlEXV07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyAyMy4zLjMuNSBXZWFrTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWZXZWFrKHRoaXMsIGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIHdlYWtNZXRob2RzLCB0cnVlLCB0cnVlKTtcclxuICBcclxuICAvLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XHJcbiAgaWYoZnJhbWV3b3JrICYmIG5ldyBXZWFrTWFwKCkuc2V0KE9iamVjdC5mcmVlemUodG1wKSwgNykuZ2V0KHRtcCkgIT0gNyl7XHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2RlbGV0ZSxoYXMsZ2V0LHNldCcpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgbWV0aG9kID0gV2Vha01hcFtQUk9UT1RZUEVdW2tleV07XHJcbiAgICAgIFdlYWtNYXBbUFJPVE9UWVBFXVtrZXldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgICAgLy8gc3RvcmUgZnJvemVuIG9iamVjdHMgb24gbGVha3kgbWFwXHJcbiAgICAgICAgaWYoaXNPYmplY3QoYSkgJiYgaXNGcm96ZW4oYSkpe1xyXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGxlYWtTdG9yZSh0aGlzKVtrZXldKGEsIGIpO1xyXG4gICAgICAgICAgcmV0dXJuIGtleSA9PSAnc2V0JyA/IHRoaXMgOiByZXN1bHQ7XHJcbiAgICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXHJcbiAgICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8gMjMuNCBXZWFrU2V0IE9iamVjdHNcclxuICBXZWFrU2V0ID0gZ2V0Q29sbGVjdGlvbihXZWFrU2V0LCBXRUFLU0VULCB7XHJcbiAgICAvLyAyMy40LjMuMSBXZWFrU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXHJcbiAgICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZldlYWsodGhpcywgdmFsdWUsIHRydWUpO1xyXG4gICAgfVxyXG4gIH0sIHdlYWtNZXRob2RzLCBmYWxzZSwgdHJ1ZSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnJlZmxlY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gRW51bWVyYXRlKGl0ZXJhdGVkKXtcclxuICAgIHZhciBrZXlzID0gW10sIGtleTtcclxuICAgIGZvcihrZXkgaW4gaXRlcmF0ZWQpa2V5cy5wdXNoKGtleSk7XHJcbiAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBhOiBrZXlzLCBpOiAwfSk7XHJcbiAgfVxyXG4gIGNyZWF0ZUl0ZXJhdG9yKEVudW1lcmF0ZSwgT0JKRUNULCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXHJcbiAgICAgICwga2V5cyA9IGl0ZXIuYVxyXG4gICAgICAsIGtleTtcclxuICAgIGRvIHtcclxuICAgICAgaWYoaXRlci5pID49IGtleXMubGVuZ3RoKXJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XHJcbiAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBrZXkpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHdyYXAoZm4pe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZm4uYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpLCB0cnVlO1xyXG4gICAgICB9IGNhdGNoKGUpe1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiByZWZsZWN0R2V0KHRhcmdldCwgcHJvcGVydHlLZXkvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXVxyXG4gICAgICAsIGRlc2MgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSksIHByb3RvO1xyXG4gICAgaWYoZGVzYylyZXR1cm4gaGFzKGRlc2MsICd2YWx1ZScpXHJcbiAgICAgID8gZGVzYy52YWx1ZVxyXG4gICAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgICA/IHVuZGVmaW5lZFxyXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XHJcbiAgICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90b3R5cGVPZih0YXJnZXQpKVxyXG4gICAgICA/IHJlZmxlY3RHZXQocHJvdG8sIHByb3BlcnR5S2V5LCByZWNlaXZlcilcclxuICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHJlZmxlY3RTZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgVi8qLCByZWNlaXZlciovKXtcclxuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCA0ID8gdGFyZ2V0IDogYXJndW1lbnRzWzNdXHJcbiAgICAgICwgb3duRGVzYyAgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcclxuICAgICAgLCBleGlzdGluZ0Rlc2NyaXB0b3IsIHByb3RvO1xyXG4gICAgaWYoIW93bkRlc2Mpe1xyXG4gICAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvdHlwZU9mKHRhcmdldCkpKXtcclxuICAgICAgICByZXR1cm4gcmVmbGVjdFNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcclxuICAgICAgfVxyXG4gICAgICBvd25EZXNjID0gZGVzY3JpcHRvcigwKTtcclxuICAgIH1cclxuICAgIGlmKGhhcyhvd25EZXNjLCAndmFsdWUnKSl7XHJcbiAgICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IgPSBnZXRPd25EZXNjcmlwdG9yKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgZGVzY3JpcHRvcigwKTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yLnZhbHVlID0gVjtcclxuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHJlY2VpdmVyLCBwcm9wZXJ0eUtleSwgZXhpc3RpbmdEZXNjcmlwdG9yKSwgdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkXHJcbiAgICAgID8gZmFsc2VcclxuICAgICAgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xyXG4gIH1cclxuICB2YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCByZXR1cm5JdDtcclxuICBcclxuICB2YXIgcmVmbGVjdCA9IHtcclxuICAgIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxyXG4gICAgYXBwbHk6IGN0eChjYWxsLCBhcHBseSwgMyksXHJcbiAgICAvLyAyNi4xLjIgUmVmbGVjdC5jb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IFssIG5ld1RhcmdldF0pXHJcbiAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uKHRhcmdldCwgYXJndW1lbnRzTGlzdCAvKiwgbmV3VGFyZ2V0Ki8pe1xyXG4gICAgICB2YXIgcHJvdG8gICAgPSBhc3NlcnRGdW5jdGlvbihhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXSlbUFJPVE9UWVBFXVxyXG4gICAgICAgICwgaW5zdGFuY2UgPSBjcmVhdGUoaXNPYmplY3QocHJvdG8pID8gcHJvdG8gOiBPYmplY3RQcm90bylcclxuICAgICAgICAsIHJlc3VsdCAgID0gYXBwbHkuY2FsbCh0YXJnZXQsIGluc3RhbmNlLCBhcmd1bWVudHNMaXN0KTtcclxuICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiBpbnN0YW5jZTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjMgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKVxyXG4gICAgZGVmaW5lUHJvcGVydHk6IHdyYXAoZGVmaW5lUHJvcGVydHkpLFxyXG4gICAgLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGRlbGV0ZVByb3BlcnR5OiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgICAgdmFyIGRlc2MgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XHJcbiAgICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS41IFJlZmxlY3QuZW51bWVyYXRlKHRhcmdldClcclxuICAgIGVudW1lcmF0ZTogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgcmV0dXJuIG5ldyBFbnVtZXJhdGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuNiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BlcnR5S2V5IFssIHJlY2VpdmVyXSlcclxuICAgIGdldDogcmVmbGVjdEdldCxcclxuICAgIC8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgICAgcmV0dXJuIGdldE93bkRlc2NyaXB0b3IoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjggUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpXHJcbiAgICBnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgcmV0dXJuIGdldFByb3RvdHlwZU9mKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjkgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGhhczogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHJldHVybiBwcm9wZXJ0eUtleSBpbiB0YXJnZXQ7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXHJcbiAgICBpc0V4dGVuc2libGU6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiAhIWlzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4xMSBSZWZsZWN0Lm93bktleXModGFyZ2V0KVxyXG4gICAgb3duS2V5czogb3duS2V5cyxcclxuICAgIC8vIDI2LjEuMTIgUmVmbGVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpXHJcbiAgICBwcmV2ZW50RXh0ZW5zaW9uczogd3JhcChPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgcmV0dXJuSXQpLFxyXG4gICAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcclxuICAgIHNldDogcmVmbGVjdFNldFxyXG4gIH1cclxuICAvLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcclxuICBpZihzZXRQcm90b3R5cGVPZilyZWZsZWN0LnNldFByb3RvdHlwZU9mID0gZnVuY3Rpb24odGFyZ2V0LCBwcm90byl7XHJcbiAgICByZXR1cm4gc2V0UHJvdG90eXBlT2YoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3RvKSwgdHJ1ZTtcclxuICB9O1xyXG4gIFxyXG4gICRkZWZpbmUoR0xPQkFMLCB7UmVmbGVjdDoge319KTtcclxuICAkZGVmaW5lKFNUQVRJQywgJ1JlZmxlY3QnLCByZWZsZWN0KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczcucHJvcG9zYWxzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFBST1RPLCBBUlJBWSwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXHJcbiAgICBpbmNsdWRlczogY3JlYXRlQXJyYXlDb250YWlucyh0cnVlKVxyXG4gIH0pO1xyXG4gICRkZWZpbmUoUFJPVE8sIFNUUklORywge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxyXG4gICAgYXQ6IGNyZWF0ZVBvaW50QXQodHJ1ZSlcclxuICB9KTtcclxuICBcclxuICBmdW5jdGlvbiBjcmVhdGVPYmplY3RUb0FycmF5KGlzRW50cmllcyl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgICAsIGtleXMgICA9IGdldEtleXMob2JqZWN0KVxyXG4gICAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgICAsIGkgICAgICA9IDBcclxuICAgICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcclxuICAgICAgICAsIGtleTtcclxuICAgICAgaWYoaXNFbnRyaWVzKXdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gW2tleSA9IGtleXNbaSsrXSwgT1trZXldXTtcclxuICAgICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9XHJcbiAgJGRlZmluZShTVEFUSUMsIE9CSkVDVCwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi85MzUzNzgxXHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAgICwgcmVzdWx0ID0ge307XHJcbiAgICAgIGZvckVhY2guY2FsbChvd25LZXlzKE8pLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5LCBkZXNjcmlwdG9yKDAsIGdldE93bkRlc2NyaXB0b3IoTywga2V5KSkpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcndhbGRyb24vdGMzOS1ub3Rlcy9ibG9iL21hc3Rlci9lczYvMjAxNC0wNC9hcHItOS5tZCM1MS1vYmplY3RlbnRyaWVzLW9iamVjdHZhbHVlc1xyXG4gICAgdmFsdWVzOiAgY3JlYXRlT2JqZWN0VG9BcnJheShmYWxzZSksXHJcbiAgICBlbnRyaWVzOiBjcmVhdGVPYmplY3RUb0FycmF5KHRydWUpXHJcbiAgfSk7XHJcbiAgJGRlZmluZShTVEFUSUMsIFJFR0VYUCwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2FuZ2F4Lzk2OTgxMDBcclxuICAgIGVzY2FwZTogY3JlYXRlUmVwbGFjZXIoLyhbXFxcXFxcLVtcXF17fSgpKis/LixeJHxdKS9nLCAnXFxcXCQxJywgdHJ1ZSlcclxuICB9KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczcuYWJzdHJhY3QtcmVmcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemVucGFyc2luZy9lcy1hYnN0cmFjdC1yZWZzXHJcbiFmdW5jdGlvbihSRUZFUkVOQ0Upe1xyXG4gIFJFRkVSRU5DRV9HRVQgPSBnZXRXZWxsS25vd25TeW1ib2woUkVGRVJFTkNFKydHZXQnLCB0cnVlKTtcclxuICB2YXIgUkVGRVJFTkNFX1NFVCA9IGdldFdlbGxLbm93blN5bWJvbChSRUZFUkVOQ0UrU0VULCB0cnVlKVxyXG4gICAgLCBSRUZFUkVOQ0VfREVMRVRFID0gZ2V0V2VsbEtub3duU3ltYm9sKFJFRkVSRU5DRSsnRGVsZXRlJywgdHJ1ZSk7XHJcbiAgXHJcbiAgJGRlZmluZShTVEFUSUMsIFNZTUJPTCwge1xyXG4gICAgcmVmZXJlbmNlR2V0OiBSRUZFUkVOQ0VfR0VULFxyXG4gICAgcmVmZXJlbmNlU2V0OiBSRUZFUkVOQ0VfU0VULFxyXG4gICAgcmVmZXJlbmNlRGVsZXRlOiBSRUZFUkVOQ0VfREVMRVRFXHJcbiAgfSk7XHJcbiAgXHJcbiAgaGlkZGVuKEZ1bmN0aW9uUHJvdG8sIFJFRkVSRU5DRV9HRVQsIHJldHVyblRoaXMpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldE1hcE1ldGhvZHMoQ29uc3RydWN0b3Ipe1xyXG4gICAgaWYoQ29uc3RydWN0b3Ipe1xyXG4gICAgICB2YXIgTWFwUHJvdG8gPSBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdO1xyXG4gICAgICBoaWRkZW4oTWFwUHJvdG8sIFJFRkVSRU5DRV9HRVQsIE1hcFByb3RvLmdldCk7XHJcbiAgICAgIGhpZGRlbihNYXBQcm90bywgUkVGRVJFTkNFX1NFVCwgTWFwUHJvdG8uc2V0KTtcclxuICAgICAgaGlkZGVuKE1hcFByb3RvLCBSRUZFUkVOQ0VfREVMRVRFLCBNYXBQcm90b1snZGVsZXRlJ10pO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRNYXBNZXRob2RzKE1hcCk7XHJcbiAgc2V0TWFwTWV0aG9kcyhXZWFrTWFwKTtcclxufSgncmVmZXJlbmNlJyk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGpzLmFycmF5LnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEphdmFTY3JpcHQgMS42IC8gU3RyYXdtYW4gYXJyYXkgc3RhdGljcyBzaGltXHJcbiFmdW5jdGlvbihhcnJheVN0YXRpY3Mpe1xyXG4gIGZ1bmN0aW9uIHNldEFycmF5U3RhdGljcyhrZXlzLCBsZW5ndGgpe1xyXG4gICAgZm9yRWFjaC5jYWxsKGFycmF5KGtleXMpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZihrZXkgaW4gQXJyYXlQcm90bylhcnJheVN0YXRpY3Nba2V5XSA9IGN0eChjYWxsLCBBcnJheVByb3RvW2tleV0sIGxlbmd0aCk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgc2V0QXJyYXlTdGF0aWNzKCdwb3AscmV2ZXJzZSxzaGlmdCxrZXlzLHZhbHVlcyxlbnRyaWVzJywgMSk7XHJcbiAgc2V0QXJyYXlTdGF0aWNzKCdpbmRleE9mLGV2ZXJ5LHNvbWUsZm9yRWFjaCxtYXAsZmlsdGVyLGZpbmQsZmluZEluZGV4LGluY2x1ZGVzJywgMyk7XHJcbiAgc2V0QXJyYXlTdGF0aWNzKCdqb2luLHNsaWNlLGNvbmNhdCxwdXNoLHNwbGljZSx1bnNoaWZ0LHNvcnQsbGFzdEluZGV4T2YsJyArXHJcbiAgICAgICAgICAgICAgICAgICdyZWR1Y2UscmVkdWNlUmlnaHQsY29weVdpdGhpbixmaWxsLHR1cm4nKTtcclxuICAkZGVmaW5lKFNUQVRJQywgQVJSQVksIGFycmF5U3RhdGljcyk7XHJcbn0oe30pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiB3ZWIuZG9tLml0YXJhYmxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oTm9kZUxpc3Qpe1xyXG4gIGlmKGZyYW1ld29yayAmJiBOb2RlTGlzdCAmJiAhKFNZTUJPTF9JVEVSQVRPUiBpbiBOb2RlTGlzdFtQUk9UT1RZUEVdKSl7XHJcbiAgICBoaWRkZW4oTm9kZUxpc3RbUFJPVE9UWVBFXSwgU1lNQk9MX0lURVJBVE9SLCBJdGVyYXRvcnNbQVJSQVldKTtcclxuICB9XHJcbiAgSXRlcmF0b3JzLk5vZGVMaXN0ID0gSXRlcmF0b3JzW0FSUkFZXTtcclxufShnbG9iYWwuTm9kZUxpc3QpO1xufSh0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKSwgdHJ1ZSk7IiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgaXRlcmF0b3JTeW1ib2wgPVxuICAgIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3IoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiB8fCBudWxsLCB0cnlMb2NzTGlzdCB8fCBbXSk7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0gR2VuZXJhdG9yLnByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW5lcmF0b3IgPSB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KTtcbiAgICAgIHZhciBjYWxsTmV4dCA9IHN0ZXAuYmluZChnZW5lcmF0b3IubmV4dCk7XG4gICAgICB2YXIgY2FsbFRocm93ID0gc3RlcC5iaW5kKGdlbmVyYXRvcltcInRocm93XCJdKTtcblxuICAgICAgZnVuY3Rpb24gc3RlcChhcmcpIHtcbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHRoaXMsIG51bGwsIGFyZyk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUoaW5mby52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGluZm8udmFsdWUpLnRoZW4oY2FsbE5leHQsIGNhbGxUaHJvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbE5leHQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBHZW5lcmF0b3IoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgZ2VuZXJhdG9yID0gb3V0ZXJGbiA/IE9iamVjdC5jcmVhdGUob3V0ZXJGbi5wcm90b3R5cGUpIDogdGhpcztcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0KTtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCAmJlxuICAgICAgICAgICAgICB0eXBlb2YgYXJnICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICBcImF0dGVtcHQgdG8gc2VuZCBcIiArIEpTT04uc3RyaW5naWZ5KGFyZykgKyBcIiB0byBuZXdib3JuIGdlbmVyYXRvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zZW50ID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgY29udGV4dC5zZW50O1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5kZWxlZ2F0ZSAmJiBtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcblxuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKHJlY29yZC5hcmcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbmVyYXRvci5uZXh0ID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgZ2VuZXJhdG9yW1widGhyb3dcIl0gPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwidGhyb3dcIik7XG4gICAgZ2VuZXJhdG9yW1wicmV0dXJuXCJdID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInJldHVyblwiKTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cblxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgdGhpcy5zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIC8vIFByZS1pbml0aWFsaXplIGF0IGxlYXN0IDIwIHRlbXBvcmFyeSB2YXJpYWJsZXMgdG8gZW5hYmxlIGhpZGRlblxuICAgICAgLy8gY2xhc3Mgb3B0aW1pemF0aW9ucyBmb3Igc2ltcGxlIGdlbmVyYXRvcnMuXG4gICAgICBmb3IgKHZhciB0ZW1wSW5kZXggPSAwLCB0ZW1wTmFtZTtcbiAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgdGVtcE5hbWUgPSBcInRcIiArIHRlbXBJbmRleCkgfHwgdGVtcEluZGV4IDwgMjA7XG4gICAgICAgICAgICsrdGVtcEluZGV4KSB7XG4gICAgICAgIHRoaXNbdGVtcE5hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDwgZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBBbW9uZyB0aGUgdmFyaW91cyB0cmlja3MgZm9yIG9idGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsXG4gIC8vIG9iamVjdCwgdGhpcyBzZWVtcyB0byBiZSB0aGUgbW9zdCByZWxpYWJsZSB0ZWNobmlxdWUgdGhhdCBkb2VzIG5vdFxuICAvLyB1c2UgaW5kaXJlY3QgZXZhbCAod2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kpLlxuICB0eXBlb2YgZ2xvYmFsID09PSBcIm9iamVjdFwiID8gZ2xvYmFsIDpcbiAgdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiA/IHdpbmRvdyA6IHRoaXNcbik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9iYWJlbC9wb2x5ZmlsbFwiKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJhYmVsLWNvcmUvcG9seWZpbGxcIik7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
