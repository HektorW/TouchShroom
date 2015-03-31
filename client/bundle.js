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
      value: function onMyPlayer(data) {}
    }
  });

  return NetworkManager;
})();

module.exports = NetworkManager;

/** { INIT }
 *
 */
NET.init = function () {

  //////////////
  // GAME OLD //
  //////////////
  this.socket.on("my player", function (data) {
    GAME.me = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
    GAME.me.player_id = data.player.player_id;
    GAME.bases.push(GAME.me);
  });

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

var requestAnimationFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    setTimeout(function () {
      callback(window.performance.now());
    }, 1000 / 60);
  };
})();

var cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout(id);
})();

var performance = window.performance = {};
performance.now = performance.now || performance.webkitNow || performance.mozNow || performance.msNow || function () {
  return new Date().getTime();
};

var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozNow || window.msNow || undefined;

module.exports = {
  requestAnimationFrame: requestAnimationFrame,
  cancelAnimationFrame: cancelAnimationFrame,
  performance: performance,
  AudioContext: AudioContext
};

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
},{}],18:[function(require,module,exports){
"use strict";

module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":15}],19:[function(require,module,exports){
"use strict";

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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFx1c2Vyc1xcaGVrdG9yXFxkZXNrdG9wXFx3b3Jrc3BhY2VcXHRvdWNoc2hyb29tXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvZ2FtZS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9pbnB1dG1hbmFnZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvbWFpbi5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9uZXR3b3JrbWFuYWdlci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9vYmplY3RzL2Jhc2UuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9taW5pb24uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvb2JqZWN0cy9wYXJ0aWNsZS5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9vYmplY3RzL3BsYXllci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy9zb3VuZG1hbmFnZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC9jb2xvci5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvc2NyaXB0cy91dGlsL2RyYXcuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC9tYXRoLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9zY3JpcHRzL3V0aWwvcHJlZml4ZXIuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vY2xpZW50L3NjcmlwdHMvdXRpbC91dGlsLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9saWIvYmFiZWwvcG9seWZpbGwuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL3NoaW0uanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1iYWJlbC9ydW50aW1lLmpzIiwiYzovdXNlcnMvaGVrdG9yL2Rlc2t0b3Avd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9wb2x5ZmlsbC5qcyIsImM6L3VzZXJzL2hla3Rvci9kZXNrdG9wL3dvcmtzcGFjZS90b3VjaHNocm9vbS9ub2RlX21vZHVsZXMvYmFiZWxpZnkvcG9seWZpbGwuanMiLCJjOi91c2Vycy9oZWt0b3IvZGVza3RvcC93b3Jrc3BhY2UvdG91Y2hzaHJvb20vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzRCQ0N5RSxpQkFBaUI7O0lBQWpGLHFCQUFxQixpQkFBckIscUJBQXFCO0lBQUUsb0JBQW9CLGlCQUFwQixvQkFBb0I7SUFBRSxXQUFXLGlCQUFYLFdBQVc7O3dCQUM1QixhQUFhOztJQUF6QyxRQUFRLGFBQVIsUUFBUTtJQUFFLFVBQVUsYUFBVixVQUFVOztJQUV0QixZQUFZLDJCQUFNLGdCQUFnQjs7SUFDbEMsWUFBWSwyQkFBTSxnQkFBZ0I7O0lBQ2xDLGNBQWMsMkJBQU0sa0JBQWtCOztJQUV0QyxRQUFRLDJCQUFNLG9CQUFvQjs7SUFDbEMsTUFBTSwyQkFBTSxrQkFBa0I7O0lBQzlCLElBQUksMkJBQU0sZ0JBQWdCOztJQUMxQixNQUFNLDJCQUFNLGtCQUFrQjs7SUFHaEIsSUFBSTtBQUVaLFdBRlEsSUFBSSxHQUVUOzBCQUZLLElBQUk7O0FBR3JCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV6QixRQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7O0FBRTFCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hC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Q0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQUEsQUFDcEQsV0FBSyxDQUFDO0FBQUUsZUFBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQzdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxBQUM3RCxXQUFLLENBQUM7QUFBRSxlQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQ3RDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDL0MsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFD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QUFJLEVBQUU7QUFDbkQsTUFBSSxHQUFHLENBQUM7QUFDUixNQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQzVDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FDTCxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ3hDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FFUixHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDckMsU0FBTyxHQUFHLENBQUM7Q0FDWixDQUFDOztBQUVGLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN2QixTQUFPLE9BQU8sR0FBRyxLQUFLLFVBQVUsQ0FBQztDQUNsQzs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDckIsU0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUM7Q0FDaEM7O0FBRUQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3JCLFNBQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUM7Q0FDaEQ7O0FBRUQsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFO0FBQ3hCLFNBQU8sR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO0NBQ3ZCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5pbXBvcnQgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCBwZXJmb3JtYW5jZSB9IGZyb20gJy4vdXRpbC9wcmVmaXhlcic7XHJcbmltcG9ydCB7IGRyYXdMaW5lLCBkcmF3Q2lyY2xlIH0gZnJvbSAnLi91dGlsL2RyYXcnO1xyXG5cclxuaW1wb3J0IFNvdW5kTWFuYWdlciBmcm9tICcuL3NvdW5kbWFuYWdlcic7XHJcbmltcG9ydCBJbnB1dE1hbmFnZXIgZnJvbSAnLi9pbnB1dG1hbmFnZXInO1xyXG5pbXBvcnQgTmV0d29ya01hbmFnZXIgZnJvbSAnLi9uZXR3b3JrbWFuYWdlcic7XHJcblxyXG5pbXBvcnQgUGFydGljbGUgZnJvbSAnLi9vYmplY3RzL3BhcnRpY2xlJztcclxuaW1wb3J0IFBsYXllciBmcm9tICcuL29iamVjdHMvcGxheWVyJztcclxuaW1wb3J0IEJhc2UgZnJvbSAnLi9vYmplY3RzL2Jhc2UnO1xyXG5pbXBvcnQgTWluaW9uIGZyb20gJy4vb2JqZWN0cy9taW5pb24nO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuICAgIHRoaXMuY3R4ID0gbnVsbDtcclxuICAgIHRoaXMuc291bmRNYW5hZ2VyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmxhc3RfdGltZSA9IC0xO1xyXG4gICAgdGhpcy5ub3cgPSAtMTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy5ob3ZlcmVkX2Jhc2UgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXRlZF9iYXNlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmJhc2VzID0gW107XHJcbiAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgIHRoaXMubWluaW9ucyA9IFtdO1xyXG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLm1lID0gbnVsbDtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSBudWxsO1xyXG4gIH1cclxuXHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLnNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKS5pbml0KCk7XHJcbiAgICB0aGlzLm5ldHdvcmtNYW5hZ2VyID0gbmV3IE5ldHdvcmtNYW5hZ2VyKCkuaW5pdCgpO1xyXG4gICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMpLmluaXQoKTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYW52YXMnKTtcclxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICB0aGlzLmJpbmRGdW5jdGlvbnMoKTtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG4gICAgdGhpcy5zZXR1cFdpZXJkQXJyYXlGdW5jdGlvbnMoKTtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgYmluZEZ1bmN0aW9ucygpIHtcclxuICAgIHRoaXMubG9vcCA9IHRoaXMubG9vcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgc2V0dXBXaWVyZEFycmF5RnVuY3Rpb25zKCkge1xyXG4gICAgdGhpcy5wbGF5ZXJzLmZpbmRCeSA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgICBpZiAodGhpc1tpXVtwcm9wXSA9PT0gdmFsdWUpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucGxheWVycy5ieUlEID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgZm9yIChsZXQgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xyXG4gICAgICAgIGlmICh0aGlzW2ldLmlkID09PSBpZCkgcmV0dXJuIHRoaXNbaV07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIG1ldGhvZCB0byBiYXNlIGxpc3RcclxuICAgIHRoaXMuYmFzZXMuaW5kZXhCeUlEID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICkge1xyXG4gICAgICAgIGlmKHRoaXNbaV0uaWQgPT09IGlkKSByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmJhc2VzLmJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvcih2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE1JTklPTlxyXG4gICAgdGhpcy5taW5pb25zLmJ5SUQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGZvcih2YXIgaSA9IHRoaXMubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgICAgaWYodGhpc1tpXS5pZCA9PT0gaWQpIHJldHVybiB0aGlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcblxyXG4gIHNldHVwKGRhdGEpIHtcclxuICAgIGxldCBsdmxfbmFtZSA9IGRhdGEubGV2ZWxfbmFtZTtcclxuICAgIGxldCBteV9pZCA9IGRhdGEubXlfaWQ7XHJcbiAgICBsZXQgcGxheWVycyA9IGRhdGEucGxheWVycztcclxuXHJcbiAgICAvLyB0aW1lZCgnTGV2ZWw6ICcgKyBsdmxfbmFtZSk7XHJcblxyXG4gICAgZm9yKGxldCBpID0gMCwgbGVuID0gZGF0YS5iYXNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIGxldCBiID0gZGF0YS5iYXNlc1tpXTtcclxuICAgICAgdGhpcy5iYXNlcy5wdXNoKFxyXG4gICAgICAgIG5ldyBCYXNlKHRoaXMsIGIuaWQsIGIubGVmdCwgYi50b3AsIGIuc2NhbGUsIGIucmVzb3VyY2VzLCBiLnJlc291cmNlc19tYXgpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBwbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgbGV0IHBsYXllckRhdGEgPSBwbGF5ZXJzW2ldO1xyXG5cclxuICAgICAgbGV0IHBsYXllciA9IG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICBwbGF5ZXJEYXRhLmlkLFxyXG4gICAgICAgIHBsYXllckRhdGEubmFtZSxcclxuICAgICAgICBwbGF5ZXJEYXRhLmNvbG9yXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBsZXQgc3RhcnRTdGF0ZXMgPSBkYXRhLnN0YXJ0X3N0YXRlW2ldO1xyXG4gICAgICBzdGFydFN0YXRlcy5mb3JFYWNoKGkgPT4gdGhpcy5iYXNlc1tpXS5zZXRQbGF5ZXIocGxheWVyKSk7XHJcblxyXG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG5cclxuICAgICAgaWYgKHBsYXllckRhdGEuaWQgPT09IG15X2lkKXtcclxuICAgICAgICB0aGlzLm1lID0gcGxheWVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZW5kKCdQTEFZRVIucmVhZHknKTtcclxuICB9XHJcblxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMubm93ID0gdGhpcy5sYXN0X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wKTtcclxuICB9XHJcblxyXG4gIGVuZCgpIHtcclxuICAgIGlmKHRoaXMuYW5pbWF0aW9uRnJhbWUpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xyXG5cclxuICAgIC8vIENMRUFOIFVQIEdBTUVcclxuICAgIHRoaXMuYmFzZXMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMucGxheWVycy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5tZSA9IG51bGw7XHJcbiAgICB0aGlzLm1pbmlvbnMubGVuZ3RoID0gMDtcclxuICAgIHRoaXMucGFydGljbGVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgLy8gVGVtcG9yYXJ5IHNvbHV0aW9uIHRvIGhpZGUgb3ZlcmxheSBhbmQgZ28gYmFjayB0byBTVEFSVFxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAvLyBDT05UUk9MTEVSLm92ZXJsYXlIaWRlKCk7XHJcbiAgICAgIC8vIENPTlRST0xMRVIuc2V0U2NyZWVuKCdzdGFydCcpO1xyXG4gICAgfSwgMzAwMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgbG9vcCgpIHtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3ApO1xyXG5cclxuICAgIGlmICh0aGlzLmRyYXdfdGltZSlcclxuICAgICAgdGhpcy5kcmF3X3RpbWUgPSB0aW1lIC0gdGhpcy5kcmF3X3RpbWU7XHJcblxyXG4gICAgdGhpcy5ub3cgPSB0aW1lO1xyXG4gICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIHRoaXMubGFzdF90aW1lKSAvIDEwMDAuMDtcclxuICAgIHRoaXMubGFzdF90aW1lID0gdGltZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZV90aW1lID0gdGltZTtcclxuICAgIHRoaXMudXBkYXRlKGVsYXBzZWQpO1xyXG4gICAgdGhpcy51cGRhdGVfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy51cGRhdGVfdGltZTtcclxuXHJcbiAgICB0aGlzLmRyYXdfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdGhpcy5kcmF3KCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnVwZGF0ZSh0aW1lKTtcclxuICB9XHJcblxyXG5cclxuICBkcmF3ICgpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuXHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLm1pbmlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgbGV0IG0gPSB0aGlzLm1pbmlvbnNbaV07XHJcbiAgICAgIGlmIChtLmFjdGl2ZSkgbS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gRHJhdyBsaW5lIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy9cclxuICAgIGlmICh0aGlzLnNlbGVjdGVkX2Jhc2Upe1xyXG4gICAgICBsZXQgYiA9IHRoaXMuc2VsZWN0ZWRfYmFzZTtcclxuXHJcbiAgICAgIGxldCB4LCB5O1xyXG4gICAgICBpZiAodGhpcy50YXJnZXRlZF9iYXNlKXtcclxuICAgICAgICB4ID0gdGhpcy50YXJnZXRlZF9iYXNlLng7XHJcbiAgICAgICAgeSA9IHRoaXMudGFyZ2V0ZWRfYmFzZS55O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHggPSB0aGlzLmlucHV0TWFuYWdlci5wb2ludGVyLng7XHJcbiAgICAgICAgeSA9IHRoaXMuaW5wdXRNYW5hZ2VyLnBvaW50ZXIueTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMztcclxuICAgICAgbGV0IGxpbmVfc2l6ZSA9IDU7XHJcbiAgICAgIGxldCBjb2xvciA9IHRoaXMubWUuY29sb3IgfHwgJyNBQUEnIDtcclxuICAgICAgZHJhd0xpbmUoY3R4LCBiLngsIGIueSwgeCwgeSwgY29sb3IsIGxpbmVfc2l6ZSk7XHJcbiAgICAgIGRyYXdDaXJjbGUoY3R4LCB4LCB5LCBsaW5lX3NpemUgLyAyLCBjb2xvcik7XHJcblxyXG4gICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHRoaXMuYmFzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICB0aGlzLmJhc2VzW2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHRoaXMucGFydGljbGVzW2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRyYXdTY29yZUJhcihjdHgpO1xyXG4gIH1cclxuXHJcbiAgZHJhd1Njb3JlQmFyKGN0eCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICBsZXQgdyA9IHdpZHRoIC8gMS41O1xyXG4gICAgbGV0IGggPSBoZWlnaHQgLyAyMDtcclxuICAgIGxldCB4ID0gKHdpZHRoIC8gMikgLSAodyAvIDIpO1xyXG4gICAgbGV0IHkgPSAoaGVpZ2h0IC8gMjApIC0gKGggLyAyKTtcclxuXHJcbiAgICBsZXQgciA9IFtdO1xyXG4gICAgbGV0IHRvdGFsID0gMDtcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICByW2ldID0gdGhpcy5wbGF5ZXJzW2ldLnRvdGFsUmVzb3VyY2VzKCk7XHJcbiAgICAgIHRvdGFsICs9IHJbaV07XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHh0ID0geDtcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wbGF5ZXJzW2ldLmNvbG9yO1xyXG4gICAgICBsZXQgd3QgPSAocltpXSAvIHRvdGFsKSAqIHc7XHJcbiAgICAgIGN0eC5maWxsUmVjdCh4dCwgeSwgd3QsIGgpO1xyXG4gICAgICBsZXQgdGV4dCA9IHRoaXMucGxheWVyc1tpXS5uYW1lICsgJyAtICcgKyByW2ldO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIHh0ICsgKHd0LzIpIC0gKGN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aC8yKSwgeSsoaC8yKSk7XHJcblxyXG4gICAgICB4dCArPSB3dDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuICAgIGN0eC5zdHJva2VSZWN0KHgsIHksIHcsIGgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgdGhpcy53aWR0aCAgPSB0aGlzLmNhbnZhcy53aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuYmFzZXMuZm9yRWFjaChlID0+IGUucmVzaXplKCkpO1xyXG4gICAgdGhpcy5taW5pb25zLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcclxuICAgIHRoaXMucGFydGljbGVzLmZvckVhY2goZSA9PiBlLnJlc2l6ZSgpKTtcclxuICB9XHJcblxyXG5cclxuXHJcbiAgdHJ5U2VuZE1pbmlvbih0YXJnZXQpIHtcclxuICAgIHRhcmdldC50YXJnZXRlZCA9IHRydWU7XHJcbiAgICB0aGlzLnRhcmdldGVkX2Jhc2UgPSB0YXJnZXQ7XHJcblxyXG4gICAgLy8gQ2FsbCAnY2FuU2VuZE1pbmlvbicgb24gc2VsZWN0ZWRfYmFzZVxyXG4gICAgLy8gW0NIQU5HRURdIEFsbHdheXMgYXNrIHNlcnZlciB0byBzZW5kXHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZF9iYXNlLmNhblNlbmRNaW5pb24oKSB8fCB0cnVlKXtcclxuICAgICAgdGhpcy5uZXR3b3JrTWFuYWdlci5zZW5kKCdCQVNFLm1pbmlvbicsIHtcclxuICAgICAgICBzb3VyY2VfaWQ6IHRoaXMuc2VsZWN0ZWRfYmFzZS5pZCxcclxuICAgICAgICB0YXJnZXRfaWQ6IHRhcmdldC5pZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEJ5SUQobGlzdCwgaWQpIHtcclxuICAgIGZvciAobGV0IGkgPSBsaXN0Lmxlbmd0aDsgaS0tOyApIHtcclxuICAgICAgbGV0IGl0ZW0gPSBsaXN0W2ldO1xyXG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLmlkID09IGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBoZWhlU2NvcGVBd2F5U2lsbHlJbXBsZW1lbnRhdGlvbigpIHtcclxuXHJcblxyXG5cclxuICAvLy8vLy8vLy8vLy9cclxuICAvLyBFVkVOVFMgLy9cclxuICAvLy8vLy8vLy8vLy9cclxuICAvKipcclxuICAgKiB7IERJU0NPTk5FQ1RJT04gfVxyXG4gICAqIENhbGxlZCB3aGVuIGEgcGxheWVyIGRpc2Nvbm5lY3RzIGZyb20gdGhlIGdhbWVcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLmRpc2Nvbm5lY3Rpb24gPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBwID0gdGhpcy5wbGF5ZXJzLmZpbmRCeSgnaWQnLCBkYXRhLnBsYXllcl9pZCk7XHJcblxyXG4gICAgaWYocCAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgQ09OVFJPTExFUi5vdmVybGF5TWVzc2FnZShcIid7MH0nIGRpc2Nvbm5lY3RlZFwiLmZvcm1hdChwLm5hbWUpKTtcclxuICAgIH1cclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIHsgQkFTRSBSRVNPVVJDRVMgfVxyXG4gICAqIFdoZW4gYSBiYXNlIGdvdCB1cGRhdGVkIHJlc291cmNlcyBmcm9tIHNlcnZlclxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIEdBTUUuYmFzZVJlc291cmNlcyA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIGIgPSBHQU1FLmJhc2VzLmJ5SUQoZGF0YS5iYXNlX2lkKTtcclxuXHJcbiAgICBpZihiKVxyXG4gICAgICBiLnJlc291cmNlcyA9IGRhdGEucmVzb3VyY2VzO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBORVcgTUlOSU9OIH1cclxuICAgKiBDYWxsZWQgd2hlbiBzZXJ2ZXIgc2VuZHMgYSBuZXcgbWluaW9uXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXHJcbiAgICovXHJcbiAgR0FNRS5uZXdNaW5pb24gPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciBtID0gZGF0YS5taW5pb247XHJcblxyXG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuYmFzZXMuYnlJRChtLnNvdXJjZV9pZCk7XHJcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5iYXNlcy5ieUlEKG0udGFyZ2V0X2lkKTtcclxuXHJcbiAgICB2YXIgbWluaW9uID0gbmV3IE1pbmlvbihcclxuICAgICAgbS5pZCxcclxuICAgICAgc291cmNlLFxyXG4gICAgICB0YXJnZXQsXHJcbiAgICAgIG0uc2NhbGVcclxuICAgICk7XHJcblxyXG4gICAgc291cmNlLnNlbmRNaW5pb24oKTtcclxuXHJcbiAgICB0aGlzLm1pbmlvbnMucHVzaChtaW5pb24pO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogeyBNSU5JT04gSElUIH1cclxuICAgKiBDYWxsZWQgYnkgc2VydmVyIHdoZW4gbWluaW9uIHJlYWNoZXMgdGFyZ2V0IGJhc2VcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcclxuICAgKi9cclxuICBHQU1FLm1pbmlvbkhpdCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIG1pbmlvbl9pZCA9IGRhdGEubWluaW9uX2lkO1xyXG4gICAgdmFyIG5ld19wbGF5ZXJfaWQgPSBkYXRhLm5ld19wbGF5ZXJfaWQ7XHJcbiAgICB2YXIgcmVzb3VyY2VzID0gZGF0YS5yZXNvdXJjZXM7XHJcblxyXG4gICAgLy8gRmV0Y2ggbWluaW9uXHJcbiAgICB2YXIgbWluaW9uID0gdGhpcy5taW5pb25zLmJ5SUQobWluaW9uX2lkKTtcclxuXHJcbiAgICBpZighbWluaW9uKXtcclxuICAgICAgYWxlcnQoJ01pbmlvbiBnb25lJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBtaW5pb24uZGVhZF9ieV9zZXJ2ZXIgPSB0cnVlO1xyXG5cclxuICAgIC8vIEdldCB0YXJnZXQgYmFzZVxyXG4gICAgdmFyIHRhcmdldCA9IG1pbmlvbi50YXJnZXRfYmFzZTtcclxuICAgIC8vIFNldCByZXNvdXJjZXMgZm9yIGJhc2VcclxuICAgIHRhcmdldC5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcblxyXG4gICAgaWYobmV3X3BsYXllcl9pZCAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgdmFyIHBsYXllciA9IHRoaXMucGxheWVycy5ieUlEKG5ld19wbGF5ZXJfaWQpO1xyXG4gICAgICB0YXJnZXQuc2V0UGxheWVyKHBsYXllcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogeyBVUERBVEUgfVxyXG4gICAqIEBwYXJhbSAge051bWJlcn0gdCAgIEVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IHVwZGF0ZSAoc2Vjb25kcylcclxuICAgKi9cclxuICBHQU1FLnVwZGF0ZSA9IGZ1bmN0aW9uKHQpe1xyXG4gICAgdmFyIGksIGxlbiwgYiwgbSwgcDtcclxuXHJcblxyXG4gICAgLy8gUmVzZXQgaG92ZXJlZCBhbmQgdGFyZ2V0ZWRcclxuICAgIHRoaXMuaG92ZXJlZF9iYXNlID0gbnVsbDtcclxuICAgIHRoaXMudGFyZ2V0ZWRfYmFzZSA9IG51bGw7XHJcblxyXG5cclxuXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IHRoaXMuYmFzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBiID0gdGhpcy5iYXNlc1tpXTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBiYXNlXHJcbiAgICAgIGIudXBkYXRlKHQpO1xyXG5cclxuICAgICAgLy8gUmVzZXQgYmFzZSBob3ZlcmVkICYgdGFyZ2V0ZWQgc3RhdGVcclxuICAgICAgYi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgIGIudGFyZ2V0ZWQgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAvLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAvLyBDSEVDSyBJTlBVVCAvL1xyXG4gICAgICAvLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAvLyBNb3VzZSBpcyBvdmVyIGJhc2VcclxuICAgICAgaWYocG9pbnRJbkNpcmNsZShUT1VDSC54LCBUT1VDSC55LCBiLngsIGIueSwgYi5zaXplKSl7XHJcbiAgICAgICAgLy8gU2VlIGlmIHRoZXJlIGlzIGFueSBzZWxlY3RlZCBiYXNlIGFuZCBpdCBpc24ndCB0aGUgb25lIHRlc3RlZFxyXG4gICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRfYmFzZSAmJiB0aGlzLnNlbGVjdGVkX2Jhc2UgIT09IGIpe1xyXG4gICAgICAgICAgLy8gU2V0IHRoZSBiYXNlIGFzIHRhcmdldGVkIGFuZCB0cnkgdG8gc2VuZFxyXG4gICAgICAgICAgR0FNRS50cnlTZW5kTWluaW9uKGIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIENoZWNrIGlmIGJhc2UgYmVsb25zIHRvICdtZSdcclxuICAgICAgICAgIGlmKHRoaXMubWUuYmFzZXNfaWQuaW5kZXhPZihiLmlkKSAhPT0gLTEpe1xyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGJhc2UgYXMgaG92ZXJlZFxyXG4gICAgICAgICAgICBiLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYodGhpcy5tZS5iYXNlc19pZC5pbmRleE9mKGIuaWQpICE9IC0xKXtcclxuICAgICAgICBpZighYi5zZWxlY3RlZCAmJiBwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgICAgIGIuaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmhvdmVyZWRfYmFzZSA9IGI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyBVcGRhdGUgbWluaW9uc1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLm1pbmlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBtID0gdGhpcy5taW5pb25zW2ldO1xyXG4gICAgICBpZihtLmFjdGl2ZSl7XHJcbiAgICAgICAgbS51cGRhdGUodCk7XHJcblxyXG4gICAgICAgIGlmKCFtLmFjdGl2ZSl7XHJcbiAgICAgICAgICBTT1VORC5wbGF5UmFuZG9tU291bmQoKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKFxyXG4gICAgICAgICAgICBuZXcgUGFydGljbGUobS50YXJnZXRfYmFzZS5sZWZ0LCBtLnRhcmdldF9iYXNlLnRvcCwgbS50YXJnZXRfYmFzZS5zY2FsZSwgbS5zb3VyY2VfYmFzZS5jb2xvcilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYobS5kZWFkX2J5X3NlcnZlciAmJiAhbS5hY3RpdmUpe1xyXG4gICAgICAgIHRoaXMubWluaW9ucy5zcGxpY2UoaS0tLCAxKTtcclxuICAgICAgICAtLWxlbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBwYXRpY2xlc1xyXG4gICAgZm9yKGkgPSAwLCBsZW4gPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgIHAgPSB0aGlzLnBhcnRpY2xlc1tpXTtcclxuICAgICAgcC51cGRhdGUodCk7XHJcblxyXG4gICAgICBpZighcC5hY3RpdmUpe1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLS0sIDEpO1xyXG4gICAgICAgIC0tbGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIEdBTUUuc2VuZCA9IGZ1bmN0aW9uKG1zZywgZGF0YSl7XHJcbiAgICBORVQuc2VuZChtc2csIGRhdGEpO1xyXG4gIH07XHJcbiAgXHJcblxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogeyBTVEFSVCBUT1VDSCB9XHJcbiAgICovXHJcbiAgR0FNRS5zdGFydFRvdWNoID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBpLCBiLCBsZW47XHJcblxyXG4gICAgaWYoIUdBTUUubWUpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBmb3IoaSA9IDAsIGxlbiA9IEdBTUUubWUuYmFzZXNfaWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICBiID0gR0FNRS5iYXNlc1tHQU1FLmJhc2VzLmluZGV4QnlJRChHQU1FLm1lLmJhc2VzX2lkW2ldKV07XHJcblxyXG4gICAgICBpZihwb2ludEluQ2lyY2xlKFRPVUNILngsIFRPVUNILnksIGIueCwgYi55LCBiLnNpemUpKXtcclxuICAgICAgICBiLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICBHQU1FLnNlbGVjdGVkX2Jhc2UgPSBiO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogeyBFTkQgVE9VQ0ggfVxyXG4gICAqL1xyXG4gIEdBTUUuZW5kVG91Y2ggPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoR0FNRS5zZWxlY3RlZF9iYXNlKXtcclxuICAgICAgLy8gQWRkIG5ldyBtaW5pb25cclxuICAgICAgaWYoR0FNRS50YXJnZXRlZF9iYXNlKXtcclxuXHJcbiAgICAgIH1cclxuICAgICAgR0FNRS5zZWxlY3RlZF9iYXNlLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgIEdBTUUuc2VsZWN0ZWRfYmFzZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxufSIsIlxyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXRNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoZ2FtZSkge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLnBvaW50ZXIgPSB7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIGRvd246IGZhbHNlLFxyXG4gICAgICB0aW1lRG93bjogMFxyXG4gICAgfTtcclxuICAgIHRoaXMubGFzdFBvaW50ZXIgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnBvaW50ZXIpO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy51cGRhdGVQb3NpdGlvbi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSh0aW1lKSB7XHJcbiAgICB0aGlzLmxhc3RQb2ludGVyID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wb2ludGVyKTtcclxuXHJcbiAgICBpZiAodGhpcy5wb2ludGVyLmRvd24pIHtcclxuICAgICAgdGhpcy5wb2ludGVyLnRpbWVEb3duICs9IHRpbWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBvaW50ZXIudGltZURvd24gPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0U3RhdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiB0aGlzLnBvaW50ZXIueCxcclxuICAgICAgeTogdGhpcy5wb2ludGVyLnksXHJcbiAgICAgIGRvd246IHRoaXMucG9pbnRlci5kb3duXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcblxyXG4gIHRyYW5zbGF0ZUV2ZW50Q29vcmRpbmF0ZXMoZXZlbnQpIHtcclxuICAgIGlmIChldmVudC5jaGFuZ2VkVG91Y2hlcykge1xyXG4gICAgICByZXR1cm4gWyBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGxldCBbIHBhZ2VYLCBwYWdlWSBdID0gdGhpcy50cmFuc2xhdGVFdmVudENvb3JkaW5hdGVzKGV2ZW50KTtcclxuICAgIFsgdGhpcy5wb2ludGVyLngsIHRoaXMucG9pbnRlci55IF0gPSBbIHBhZ2VYLCBwYWdlWSBdO1xyXG4gIH1cclxuXHJcbiAgb25Qb2ludGVyRG93bihldmVudCkge1xyXG4gICAgdGhpcy51cGRhdGVQb3NpdGlvbihldmVudCk7XHJcbiAgICB0aGlzLnBvaW50ZXIuZG93biA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBvblBvaW50ZXJVcChldmVudCkge1xyXG4gICAgdGhpcy51cGRhdGVQb3NpdGlvbihldmVudCk7XHJcbiAgICB0aGlzLnBvaW50ZXIuZG93biA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmlnZ2VyKCdwb2ludGVyLnVwJyk7XHJcbiAgfVxyXG5cclxufSIsIlxyXG4vLyBpbmNsdWRlcyBzb21lIGJyb3dzZXIgcG9seWZpbGxzXHJcbnJlcXVpcmUoJ2JhYmVsaWZ5L3BvbHlmaWxsJyk7XHJcblxyXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUnXHJcblxyXG52YXIgZ2FtZSA9IHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKS5pbml0KCk7XHJcbiIsIlxyXG4vLyB0ZW1wXHJcbmZ1bmN0aW9uIHRpbWVkKCkgeyBjb25zb2xlLmxvZyhhcmd1bWVudHNbMF0pOyB9XHJcblxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ldHdvcmtNYW5hZ2VyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY29udHJvbGxlciwgZ2FtZSkge1xyXG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5jb25uZWN0KCk7XHJcbiAgICB0aGlzLnNldHVwU29ja2V0RXZlbnRIYW5kbGVycygpO1xyXG4gIH1cclxuXHJcbiAgY29ubmVjdCgpIHtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnOjg4ODgnLCB7XHJcbiAgICAgICAgcmVjb25uZWN0OiB0cnVlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNldHVwU29ja2V0RXZlbnRIYW5kbGVycygpIHtcclxuICAgIGxldCBzb2NrZXQgPSB0aGlzLnNvY2tldDtcclxuXHJcbiAgICBzb2NrZXQub24oJ2Vycm9yJywgdGhpcy5vblNvY2tldEVycm9yLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3QuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBzb2NrZXQub24oJ1NFUlZFUi55b3VybmFtZScsIHRoaXMub25TZXJ2ZXJZb3VybmFtZS5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignU0VSVkVSLm51bV9wbGF5ZXJzJywgdGhpcy5vblNlcnZlck51bVBsYXllcnMuYmluZCh0aGlzKSk7XHJcbiAgICBzb2NrZXQub24oJ1NFUlZFUi5pbml0Z2FtZScsIHRoaXMub25TZXJ2ZXJJbml0Z2FtZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBzb2NrZXQub24oJ0dBTUUuc2V0dXAnLCB0aGlzLm9uR2FtZVNldHVwLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLnN0YXJ0JywgdGhpcy5vbkdhbWVTdGFydC5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignR0FNRS5lbmQnLCB0aGlzLm9uR2FtZUVuZC5iaW5kKHRoaXMpKTtcclxuICAgIHNvY2tldC5vbignR0FNRS5kaXNjb25uZWN0aW9uJywgdGhpcy5vbkdhbWVEaXNjb25uZWN0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgc29ja2V0Lm9uKCdHQU1FLm1pbmlvbicsIHRoaXMub25HYW1lTWluaW9uLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHNvY2tldC5vbignTUlOSU9OLmhpdCcsIHRoaXMub25NaW5pb25IaXQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgc29ja2V0Lm9uKCdCQVNFLnJlc291cmNlcycsIHRoaXMub25CYXNlUmVzb3VyY2VzLmJpbmQodGhpdHMpKTtcclxuICB9XHJcblxyXG4gIHNlbmQobXNnLCBkYXRhKSB7XHJcbiAgICB0aGlzLnNvY2tldC5lbWl0KG1zZywgZGF0YSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgb25Tb2NrZXRFcnJvcigpIHtcclxuICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcclxuICAgICAgdGhpcy5jb250cm9sbGVyLm5vY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBvblNvY2tldENvbm5lY3QoKSB7XHJcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIuY29ubmVjdGVkKCk7XHJcbiAgfVxyXG4gIG9uU29ja2V0RGlzY29ubmVjdCgpIHtcclxuICAgIHRoaXMuY29uZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY29udHJvbGxlci5kaXNjb25uZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIG9uU2VydmVyWW91cm5hbWUoZGF0YSkge1xyXG4gICAgdGltZWQoYFlvdSBzaGFsbCBiZSBrbm93biBhcyAnJHtkYXRhLm5hbWV9J2ApO1xyXG4gIH1cclxuICBvblNlcnZlck51bVBsYXllcnMoZGF0YSkge1xyXG4gICAgdGltZWQoJ1BsYXllcnMgb25saW5lOiAnICsgZGF0YS5udW1fcGxheWVycyk7XHJcbiAgfVxyXG4gIG9uU2VydmVySW5pdGdhbWUoKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xsZXIuc3RhcnRnYW1lKCk7XHJcbiAgfVxyXG5cclxuICBvbkdhbWVTZXR1cChkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuc2V0dXAoZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5nYW1lLnN0YXJ0KCk7IFxyXG4gIH1cclxuICBvbkdhbWVFbmQoKSB7XHJcbiAgICB0aGlzLmdhbWUuZW5kKCk7XHJcbiAgfVxyXG4gIG9uR2FtZURpc2Nvbm5lY3Rpb24oZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLmRpc2Nvbm5lY3Rpb24oZGF0YSk7XHJcbiAgfVxyXG4gIG9uR2FtZU1pbmlvbihkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUubmV3TWluaW9uKGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgb25NaW5pb25IaXQoZGF0YSkge1xyXG4gICAgdGhpcy5nYW1lLm1pbmlvbkhpdChkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uQmFzZVJlc291cmNlcyhkYXRhKSB7XHJcbiAgICB0aGlzLmdhbWUuYmFzZVJlc291cmNlcyhkYXRhKTtcclxuICB9XHJcblxyXG4gIG9uTXlQbGF5ZXIoZGF0YSkge1xyXG4gICAgXHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyoqIHsgSU5JVCB9XHJcbiAqXHJcbiAqL1xyXG5ORVQuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcblxyXG5cclxuXHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIEdBTUUgT0xEIC8vXHJcbiAgICAvLy8vLy8vLy8vLy8vL1xyXG4gICAgdGhpcy5zb2NrZXQub24oJ215IHBsYXllcicsIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIEdBTUUubWUgPSBuZXcgQmFzZShkYXRhLnBsYXllci5hc3BlY3RfbGVmdCwgZGF0YS5wbGF5ZXIuYXNwZWN0X3RvcCwgZGF0YS5wbGF5ZXIuYXNwZWN0X3NpemUsIGRhdGEucGxheWVyLmNvbG9yKTtcclxuICAgICAgICBHQU1FLm1lLnBsYXllcl9pZCA9IGRhdGEucGxheWVyLnBsYXllcl9pZDtcclxuICAgICAgICBHQU1FLmJhc2VzLnB1c2goR0FNRS5tZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbignZy5wbGF5ZXJzJywgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgdmFyIGksIGIsIGxlbjtcclxuICAgICAgICB2YXIgcCA9IGRhdGEucGxheWVycztcclxuICAgICAgICBmb3IoaSA9IDAsIGxlbiA9IHAubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBHQU1FLmJhc2VzLmluZGV4QnlJRChwW2ldLnBsYXllcl9pZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBwbGF5ZXIgaXMgbm90IGluIGdhbWUgLT4gQWRkXHJcbiAgICAgICAgICAgIGlmKGluZGV4ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgYiA9IG5ldyBCYXNlKHBbaV0uYXNwZWN0X2xlZnQsIHBbaV0uYXNwZWN0X3RvcCwgcFtpXS5hc3BlY3Rfc2l6ZSwgcFtpXS5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICBiLnBsYXllcl9pZCA9IHBbaV0ucGxheWVyX2lkO1xyXG4gICAgICAgICAgICAgICAgR0FNRS5iYXNlcy5wdXNoKGIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEVsc2Ugc2V0IHZhbHVlcyBjb3JyZWN0XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYiA9IEdBTUUuYmFzZXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgYi5hc3BlY3RfbGVmdCA9IHBbaV0uYXNwZWN0X2xlZnQ7XHJcbiAgICAgICAgICAgICAgICBiLmFzcGVjdF90b3AgPSBwW2ldLmFzcGVjdF90b3A7XHJcbiAgICAgICAgICAgICAgICBiLmFzcGVjdF9zaXplID0gcFtpXS5hc3BlY3Rfc2l6ZTtcclxuICAgICAgICAgICAgICAgIGIuY29sb3IgPSBwW2ldLmNvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxsIHJlc2l6ZSB0byBmaXggYXNwZWN0c1xyXG4gICAgICAgIEdBTUUucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbigncC5jb25uZWN0aW9uJywgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgaWYoZGF0YS5wbGF5ZXIucGxheWVyX2lkICE9PSBHQU1FLm1lLnBsYXllcl9pZCl7XHJcbiAgICAgICAgICAgIHZhciBiID0gbmV3IEJhc2UoZGF0YS5wbGF5ZXIuYXNwZWN0X2xlZnQsIGRhdGEucGxheWVyLmFzcGVjdF90b3AsIGRhdGEucGxheWVyLmFzcGVjdF9zaXplLCBkYXRhLnBsYXllci5jb2xvcik7XHJcbiAgICAgICAgICAgIGIucGxheWVyX2lkID0gZGF0YS5wbGF5ZXIucGxheWVyX2lkO1xyXG4gICAgICAgICAgICBHQU1FLmJhc2VzLnB1c2goYik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnNvY2tldC5vbigncC5kaXNjb25uZWN0aW9uJywgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgdmFyIGkgPSBHQU1FLmJhc2VzLmluZGV4QnlJRChkYXRhLnBsYXllcl9pZCk7XHJcbiAgICAgICAgaWYoaSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgR0FNRS5iYXNlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oJ2IubWluaW9uJywgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgdmFyIHNvdXJjZV9pbmRleCA9IEdBTUUuYmFzZXMuaW5kZXhCeUlEKGRhdGEuc291cmNlX2lkKTtcclxuICAgICAgICB2YXIgdGFyZ2V0X2luZGV4ID0gR0FNRS5iYXNlcy5pbmRleEJ5SUQoZGF0YS50YXJnZXRfaWQpO1xyXG5cclxuICAgICAgICBpZihzb3VyY2VfaW5kZXggIT09IHVuZGVmaW5lZCAmJiB0YXJnZXRfaW5kZXggIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIEdBTUUubWluaW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgbmV3IE1pbmlvbihHQU1FLmJhc2VzW3NvdXJjZV9pbmRleF0sIEdBTUUuYmFzZXNbdGFyZ2V0X2luZGV4XSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07IiwiXHJcbmltcG9ydCB7IGRyYXdDaXJjbGUgfSBmcm9tICcuLi91dGlsL2RyYXcnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihnYW1lLCBpZCwgbGVmdCwgdG9wLCBzY2FsZSwgcmVzb3VyY2VzLCByZXNvdXJjZXNfbWF4KSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICAgIHRoaXMueCA9IC0xO1xyXG4gICAgdGhpcy55ID0gLTE7XHJcbiAgICB0aGlzLnNpemUgPSAtMTtcclxuXHJcbiAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgdGhpcy50b3AgPSB0b3A7XHJcbiAgICB0aGlzLnNjYWxlID0gc2NhbGUgfHwgMC4xO1xyXG4gICAgdGhpcy5zaGFkb3dfc2l6ZSA9IDMwO1xyXG5cclxuICAgIHRoaXMuY29sb3IgPSAnI0FBQUFBQSc7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnRhcmdldGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zcGF3bl9kZWxheSA9IDA7XHJcbiAgICB0aGlzLnNwYXduX2RlbGF5X21heCA9IDAuNTtcclxuXHJcbiAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcyB8fCAwO1xyXG4gICAgdGhpcy5yZXNvdXJjZXNfbWF4ID0gcmVzb3VyY2VzX21heDtcclxuXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuICB9XHJcblxyXG5cclxuICB1cGRhdGUodGltZSkge1xyXG4gICAgaWYodGhpcy5zcGF3bl9kZWxheSA+IDApXHJcbiAgICAgIHRoaXMuc3Bhd25fZGVsYXkgLT0gdGltZTtcclxuICB9XHJcblxyXG4gIGRyYXcoY3R4KSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG5cclxuXHJcbiAgICBpZiAodGhpcy5ob3ZlcmVkKXtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gdGhpcy5jb2xvcjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAxMDtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3RlZCl7XHJcbiAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHRoaXMuY29sb3I7XHJcbiAgICAgIGN0eC5zaGFkb3dCbHVyID0gMjA7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0NpcmNsZShjdHgsIHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUsIHRoaXMuY29sb3IsICdmaWxsJyk7XHJcblxyXG4gICAgLy8gRHJhdyB0ZXh0XHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuICAgIHZhciB0ZXh0ID0gdGhpcy5yZXNvdXJjZXMgKyAoKHRoaXMucGxheWVyKT8gJy8nICsgdGhpcy5yZXNvdXJjZXNfbWF4IDogJycpO1xyXG4gICAgdmFyIG0gPSBjdHgubWVhc3VyZVRleHQodGV4dCk7XHJcbiAgICBjdHguZmlsbFRleHQodGV4dCwgdGhpcy54IC0gbS53aWR0aC8yLCB0aGlzLnkpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA+IHRoaXMuZ2FtZS5oZWlnaHQpIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5sZWZ0O1xyXG4gICAgICB0aGlzLnkgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy50b3A7XHJcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLnNjYWxlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy54ID0gdGhpcy5nYW1lLndpZHRoIC0gKHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMudG9wKTtcclxuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMubGVmdDtcclxuICAgICAgdGhpcy5zaXplID0gdGhpcy5nYW1lLndpZHRoICogdGhpcy5zY2FsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldFBsYXllcihwbGF5ZXIpIHtcclxuICAgIGlmICh0aGlzLnBsYXllcil7XHJcbiAgICAgIHRoaXMucGxheWVyLnJlbW92ZUJhc2UodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb2xvciA9IHBsYXllci5jb2xvcjtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkQmFzZSh0aGlzKTtcclxuICB9XHJcblxyXG4gIGNhblNlbmRNaW5pb24oKSB7XHJcbiAgICByZXR1cm4gKHRoaXMuc3Bhd25fZGVsYXkgPD0gMC4wKTtcclxuICB9XHJcblxyXG4gIHNlbmRNaW5pb24oKSB7XHJcbiAgICB0aGlzLnNwYXduX2RlbGF5ID0gdGhpcy5zcGF3bl9kZWxheV9tYXg7XHJcbiAgICAtLXRoaXMucmVzb3VyY2VzO1xyXG4gIH1cclxufVxyXG4iLCJcclxuaW1wb3J0IHsgcG9pbnRJbkNpcmNsZSwgdmVjRGlzdGFuY2UgfSBmcm9tICcuLi91dGlsL21hdGgnXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW9uIHtcclxuXHJcbiAgY29uc3RydWN0b3IoaWQsIHNvdXJjZSwgdGFyZ2V0LCBzY2FsZSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICAgIHRoaXMuc291cmNlX2Jhc2UgPSBzb3VyY2U7XHJcbiAgICB0aGlzLnRhcmdldF9iYXNlID0gdGFyZ2V0O1xyXG5cclxuICAgIHRoaXMueCA9IHRoaXMuc291cmNlX2Jhc2UueDtcclxuICAgIHRoaXMueSA9IHRoaXMuc291cmNlX2Jhc2UueTtcclxuICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCAwLjAxO1xyXG4gICAgdGhpcy5zaXplID0gMTA7XHJcbiAgICB0aGlzLmNvbG9yID0gdGhpcy5zb3VyY2VfYmFzZS5jb2xvcjtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLmRlYWRfYnlfc2VydmVyID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zdGFydF90aW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdGhpcy5hY3RpdmVfdGltZSA9IDA7XHJcblxyXG4gICAgdGhpcy5zcGVlZCA9IDM7XHJcblxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSh0aW1lKSB7XHJcbiAgICB0aGlzLmFjdGl2ZV90aW1lICs9IHQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy5zb3VyY2VfYmFzZS54ICsgdGhpcy52ZWxfeCAqIHRoaXMuYWN0aXZlX3RpbWU7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnNvdXJjZV9iYXNlLnkgKyB0aGlzLnZlbF95ICogdGhpcy5hY3RpdmVfdGltZTtcclxuXHJcbiAgICBpZihwb2ludEluQ2lyY2xlKHRoaXMueCwgdGhpcy55LCB0aGlzLnRhcmdldF9iYXNlLngsIHRoaXMudGFyZ2V0X2Jhc2UueSwgdGhpcy50YXJnZXRfYmFzZS5zaXplKSl7XHJcbiAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkcmF3KGN0eCkge1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5zaXplLCBNYXRoLlBJKjIsIGZhbHNlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzaXplKCkge1xyXG4gICAgbGV0IGRlbHRhX3NwZWVkID0gKChHQU1FLndpZHRoID4gR0FNRS5oZWlnaHQpPyBHQU1FLndpZHRoIDogR0FNRS5oZWlnaHQpIC8gdGhpcy5zcGVlZDtcclxuXHJcbiAgICBsZXQgZGlzdGFuY2UgPSB2ZWNEaXN0YW5jZSh0aGlzLnNvdXJjZV9iYXNlLngsIHRoaXMuc291cmNlX2Jhc2UueSwgdGhpcy50YXJnZXRfYmFzZS54LCB0aGlzLnRhcmdldF9iYXNlLnkpO1xyXG4gICAgbGV0IGRpc3RhbmNlX3ggPSB0aGlzLnRhcmdldF9iYXNlLnggLSB0aGlzLnNvdXJjZV9iYXNlLng7XHJcbiAgICBsZXQgZGlzdGFuY2VfeSA9IHRoaXMudGFyZ2V0X2Jhc2UueSAtIHRoaXMuc291cmNlX2Jhc2UueTtcclxuXHJcbiAgICB0aGlzLnZlbF94ID0gKGRpc3RhbmNlX3ggLyBNYXRoLmFicygoZGlzdGFuY2UgLyBkZWx0YV9zcGVlZCkpKSB8fCAwO1xyXG4gICAgdGhpcy52ZWxfeSA9IChkaXN0YW5jZV95IC8gTWF0aC5hYnMoKGRpc3RhbmNlIC8gZGVsdGFfc3BlZWQpKSkgfHwgMDtcclxuXHJcbiAgICB0aGlzLnNpemUgPSAoKEdBTUUud2lkdGggPiBHQU1FLmhlaWdodCk/IEdBTUUuaGVpZ2h0IDogR0FNRS53aWR0aCkgKiB0aGlzLnNjYWxlO1xyXG4gIH1cclxuXHJcbn07IiwiXHJcbmltcG9ydCB7IGhleGNvbG9yVG9SR0IgfSBmcm9tICcuLi91dGlsL2NvbG9yJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJ0aWNsZSB7XHJcbiAgXHJcbiAgY29uc3R1Y3RvcihnYW1lLCBsZWZ0LCB0b3AsIHNjYWxlLCBjb2xvcikge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLnggPSAtMTtcclxuICAgIHRoaXMueSA9IC0xO1xyXG4gICAgdGhpcy5zaXplID0gLTE7XHJcblxyXG4gICAgdGhpcy5sZWZ0ID0gbGVmdDtcclxuICAgIHRoaXMudG9wID0gdG9wO1xyXG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlIHx8IDAuMDE7XHJcblxyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yIHx8ICcjQUFBQUFBJztcclxuICAgIHRoaXMucmdiYSA9IGhleGNvbG9yVG9SR0IodGhpcy5jb2xvcik7XHJcbiAgICB0aGlzLnJnYmFbM10gPSAxLjA7XHJcblxyXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgdGhpcy5saXZlX2NvdW50ID0gMC4wO1xyXG5cclxuICAgIHRoaXMucmVzaXplKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgdXBkYXRlKHRpbWUpIHtcclxuICAgIHRoaXMubGl2ZV9jb3VudCArPSB0aW1lO1xyXG4gICAgdGhpcy5yZ2JhWzNdIC09IHRpbWUgKiAwLjU7XHJcblxyXG4gICAgaWYgKHRoaXMucmdiYVszXSA8IDApXHJcbiAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuXHJcbiAgZHJhdyhjdHgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgbGV0IFtyLCBnLCBiLCBhXSA9IHRoaXMucmdiYTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2JhKCR7cn0sJHtnfSwke2J9LCR7YX0pYDtcclxuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUgKyAodGhpcy5saXZlX2NvdW50ICogMTApLCBNYXRoLlBJKjIsIGZhbHNlKTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcblxyXG4gIHJlc2l6ZSgpIHtcclxuICAgIGlmICh0aGlzLmdhbWUud2lkdGggPiB0aGlzLmdhbWUuaGVpZ2h0KSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMubGVmdDtcclxuICAgICAgdGhpcy55ID0gdGhpcy5nYW1lLmhlaWdodCAqIHRoaXMudG9wO1xyXG4gICAgICB0aGlzLnNpemUgPSB0aGlzLmdhbWUuaGVpZ2h0ICogdGhpcy5zY2FsZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMueCA9IHRoaXMuZ2FtZS53aWR0aCAtICh0aGlzLmdhbWUud2lkdGggKiB0aGlzLnRvcCk7XHJcbiAgICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5oZWlnaHQgKiB0aGlzLmxlZnQ7XHJcbiAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuZ2FtZS53aWR0aCAqIHRoaXMuc2NhbGU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufSIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihnYW1lLCBpZCwgbmFtZSwgY29sb3IpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgICB0aGlzLmJhc2VzX2lkID0gW107XHJcbiAgfVxyXG5cclxuICBhZGRCYXNlKGJhc2UpIHtcclxuICAgIGlmKCF0aGlzLmJhc2VzX2lkLmNvbnRhaW5zKGJhc2UuaWQpKVxyXG4gICAgICB0aGlzLmJhc2VzX2lkLnB1c2goYmFzZS5pZCk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVCYXNlKGJhc2UpIHtcclxuICAgIGxldCBpID0gdGhpcy5iYXNlc19pZC5pbmRleE9mKGJhc2UuaWQpO1xyXG4gICAgaWYoaSAhPT0gLTEpXHJcbiAgICAgIHRoaXMuYmFzZXNfaWQuc3BsaWNlKGksIDEpO1xyXG4gIH1cclxuXHJcbiAgdG90YWxSZXNvdXJjZXMoKSB7XHJcbiAgICBsZXQgdG90YWwgPSAwO1xyXG5cclxuICAgIGZvcihsZXQgaSA9IHRoaXMuYmFzZXNfaWQubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgIGxldCBiYXNlID0gdGhpcy5nYW1lLmdldEJ5SUQodGhpcy5nYW1lLmJhc2VzLCB0aGlzLmJhc2VzX2lkW2ldKTtcclxuICAgICAgdG90YWwgKz0gYmFzZS5yZXNvdXJjZXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG90YWw7XHJcbiAgfVxyXG59IiwiXHJcblxyXG5pbXBvcnQgeyByYW5kb21SYW5nZUludCB9IGZyb20gJy4vdXRpbC91dGlsLmpzJztcclxuaW1wb3J0IHsgQXVkaW9Db250ZXh0IH0gZnJvbSAnLi91dGlsL3ByZWZpeGVyLmpzJztcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmN0eCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xyXG4gICAgdGhpcy5zb3VuZF9uYW1lcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBpZiAoIUF1ZGlvQ29udGV4dCkge1xyXG4gICAgICB0aHJvdyBcIkF1ZGlvQ29udGV4dCBub3Qgc3VwcG9ydGVkIGJ5IGJyb3dzZXJcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuXHJcbiAgICB0aGlzLmluaXRTb3VuZHMoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG5cclxuICBpbml0U291bmRzKCkgeyAgXHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9jNC53YXYnLCAnYzQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Q0LndhdicsICdkNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZTQud2F2JywgJ2U0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9mNC53YXYnLCAnZjQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2c0LndhdicsICdnNCcpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYTQud2F2JywgJ2E0Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9iNC53YXYnLCAnYjQnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2M1LndhdicsICdjNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZDUud2F2JywgJ2Q1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9lNS53YXYnLCAnZTUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2Y1LndhdicsICdmNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvZzUud2F2JywgJ2c1Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9hNS53YXYnLCAnYTUnKTtcclxuICAgIHRoaXMubG9hZFNvdW5kKCcvcmVzL3NvdW5kcy9tYXJpbWJhL2I1LndhdicsICdiNScpO1xyXG4gICAgdGhpcy5sb2FkU291bmQoJy9yZXMvc291bmRzL21hcmltYmEvYzYud2F2JywgJ2M2Jyk7XHJcbiAgICB0aGlzLmxvYWRTb3VuZCgnL3Jlcy9zb3VuZHMvbWFyaW1iYS9kNi53YXYnLCAnZDYnKTtcclxuICB9XHJcblxyXG5cclxuICBsb2FkU291bmQodXJsLCBuYW1lKSB7XHJcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcclxuICAgIFxyXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jdHguZGVjb2RlQXVkaW9EYXRhKHhoci5yZXNwb25zZSwgKGJ1ZmZlcikgPT4ge1xyXG4gICAgICAgIHRoaXMuc291bmRfbmFtZXMucHVzaChuYW1lKTtcclxuICAgICAgICB0aGlzLnNvdW5kc1tuYW1lXSA9IGJ1ZmZlcjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zdGFydHVwX2V2ZW50ID09PSBudWxsKXtcclxuICAgICAgICAgIHRoaXMuc3RhcnR1cF9ldmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU291bmQoKTtcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnN0YXJ0dXBfZXZlbnQsIGZhbHNlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxuICB9XHJcblxyXG5cclxuICBwbGF5U291bmQobmFtZSkge1xyXG4gICAgaWYgKCF0aGlzLnNvdW5kc1tuYW1lXSkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBzb3VuZCA9IHRoaXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgc291bmQuYnVmZmVyID0gdGhpcy5zb3VuZHNbbmFtZV07XHJcblxyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmNyZWF0ZUdhaW5Ob2RlKDAuOCwgMC4wLCAwLjQpO1xyXG5cclxuICAgIHNvdW5kLmNvbm5lY3QoZ2Fpbik7XHJcbiAgICBnYWluLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xyXG5cclxuICAgIHNvdW5kLnN0YXJ0KDApO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlR2Fpbk5vZGUoc3RhcnQsIGVuZCwgdGltZSkge1xyXG4gICAgbGV0IG5vZGUgPSB0aGlzLmN0eC5jcmVhdGVHYWluKCk7XHJcbiAgICBsZXQgbm93ID0gdGhpcy5jdHguY3VycmVudFRpbWU7XHJcblxyXG4gICAgbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHN0YXJ0LCBub3cpO1xyXG4gICAgbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGVuZCwgbm93ICsgdGltZSk7XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfVxyXG5cclxuICBwbGF5UmFuZG9tU291bmQoKSB7XHJcbiAgICB0aGlzLnBsYXlTb3VuZCh0aGlzLnNvdW5kX25hbWVzW3JhbmRvbVJhbmdlSW50KDAsIHRoaXMuc291bmRfbmFtZXMubGVuZ3RoKV0pO1xyXG4gIH1cclxufSIsImZ1bmN0aW9uIGhleGNoYXJUb0RlYyhoZXh2YWwpe1xyXG4gICAgdmFyIGMgPSBoZXh2YWwudG9VcHBlckNhc2UoKS5jaGFyQ29kZUF0KDApO1xyXG4gICAgcmV0dXJuIChjIDwgNjApPyAoYy00OCkgOiAoYy01NSk7XHJcbn1cclxuZnVuY3Rpb24gaGV4Y29sb3JUb1JHQihoZXgpe1xyXG4gICAgaGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICB2YXIgcmdiID0gW107XHJcbiAgICB2YXIgaW5jID0gKGhleC5sZW5ndGggPCA2KT8gMSA6IDI7XHJcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBoZXgubGVuZ3RoOyBpIDwgbGVuOyBpKz1pbmMpe1xyXG4gICAgICAgIC8vIHZhciB2ID0gaGV4LnN1YnN0cihpLCBpbmMpO1xyXG4gICAgICAgIHJnYi5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoaSwgaW5jKSwgMTYpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZ2I7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaGV4Y2hhclRvRGVjLFxyXG4gICAgaGV4Y29sb3JUb1JHQlxyXG59OyIsIlxyXG5mdW5jdGlvbiBkcmF3TGluZShjdHgsIHgxLCB5MSwgeDIsIHkyLCBjb2xvciwgd2lkdGgpe1xyXG5cclxuICBpZihjb2xvcikgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgaWYod2lkdGgpIGN0eC5saW5lV2lkdGggPSB3aWR0aDtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3Q2lyY2xlKGN0eCwgeCwgeSwgciwgY29sb3IsIHN0eWxlID0gJ2ZpbGwnKXtcclxuXHJcbiAgaWYoY29sb3IpIGN0eFtzdHlsZSsnU3R5bGUnXSA9IGNvbG9yO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmFyYyh4LCB5LCByLCBNYXRoLlBJKjIsIGZhbHNlKTtcclxuICBjdHhbc3R5bGVdKCk7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBkcmF3TGluZSxcclxuICBkcmF3Q2lyY2xlXHJcbn0iLCJcclxuZnVuY3Rpb24gdmVjRGlzdGFuY2VTcSh4MSwgeTEsIHgyLCB5Mil7XHJcbiAgICByZXR1cm4gTWF0aC5wb3coeDEteDIsIDIpICsgTWF0aC5wb3coeTEteTIsIDIpO1xyXG59XHJcbmZ1bmN0aW9uIHZlY0Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKXtcclxuICAgIHJldHVybiBNYXRoLnNxcnQodmVjRGlzdGFuY2VTcSh4MSwgeTEsIHgyLCB5MikpO1xyXG59XHJcbmZ1bmN0aW9uIHBvaW50SW5DaXJjbGUocHgsIHB5LCBjeCwgY3ksIGNyKXtcclxuICAgIHJldHVybiAodmVjRGlzdGFuY2VTcShweCwgcHksIGN4LCBjeSkgPCBNYXRoLnBvdyhjciwgMikpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdmVjRGlzdGFuY2VTcSxcclxuICB2ZWNEaXN0YW5jZSxcclxuICBwb2ludEluQ2lyY2xlXHJcbn07IiwiXHJcbmxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSk7XHJcbiAgICAgICAgICAgICAgfSwgMTAwMC82MCk7XHJcbiAgICAgICAgICB9O1xyXG59KCkpO1xyXG5cclxubGV0IGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgICB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgIHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgICAgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpO1xyXG59KCkpO1xyXG5cclxuXHJcbmxldCBwZXJmb3JtYW5jZSA9IHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xyXG5wZXJmb3JtYW5jZS5ub3cgPSBwZXJmb3JtYW5jZS5ub3cgfHxcclxuICAgICAgICAgICAgICAgICAgcGVyZm9ybWFuY2Uud2Via2l0Tm93IHx8XHJcbiAgICAgICAgICAgICAgICAgIHBlcmZvcm1hbmNlLm1vek5vdyB8fFxyXG4gICAgICAgICAgICAgICAgICBwZXJmb3JtYW5jZS5tc05vdyB8fFxyXG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7IH07XHJcblxyXG5cclxubGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pOb3cgfHxcclxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc05vdyB8fFxyXG4gICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZSxcclxuICBwZXJmb3JtYW5jZSxcclxuICBBdWRpb0NvbnRleHRcclxufTsiLCJcclxuZnVuY3Rpb24gcmFuZG9tUmFuZ2UobWluLCBtYXgpe1xyXG4gICAgcmV0dXJuICgoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSkgKyBtaW4pO1xyXG59XHJcbmZ1bmN0aW9uIHJhbmRvbVJhbmdlSW50KG1pbiwgbWF4KXtcclxuICAgIHJldHVybiAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heC1taW4pKSArIG1pbik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRvbVJhbmdlLFxyXG4gIHJhbmRvbVJhbmdlSW50XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuaWYgKGdsb2JhbC5fYmFiZWxQb2x5ZmlsbCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJvbmx5IG9uZSBpbnN0YW5jZSBvZiBiYWJlbC9wb2x5ZmlsbCBpcyBhbGxvd2VkXCIpO1xufVxuZ2xvYmFsLl9iYWJlbFBvbHlmaWxsID0gdHJ1ZTtcblxucmVxdWlyZShcImNvcmUtanMvc2hpbVwiKTtcblxucmVxdWlyZShcInJlZ2VuZXJhdG9yLWJhYmVsL3J1bnRpbWVcIik7IiwiLyoqXG4gKiBDb3JlLmpzIDAuNi4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qc1xuICogTGljZW5zZTogaHR0cDovL3JvY2subWl0LWxpY2Vuc2Uub3JnXG4gKiDCqSAyMDE1IERlbmlzIFB1c2hrYXJldlxuICovXG4hZnVuY3Rpb24oZ2xvYmFsLCBmcmFtZXdvcmssIHVuZGVmaW5lZCl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLy8gU2hvcnRjdXRzIGZvciBbW0NsYXNzXV0gJiBwcm9wZXJ0eSBuYW1lc1xyXG52YXIgT0JKRUNUICAgICAgICAgID0gJ09iamVjdCdcclxuICAsIEZVTkNUSU9OICAgICAgICA9ICdGdW5jdGlvbidcclxuICAsIEFSUkFZICAgICAgICAgICA9ICdBcnJheSdcclxuICAsIFNUUklORyAgICAgICAgICA9ICdTdHJpbmcnXHJcbiAgLCBOVU1CRVIgICAgICAgICAgPSAnTnVtYmVyJ1xyXG4gICwgUkVHRVhQICAgICAgICAgID0gJ1JlZ0V4cCdcclxuICAsIERBVEUgICAgICAgICAgICA9ICdEYXRlJ1xyXG4gICwgTUFQICAgICAgICAgICAgID0gJ01hcCdcclxuICAsIFNFVCAgICAgICAgICAgICA9ICdTZXQnXHJcbiAgLCBXRUFLTUFQICAgICAgICAgPSAnV2Vha01hcCdcclxuICAsIFdFQUtTRVQgICAgICAgICA9ICdXZWFrU2V0J1xyXG4gICwgU1lNQk9MICAgICAgICAgID0gJ1N5bWJvbCdcclxuICAsIFBST01JU0UgICAgICAgICA9ICdQcm9taXNlJ1xyXG4gICwgTUFUSCAgICAgICAgICAgID0gJ01hdGgnXHJcbiAgLCBBUkdVTUVOVFMgICAgICAgPSAnQXJndW1lbnRzJ1xyXG4gICwgUFJPVE9UWVBFICAgICAgID0gJ3Byb3RvdHlwZSdcclxuICAsIENPTlNUUlVDVE9SICAgICA9ICdjb25zdHJ1Y3RvcidcclxuICAsIFRPX1NUUklORyAgICAgICA9ICd0b1N0cmluZydcclxuICAsIFRPX1NUUklOR19UQUcgICA9IFRPX1NUUklORyArICdUYWcnXHJcbiAgLCBUT19MT0NBTEUgICAgICAgPSAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgLCBIQVNfT1dOICAgICAgICAgPSAnaGFzT3duUHJvcGVydHknXHJcbiAgLCBGT1JfRUFDSCAgICAgICAgPSAnZm9yRWFjaCdcclxuICAsIElURVJBVE9SICAgICAgICA9ICdpdGVyYXRvcidcclxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQCcgKyBJVEVSQVRPUlxyXG4gICwgUFJPQ0VTUyAgICAgICAgID0gJ3Byb2Nlc3MnXHJcbiAgLCBDUkVBVEVfRUxFTUVOVCAgPSAnY3JlYXRlRWxlbWVudCdcclxuICAvLyBBbGlhc2VzIGdsb2JhbCBvYmplY3RzIGFuZCBwcm90b3R5cGVzXHJcbiAgLCBGdW5jdGlvbiAgICAgICAgPSBnbG9iYWxbRlVOQ1RJT05dXHJcbiAgLCBPYmplY3QgICAgICAgICAgPSBnbG9iYWxbT0JKRUNUXVxyXG4gICwgQXJyYXkgICAgICAgICAgID0gZ2xvYmFsW0FSUkFZXVxyXG4gICwgU3RyaW5nICAgICAgICAgID0gZ2xvYmFsW1NUUklOR11cclxuICAsIE51bWJlciAgICAgICAgICA9IGdsb2JhbFtOVU1CRVJdXHJcbiAgLCBSZWdFeHAgICAgICAgICAgPSBnbG9iYWxbUkVHRVhQXVxyXG4gICwgRGF0ZSAgICAgICAgICAgID0gZ2xvYmFsW0RBVEVdXHJcbiAgLCBNYXAgICAgICAgICAgICAgPSBnbG9iYWxbTUFQXVxyXG4gICwgU2V0ICAgICAgICAgICAgID0gZ2xvYmFsW1NFVF1cclxuICAsIFdlYWtNYXAgICAgICAgICA9IGdsb2JhbFtXRUFLTUFQXVxyXG4gICwgV2Vha1NldCAgICAgICAgID0gZ2xvYmFsW1dFQUtTRVRdXHJcbiAgLCBTeW1ib2wgICAgICAgICAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICwgTWF0aCAgICAgICAgICAgID0gZ2xvYmFsW01BVEhdXHJcbiAgLCBUeXBlRXJyb3IgICAgICAgPSBnbG9iYWwuVHlwZUVycm9yXHJcbiAgLCBSYW5nZUVycm9yICAgICAgPSBnbG9iYWwuUmFuZ2VFcnJvclxyXG4gICwgc2V0VGltZW91dCAgICAgID0gZ2xvYmFsLnNldFRpbWVvdXRcclxuICAsIHNldEltbWVkaWF0ZSAgICA9IGdsb2JhbC5zZXRJbW1lZGlhdGVcclxuICAsIGNsZWFySW1tZWRpYXRlICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxyXG4gICwgcGFyc2VJbnQgICAgICAgID0gZ2xvYmFsLnBhcnNlSW50XHJcbiAgLCBpc0Zpbml0ZSAgICAgICAgPSBnbG9iYWwuaXNGaW5pdGVcclxuICAsIHByb2Nlc3MgICAgICAgICA9IGdsb2JhbFtQUk9DRVNTXVxyXG4gICwgbmV4dFRpY2sgICAgICAgID0gcHJvY2VzcyAmJiBwcm9jZXNzLm5leHRUaWNrXHJcbiAgLCBkb2N1bWVudCAgICAgICAgPSBnbG9iYWwuZG9jdW1lbnRcclxuICAsIGh0bWwgICAgICAgICAgICA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxyXG4gICwgbmF2aWdhdG9yICAgICAgID0gZ2xvYmFsLm5hdmlnYXRvclxyXG4gICwgZGVmaW5lICAgICAgICAgID0gZ2xvYmFsLmRlZmluZVxyXG4gICwgY29uc29sZSAgICAgICAgID0gZ2xvYmFsLmNvbnNvbGUgfHwge31cclxuICAsIEFycmF5UHJvdG8gICAgICA9IEFycmF5W1BST1RPVFlQRV1cclxuICAsIE9iamVjdFByb3RvICAgICA9IE9iamVjdFtQUk9UT1RZUEVdXHJcbiAgLCBGdW5jdGlvblByb3RvICAgPSBGdW5jdGlvbltQUk9UT1RZUEVdXHJcbiAgLCBJbmZpbml0eSAgICAgICAgPSAxIC8gMFxyXG4gICwgRE9UICAgICAgICAgICAgID0gJy4nO1xyXG5cclxuLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XHJcbiAgcmV0dXJuIGl0ICE9PSBudWxsICYmICh0eXBlb2YgaXQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGl0ID09ICdmdW5jdGlvbicpO1xyXG59XHJcbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJztcclxufVxyXG4vLyBOYXRpdmUgZnVuY3Rpb24/XHJcbnZhciBpc05hdGl2ZSA9IGN0eCgvLi8udGVzdCwgL1xcW25hdGl2ZSBjb2RlXFxdXFxzKlxcfVxccyokLywgMSk7XHJcblxyXG4vLyBPYmplY3QgaW50ZXJuYWwgW1tDbGFzc11dIG9yIHRvU3RyaW5nVGFnXHJcbi8vIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcclxudmFyIHRvU3RyaW5nID0gT2JqZWN0UHJvdG9bVE9fU1RSSU5HXTtcclxuZnVuY3Rpb24gc2V0VG9TdHJpbmdUYWcoaXQsIHRhZywgc3RhdCl7XHJcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0W1BST1RPVFlQRV0sIFNZTUJPTF9UQUcpKWhpZGRlbihpdCwgU1lNQk9MX1RBRywgdGFnKTtcclxufVxyXG5mdW5jdGlvbiBjb2YoaXQpe1xyXG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XHJcbn1cclxuZnVuY3Rpb24gY2xhc3NvZihpdCl7XHJcbiAgdmFyIE8sIFQ7XHJcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xyXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1NZTUJPTF9UQUddKSA9PSAnc3RyaW5nJyA/IFQgOiBjb2YoTyk7XHJcbn1cclxuXHJcbi8vIEZ1bmN0aW9uXHJcbnZhciBjYWxsICA9IEZ1bmN0aW9uUHJvdG8uY2FsbFxyXG4gICwgYXBwbHkgPSBGdW5jdGlvblByb3RvLmFwcGx5XHJcbiAgLCBSRUZFUkVOQ0VfR0VUO1xyXG4vLyBQYXJ0aWFsIGFwcGx5XHJcbmZ1bmN0aW9uIHBhcnQoLyogLi4uYXJncyAqLyl7XHJcbiAgdmFyIGZuICAgICA9IGFzc2VydEZ1bmN0aW9uKHRoaXMpXHJcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJncyAgID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIF8gICAgICA9IHBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXHJcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBpID0gMCwgaiA9IDAsIF9hcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICAgIF9hcmdzID0gYXJncy5zbGljZSgpO1xyXG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gaTsgaSsrKWlmKF9hcmdzW2ldID09PSBfKV9hcmdzW2ldID0gYXJndW1lbnRzW2orK107XHJcbiAgICB3aGlsZShfbGVuZ3RoID4gailfYXJncy5wdXNoKGFyZ3VtZW50c1tqKytdKTtcclxuICAgIHJldHVybiBpbnZva2UoZm4sIF9hcmdzLCB0aGF0KTtcclxuICB9XHJcbn1cclxuLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXHJcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCwgbGVuZ3RoKXtcclxuICBhc3NlcnRGdW5jdGlvbihmbik7XHJcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xyXG4gIHN3aXRjaChsZW5ndGgpe1xyXG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICB9XHJcbn1cclxuLy8gRmFzdCBhcHBseVxyXG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcclxuZnVuY3Rpb24gaW52b2tlKGZuLCBhcmdzLCB0aGF0KXtcclxuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XHJcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoIHwgMCl7XHJcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcclxuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcclxuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcclxuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcclxuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcclxuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XHJcbn1cclxuXHJcbi8vIE9iamVjdDpcclxudmFyIGNyZWF0ZSAgICAgICAgICAgPSBPYmplY3QuY3JlYXRlXHJcbiAgLCBnZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LmdldFByb3RvdHlwZU9mXHJcbiAgLCBzZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LnNldFByb3RvdHlwZU9mXHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XHJcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXNcclxuICAsIGdldE93bkRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXHJcbiAgLCBnZXRLZXlzICAgICAgICAgID0gT2JqZWN0LmtleXNcclxuICAsIGdldE5hbWVzICAgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gICwgZ2V0U3ltYm9scyAgICAgICA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHNcclxuICAsIGlzRnJvemVuICAgICAgICAgPSBPYmplY3QuaXNGcm96ZW5cclxuICAsIGhhcyAgICAgICAgICAgICAgPSBjdHgoY2FsbCwgT2JqZWN0UHJvdG9bSEFTX09XTl0sIDIpXHJcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXHJcbiAgLCBFUzVPYmplY3QgICAgICAgID0gT2JqZWN0XHJcbiAgLCBEaWN0O1xyXG5mdW5jdGlvbiB0b09iamVjdChpdCl7XHJcbiAgcmV0dXJuIEVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gcmV0dXJuSXQoaXQpe1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5UaGlzKCl7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuZnVuY3Rpb24gZ2V0KG9iamVjdCwga2V5KXtcclxuICBpZihoYXMob2JqZWN0LCBrZXkpKXJldHVybiBvYmplY3Rba2V5XTtcclxufVxyXG5mdW5jdGlvbiBvd25LZXlzKGl0KXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHJldHVybiBnZXRTeW1ib2xzID8gZ2V0TmFtZXMoaXQpLmNvbmNhdChnZXRTeW1ib2xzKGl0KSkgOiBnZXROYW1lcyhpdCk7XHJcbn1cclxuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxyXG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSl7XHJcbiAgdmFyIFQgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxyXG4gICAgICAsIGtleXMgICA9IGdldEtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn1cclxuZnVuY3Rpb24ga2V5T2Yob2JqZWN0LCBlbCl7XHJcbiAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59XHJcblxyXG4vLyBBcnJheVxyXG4vLyBhcnJheSgnc3RyMSxzdHIyLHN0cjMnKSA9PiBbJ3N0cjEnLCAnc3RyMicsICdzdHIzJ11cclxuZnVuY3Rpb24gYXJyYXkoaXQpe1xyXG4gIHJldHVybiBTdHJpbmcoaXQpLnNwbGl0KCcsJyk7XHJcbn1cclxudmFyIHB1c2ggICAgPSBBcnJheVByb3RvLnB1c2hcclxuICAsIHVuc2hpZnQgPSBBcnJheVByb3RvLnVuc2hpZnRcclxuICAsIHNsaWNlICAgPSBBcnJheVByb3RvLnNsaWNlXHJcbiAgLCBzcGxpY2UgID0gQXJyYXlQcm90by5zcGxpY2VcclxuICAsIGluZGV4T2YgPSBBcnJheVByb3RvLmluZGV4T2ZcclxuICAsIGZvckVhY2ggPSBBcnJheVByb3RvW0ZPUl9FQUNIXTtcclxuLypcclxuICogMCAtPiBmb3JFYWNoXHJcbiAqIDEgLT4gbWFwXHJcbiAqIDIgLT4gZmlsdGVyXHJcbiAqIDMgLT4gc29tZVxyXG4gKiA0IC0+IGV2ZXJ5XHJcbiAqIDUgLT4gZmluZFxyXG4gKiA2IC0+IGZpbmRJbmRleFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlNZXRob2QodHlwZSl7XHJcbiAgdmFyIGlzTWFwICAgICAgID0gdHlwZSA9PSAxXHJcbiAgICAsIGlzRmlsdGVyICAgID0gdHlwZSA9PSAyXHJcbiAgICAsIGlzU29tZSAgICAgID0gdHlwZSA9PSAzXHJcbiAgICAsIGlzRXZlcnkgICAgID0gdHlwZSA9PSA0XHJcbiAgICAsIGlzRmluZEluZGV4ID0gdHlwZSA9PSA2XHJcbiAgICAsIG5vaG9sZXMgICAgID0gdHlwZSA9PSA1IHx8IGlzRmluZEluZGV4O1xyXG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIHRoYXQgICA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAsIHNlbGYgICA9IEVTNU9iamVjdChPKVxyXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBpc01hcCA/IEFycmF5KGxlbmd0aCkgOiBpc0ZpbHRlciA/IFtdIDogdW5kZWZpbmVkXHJcbiAgICAgICwgdmFsLCByZXM7XHJcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKG5vaG9sZXMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZih0eXBlKXtcclxuICAgICAgICBpZihpc01hcClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoaXNFdmVyeSlyZXR1cm4gZmFsc2U7ICAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNGaW5kSW5kZXggPyAtMSA6IGlzU29tZSB8fCBpc0V2ZXJ5ID8gaXNFdmVyeSA6IHJlc3VsdDtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlDb250YWlucyhpc0NvbnRhaW5zKXtcclxuICByZXR1cm4gZnVuY3Rpb24oZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aCk7XHJcbiAgICBpZihpc0NvbnRhaW5zICYmIGVsICE9IGVsKXtcclxuICAgICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihzYW1lTmFOKE9baW5kZXhdKSlyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKGlzQ29udGFpbnMgfHwgaW5kZXggaW4gTyl7XHJcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gcmV0dXJuICFpc0NvbnRhaW5zICYmIC0xO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBnZW5lcmljKEEsIEIpe1xyXG4gIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgdnMgaXNGdW5jdGlvblxyXG4gIHJldHVybiB0eXBlb2YgQSA9PSAnZnVuY3Rpb24nID8gQSA6IEI7XHJcbn1cclxuXHJcbi8vIE1hdGhcclxudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmIC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcclxuICAsIHBvdyAgICA9IE1hdGgucG93XHJcbiAgLCBhYnMgICAgPSBNYXRoLmFic1xyXG4gICwgY2VpbCAgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciAgPSBNYXRoLmZsb29yXHJcbiAgLCBtYXggICAgPSBNYXRoLm1heFxyXG4gICwgbWluICAgID0gTWF0aC5taW5cclxuICAsIHJhbmRvbSA9IE1hdGgucmFuZG9tXHJcbiAgLCB0cnVuYyAgPSBNYXRoLnRydW5jIHx8IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxuICAgIH1cclxuLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuZnVuY3Rpb24gc2FtZU5hTihudW1iZXIpe1xyXG4gIHJldHVybiBudW1iZXIgIT0gbnVtYmVyO1xyXG59XHJcbi8vIDcuMS40IFRvSW50ZWdlclxyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiBpc05hTihpdCkgPyAwIDogdHJ1bmMoaXQpO1xyXG59XHJcbi8vIDcuMS4xNSBUb0xlbmd0aFxyXG5mdW5jdGlvbiB0b0xlbmd0aChpdCl7XHJcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCBNQVhfU0FGRV9JTlRFR0VSKSA6IDA7XHJcbn1cclxuZnVuY3Rpb24gdG9JbmRleChpbmRleCwgbGVuZ3RoKXtcclxuICB2YXIgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xyXG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xyXG59XHJcbmZ1bmN0aW9uIGx6KG51bSl7XHJcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVJlcGxhY2VyKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xyXG4gIHZhciByZXBsYWNlciA9IGlzT2JqZWN0KHJlcGxhY2UpID8gZnVuY3Rpb24ocGFydCl7XHJcbiAgICByZXR1cm4gcmVwbGFjZVtwYXJ0XTtcclxuICB9IDogcmVwbGFjZTtcclxuICByZXR1cm4gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIFN0cmluZyhpc1N0YXRpYyA/IGl0IDogdGhpcykucmVwbGFjZShyZWdFeHAsIHJlcGxhY2VyKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlUG9pbnRBdCh0b1N0cmluZyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHBvcyl7XHJcbiAgICB2YXIgcyA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxyXG4gICAgICAsIGwgPSBzLmxlbmd0aFxyXG4gICAgICAsIGEsIGI7XHJcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIHRvU3RyaW5nID8gJycgOiB1bmRlZmluZWQ7XHJcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcclxuICAgICAgPyB0b1N0cmluZyA/IHMuY2hhckF0KGkpIDogYVxyXG4gICAgICA6IHRvU3RyaW5nID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQXNzZXJ0aW9uICYgZXJyb3JzXHJcbnZhciBSRURVQ0VfRVJST1IgPSAnUmVkdWNlIG9mIGVtcHR5IG9iamVjdCB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcclxuICBpZighY29uZGl0aW9uKXRocm93IFR5cGVFcnJvcihtc2cyID8gbXNnMSArIG1zZzIgOiBtc2cxKTtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcclxuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0RnVuY3Rpb24oaXQpe1xyXG4gIGFzc2VydChpc0Z1bmN0aW9uKGl0KSwgaXQsICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydE9iamVjdChpdCl7XHJcbiAgYXNzZXJ0KGlzT2JqZWN0KGl0KSwgaXQsICcgaXMgbm90IGFuIG9iamVjdCEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0SW5zdGFuY2UoaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcclxuICBhc3NlcnQoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvciwgbmFtZSwgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xyXG59XHJcblxyXG4vLyBQcm9wZXJ0eSBkZXNjcmlwdG9ycyAmIFN5bWJvbFxyXG5mdW5jdGlvbiBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpe1xyXG4gIHJldHVybiB7XHJcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXHJcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXHJcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXHJcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNpbXBsZVNldChvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gIG9iamVjdFtrZXldID0gdmFsdWU7XHJcbiAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XHJcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpKTtcclxuICB9IDogc2ltcGxlU2V0O1xyXG59XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiBTWU1CT0wgKyAnKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgcmFuZG9tKCkpW1RPX1NUUklOR10oMzYpO1xyXG59XHJcbmZ1bmN0aW9uIGdldFdlbGxLbm93blN5bWJvbChuYW1lLCBzZXR0ZXIpe1xyXG4gIHJldHVybiAoU3ltYm9sICYmIFN5bWJvbFtuYW1lXSkgfHwgKHNldHRlciA/IFN5bWJvbCA6IHNhZmVTeW1ib2wpKFNZTUJPTCArIERPVCArIG5hbWUpO1xyXG59XHJcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxyXG52YXIgREVTQyA9ICEhZnVuY3Rpb24oKXtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDIgfX0pLmEgPT0gMjtcclxuICAgICAgfSBjYXRjaChlKXt9XHJcbiAgICB9KClcclxuICAsIHNpZCAgICA9IDBcclxuICAsIGhpZGRlbiA9IGNyZWF0ZURlZmluZXIoMSlcclxuICAsIHNldCAgICA9IFN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGRlblxyXG4gICwgc2FmZVN5bWJvbCA9IFN5bWJvbCB8fCB1aWQ7XHJcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbih0YXJnZXQsIHNyYyl7XHJcbiAgZm9yKHZhciBrZXkgaW4gc3JjKWhpZGRlbih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gIHJldHVybiB0YXJnZXQ7XHJcbn1cclxuXHJcbnZhciBTWU1CT0xfVU5TQ09QQUJMRVMgPSBnZXRXZWxsS25vd25TeW1ib2woJ3Vuc2NvcGFibGVzJylcclxuICAsIEFycmF5VW5zY29wYWJsZXMgICA9IEFycmF5UHJvdG9bU1lNQk9MX1VOU0NPUEFCTEVTXSB8fCB7fVxyXG4gICwgU1lNQk9MX1RBRyAgICAgICAgID0gZ2V0V2VsbEtub3duU3ltYm9sKFRPX1NUUklOR19UQUcpXHJcbiAgLCBTWU1CT0xfU1BFQ0lFUyAgICAgPSBnZXRXZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKVxyXG4gICwgU1lNQk9MX0lURVJBVE9SO1xyXG5mdW5jdGlvbiBzZXRTcGVjaWVzKEMpe1xyXG4gIGlmKERFU0MgJiYgKGZyYW1ld29yayB8fCAhaXNOYXRpdmUoQykpKWRlZmluZVByb3BlcnR5KEMsIFNZTUJPTF9TUEVDSUVTLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IHJldHVyblRoaXNcclxuICB9KTtcclxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb21tb24uZXhwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgTk9ERSA9IGNvZihwcm9jZXNzKSA9PSBQUk9DRVNTXHJcbiAgLCBjb3JlID0ge31cclxuICAsIHBhdGggPSBmcmFtZXdvcmsgPyBnbG9iYWwgOiBjb3JlXHJcbiAgLCBvbGQgID0gZ2xvYmFsLmNvcmVcclxuICAsIGV4cG9ydEdsb2JhbFxyXG4gIC8vIHR5cGUgYml0bWFwXHJcbiAgLCBGT1JDRUQgPSAxXHJcbiAgLCBHTE9CQUwgPSAyXHJcbiAgLCBTVEFUSUMgPSA0XHJcbiAgLCBQUk9UTyAgPSA4XHJcbiAgLCBCSU5EICAgPSAxNlxyXG4gICwgV1JBUCAgID0gMzI7XHJcbmZ1bmN0aW9uICRkZWZpbmUodHlwZSwgbmFtZSwgc291cmNlKXtcclxuICB2YXIga2V5LCBvd24sIG91dCwgZXhwXHJcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmIEdMT0JBTFxyXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogKHR5cGUgJiBTVEFUSUMpXHJcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IE9iamVjdFByb3RvKVtQUk9UT1RZUEVdXHJcbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcclxuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xyXG4gIGZvcihrZXkgaW4gc291cmNlKXtcclxuICAgIC8vIHRoZXJlIGlzIGEgc2ltaWxhciBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmIEZPUkNFRCkgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXRcclxuICAgICAgJiYgKCFpc0Z1bmN0aW9uKHRhcmdldFtrZXldKSB8fCBpc05hdGl2ZSh0YXJnZXRba2V5XSkpO1xyXG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcclxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XHJcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcclxuICAgIGlmKCFmcmFtZXdvcmsgJiYgaXNHbG9iYWwgJiYgIWlzRnVuY3Rpb24odGFyZ2V0W2tleV0pKWV4cCA9IHNvdXJjZVtrZXldO1xyXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcclxuICAgIGVsc2UgaWYodHlwZSAmIEJJTkQgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XHJcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxyXG4gICAgZWxzZSBpZih0eXBlICYgV1JBUCAmJiAhZnJhbWV3b3JrICYmIHRhcmdldFtrZXldID09IG91dCl7XHJcbiAgICAgIGV4cCA9IGZ1bmN0aW9uKHBhcmFtKXtcclxuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIG91dCA/IG5ldyBvdXQocGFyYW0pIDogb3V0KHBhcmFtKTtcclxuICAgICAgfVxyXG4gICAgICBleHBbUFJPVE9UWVBFXSA9IG91dFtQUk9UT1RZUEVdO1xyXG4gICAgfSBlbHNlIGV4cCA9IHR5cGUgJiBQUk9UTyAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4dGVuZCBnbG9iYWxcclxuICAgIGlmKGZyYW1ld29yayAmJiB0YXJnZXQgJiYgIW93bil7XHJcbiAgICAgIGlmKGlzR2xvYmFsKXRhcmdldFtrZXldID0gb3V0O1xyXG4gICAgICBlbHNlIGRlbGV0ZSB0YXJnZXRba2V5XSAmJiBoaWRkZW4odGFyZ2V0LCBrZXksIG91dCk7XHJcbiAgICB9XHJcbiAgICAvLyBleHBvcnRcclxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZGVuKGV4cG9ydHMsIGtleSwgZXhwKTtcclxuICB9XHJcbn1cclxuLy8gQ29tbW9uSlMgZXhwb3J0XHJcbmlmKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xyXG4vLyBSZXF1aXJlSlMgZXhwb3J0XHJcbmVsc2UgaWYoaXNGdW5jdGlvbihkZWZpbmUpICYmIGRlZmluZS5hbWQpZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGNvcmV9KTtcclxuLy8gRXhwb3J0IHRvIGdsb2JhbCBvYmplY3RcclxuZWxzZSBleHBvcnRHbG9iYWwgPSB0cnVlO1xyXG5pZihleHBvcnRHbG9iYWwgfHwgZnJhbWV3b3JrKXtcclxuICBjb3JlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xyXG4gICAgZ2xvYmFsLmNvcmUgPSBvbGQ7XHJcbiAgICByZXR1cm4gY29yZTtcclxuICB9XHJcbiAgZ2xvYmFsLmNvcmUgPSBjb3JlO1xyXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbi5pdGVyYXRvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblNZTUJPTF9JVEVSQVRPUiA9IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUik7XHJcbnZhciBJVEVSICA9IHNhZmVTeW1ib2woJ2l0ZXInKVxyXG4gICwgS0VZICAgPSAxXHJcbiAgLCBWQUxVRSA9IDJcclxuICAsIEl0ZXJhdG9ycyA9IHt9XHJcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9XHJcbiAgICAvLyBTYWZhcmkgaGFzIGJ5Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXHJcbiAgLCBCVUdHWV9JVEVSQVRPUlMgPSAna2V5cycgaW4gQXJyYXlQcm90byAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpO1xyXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxyXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgcmV0dXJuVGhpcyk7XHJcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcclxuICBoaWRkZW4oTywgU1lNQk9MX0lURVJBVE9SLCB2YWx1ZSk7XHJcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxyXG4gIEZGX0lURVJBVE9SIGluIEFycmF5UHJvdG8gJiYgaGlkZGVuKE8sIEZGX0lURVJBVE9SLCB2YWx1ZSk7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcclxuICBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdID0gY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xyXG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xyXG59XHJcbmZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yKENvbnN0cnVjdG9yLCBOQU1FLCB2YWx1ZSwgREVGQVVMVCl7XHJcbiAgdmFyIHByb3RvID0gQ29uc3RydWN0b3JbUFJPVE9UWVBFXVxyXG4gICAgLCBpdGVyICA9IGdldChwcm90bywgU1lNQk9MX0lURVJBVE9SKSB8fCBnZXQocHJvdG8sIEZGX0lURVJBVE9SKSB8fCAoREVGQVVMVCAmJiBnZXQocHJvdG8sIERFRkFVTFQpKSB8fCB2YWx1ZTtcclxuICBpZihmcmFtZXdvcmspe1xyXG4gICAgLy8gRGVmaW5lIGl0ZXJhdG9yXHJcbiAgICBzZXRJdGVyYXRvcihwcm90bywgaXRlcik7XHJcbiAgICBpZihpdGVyICE9PSB2YWx1ZSl7XHJcbiAgICAgIHZhciBpdGVyUHJvdG8gPSBnZXRQcm90b3R5cGVPZihpdGVyLmNhbGwobmV3IENvbnN0cnVjdG9yKSk7XHJcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgICAgc2V0VG9TdHJpbmdUYWcoaXRlclByb3RvLCBOQU1FICsgJyBJdGVyYXRvcicsIHRydWUpO1xyXG4gICAgICAvLyBGRiBmaXhcclxuICAgICAgaGFzKHByb3RvLCBGRl9JVEVSQVRPUikgJiYgc2V0SXRlcmF0b3IoaXRlclByb3RvLCByZXR1cm5UaGlzKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxyXG4gIEl0ZXJhdG9yc1tOQU1FXSA9IGl0ZXI7XHJcbiAgLy8gRkYgJiB2OCBmaXhcclxuICBJdGVyYXRvcnNbTkFNRSArICcgSXRlcmF0b3InXSA9IHJldHVyblRoaXM7XHJcbiAgcmV0dXJuIGl0ZXI7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lU3RkSXRlcmF0b3JzKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQpe1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZXIoa2luZCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTtcclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xyXG4gIHZhciBlbnRyaWVzID0gY3JlYXRlSXRlcihLRVkrVkFMVUUpXHJcbiAgICAsIHZhbHVlcyAgPSBjcmVhdGVJdGVyKFZBTFVFKTtcclxuICBpZihERUZBVUxUID09IFZBTFVFKXZhbHVlcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIHZhbHVlcywgJ3ZhbHVlcycpO1xyXG4gIGVsc2UgZW50cmllcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIGVudHJpZXMsICdlbnRyaWVzJyk7XHJcbiAgaWYoREVGQVVMVCl7XHJcbiAgICAkZGVmaW5lKFBST1RPICsgRk9SQ0VEICogQlVHR1lfSVRFUkFUT1JTLCBOQU1FLCB7XHJcbiAgICAgIGVudHJpZXM6IGVudHJpZXMsXHJcbiAgICAgIGtleXM6IElTX1NFVCA/IHZhbHVlcyA6IGNyZWF0ZUl0ZXIoS0VZKSxcclxuICAgICAgdmFsdWVzOiB2YWx1ZXNcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBpdGVyUmVzdWx0KGRvbmUsIHZhbHVlKXtcclxuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxufVxyXG5mdW5jdGlvbiBpc0l0ZXJhYmxlKGl0KXtcclxuICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxyXG4gICAgLCBTeW1ib2wgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBoYXNFeHQgPSAoU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1IpIGluIE87XHJcbiAgcmV0dXJuIGhhc0V4dCB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gTyB8fCBoYXMoSXRlcmF0b3JzLCBjbGFzc29mKE8pKTtcclxufVxyXG5mdW5jdGlvbiBnZXRJdGVyYXRvcihpdCl7XHJcbiAgdmFyIFN5bWJvbCAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1JdXHJcbiAgICAsIGdldEl0ZXIgPSBleHQgfHwgaXRbU1lNQk9MX0lURVJBVE9SXSB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xyXG4gIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gc3RlcENhbGwoZm4sIHZhbHVlLCBlbnRyaWVzKXtcclxuICByZXR1cm4gZW50cmllcyA/IGludm9rZShmbiwgdmFsdWUpIDogZm4odmFsdWUpO1xyXG59XHJcbmZ1bmN0aW9uIGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoZm4pe1xyXG4gIHZhciBkYW5nZXIgPSB0cnVlO1xyXG4gIHZhciBPID0ge1xyXG4gICAgbmV4dDogZnVuY3Rpb24oKXsgdGhyb3cgMSB9LFxyXG4gICAgJ3JldHVybic6IGZ1bmN0aW9uKCl7IGRhbmdlciA9IGZhbHNlIH1cclxuICB9O1xyXG4gIE9bU1lNQk9MX0lURVJBVE9SXSA9IHJldHVyblRoaXM7XHJcbiAgdHJ5IHtcclxuICAgIGZuKE8pO1xyXG4gIH0gY2F0Y2goZSl7fVxyXG4gIHJldHVybiBkYW5nZXI7XHJcbn1cclxuZnVuY3Rpb24gY2xvc2VJdGVyYXRvcihpdGVyYXRvcil7XHJcbiAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcclxuICBpZihyZXQgIT09IHVuZGVmaW5lZClyZXQuY2FsbChpdGVyYXRvcik7XHJcbn1cclxuZnVuY3Rpb24gc2FmZUl0ZXJDbG9zZShleGVjLCBpdGVyYXRvcil7XHJcbiAgdHJ5IHtcclxuICAgIGV4ZWMoaXRlcmF0b3IpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGZvck9mKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XHJcbiAgc2FmZUl0ZXJDbG9zZShmdW5jdGlvbihpdGVyYXRvcil7XHJcbiAgICB2YXIgZiA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxyXG4gICAgICAsIHN0ZXA7XHJcbiAgICB3aGlsZSghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpaWYoc3RlcENhbGwoZiwgc3RlcC52YWx1ZSwgZW50cmllcykgPT09IGZhbHNlKXtcclxuICAgICAgcmV0dXJuIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3IpO1xyXG4gICAgfVxyXG4gIH0sIGdldEl0ZXJhdG9yKGl0ZXJhYmxlKSk7XHJcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnN5bWJvbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxyXG4hZnVuY3Rpb24oVEFHLCBTeW1ib2xSZWdpc3RyeSwgQWxsU3ltYm9scywgc2V0dGVyKXtcclxuICAvLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcclxuICBpZighaXNOYXRpdmUoU3ltYm9sKSl7XHJcbiAgICBTeW1ib2wgPSBmdW5jdGlvbihkZXNjcmlwdGlvbil7XHJcbiAgICAgIGFzc2VydCghKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpLCBTWU1CT0wgKyAnIGlzIG5vdCBhICcgKyBDT05TVFJVQ1RPUik7XHJcbiAgICAgIHZhciB0YWcgPSB1aWQoZGVzY3JpcHRpb24pXHJcbiAgICAgICAgLCBzeW0gPSBzZXQoY3JlYXRlKFN5bWJvbFtQUk9UT1RZUEVdKSwgVEFHLCB0YWcpO1xyXG4gICAgICBBbGxTeW1ib2xzW3RhZ10gPSBzeW07XHJcbiAgICAgIERFU0MgJiYgc2V0dGVyICYmIGRlZmluZVByb3BlcnR5KE9iamVjdFByb3RvLCB0YWcsIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICBoaWRkZW4odGhpcywgdGFnLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHN5bTtcclxuICAgIH1cclxuICAgIGhpZGRlbihTeW1ib2xbUFJPVE9UWVBFXSwgVE9fU1RSSU5HLCBmdW5jdGlvbigpe1xyXG4gICAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gICRkZWZpbmUoR0xPQkFMICsgV1JBUCwge1N5bWJvbDogU3ltYm9sfSk7XHJcbiAgXHJcbiAgdmFyIHN5bWJvbFN0YXRpY3MgPSB7XHJcbiAgICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcclxuICAgICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXHJcbiAgICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXHJcbiAgICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gU3ltYm9sKGtleSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXHJcbiAgICBpdGVyYXRvcjogU1lNQk9MX0lURVJBVE9SIHx8IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUiksXHJcbiAgICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcclxuICAgIGtleUZvcjogcGFydC5jYWxsKGtleU9mLCBTeW1ib2xSZWdpc3RyeSksXHJcbiAgICAvLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuICAgIHNwZWNpZXM6IFNZTUJPTF9TUEVDSUVTLFxyXG4gICAgLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xyXG4gICAgdG9TdHJpbmdUYWc6IFNZTUJPTF9UQUcgPSBnZXRXZWxsS25vd25TeW1ib2woVE9fU1RSSU5HX1RBRywgdHJ1ZSksXHJcbiAgICAvLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXHJcbiAgICB1bnNjb3BhYmxlczogU1lNQk9MX1VOU0NPUEFCTEVTLFxyXG4gICAgcHVyZTogc2FmZVN5bWJvbCxcclxuICAgIHNldDogc2V0LFxyXG4gICAgdXNlU2V0dGVyOiBmdW5jdGlvbigpe3NldHRlciA9IHRydWV9LFxyXG4gICAgdXNlU2ltcGxlOiBmdW5jdGlvbigpe3NldHRlciA9IGZhbHNlfVxyXG4gIH07XHJcbiAgLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXHJcbiAgLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxyXG4gIC8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxyXG4gIC8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXHJcbiAgLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4gIC8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcclxuICAvLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbiAgZm9yRWFjaC5jYWxsKGFycmF5KCdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BsaXQsdG9QcmltaXRpdmUnKSxcclxuICAgIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgc3ltYm9sU3RhdGljc1tpdF0gPSBnZXRXZWxsS25vd25TeW1ib2woaXQpO1xyXG4gICAgfVxyXG4gICk7XHJcbiAgJGRlZmluZShTVEFUSUMsIFNZTUJPTCwgc3ltYm9sU3RhdGljcyk7XHJcbiAgXHJcbiAgc2V0VG9TdHJpbmdUYWcoU3ltYm9sLCBTWU1CT0wpO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogIWlzTmF0aXZlKFN5bWJvbCksIE9CSkVDVCwge1xyXG4gICAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICAgIGdldE93blByb3BlcnR5TmFtZXM6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgdmFyIG5hbWVzID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKSwgcmVzdWx0ID0gW10sIGtleSwgaSA9IDA7XHJcbiAgICAgIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxyXG4gICAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHZhciBuYW1lcyA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSksIHJlc3VsdCA9IFtdLCBrZXksIGkgPSAwO1xyXG4gICAgICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cclxuICBzZXRUb1N0cmluZ1RhZyhNYXRoLCBNQVRILCB0cnVlKTtcclxuICAvLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxyXG4gIHNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xyXG59KHNhZmVTeW1ib2woJ3RhZycpLCB7fSwge30sIHRydWUpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgb2JqZWN0U3RhdGljID0ge1xyXG4gICAgLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxuICAgIGFzc2lnbjogYXNzaWduLFxyXG4gICAgLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcclxuICAgIGlzOiBmdW5jdGlvbih4LCB5KXtcclxuICAgICAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxyXG4gIC8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrcyB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cclxuICAnX19wcm90b19fJyBpbiBPYmplY3RQcm90byAmJiBmdW5jdGlvbihidWdneSwgc2V0KXtcclxuICAgIHRyeSB7XHJcbiAgICAgIHNldCA9IGN0eChjYWxsLCBnZXRPd25EZXNjcmlwdG9yKE9iamVjdFByb3RvLCAnX19wcm90b19fJykuc2V0LCAyKTtcclxuICAgICAgc2V0KHt9LCBBcnJheVByb3RvKTtcclxuICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZSB9XHJcbiAgICBvYmplY3RTdGF0aWMuc2V0UHJvdG90eXBlT2YgPSBzZXRQcm90b3R5cGVPZiA9IHNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8sIHByb3RvKXtcclxuICAgICAgYXNzZXJ0T2JqZWN0KE8pO1xyXG4gICAgICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgaXNPYmplY3QocHJvdG8pLCBwcm90bywgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xyXG4gICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xyXG4gICAgICBlbHNlIHNldChPLCBwcm90byk7XHJcbiAgICAgIHJldHVybiBPO1xyXG4gICAgfVxyXG4gIH0oKTtcclxuICAkZGVmaW5lKFNUQVRJQywgT0JKRUNULCBvYmplY3RTdGF0aWMpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5vYmplY3QucHJvdG90eXBlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbih0bXApe1xyXG4gIC8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxyXG4gIHRtcFtTWU1CT0xfVEFHXSA9IERPVDtcclxuICBpZihjb2YodG1wKSAhPSBET1QpaGlkZGVuKE9iamVjdFByb3RvLCBUT19TVFJJTkcsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XHJcbiAgfSk7XHJcbn0oe30pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAvLyBPYmplY3Qgc3RhdGljIG1ldGhvZHMgYWNjZXB0IHByaW1pdGl2ZXNcclxuICBmdW5jdGlvbiB3cmFwT2JqZWN0TWV0aG9kKGtleSwgTU9ERSl7XHJcbiAgICB2YXIgZm4gID0gT2JqZWN0W2tleV1cclxuICAgICAgLCBleHAgPSBjb3JlW09CSkVDVF1ba2V5XVxyXG4gICAgICAsIGYgICA9IDBcclxuICAgICAgLCBvICAgPSB7fTtcclxuICAgIGlmKCFleHAgfHwgaXNOYXRpdmUoZXhwKSl7XHJcbiAgICAgIG9ba2V5XSA9IE1PREUgPT0gMSA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XHJcbiAgICAgIH0gOiBNT0RFID09IDIgPyBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XHJcbiAgICAgIH0gOiBNT0RFID09IDMgPyBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGZhbHNlO1xyXG4gICAgICB9IDogTU9ERSA9PSA0ID8gZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICAgICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSwga2V5KTtcclxuICAgICAgfSA6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcclxuICAgICAgfTtcclxuICAgICAgdHJ5IHsgZm4oRE9UKSB9XHJcbiAgICAgIGNhdGNoKGUpeyBmID0gMSB9XHJcbiAgICAgICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogZiwgT0JKRUNULCBvKTtcclxuICAgIH1cclxuICB9XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZnJlZXplJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnc2VhbCcsIDEpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ3ByZXZlbnRFeHRlbnNpb25zJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnaXNGcm96ZW4nLCAyKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdpc1NlYWxlZCcsIDIpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2lzRXh0ZW5zaWJsZScsIDMpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIDQpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldFByb3RvdHlwZU9mJyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgna2V5cycpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5TmFtZXMnKTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuZnVuY3Rpb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oTkFNRSl7XHJcbiAgLy8gMTkuMi40LjIgbmFtZVxyXG4gIE5BTUUgaW4gRnVuY3Rpb25Qcm90byB8fCAoREVTQyAmJiBkZWZpbmVQcm9wZXJ0eShGdW5jdGlvblByb3RvLCBOQU1FLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXHJcbiAgICAgICAgLCBuYW1lICA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcclxuICAgICAgaGFzKHRoaXMsIE5BTUUpIHx8IGRlZmluZVByb3BlcnR5KHRoaXMsIE5BTUUsIGRlc2NyaXB0b3IoNSwgbmFtZSkpO1xyXG4gICAgICByZXR1cm4gbmFtZTtcclxuICAgIH0sXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgaGFzKHRoaXMsIE5BTUUpIHx8IGRlZmluZVByb3BlcnR5KHRoaXMsIE5BTUUsIGRlc2NyaXB0b3IoMCwgdmFsdWUpKTtcclxuICAgIH1cclxuICB9KSk7XHJcbn0oJ25hbWUnKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm51bWJlci5jb25zdHJ1Y3RvciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuTnVtYmVyKCcwbzEnKSAmJiBOdW1iZXIoJzBiMScpIHx8IGZ1bmN0aW9uKF9OdW1iZXIsIE51bWJlclByb3RvKXtcclxuICBmdW5jdGlvbiB0b051bWJlcihpdCl7XHJcbiAgICBpZihpc09iamVjdChpdCkpaXQgPSB0b1ByaW1pdGl2ZShpdCk7XHJcbiAgICBpZih0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMiAmJiBpdC5jaGFyQ29kZUF0KDApID09IDQ4KXtcclxuICAgICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xyXG4gICAgICBzd2l0Y2goaXQuY2hhckNvZGVBdCgxKSl7XHJcbiAgICAgICAgY2FzZSA2NiA6IGNhc2UgOTggIDogYmluYXJ5ID0gdHJ1ZTtcclxuICAgICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcclxuICAgICAgfVxyXG4gICAgfSByZXR1cm4gK2l0O1xyXG4gIH1cclxuICBmdW5jdGlvbiB0b1ByaW1pdGl2ZShpdCl7XHJcbiAgICB2YXIgZm4sIHZhbDtcclxuICAgIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC52YWx1ZU9mKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XHJcbiAgICBpZihpc0Z1bmN0aW9uKGZuID0gaXRbVE9fU1RSSU5HXSkgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xyXG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gbnVtYmVyXCIpO1xyXG4gIH1cclxuICBOdW1iZXIgPSBmdW5jdGlvbiBOdW1iZXIoaXQpe1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBOdW1iZXIgPyBuZXcgX051bWJlcih0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xyXG4gIH1cclxuICBmb3JFYWNoLmNhbGwoREVTQyA/IGdldE5hbWVzKF9OdW1iZXIpXHJcbiAgOiBhcnJheSgnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFknKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIGtleSBpbiBOdW1iZXIgfHwgZGVmaW5lUHJvcGVydHkoTnVtYmVyLCBrZXksIGdldE93bkRlc2NyaXB0b3IoX051bWJlciwga2V5KSk7XHJcbiAgfSk7XHJcbiAgTnVtYmVyW1BST1RPVFlQRV0gPSBOdW1iZXJQcm90bztcclxuICBOdW1iZXJQcm90b1tDT05TVFJVQ1RPUl0gPSBOdW1iZXI7XHJcbiAgaGlkZGVuKGdsb2JhbCwgTlVNQkVSLCBOdW1iZXIpO1xyXG59KE51bWJlciwgTnVtYmVyW1BST1RPVFlQRV0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYubnVtYmVyLnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oaXNJbnRlZ2VyKXtcclxuICAkZGVmaW5lKFNUQVRJQywgTlVNQkVSLCB7XHJcbiAgICAvLyAyMC4xLjIuMSBOdW1iZXIuRVBTSUxPTlxyXG4gICAgRVBTSUxPTjogcG93KDIsIC01MiksXHJcbiAgICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxyXG4gICAgaXNGaW5pdGU6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShpdCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXHJcbiAgICBpc0ludGVnZXI6IGlzSW50ZWdlcixcclxuICAgIC8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXHJcbiAgICBpc05hTjogc2FtZU5hTixcclxuICAgIC8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcclxuICAgIGlzU2FmZUludGVnZXI6IGZ1bmN0aW9uKG51bWJlcil7XHJcbiAgICAgIHJldHVybiBpc0ludGVnZXIobnVtYmVyKSAmJiBhYnMobnVtYmVyKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXHJcbiAgICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSLFxyXG4gICAgLy8gMjAuMS4yLjEwIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSXHJcbiAgICBNSU5fU0FGRV9JTlRFR0VSOiAtTUFYX1NBRkVfSU5URUdFUixcclxuICAgIC8vIDIwLjEuMi4xMiBOdW1iZXIucGFyc2VGbG9hdChzdHJpbmcpXHJcbiAgICBwYXJzZUZsb2F0OiBwYXJzZUZsb2F0LFxyXG4gICAgLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxyXG4gICAgcGFyc2VJbnQ6IHBhcnNlSW50XHJcbiAgfSk7XHJcbi8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxyXG59KE51bWJlci5pc0ludGVnZXIgfHwgZnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiAhaXNPYmplY3QoaXQpICYmIGlzRmluaXRlKGl0KSAmJiBmbG9vcihpdCkgPT09IGl0O1xyXG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lm1hdGggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IHNoaW1cclxuIWZ1bmN0aW9uKCl7XHJcbiAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gIHZhciBFICAgID0gTWF0aC5FXHJcbiAgICAsIGV4cCAgPSBNYXRoLmV4cFxyXG4gICAgLCBsb2cgID0gTWF0aC5sb2dcclxuICAgICwgc3FydCA9IE1hdGguc3FydFxyXG4gICAgLCBzaWduID0gTWF0aC5zaWduIHx8IGZ1bmN0aW9uKHgpe1xyXG4gICAgICAgIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcclxuICAgICAgfTtcclxuICBcclxuICAvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbiAgZnVuY3Rpb24gYXNpbmgoeCl7XHJcbiAgICByZXR1cm4gIWlzRmluaXRlKHggPSAreCkgfHwgeCA9PSAwID8geCA6IHggPCAwID8gLWFzaW5oKC14KSA6IGxvZyh4ICsgc3FydCh4ICogeCArIDEpKTtcclxuICB9XHJcbiAgLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcclxuICBmdW5jdGlvbiBleHBtMSh4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xyXG4gIH1cclxuICAgIFxyXG4gICRkZWZpbmUoU1RBVElDLCBNQVRILCB7XHJcbiAgICAvLyAyMC4yLjIuMyBNYXRoLmFjb3NoKHgpXHJcbiAgICBhY29zaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcclxuICAgIGFzaW5oOiBhc2luaCxcclxuICAgIC8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcclxuICAgIGF0YW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjkgTWF0aC5jYnJ0KHgpXHJcbiAgICBjYnJ0OiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIHNpZ24oeCA9ICt4KSAqIHBvdyhhYnMoeCksIDEgLyAzKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMTEgTWF0aC5jbHozMih4KVxyXG4gICAgY2x6MzI6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPj4+PSAwKSA/IDMyIC0geFtUT19TVFJJTkddKDIpLmxlbmd0aCA6IDMyO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcclxuICAgIGNvc2g6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKGV4cCh4ID0gK3gpICsgZXhwKC14KSkgLyAyO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbiAgICBleHBtMTogZXhwbTEsXHJcbiAgICAvLyAyMC4yLjIuMTYgTWF0aC5mcm91bmQoeClcclxuICAgIC8vIFRPRE86IGZhbGxiYWNrIGZvciBJRTktXHJcbiAgICBmcm91bmQ6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbeF0pWzBdO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xNyBNYXRoLmh5cG90KFt2YWx1ZTFbLCB2YWx1ZTJbLCDigKYgXV1dKVxyXG4gICAgaHlwb3Q6IGZ1bmN0aW9uKHZhbHVlMSwgdmFsdWUyKXtcclxuICAgICAgdmFyIHN1bSAgPSAwXHJcbiAgICAgICAgLCBsZW4xID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgbGVuMiA9IGxlbjFcclxuICAgICAgICAsIGFyZ3MgPSBBcnJheShsZW4xKVxyXG4gICAgICAgICwgbGFyZyA9IC1JbmZpbml0eVxyXG4gICAgICAgICwgYXJnO1xyXG4gICAgICB3aGlsZShsZW4xLS0pe1xyXG4gICAgICAgIGFyZyA9IGFyZ3NbbGVuMV0gPSArYXJndW1lbnRzW2xlbjFdO1xyXG4gICAgICAgIGlmKGFyZyA9PSBJbmZpbml0eSB8fCBhcmcgPT0gLUluZmluaXR5KXJldHVybiBJbmZpbml0eTtcclxuICAgICAgICBpZihhcmcgPiBsYXJnKWxhcmcgPSBhcmc7XHJcbiAgICAgIH1cclxuICAgICAgbGFyZyA9IGFyZyB8fCAxO1xyXG4gICAgICB3aGlsZShsZW4yLS0pc3VtICs9IHBvdyhhcmdzW2xlbjJdIC8gbGFyZywgMik7XHJcbiAgICAgIHJldHVybiBsYXJnICogc3FydChzdW0pO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcclxuICAgIGltdWw6IGZ1bmN0aW9uKHgsIHkpe1xyXG4gICAgICB2YXIgVUludDE2ID0gMHhmZmZmXHJcbiAgICAgICAgLCB4biA9ICt4XHJcbiAgICAgICAgLCB5biA9ICt5XHJcbiAgICAgICAgLCB4bCA9IFVJbnQxNiAmIHhuXHJcbiAgICAgICAgLCB5bCA9IFVJbnQxNiAmIHluO1xyXG4gICAgICByZXR1cm4gMCB8IHhsICogeWwgKyAoKFVJbnQxNiAmIHhuID4+PiAxNikgKiB5bCArIHhsICogKFVJbnQxNiAmIHluID4+PiAxNikgPDwgMTYgPj4+IDApO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yMCBNYXRoLmxvZzFwKHgpXHJcbiAgICBsb2cxcDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IGxvZygxICsgeCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjIxIE1hdGgubG9nMTAoeClcclxuICAgIGxvZzEwOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4xMDtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjIgTWF0aC5sb2cyKHgpXHJcbiAgICBsb2cyOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcclxuICAgIHNpZ246IHNpZ24sXHJcbiAgICAvLyAyMC4yLjIuMzAgTWF0aC5zaW5oKHgpXHJcbiAgICBzaW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuIChhYnMoeCA9ICt4KSA8IDEpID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDIgOiAoZXhwKHggLSAxKSAtIGV4cCgteCAtIDEpKSAqIChFIC8gMik7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjMzIE1hdGgudGFuaCh4KVxyXG4gICAgdGFuaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHZhciBhID0gZXhwbTEoeCA9ICt4KVxyXG4gICAgICAgICwgYiA9IGV4cG0xKC14KTtcclxuICAgICAgcmV0dXJuIGEgPT0gSW5maW5pdHkgPyAxIDogYiA9PSBJbmZpbml0eSA/IC0xIDogKGEgLSBiKSAvIChleHAoeCkgKyBleHAoLXgpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxyXG4gICAgdHJ1bmM6IHRydW5jXHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGZyb21DaGFyQ29kZSl7XHJcbiAgZnVuY3Rpb24gYXNzZXJ0Tm90UmVnRXhwKGl0KXtcclxuICAgIGlmKGNvZihpdCkgPT0gUkVHRVhQKXRocm93IFR5cGVFcnJvcigpO1xyXG4gIH1cclxuICBcclxuICAkZGVmaW5lKFNUQVRJQywgU1RSSU5HLCB7XHJcbiAgICAvLyAyMS4xLjIuMiBTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzKVxyXG4gICAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHZhciByZXMgPSBbXVxyXG4gICAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgaSAgID0gMFxyXG4gICAgICAgICwgY29kZVxyXG4gICAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgICBjb2RlID0gK2FyZ3VtZW50c1tpKytdO1xyXG4gICAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xyXG4gICAgICAgIHJlcy5wdXNoKGNvZGUgPCAweDEwMDAwXHJcbiAgICAgICAgICA/IGZyb21DaGFyQ29kZShjb2RlKVxyXG4gICAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjIuNCBTdHJpbmcucmF3KGNhbGxTaXRlLCAuLi5zdWJzdGl0dXRpb25zKVxyXG4gICAgcmF3OiBmdW5jdGlvbihjYWxsU2l0ZSl7XHJcbiAgICAgIHZhciByYXcgPSB0b09iamVjdChjYWxsU2l0ZS5yYXcpXHJcbiAgICAgICAgLCBsZW4gPSB0b0xlbmd0aChyYXcubGVuZ3RoKVxyXG4gICAgICAgICwgc2xuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzID0gW11cclxuICAgICAgICAsIGkgICA9IDA7XHJcbiAgICAgIHdoaWxlKGxlbiA+IGkpe1xyXG4gICAgICAgIHJlcy5wdXNoKFN0cmluZyhyYXdbaSsrXSkpO1xyXG4gICAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgICB9IHJldHVybiByZXMuam9pbignJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgJGRlZmluZShQUk9UTywgU1RSSU5HLCB7XHJcbiAgICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcclxuICAgIGNvZGVQb2ludEF0OiBjcmVhdGVQb2ludEF0KGZhbHNlKSxcclxuICAgIC8vIDIxLjEuMy42IFN0cmluZy5wcm90b3R5cGUuZW5kc1dpdGgoc2VhcmNoU3RyaW5nIFssIGVuZFBvc2l0aW9uXSlcclxuICAgIGVuZHNXaXRoOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICB2YXIgdGhhdCA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgZW5kUG9zaXRpb24gPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxyXG4gICAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IG1pbih0b0xlbmd0aChlbmRQb3NpdGlvbiksIGxlbik7XHJcbiAgICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgICAgcmV0dXJuIHRoYXQuc2xpY2UoZW5kIC0gc2VhcmNoU3RyaW5nLmxlbmd0aCwgZW5kKSA9PT0gc2VhcmNoU3RyaW5nO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy43IFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbiA9IDApXHJcbiAgICBpbmNsdWRlczogZnVuY3Rpb24oc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xyXG4gICAgICBhc3NlcnROb3RSZWdFeHAoc2VhcmNoU3RyaW5nKTtcclxuICAgICAgcmV0dXJuICEhflN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKS5pbmRleE9mKHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMS4xLjMuMTMgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQoY291bnQpXHJcbiAgICByZXBlYXQ6IGZ1bmN0aW9uKGNvdW50KXtcclxuICAgICAgdmFyIHN0ciA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgcmVzID0gJydcclxuICAgICAgICAsIG4gICA9IHRvSW50ZWdlcihjb3VudCk7XHJcbiAgICAgIGlmKDAgPiBuIHx8IG4gPT0gSW5maW5pdHkpdGhyb3cgUmFuZ2VFcnJvcihcIkNvdW50IGNhbid0IGJlIG5lZ2F0aXZlXCIpO1xyXG4gICAgICBmb3IoO24gPiAwOyAobiA+Pj49IDEpICYmIChzdHIgKz0gc3RyKSlpZihuICYgMSlyZXMgKz0gc3RyO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy4xOCBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIFssIHBvc2l0aW9uIF0pXHJcbiAgICBzdGFydHNXaXRoOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICB2YXIgdGhhdCAgPSBTdHJpbmcoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGluZGV4ID0gdG9MZW5ndGgobWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcclxuICAgICAgc2VhcmNoU3RyaW5nICs9ICcnO1xyXG4gICAgICByZXR1cm4gdGhhdC5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2hTdHJpbmcubGVuZ3RoKSA9PT0gc2VhcmNoU3RyaW5nO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KFN0cmluZy5mcm9tQ2hhckNvZGUpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuYXJyYXkuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFNUQVRJQyArIEZPUkNFRCAqIGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoQXJyYXkuZnJvbSksIEFSUkFZLCB7XHJcbiAgICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmcm9tOiBmdW5jdGlvbihhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XHJcbiAgICAgIHZhciBPICAgICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcclxuICAgICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXHJcbiAgICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAgICwgaW5kZXggICA9IDBcclxuICAgICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwO1xyXG4gICAgICBpZihpc0l0ZXJhYmxlKE8pKXtcclxuICAgICAgICByZXN1bHQgPSBuZXcgKGdlbmVyaWModGhpcywgQXJyYXkpKTtcclxuICAgICAgICBzYWZlSXRlckNsb3NlKGZ1bmN0aW9uKGl0ZXJhdG9yKXtcclxuICAgICAgICAgIGZvcig7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XHJcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihzdGVwLnZhbHVlLCBpbmRleCkgOiBzdGVwLnZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGdldEl0ZXJhdG9yKE8pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBuZXcgKGdlbmVyaWModGhpcywgQXJyYXkpKShsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCkpO1xyXG4gICAgICAgIGZvcig7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcclxuICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICAkZGVmaW5lKFNUQVRJQywgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcclxuICAgIG9mOiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgICAgdmFyIGluZGV4ICA9IDBcclxuICAgICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgICAsIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpKGxlbmd0aCk7XHJcbiAgICAgIHdoaWxlKGxlbmd0aCA+IGluZGV4KXJlc3VsdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXgrK107XHJcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgc2V0U3BlY2llcyhBcnJheSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LmFycmF5LnByb3RvdHlwZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgJGRlZmluZShQUk9UTywgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMy4zIEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluKHRhcmdldCwgc3RhcnQsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gICAgY29weVdpdGhpbjogZnVuY3Rpb24odGFyZ2V0IC8qID0gMCAqLywgc3RhcnQgLyogPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcclxuICAgICAgdmFyIE8gICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBsZW4gICA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAgICwgdG8gICAgPSB0b0luZGV4KHRhcmdldCwgbGVuKVxyXG4gICAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXHJcbiAgICAgICAgLCBlbmQgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAgICwgZmluICAgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IHRvSW5kZXgoZW5kLCBsZW4pXHJcbiAgICAgICAgLCBjb3VudCA9IG1pbihmaW4gLSBmcm9tLCBsZW4gLSB0bylcclxuICAgICAgICAsIGluYyAgID0gMTtcclxuICAgICAgaWYoZnJvbSA8IHRvICYmIHRvIDwgZnJvbSArIGNvdW50KXtcclxuICAgICAgICBpbmMgID0gLTE7XHJcbiAgICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XHJcbiAgICAgICAgdG8gICA9IHRvICsgY291bnQgLSAxO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlKGNvdW50LS0gPiAwKXtcclxuICAgICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xyXG4gICAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xyXG4gICAgICAgIHRvICs9IGluYztcclxuICAgICAgICBmcm9tICs9IGluYztcclxuICAgICAgfSByZXR1cm4gTztcclxuICAgIH0sXHJcbiAgICAvLyAyMi4xLjMuNiBBcnJheS5wcm90b3R5cGUuZmlsbCh2YWx1ZSwgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aClcclxuICAgIGZpbGw6IGZ1bmN0aW9uKHZhbHVlIC8qLCBzdGFydCA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xyXG4gICAgICB2YXIgTyAgICAgID0gT2JqZWN0KGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXHJcbiAgICAgICAgLCBlbmQgICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XHJcbiAgICAgIHdoaWxlKGVuZFBvcyA+IGluZGV4KU9baW5kZXgrK10gPSB2YWx1ZTtcclxuICAgICAgcmV0dXJuIE87XHJcbiAgICB9LFxyXG4gICAgLy8gMjIuMS4zLjggQXJyYXkucHJvdG90eXBlLmZpbmQocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZmluZDogY3JlYXRlQXJyYXlNZXRob2QoNSksXHJcbiAgICAvLyAyMi4xLjMuOSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZpbmRJbmRleDogY3JlYXRlQXJyYXlNZXRob2QoNilcclxuICB9KTtcclxuICBcclxuICBpZihmcmFtZXdvcmspe1xyXG4gICAgLy8gMjIuMS4zLjMxIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxyXG4gICAgZm9yRWFjaC5jYWxsKGFycmF5KCdmaW5kLGZpbmRJbmRleCxmaWxsLGNvcHlXaXRoaW4sZW50cmllcyxrZXlzLHZhbHVlcycpLCBmdW5jdGlvbihpdCl7XHJcbiAgICAgIEFycmF5VW5zY29wYWJsZXNbaXRdID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgU1lNQk9MX1VOU0NPUEFCTEVTIGluIEFycmF5UHJvdG8gfHwgaGlkZGVuKEFycmF5UHJvdG8sIFNZTUJPTF9VTlNDT1BBQkxFUywgQXJyYXlVbnNjb3BhYmxlcyk7XHJcbiAgfVxyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5pdGVyYXRvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihhdCl7XHJcbiAgLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxyXG4gIC8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXHJcbiAgLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxyXG4gIC8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG4gIGRlZmluZVN0ZEl0ZXJhdG9ycyhBcnJheSwgQVJSQVksIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogdG9PYmplY3QoaXRlcmF0ZWQpLCBpOiAwLCBrOiBraW5kfSk7XHJcbiAgLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbiAgfSwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICwgaW5kZXggPSBpdGVyLmkrKztcclxuICAgIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcclxuICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgICByZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIH1cclxuICAgIGlmKGtpbmQgPT0gS0VZKSAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgaW5kZXgpO1xyXG4gICAgaWYoa2luZCA9PSBWQUxVRSlyZXR1cm4gaXRlclJlc3VsdCgwLCBPW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIFtpbmRleCwgT1tpbmRleF1dKTtcclxuICB9LCBWQUxVRSk7XHJcbiAgXHJcbiAgLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxyXG4gIEl0ZXJhdG9yc1tBUkdVTUVOVFNdID0gSXRlcmF0b3JzW0FSUkFZXTtcclxuICBcclxuICAvLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbiAgZGVmaW5lU3RkSXRlcmF0b3JzKFN0cmluZywgU1RSSU5HLCBmdW5jdGlvbihpdGVyYXRlZCl7XHJcbiAgICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcclxuICAvLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbiAgfSwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgICAsIGluZGV4ID0gaXRlci5pXHJcbiAgICAgICwgcG9pbnQ7XHJcbiAgICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIHBvaW50ID0gYXQuY2FsbChPLCBpbmRleCk7XHJcbiAgICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgcG9pbnQpO1xyXG4gIH0pO1xyXG59KGNyZWF0ZVBvaW50QXQodHJ1ZSkpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYucmVnZXhwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5ERVNDICYmICFmdW5jdGlvbihSZWdFeHBQcm90bywgX1JlZ0V4cCl7ICBcclxuICAvLyBSZWdFeHAgYWxsb3dzIGEgcmVnZXggd2l0aCBmbGFncyBhcyB0aGUgcGF0dGVyblxyXG4gIGlmKCFmdW5jdGlvbigpe3RyeXtyZXR1cm4gUmVnRXhwKC9hL2csICdpJykgPT0gJy9hL2knfWNhdGNoKGUpe319KCkpe1xyXG4gICAgUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcclxuICAgICAgcmV0dXJuIG5ldyBfUmVnRXhwKGNvZihwYXR0ZXJuKSA9PSBSRUdFWFAgJiYgZmxhZ3MgIT09IHVuZGVmaW5lZFxyXG4gICAgICAgID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuLCBmbGFncyk7XHJcbiAgICB9XHJcbiAgICBmb3JFYWNoLmNhbGwoZ2V0TmFtZXMoX1JlZ0V4cCksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGtleSBpbiBSZWdFeHAgfHwgZGVmaW5lUHJvcGVydHkoUmVnRXhwLCBrZXksIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gX1JlZ0V4cFtrZXldIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbihpdCl7IF9SZWdFeHBba2V5XSA9IGl0IH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFJlZ0V4cFByb3RvW0NPTlNUUlVDVE9SXSA9IFJlZ0V4cDtcclxuICAgIFJlZ0V4cFtQUk9UT1RZUEVdID0gUmVnRXhwUHJvdG87XHJcbiAgICBoaWRkZW4oZ2xvYmFsLCBSRUdFWFAsIFJlZ0V4cCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcclxuICBpZigvLi9nLmZsYWdzICE9ICdnJylkZWZpbmVQcm9wZXJ0eShSZWdFeHBQcm90bywgJ2ZsYWdzJywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiBjcmVhdGVSZXBsYWNlcigvXi4qXFwvKFxcdyopJC8sICckMScpXHJcbiAgfSk7XHJcbiAgXHJcbiAgc2V0U3BlY2llcyhSZWdFeHApO1xyXG59KFJlZ0V4cFtQUk9UT1RZUEVdLCBSZWdFeHApO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiB3ZWIuaW1tZWRpYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBzZXRJbW1lZGlhdGUgc2hpbVxyXG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBlbHNlOlxyXG5pc0Z1bmN0aW9uKHNldEltbWVkaWF0ZSkgJiYgaXNGdW5jdGlvbihjbGVhckltbWVkaWF0ZSkgfHwgZnVuY3Rpb24oT05SRUFEWVNUQVRFQ0hBTkdFKXtcclxuICB2YXIgcG9zdE1lc3NhZ2UgICAgICA9IGdsb2JhbC5wb3N0TWVzc2FnZVxyXG4gICAgLCBhZGRFdmVudExpc3RlbmVyID0gZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXJcclxuICAgICwgTWVzc2FnZUNoYW5uZWwgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxyXG4gICAgLCBjb3VudGVyICAgICAgICAgID0gMFxyXG4gICAgLCBxdWV1ZSAgICAgICAgICAgID0ge31cclxuICAgICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XHJcbiAgc2V0SW1tZWRpYXRlID0gZnVuY3Rpb24oZm4pe1xyXG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XHJcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xyXG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGludm9rZShpc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcclxuICAgIH1cclxuICAgIGRlZmVyKGNvdW50ZXIpO1xyXG4gICAgcmV0dXJuIGNvdW50ZXI7XHJcbiAgfVxyXG4gIGNsZWFySW1tZWRpYXRlID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICB9XHJcbiAgZnVuY3Rpb24gcnVuKGlkKXtcclxuICAgIGlmKGhhcyhxdWV1ZSwgaWQpKXtcclxuICAgICAgdmFyIGZuID0gcXVldWVbaWRdO1xyXG4gICAgICBkZWxldGUgcXVldWVbaWRdO1xyXG4gICAgICBmbigpO1xyXG4gICAgfVxyXG4gIH1cclxuICBmdW5jdGlvbiBsaXN0bmVyKGV2ZW50KXtcclxuICAgIHJ1bihldmVudC5kYXRhKTtcclxuICB9XHJcbiAgLy8gTm9kZS5qcyAwLjgtXHJcbiAgaWYoTk9ERSl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgbmV4dFRpY2socGFydC5jYWxsKHJ1biwgaWQpKTtcclxuICAgIH1cclxuICAvLyBNb2Rlcm4gYnJvd3NlcnMsIHNraXAgaW1wbGVtZW50YXRpb24gZm9yIFdlYldvcmtlcnNcclxuICAvLyBJRTggaGFzIHBvc3RNZXNzYWdlLCBidXQgaXQncyBzeW5jICYgdHlwZW9mIGl0cyBwb3N0TWVzc2FnZSBpcyBvYmplY3RcclxuICB9IGVsc2UgaWYoYWRkRXZlbnRMaXN0ZW5lciAmJiBpc0Z1bmN0aW9uKHBvc3RNZXNzYWdlKSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHBvc3RNZXNzYWdlKGlkLCAnKicpO1xyXG4gICAgfVxyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcclxuICAvLyBXZWJXb3JrZXJzXHJcbiAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oTWVzc2FnZUNoYW5uZWwpKXtcclxuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XHJcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcclxuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcclxuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xyXG4gIC8vIElFOC1cclxuICB9IGVsc2UgaWYoZG9jdW1lbnQgJiYgT05SRUFEWVNUQVRFQ0hBTkdFIGluIGRvY3VtZW50W0NSRUFURV9FTEVNRU5UXSgnc2NyaXB0Jykpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnRbQ1JFQVRFX0VMRU1FTlRdKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcclxuICAgICAgICBydW4oaWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcclxuICB9IGVsc2Uge1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHNldFRpbWVvdXQocnVuLCAwLCBpZCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KCdvbnJlYWR5c3RhdGVjaGFuZ2UnKTtcclxuJGRlZmluZShHTE9CQUwgKyBCSU5ELCB7XHJcbiAgc2V0SW1tZWRpYXRlOiAgIHNldEltbWVkaWF0ZSxcclxuICBjbGVhckltbWVkaWF0ZTogY2xlYXJJbW1lZGlhdGVcclxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5wcm9taXNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVTNiBwcm9taXNlcyBzaGltXHJcbi8vIEJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXRpZnkvbmF0aXZlLXByb21pc2Utb25seS9cclxuIWZ1bmN0aW9uKFByb21pc2UsIHRlc3Qpe1xyXG4gIGlzRnVuY3Rpb24oUHJvbWlzZSkgJiYgaXNGdW5jdGlvbihQcm9taXNlLnJlc29sdmUpXHJcbiAgJiYgUHJvbWlzZS5yZXNvbHZlKHRlc3QgPSBuZXcgUHJvbWlzZShmdW5jdGlvbigpe30pKSA9PSB0ZXN0XHJcbiAgfHwgZnVuY3Rpb24oYXNhcCwgUkVDT1JEKXtcclxuICAgIGZ1bmN0aW9uIGlzVGhlbmFibGUoaXQpe1xyXG4gICAgICB2YXIgdGhlbjtcclxuICAgICAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xyXG4gICAgICByZXR1cm4gaXNGdW5jdGlvbih0aGVuKSA/IHRoZW4gOiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocHJvbWlzZSl7XHJcbiAgICAgIHZhciByZWNvcmQgPSBwcm9taXNlW1JFQ09SRF1cclxuICAgICAgICAsIGNoYWluICA9IHJlY29yZC5jXHJcbiAgICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICAgLCByZWFjdDtcclxuICAgICAgaWYocmVjb3JkLmgpcmV0dXJuIHRydWU7XHJcbiAgICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpe1xyXG4gICAgICAgIHJlYWN0ID0gY2hhaW5baSsrXTtcclxuICAgICAgICBpZihyZWFjdC5mYWlsIHx8IGhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocmVhY3QuUCkpcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5vdGlmeShyZWNvcmQsIHJlamVjdCl7XHJcbiAgICAgIHZhciBjaGFpbiA9IHJlY29yZC5jO1xyXG4gICAgICBpZihyZWplY3QgfHwgY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgcHJvbWlzZSA9IHJlY29yZC5wXHJcbiAgICAgICAgICAsIHZhbHVlICAgPSByZWNvcmQudlxyXG4gICAgICAgICAgLCBvayAgICAgID0gcmVjb3JkLnMgPT0gMVxyXG4gICAgICAgICAgLCBpICAgICAgID0gMDtcclxuICAgICAgICBpZihyZWplY3QgJiYgIWhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocHJvbWlzZSkpe1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZighaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKSl7XHJcbiAgICAgICAgICAgICAgaWYoTk9ERSl7XHJcbiAgICAgICAgICAgICAgICBpZighcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSkpe1xyXG4gICAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IG5vZGUuanMgYmVoYXZpb3JcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2UgaWYoaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCAxZTMpO1xyXG4gICAgICAgIH0gZWxzZSB3aGlsZShjaGFpbi5sZW5ndGggPiBpKSFmdW5jdGlvbihyZWFjdCl7XHJcbiAgICAgICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxyXG4gICAgICAgICAgICAsIHJldCwgdGhlbjtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmKGNiKXtcclxuICAgICAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcclxuICAgICAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoUFJPTUlTRSArICctY2hhaW4gY3ljbGUnKSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xyXG4gICAgICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XHJcbiAgICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgIHJlYWN0LnJlaihlcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0oY2hhaW5baSsrXSk7XHJcbiAgICAgICAgY2hhaW4ubGVuZ3RoID0gMDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHZhbHVlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHRoaXNcclxuICAgICAgICAsIHRoZW4sIHdyYXBwZXI7XHJcbiAgICAgIGlmKHJlY29yZC5kKXJldHVybjtcclxuICAgICAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gICAgICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XHJcbiAgICAgICAgICB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXHJcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eChyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KHJlamVjdCwgd3JhcHBlciwgMSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICAgICAgcmVjb3JkLnMgPSAxO1xyXG4gICAgICAgICAgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgcmVqZWN0LmNhbGwod3JhcHBlciB8fCB7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGVycik7IC8vIHdyYXBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHRoaXM7XHJcbiAgICAgIGlmKHJlY29yZC5kKXJldHVybjtcclxuICAgICAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gICAgICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICByZWNvcmQucyA9IDI7XHJcbiAgICAgIG5vdGlmeShyZWNvcmQsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XHJcbiAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KEMpW1NZTUJPTF9TUEVDSUVTXTtcclxuICAgICAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XHJcbiAgICB9XHJcbiAgICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxyXG4gICAgUHJvbWlzZSA9IGZ1bmN0aW9uKGV4ZWN1dG9yKXtcclxuICAgICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xyXG4gICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBQcm9taXNlLCBQUk9NSVNFKTtcclxuICAgICAgdmFyIHJlY29yZCA9IHtcclxuICAgICAgICBwOiB0aGlzLCAgICAgIC8vIHByb21pc2VcclxuICAgICAgICBjOiBbXSwgICAgICAgIC8vIGNoYWluXHJcbiAgICAgICAgczogMCwgICAgICAgICAvLyBzdGF0ZVxyXG4gICAgICAgIGQ6IGZhbHNlLCAgICAgLy8gZG9uZVxyXG4gICAgICAgIHY6IHVuZGVmaW5lZCwgLy8gdmFsdWVcclxuICAgICAgICBoOiBmYWxzZSAgICAgIC8vIGhhbmRsZWQgcmVqZWN0aW9uXHJcbiAgICAgIH07XHJcbiAgICAgIGhpZGRlbih0aGlzLCBSRUNPUkQsIHJlY29yZCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZXhlY3V0b3IoY3R4KHJlc29sdmUsIHJlY29yZCwgMSksIGN0eChyZWplY3QsIHJlY29yZCwgMSkpO1xyXG4gICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgcmVqZWN0LmNhbGwocmVjb3JkLCBlcnIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NpZ25IaWRkZW4oUHJvbWlzZVtQUk9UT1RZUEVdLCB7XHJcbiAgICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXHJcbiAgICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcclxuICAgICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcylbQ09OU1RSVUNUT1JdKVtTWU1CT0xfU1BFQ0lFU107XHJcbiAgICAgICAgdmFyIHJlYWN0ID0ge1xyXG4gICAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXHJcbiAgICAgICAgICBmYWlsOiBpc0Z1bmN0aW9uKG9uUmVqZWN0ZWQpICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcclxuICAgICAgICB9ICwgUCA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFByb21pc2UpKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICByZWFjdC5yZXMgPSBhc3NlcnRGdW5jdGlvbihyZXNvbHZlKTtcclxuICAgICAgICAgIHJlYWN0LnJlaiA9IGFzc2VydEZ1bmN0aW9uKHJlamVjdCk7XHJcbiAgICAgICAgfSksIHJlY29yZCA9IHRoaXNbUkVDT1JEXTtcclxuICAgICAgICByZWNvcmQuYy5wdXNoKHJlYWN0KTtcclxuICAgICAgICByZWNvcmQucyAmJiBub3RpZnkocmVjb3JkKTtcclxuICAgICAgICByZXR1cm4gUDtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcclxuICAgICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGFzc2lnbkhpZGRlbihQcm9taXNlLCB7XHJcbiAgICAgIC8vIDI1LjQuNC4xIFByb21pc2UuYWxsKGl0ZXJhYmxlKVxyXG4gICAgICBhbGw6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICB2YXIgUHJvbWlzZSA9IGdldENvbnN0cnVjdG9yKHRoaXMpXHJcbiAgICAgICAgICAsIHZhbHVlcyAgPSBbXTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgcHVzaCwgdmFsdWVzKTtcclxuICAgICAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcclxuICAgICAgICAgIGlmKHJlbWFpbmluZylmb3JFYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGVsc2UgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxyXG4gICAgICByYWNlOiBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgdmFyIFByb21pc2UgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShwcm9taXNlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcclxuICAgICAgcmVqZWN0OiBmdW5jdGlvbihyKXtcclxuICAgICAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIHJlamVjdChyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXHJcbiAgICAgIHJlc29sdmU6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdCh4KSAmJiBSRUNPUkQgaW4geCAmJiBnZXRQcm90b3R5cGVPZih4KSA9PT0gdGhpc1tQUk9UT1RZUEVdXHJcbiAgICAgICAgICA/IHggOiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgICByZXNvbHZlKHgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0obmV4dFRpY2sgfHwgc2V0SW1tZWRpYXRlLCBzYWZlU3ltYm9sKCdyZWNvcmQnKSk7XHJcbiAgc2V0VG9TdHJpbmdUYWcoUHJvbWlzZSwgUFJPTUlTRSk7XHJcbiAgc2V0U3BlY2llcyhQcm9taXNlKTtcclxuICAkZGVmaW5lKEdMT0JBTCArIEZPUkNFRCAqICFpc05hdGl2ZShQcm9taXNlKSwge1Byb21pc2U6IFByb21pc2V9KTtcclxufShnbG9iYWxbUFJPTUlTRV0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuY29sbGVjdGlvbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFQ01BU2NyaXB0IDYgY29sbGVjdGlvbnMgc2hpbVxyXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgVUlEICAgPSBzYWZlU3ltYm9sKCd1aWQnKVxyXG4gICAgLCBPMSAgICA9IHNhZmVTeW1ib2woJ08xJylcclxuICAgICwgV0VBSyAgPSBzYWZlU3ltYm9sKCd3ZWFrJylcclxuICAgICwgTEVBSyAgPSBzYWZlU3ltYm9sKCdsZWFrJylcclxuICAgICwgTEFTVCAgPSBzYWZlU3ltYm9sKCdsYXN0JylcclxuICAgICwgRklSU1QgPSBzYWZlU3ltYm9sKCdmaXJzdCcpXHJcbiAgICAsIFNJWkUgID0gREVTQyA/IHNhZmVTeW1ib2woJ3NpemUnKSA6ICdzaXplJ1xyXG4gICAgLCB1aWQgICA9IDBcclxuICAgICwgdG1wICAgPSB7fTtcclxuICBcclxuICBmdW5jdGlvbiBnZXRDb2xsZWN0aW9uKEMsIE5BTUUsIG1ldGhvZHMsIGNvbW1vbk1ldGhvZHMsIGlzTWFwLCBpc1dlYWspe1xyXG4gICAgdmFyIEFEREVSID0gaXNNYXAgPyAnc2V0JyA6ICdhZGQnXHJcbiAgICAgICwgcHJvdG8gPSBDICYmIENbUFJPVE9UWVBFXVxyXG4gICAgICAsIE8gICAgID0ge307XHJcbiAgICBmdW5jdGlvbiBpbml0RnJvbUl0ZXJhYmxlKHRoYXQsIGl0ZXJhYmxlKXtcclxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBpc01hcCwgdGhhdFtBRERFUl0sIHRoYXQpO1xyXG4gICAgICByZXR1cm4gdGhhdDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZpeFNWWihrZXksIGNoYWluKXtcclxuICAgICAgdmFyIG1ldGhvZCA9IHByb3RvW2tleV07XHJcbiAgICAgIGlmKGZyYW1ld29yaylwcm90b1trZXldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSwgYik7XHJcbiAgICAgICAgcmV0dXJuIGNoYWluID8gdGhpcyA6IHJlc3VsdDtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmKCFpc05hdGl2ZShDKSB8fCAhKGlzV2VhayB8fCAoIUJVR0dZX0lURVJBVE9SUyAmJiBoYXMocHJvdG8sIEZPUl9FQUNIKSAmJiBoYXMocHJvdG8sICdlbnRyaWVzJykpKSl7XHJcbiAgICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXHJcbiAgICAgIEMgPSBpc1dlYWtcclxuICAgICAgICA/IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgICAgIHNldCh0aGlzLCBVSUQsIHVpZCsrKTtcclxuICAgICAgICAgICAgaW5pdEZyb21JdGVyYWJsZSh0aGlzLCBpdGVyYWJsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgOiBmdW5jdGlvbihpdGVyYWJsZSl7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhhdCwgQywgTkFNRSk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBPMSwgY3JlYXRlKG51bGwpKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIFNJWkUsIDApO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgTEFTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIEZJUlNULCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICBpbml0RnJvbUl0ZXJhYmxlKHRoYXQsIGl0ZXJhYmxlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgIGFzc2lnbkhpZGRlbihhc3NpZ25IaWRkZW4oQ1tQUk9UT1RZUEVdLCBtZXRob2RzKSwgY29tbW9uTWV0aG9kcyk7XHJcbiAgICAgIGlzV2VhayB8fCAhREVTQyB8fCBkZWZpbmVQcm9wZXJ0eShDW1BST1RPVFlQRV0sICdzaXplJywge2dldDogZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gYXNzZXJ0RGVmaW5lZCh0aGlzW1NJWkVdKTtcclxuICAgICAgfX0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIE5hdGl2ZSA9IENcclxuICAgICAgICAsIGluc3QgICA9IG5ldyBDXHJcbiAgICAgICAgLCBjaGFpbiAgPSBpbnN0W0FEREVSXShpc1dlYWsgPyB7fSA6IC0wLCAxKVxyXG4gICAgICAgICwgYnVnZ3laZXJvO1xyXG4gICAgICAvLyB3cmFwIHRvIGluaXQgY29sbGVjdGlvbnMgZnJvbSBpdGVyYWJsZVxyXG4gICAgICBpZihjaGVja0Rhbmdlckl0ZXJDbG9zaW5nKGZ1bmN0aW9uKE8peyBuZXcgQyhPKSB9KSl7XHJcbiAgICAgICAgQyA9IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIEMsIE5BTUUpO1xyXG4gICAgICAgICAgcmV0dXJuIGluaXRGcm9tSXRlcmFibGUobmV3IE5hdGl2ZSwgaXRlcmFibGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDW1BST1RPVFlQRV0gPSBwcm90bztcclxuICAgICAgICBpZihmcmFtZXdvcmspcHJvdG9bQ09OU1RSVUNUT1JdID0gQztcclxuICAgICAgfVxyXG4gICAgICBpc1dlYWsgfHwgaW5zdFtGT1JfRUFDSF0oZnVuY3Rpb24odmFsLCBrZXkpe1xyXG4gICAgICAgIGJ1Z2d5WmVybyA9IDEgLyBrZXkgPT09IC1JbmZpbml0eTtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIGZpeCBjb252ZXJ0aW5nIC0wIGtleSB0byArMFxyXG4gICAgICBpZihidWdneVplcm8pe1xyXG4gICAgICAgIGZpeFNWWignZGVsZXRlJyk7XHJcbiAgICAgICAgZml4U1ZaKCdoYXMnKTtcclxuICAgICAgICBpc01hcCAmJiBmaXhTVlooJ2dldCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xyXG4gICAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4U1ZaKEFEREVSLCB0cnVlKTtcclxuICAgIH1cclxuICAgIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xyXG4gICAgc2V0U3BlY2llcyhDKTtcclxuICAgIFxyXG4gICAgT1tOQU1FXSA9IEM7XHJcbiAgICAkZGVmaW5lKEdMT0JBTCArIFdSQVAgKyBGT1JDRUQgKiAhaXNOYXRpdmUoQyksIE8pO1xyXG4gICAgXHJcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cclxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcclxuICAgIGlzV2VhayB8fCBkZWZpbmVTdGRJdGVyYXRvcnMoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiBraW5kfSk7XHJcbiAgICB9LCBmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAgICAgLCBraW5kICA9IGl0ZXIua1xyXG4gICAgICAgICwgZW50cnkgPSBpdGVyLmw7XHJcbiAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcclxuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcclxuICAgICAgaWYoIWl0ZXIubyB8fCAhKGl0ZXIubCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogaXRlci5vW0ZJUlNUXSkpe1xyXG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXHJcbiAgICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcclxuICAgICAgaWYoa2luZCA9PSBLRVkpICByZXR1cm4gaXRlclJlc3VsdCgwLCBlbnRyeS5rKTtcclxuICAgICAgaWYoa2luZCA9PSBWQUxVRSlyZXR1cm4gaXRlclJlc3VsdCgwLCBlbnRyeS52KTtcclxuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBbZW50cnkuaywgZW50cnkudl0pOyAgIFxyXG4gICAgfSwgaXNNYXAgPyBLRVkrVkFMVUUgOiBWQUxVRSwgIWlzTWFwKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIEM7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XHJcbiAgICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XHJcbiAgICBpZighaXNPYmplY3QoaXQpKXJldHVybiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xyXG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcclxuICAgIGlmKGlzRnJvemVuKGl0KSlyZXR1cm4gJ0YnO1xyXG4gICAgaWYoIWhhcyhpdCwgVUlEKSl7XHJcbiAgICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXHJcbiAgICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcclxuICAgICAgLy8gYWRkIG1pc3Npbmcgb2JqZWN0IGlkXHJcbiAgICAgIGhpZGRlbihpdCwgVUlELCArK3VpZCk7XHJcbiAgICAvLyByZXR1cm4gb2JqZWN0IGlkIHdpdGggcHJlZml4XHJcbiAgICB9IHJldHVybiAnTycgKyBpdFtVSURdO1xyXG4gIH1cclxuICBmdW5jdGlvbiBnZXRFbnRyeSh0aGF0LCBrZXkpe1xyXG4gICAgLy8gZmFzdCBjYXNlXHJcbiAgICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xyXG4gICAgaWYoaW5kZXggIT0gJ0YnKXJldHVybiB0aGF0W08xXVtpbmRleF07XHJcbiAgICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcclxuICAgIGZvcihlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xyXG4gICAgfVxyXG4gIH1cclxuICBmdW5jdGlvbiBkZWYodGhhdCwga2V5LCB2YWx1ZSl7XHJcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXHJcbiAgICAgICwgcHJldiwgaW5kZXg7XHJcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcclxuICAgIGlmKGVudHJ5KWVudHJ5LnYgPSB2YWx1ZTtcclxuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XHJcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XHJcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxyXG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxyXG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XHJcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcclxuICAgICAgfTtcclxuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XHJcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XHJcbiAgICAgIHRoYXRbU0laRV0rKztcclxuICAgICAgLy8gYWRkIHRvIGluZGV4XHJcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfVxyXG5cclxuICB2YXIgY29sbGVjdGlvbk1ldGhvZHMgPSB7XHJcbiAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcclxuICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0W08xXSwgZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICAgICAgZW50cnkuciA9IHRydWU7XHJcbiAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xyXG4gICAgICB9XHJcbiAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhhdFtTSVpFXSA9IDA7XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXHJcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIHRoYXQgID0gdGhpc1xyXG4gICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xyXG4gICAgICBpZihlbnRyeSl7XHJcbiAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXHJcbiAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xyXG4gICAgICAgIGRlbGV0ZSB0aGF0W08xXVtlbnRyeS5pXTtcclxuICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICBpZihwcmV2KXByZXYubiA9IG5leHQ7XHJcbiAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xyXG4gICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcclxuICAgICAgICBpZih0aGF0W0xBU1RdID09IGVudHJ5KXRoYXRbTEFTVF0gPSBwcmV2O1xyXG4gICAgICAgIHRoYXRbU0laRV0tLTtcclxuICAgICAgfSByZXR1cm4gISFlbnRyeTtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcclxuICAgICAgICAsIGVudHJ5O1xyXG4gICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXNbRklSU1RdKXtcclxuICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xyXG4gICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHJldHVybiAhIWdldEVudHJ5KHRoaXMsIGtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIzLjEgTWFwIE9iamVjdHNcclxuICBNYXAgPSBnZXRDb2xsZWN0aW9uKE1hcCwgTUFQLCB7XHJcbiAgICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoaXMsIGtleSk7XHJcbiAgICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjEuMy45IE1hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmKHRoaXMsIGtleSA9PT0gMCA/IDAgOiBrZXksIHZhbHVlKTtcclxuICAgIH1cclxuICB9LCBjb2xsZWN0aW9uTWV0aG9kcywgdHJ1ZSk7XHJcbiAgXHJcbiAgLy8gMjMuMiBTZXQgT2JqZWN0c1xyXG4gIFNldCA9IGdldENvbGxlY3Rpb24oU2V0LCBTRVQsIHtcclxuICAgIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gICAgYWRkOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIGNvbGxlY3Rpb25NZXRob2RzKTtcclxuICBcclxuICBmdW5jdGlvbiBkZWZXZWFrKHRoYXQsIGtleSwgdmFsdWUpe1xyXG4gICAgaWYoaXNGcm96ZW4oYXNzZXJ0T2JqZWN0KGtleSkpKWxlYWtTdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICBlbHNlIHtcclxuICAgICAgaGFzKGtleSwgV0VBSykgfHwgaGlkZGVuKGtleSwgV0VBSywge30pO1xyXG4gICAgICBrZXlbV0VBS11bdGhhdFtVSURdXSA9IHZhbHVlO1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9XHJcbiAgZnVuY3Rpb24gbGVha1N0b3JlKHRoYXQpe1xyXG4gICAgcmV0dXJuIHRoYXRbTEVBS10gfHwgaGlkZGVuKHRoYXQsIExFQUssIG5ldyBNYXApW0xFQUtdO1xyXG4gIH1cclxuICBcclxuICB2YXIgd2Vha01ldGhvZHMgPSB7XHJcbiAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xyXG4gICAgICByZXR1cm4gaGFzKGtleSwgV0VBSykgJiYgaGFzKGtleVtXRUFLXSwgdGhpc1tVSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbVUlEXV07XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XHJcbiAgICAgIHJldHVybiBoYXMoa2V5LCBXRUFLKSAmJiBoYXMoa2V5W1dFQUtdLCB0aGlzW1VJRF0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgLy8gMjMuMyBXZWFrTWFwIE9iamVjdHNcclxuICBXZWFrTWFwID0gZ2V0Q29sbGVjdGlvbihXZWFrTWFwLCBXRUFLTUFQLCB7XHJcbiAgICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZihpc09iamVjdChrZXkpKXtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYoaGFzKGtleSwgV0VBSykpcmV0dXJuIGtleVtXRUFLXVt0aGlzW1VJRF1dO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICByZXR1cm4gZGVmV2Vhayh0aGlzLCBrZXksIHZhbHVlKTtcclxuICAgIH1cclxuICB9LCB3ZWFrTWV0aG9kcywgdHJ1ZSwgdHJ1ZSk7XHJcbiAgXHJcbiAgLy8gSUUxMSBXZWFrTWFwIGZyb3plbiBrZXlzIGZpeFxyXG4gIGlmKGZyYW1ld29yayAmJiBuZXcgV2Vha01hcCgpLnNldChPYmplY3QuZnJlZXplKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xyXG4gICAgZm9yRWFjaC5jYWxsKGFycmF5KCdkZWxldGUsaGFzLGdldCxzZXQnKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIG1ldGhvZCA9IFdlYWtNYXBbUFJPVE9UWVBFXVtrZXldO1xyXG4gICAgICBXZWFrTWFwW1BST1RPVFlQRV1ba2V5XSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGxlYWt5IG1hcFxyXG4gICAgICAgIGlmKGlzT2JqZWN0KGEpICYmIGlzRnJvemVuKGEpKXtcclxuICAgICAgICAgIHZhciByZXN1bHQgPSBsZWFrU3RvcmUodGhpcylba2V5XShhLCBiKTtcclxuICAgICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxyXG4gICAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIDIzLjQgV2Vha1NldCBPYmplY3RzXHJcbiAgV2Vha1NldCA9IGdldENvbGxlY3Rpb24oV2Vha1NldCwgV0VBS1NFVCwge1xyXG4gICAgLy8gMjMuNC4zLjEgV2Vha1NldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gICAgYWRkOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWZXZWFrKHRoaXMsIHZhbHVlLCB0cnVlKTtcclxuICAgIH1cclxuICB9LCB3ZWFrTWV0aG9kcywgZmFsc2UsIHRydWUpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5yZWZsZWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gIGZ1bmN0aW9uIEVudW1lcmF0ZShpdGVyYXRlZCl7XHJcbiAgICB2YXIga2V5cyA9IFtdLCBrZXk7XHJcbiAgICBmb3Ioa2V5IGluIGl0ZXJhdGVkKWtleXMucHVzaChrZXkpO1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgYToga2V5cywgaTogMH0pO1xyXG4gIH1cclxuICBjcmVhdGVJdGVyYXRvcihFbnVtZXJhdGUsIE9CSkVDVCwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIGtleXMgPSBpdGVyLmFcclxuICAgICAgLCBrZXk7XHJcbiAgICBkbyB7XHJcbiAgICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aClyZXR1cm4gaXRlclJlc3VsdCgxKTtcclxuICAgIH0gd2hpbGUoISgoa2V5ID0ga2V5c1tpdGVyLmkrK10pIGluIGl0ZXIubykpO1xyXG4gICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwga2V5KTtcclxuICB9KTtcclxuICBcclxuICBmdW5jdGlvbiB3cmFwKGZuKXtcclxuICAgIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIGFzc2VydE9iamVjdChpdCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSwgdHJ1ZTtcclxuICAgICAgfSBjYXRjaChlKXtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gcmVmbGVjdEdldCh0YXJnZXQsIHByb3BlcnR5S2V5LyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl1cclxuICAgICAgLCBkZXNjID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcclxuICAgIGlmKGRlc2MpcmV0dXJuIGhhcyhkZXNjLCAndmFsdWUnKVxyXG4gICAgICA/IGRlc2MudmFsdWVcclxuICAgICAgOiBkZXNjLmdldCA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgPyB1bmRlZmluZWRcclxuICAgICAgICA6IGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG90eXBlT2YodGFyZ2V0KSlcclxuICAgICAgPyByZWZsZWN0R2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXHJcbiAgICAgIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuICBmdW5jdGlvbiByZWZsZWN0U2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgNCA/IHRhcmdldCA6IGFyZ3VtZW50c1szXVxyXG4gICAgICAsIG93bkRlc2MgID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpXHJcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcclxuICAgIGlmKCFvd25EZXNjKXtcclxuICAgICAgaWYoaXNPYmplY3QocHJvdG8gPSBnZXRQcm90b3R5cGVPZih0YXJnZXQpKSl7XHJcbiAgICAgICAgcmV0dXJuIHJlZmxlY3RTZXQocHJvdG8sIHByb3BlcnR5S2V5LCBWLCByZWNlaXZlcik7XHJcbiAgICAgIH1cclxuICAgICAgb3duRGVzYyA9IGRlc2NyaXB0b3IoMCk7XHJcbiAgICB9XHJcbiAgICBpZihoYXMob3duRGVzYywgJ3ZhbHVlJykpe1xyXG4gICAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gZ2V0T3duRGVzY3JpcHRvcihyZWNlaXZlciwgcHJvcGVydHlLZXkpIHx8IGRlc2NyaXB0b3IoMCk7XHJcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvci52YWx1ZSA9IFY7XHJcbiAgICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eShyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvciksIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3duRGVzYy5zZXQgPT09IHVuZGVmaW5lZFxyXG4gICAgICA/IGZhbHNlXHJcbiAgICAgIDogKG93bkRlc2Muc2V0LmNhbGwocmVjZWl2ZXIsIFYpLCB0cnVlKTtcclxuICB9XHJcbiAgdmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgcmV0dXJuSXQ7XHJcbiAgXHJcbiAgdmFyIHJlZmxlY3QgPSB7XHJcbiAgICAvLyAyNi4xLjEgUmVmbGVjdC5hcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdClcclxuICAgIGFwcGx5OiBjdHgoY2FsbCwgYXBwbHksIDMpLFxyXG4gICAgLy8gMjYuMS4yIFJlZmxlY3QuY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCBbLCBuZXdUYXJnZXRdKVxyXG4gICAgY29uc3RydWN0OiBmdW5jdGlvbih0YXJnZXQsIGFyZ3VtZW50c0xpc3QgLyosIG5ld1RhcmdldCovKXtcclxuICAgICAgdmFyIHByb3RvICAgID0gYXNzZXJ0RnVuY3Rpb24oYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl0pW1BST1RPVFlQRV1cclxuICAgICAgICAsIGluc3RhbmNlID0gY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0UHJvdG8pXHJcbiAgICAgICAgLCByZXN1bHQgICA9IGFwcGx5LmNhbGwodGFyZ2V0LCBpbnN0YW5jZSwgYXJndW1lbnRzTGlzdCk7XHJcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4zIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcylcclxuICAgIGRlZmluZVByb3BlcnR5OiB3cmFwKGRlZmluZVByb3BlcnR5KSxcclxuICAgIC8vIDI2LjEuNCBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgICBkZWxldGVQcm9wZXJ0eTogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHZhciBkZXNjID0gZ2V0T3duRGVzY3JpcHRvcihhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gICAgICByZXR1cm4gZGVzYyAmJiAhZGVzYy5jb25maWd1cmFibGUgPyBmYWxzZSA6IGRlbGV0ZSB0YXJnZXRbcHJvcGVydHlLZXldO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXHJcbiAgICBlbnVtZXJhdGU6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiBuZXcgRW51bWVyYXRlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXHJcbiAgICBnZXQ6IHJlZmxlY3RHZXQsXHJcbiAgICAvLyAyNi4xLjcgUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHJldHVybiBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxyXG4gICAgZ2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiBnZXRQcm90b3R5cGVPZihhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS45IFJlZmxlY3QuaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgICBoYXM6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgICByZXR1cm4gcHJvcGVydHlLZXkgaW4gdGFyZ2V0O1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxyXG4gICAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgICByZXR1cm4gISFpc0V4dGVuc2libGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuMTEgUmVmbGVjdC5vd25LZXlzKHRhcmdldClcclxuICAgIG93bktleXM6IG93bktleXMsXHJcbiAgICAvLyAyNi4xLjEyIFJlZmxlY3QucHJldmVudEV4dGVuc2lvbnModGFyZ2V0KVxyXG4gICAgcHJldmVudEV4dGVuc2lvbnM6IHdyYXAoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zIHx8IHJldHVybkl0KSxcclxuICAgIC8vIDI2LjEuMTMgUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgViBbLCByZWNlaXZlcl0pXHJcbiAgICBzZXQ6IHJlZmxlY3RTZXRcclxuICB9XHJcbiAgLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXHJcbiAgaWYoc2V0UHJvdG90eXBlT2YpcmVmbGVjdC5zZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvdG8pe1xyXG4gICAgcmV0dXJuIHNldFByb3RvdHlwZU9mKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm90byksIHRydWU7XHJcbiAgfTtcclxuICBcclxuICAkZGVmaW5lKEdMT0JBTCwge1JlZmxlY3Q6IHt9fSk7XHJcbiAgJGRlZmluZShTVEFUSUMsICdSZWZsZWN0JywgcmVmbGVjdCk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM3LnByb3Bvc2FscyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgJGRlZmluZShQUk9UTywgQVJSQVksIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG4gICAgaW5jbHVkZXM6IGNyZWF0ZUFycmF5Q29udGFpbnModHJ1ZSlcclxuICB9KTtcclxuICAkZGVmaW5lKFBST1RPLCBTVFJJTkcsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuYXRcclxuICAgIGF0OiBjcmVhdGVQb2ludEF0KHRydWUpXHJcbiAgfSk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAgICAgLCBrZXlzICAgPSBnZXRLZXlzKG9iamVjdClcclxuICAgICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICAgLCByZXN1bHQgPSBBcnJheShsZW5ndGgpXHJcbiAgICAgICAgLCBrZXk7XHJcbiAgICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XHJcbiAgICAgIGVsc2Ugd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBPW2tleXNbaSsrXV07XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gICRkZWZpbmUoU1RBVElDLCBPQkpFQ1QsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vOTM1Mzc4MVxyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgICAsIHJlc3VsdCA9IHt9O1xyXG4gICAgICBmb3JFYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICBkZWZpbmVQcm9wZXJ0eShyZXN1bHQsIGtleSwgZGVzY3JpcHRvcigwLCBnZXRPd25EZXNjcmlwdG9yKE8sIGtleSkpKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3J3YWxkcm9uL3RjMzktbm90ZXMvYmxvYi9tYXN0ZXIvZXM2LzIwMTQtMDQvYXByLTkubWQjNTEtb2JqZWN0ZW50cmllcy1vYmplY3R2YWx1ZXNcclxuICAgIHZhbHVlczogIGNyZWF0ZU9iamVjdFRvQXJyYXkoZmFsc2UpLFxyXG4gICAgZW50cmllczogY3JlYXRlT2JqZWN0VG9BcnJheSh0cnVlKVxyXG4gIH0pO1xyXG4gICRkZWZpbmUoU1RBVElDLCBSRUdFWFAsIHtcclxuICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thbmdheC85Njk4MTAwXHJcbiAgICBlc2NhcGU6IGNyZWF0ZVJlcGxhY2VyKC8oW1xcXFxcXC1bXFxde30oKSorPy4sXiR8XSkvZywgJ1xcXFwkMScsIHRydWUpXHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM3LmFic3RyYWN0LXJlZnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3plbnBhcnNpbmcvZXMtYWJzdHJhY3QtcmVmc1xyXG4hZnVuY3Rpb24oUkVGRVJFTkNFKXtcclxuICBSRUZFUkVOQ0VfR0VUID0gZ2V0V2VsbEtub3duU3ltYm9sKFJFRkVSRU5DRSsnR2V0JywgdHJ1ZSk7XHJcbiAgdmFyIFJFRkVSRU5DRV9TRVQgPSBnZXRXZWxsS25vd25TeW1ib2woUkVGRVJFTkNFK1NFVCwgdHJ1ZSlcclxuICAgICwgUkVGRVJFTkNFX0RFTEVURSA9IGdldFdlbGxLbm93blN5bWJvbChSRUZFUkVOQ0UrJ0RlbGV0ZScsIHRydWUpO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBTWU1CT0wsIHtcclxuICAgIHJlZmVyZW5jZUdldDogUkVGRVJFTkNFX0dFVCxcclxuICAgIHJlZmVyZW5jZVNldDogUkVGRVJFTkNFX1NFVCxcclxuICAgIHJlZmVyZW5jZURlbGV0ZTogUkVGRVJFTkNFX0RFTEVURVxyXG4gIH0pO1xyXG4gIFxyXG4gIGhpZGRlbihGdW5jdGlvblByb3RvLCBSRUZFUkVOQ0VfR0VULCByZXR1cm5UaGlzKTtcclxuICBcclxuICBmdW5jdGlvbiBzZXRNYXBNZXRob2RzKENvbnN0cnVjdG9yKXtcclxuICAgIGlmKENvbnN0cnVjdG9yKXtcclxuICAgICAgdmFyIE1hcFByb3RvID0gQ29uc3RydWN0b3JbUFJPVE9UWVBFXTtcclxuICAgICAgaGlkZGVuKE1hcFByb3RvLCBSRUZFUkVOQ0VfR0VULCBNYXBQcm90by5nZXQpO1xyXG4gICAgICBoaWRkZW4oTWFwUHJvdG8sIFJFRkVSRU5DRV9TRVQsIE1hcFByb3RvLnNldCk7XHJcbiAgICAgIGhpZGRlbihNYXBQcm90bywgUkVGRVJFTkNFX0RFTEVURSwgTWFwUHJvdG9bJ2RlbGV0ZSddKTtcclxuICAgIH1cclxuICB9XHJcbiAgc2V0TWFwTWV0aG9kcyhNYXApO1xyXG4gIHNldE1hcE1ldGhvZHMoV2Vha01hcCk7XHJcbn0oJ3JlZmVyZW5jZScpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBqcy5hcnJheS5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxyXG4hZnVuY3Rpb24oYXJyYXlTdGF0aWNzKXtcclxuICBmdW5jdGlvbiBzZXRBcnJheVN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcclxuICAgIGZvckVhY2guY2FsbChhcnJheShrZXlzKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoa2V5IGluIEFycmF5UHJvdG8pYXJyYXlTdGF0aWNzW2tleV0gPSBjdHgoY2FsbCwgQXJyYXlQcm90b1trZXldLCBsZW5ndGgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNldEFycmF5U3RhdGljcygncG9wLHJldmVyc2Usc2hpZnQsa2V5cyx2YWx1ZXMsZW50cmllcycsIDEpO1xyXG4gIHNldEFycmF5U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xyXG4gIHNldEFycmF5U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xyXG4gICAgICAgICAgICAgICAgICAncmVkdWNlLHJlZHVjZVJpZ2h0LGNvcHlXaXRoaW4sZmlsbCx0dXJuJyk7XHJcbiAgJGRlZmluZShTVEFUSUMsIEFSUkFZLCBhcnJheVN0YXRpY3MpO1xyXG59KHt9KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogd2ViLmRvbS5pdGFyYWJsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKE5vZGVMaXN0KXtcclxuICBpZihmcmFtZXdvcmsgJiYgTm9kZUxpc3QgJiYgIShTWU1CT0xfSVRFUkFUT1IgaW4gTm9kZUxpc3RbUFJPVE9UWVBFXSkpe1xyXG4gICAgaGlkZGVuKE5vZGVMaXN0W1BST1RPVFlQRV0sIFNZTUJPTF9JVEVSQVRPUiwgSXRlcmF0b3JzW0FSUkFZXSk7XHJcbiAgfVxyXG4gIEl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEl0ZXJhdG9yc1tBUlJBWV07XHJcbn0oZ2xvYmFsLk5vZGVMaXN0KTtcbn0odHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCksIHRydWUpOyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvbWFzdGVyL0xJQ0VOU0UgZmlsZS4gQW5cbiAqIGFkZGl0aW9uYWwgZ3JhbnQgb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpblxuICogdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID1cbiAgICB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHJldHVybiBuZXcgR2VuZXJhdG9yKGlubmVyRm4sIG91dGVyRm4sIHNlbGYgfHwgbnVsbCwgdHJ5TG9jc0xpc3QgfHwgW10pO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuZXJhdG9yID0gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCk7XG4gICAgICB2YXIgY2FsbE5leHQgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLm5leHQpO1xuICAgICAgdmFyIGNhbGxUaHJvdyA9IHN0ZXAuYmluZChnZW5lcmF0b3JbXCJ0aHJvd1wiXSk7XG5cbiAgICAgIGZ1bmN0aW9uIHN0ZXAoYXJnKSB7XG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaCh0aGlzLCBudWxsLCBhcmcpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICByZXNvbHZlKGluZm8udmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZShpbmZvLnZhbHVlKS50aGVuKGNhbGxOZXh0LCBjYWxsVGhyb3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxOZXh0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGdlbmVyYXRvciA9IG91dGVyRm4gPyBPYmplY3QuY3JlYXRlKG91dGVyRm4ucHJvdG90eXBlKSA6IHRoaXM7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCk7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSxcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yLFxuICAgICAgICAgICAgYXJnXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gTGlrZSByZXR1cm5pbmcgZ2VuZXJhdG9yLnRocm93KHVuY2F1Z2h0KSwgYnV0IHdpdGhvdXQgdGhlXG4gICAgICAgICAgICAvLyBvdmVyaGVhZCBvZiBhbiBleHRyYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIGFyZyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgXCJhdHRlbXB0IHRvIHNlbmQgXCIgKyBKU09OLnN0cmluZ2lmeShhcmcpICsgXCIgdG8gbmV3Ym9ybiBnZW5lcmF0b3JcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG5cbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihyZWNvcmQuYXJnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW5lcmF0b3IubmV4dCA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJuZXh0XCIpO1xuICAgIGdlbmVyYXRvcltcInRocm93XCJdID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInRocm93XCIpO1xuICAgIGdlbmVyYXRvcltcInJldHVyblwiXSA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJyZXR1cm5cIik7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICAvLyBQcmUtaW5pdGlhbGl6ZSBhdCBsZWFzdCAyMCB0ZW1wb3JhcnkgdmFyaWFibGVzIHRvIGVuYWJsZSBoaWRkZW5cbiAgICAgIC8vIGNsYXNzIG9wdGltaXphdGlvbnMgZm9yIHNpbXBsZSBnZW5lcmF0b3JzLlxuICAgICAgZm9yICh2YXIgdGVtcEluZGV4ID0gMCwgdGVtcE5hbWU7XG4gICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIHRlbXBOYW1lID0gXCJ0XCIgKyB0ZW1wSW5kZXgpIHx8IHRlbXBJbmRleCA8IDIwO1xuICAgICAgICAgICArK3RlbXBJbmRleCkge1xuICAgICAgICB0aGlzW3RlbXBOYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcbiAgICAgICAgcmV0dXJuICEhY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOiB0aGlzXG4pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvYmFiZWwvcG9seWZpbGxcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiYWJlbC1jb3JlL3BvbHlmaWxsXCIpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
