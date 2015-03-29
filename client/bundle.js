(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Sound = _interopRequire(require("./soundmanager"));

var App = (function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, {
    init: {
      value: function init() {
        return this;
      }
    }
  });

  return App;
})();

module.exports = App;

},{"./soundmanager":3}],2:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var App = _interopRequire(require("./app"));

var polyfill = _interopRequireWildcard(require("./util/polyfill"));

var app = window.app = new App().init();

},{"./app":1,"./util/polyfill":4}],3:[function(require,module,exports){
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
      }
    },
    initSounds: {
      value: function initSounds() {
        this.loadSound("sound/marimba/c4.wav", "c4");
        this.loadSound("sound/marimba/d4.wav", "d4");
        this.loadSound("sound/marimba/e4.wav", "e4");
        this.loadSound("sound/marimba/f4.wav", "f4");
        this.loadSound("sound/marimba/g4.wav", "g4");
        this.loadSound("sound/marimba/a4.wav", "a4");
        this.loadSound("sound/marimba/b4.wav", "b4");
        this.loadSound("sound/marimba/c5.wav", "c5");
        this.loadSound("sound/marimba/d5.wav", "d5");
        this.loadSound("sound/marimba/e5.wav", "e5");
        this.loadSound("sound/marimba/f5.wav", "f5");
        this.loadSound("sound/marimba/g5.wav", "g5");
        this.loadSound("sound/marimba/a5.wav", "a5");
        this.loadSound("sound/marimba/b5.wav", "b5");
        this.loadSound("sound/marimba/c6.wav", "c6");
        this.loadSound("sound/marimba/d6.wav", "d6");
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

module.exports = {
  requestAnimationFrame: requestAnimationFrame,
  cancelAnimationFrame: cancelAnimationFrame
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9qcy9hcHAuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvanMvbWFpbi5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9qcy9zb3VuZG1hbmFnZXIuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvanMvdXRpbC9wb2x5ZmlsbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQ08sS0FBSywyQkFBTSxnQkFBZ0I7O0lBR2IsR0FBRztBQUVYLFdBRlEsR0FBRyxHQUVSOzBCQUZLLEdBQUc7R0FFTDs7ZUFGRSxHQUFHO0FBSXRCLFFBQUk7YUFBQSxnQkFBRztBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7Ozs7U0FOa0IsR0FBRzs7O2lCQUFILEdBQUc7Ozs7Ozs7OztJQ0hqQixHQUFHLDJCQUFNLE9BQU87O0lBQ1gsUUFBUSxtQ0FBTSxpQkFBaUI7O0FBRTNDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7Ozs7Ozs7O0FDRnhDLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLElBQ25CLE1BQU0sQ0FBQyxrQkFBa0IsSUFDekIsTUFBTSxDQUFDLE1BQU0sSUFDYixNQUFNLENBQUMsS0FBSyxJQUNaLFNBQVMsQ0FBQzs7SUFHUixLQUFLO0FBRWIsV0FGUSxLQUFLLEdBRVY7MEJBRkssS0FBSzs7QUFHdEIsUUFBSSxDQUFDLEdB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Q0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDOUU7Ozs7U0ExRmtCLEtBQUs7OztpQkFBTCxLQUFLOzs7OztBQ1IxQixJQUFJLHFCQUFxQixHQUFJLENBQUEsWUFBVztBQUN0QyxTQUFRLE1BQU0sQ0FBQyxxQkFBcUIsSUFDNUIsTUFBTSxDQUFDLDJCQUEyQixJQUNsQyxNQUFNLENBQUMsd0JBQXdCLElBQy9CLE1BQU0sQ0FBQyx1QkFBdUIsSUFDOUIsVUFBUyxRQUFRLEVBQUM7QUFDZCxjQUFVLENBQUMsWUFBVTtBQUNqQixjQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDLEVBQUUsSUFBSSxHQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ2YsQ0FBQztDQUNYLENBQUEsRUFBRSxBQUFDLENBQUM7O0FBRUwsSUFBSSxvQkFBb0IsR0FBSSxDQUFBLFlBQVc7QUFDckMsU0FBUSxNQUFNLENBQUMsb0JBQW9CLElBQzNCLE1BQU0sQ0FBQywwQkFBMEIsSUFDakMsTUFBTSxDQUFDLHVCQUF1QixJQUM5QixNQUFNLENBQUMsc0JBQXNCLElBQzdCLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDakMsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7QUFJTCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixzQkFBb0IsRUFBcEIsb0JBQW9CO0NBQ3JCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5pbXBvcnQgU291bmQgZnJvbSAnLi9zb3VuZG1hbmFnZXInO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcCB7XG5cbiAgY29uc3RydWN0b3IoKSB7IH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCJcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnXG5pbXBvcnQgKiBhcyBwb2x5ZmlsbCBmcm9tICcuL3V0aWwvcG9seWZpbGwnO1xuXG52YXIgYXBwID0gd2luZG93LmFwcCA9IG5ldyBBcHAoKS5pbml0KCk7IiwiXG5cbmxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8XG4gICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fFxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pOb3cgfHxcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNOb3cgfHxcbiAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQ7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291bmQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xuICAgIHRoaXMuc291bmRfbmFtZXMgPSBbXTtcbiAgICB0aGlzLnN0YXJ0dXBfZXZlbnQgPSBudWxsO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAoIXdpbmRvdy5BdWRpb0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiQXVkaW9Db250ZXh0IG5vdCBzdXBwb3J0ZWQgYnkgYnJvd3NlclwiO1xuICAgIH1cblxuICAgIHRoaXMuY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4gICAgdGhpcy5pbml0U291bmRzKCk7XG4gIH1cblxuXG4gIGluaXRTb3VuZHMoKSB7ICBcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNC53YXYnLCAnYzQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNC53YXYnLCAnZDQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9lNC53YXYnLCAnZTQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9mNC53YXYnLCAnZjQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9nNC53YXYnLCAnZzQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9hNC53YXYnLCAnYTQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9iNC53YXYnLCAnYjQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNS53YXYnLCAnYzUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNS53YXYnLCAnZDUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9lNS53YXYnLCAnZTUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9mNS53YXYnLCAnZjUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9nNS53YXYnLCAnZzUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9hNS53YXYnLCAnYTUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9iNS53YXYnLCAnYjUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNi53YXYnLCAnYzYnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNi53YXYnLCAnZDYnKTtcbiAgfVxuXG5cbiAgbG9hZFNvdW5kKHVybCwgbmFtZSkge1xuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICBcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgdGhpcy5jdHguZGVjb2RlQXVkaW9EYXRhKHhoci5yZXNwb25zZSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICB0aGlzLnNvdW5kX25hbWVzLnB1c2gobmFtZSk7XG4gICAgICAgIHRoaXMuc291bmRzW25hbWVdID0gYnVmZmVyO1xuXG4gICAgICAgIGlmKHRoaXMuc3RhcnR1cF9ldmVudCA9PT0gbnVsbCl7XG4gICAgICAgICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU291bmQoKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgeGhyLnNlbmQoKTtcbiAgfVxuXG5cbiAgcGxheVNvdW5kKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuc291bmRzW25hbWVdKSByZXR1cm47XG5cbiAgICBsZXQgc291bmQgPSB0aGlzLnR4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHNvdW5kLmJ1ZmZlciA9IHRoaXMuc291bmRzW25hbWVdO1xuXG4gICAgbGV0IGdhaW4gPSB0aGlzLmNyZWF0ZUdhaW5Ob2RlKDAuOCwgMC4wLCAwLjQpO1xuXG4gICAgc291bmQuY29ubmVjdChnYWluKTtcbiAgICBnYWluLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xuXG4gICAgc291bmQubm90ZU9uKDApO1xuICB9XG5cbiAgY3JlYXRlR2Fpbk5vZGUoc3RhcnQsIGVuZCwgdGltZSkge1xuICAgIGxldCBub2RlID0gdGhpcy5jdHguY3JlYXRlR2FpbigpO1xuICAgIGxldCBub3cgPSB0aGlzLmN0eC5jdXJyZW50VGltZTtcblxuICAgIG5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShzdGFydCwgbm93KTtcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZW5kLCBub3cgKyB0aW1lKTtcblxuICAgIHJldHVybiBnYWluO1xuICB9XG5cbiAgcGxheVJhbmRvbVNvdW5kKCkge1xuICAgIHRoaXMucGxheVNvdW5kKHRoaXMuc291bmRfbmFtZXNbcmFuZG9tUmFuZ2VJbnQoMCwgdGhpcy5zb3VuZF9uYW1lcy5sZW5ndGgpXSk7XG4gIH1cbn0iLCJcbmxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFjayh3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICAgICAgICB9LCAxMDAwLzYwKTtcbiAgICAgICAgICB9O1xufSgpKTtcblxubGV0IGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChpZCk7XG59KCkpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWVcbn07Il19
