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

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var App = _interopRequire(require("./app"));

var app = window.app = new App().init();

},{"./app":1}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9qcy9hcHAuanMiLCIvaG9tZS9oZWt0b3J3L3dvcmtzcGFjZS90b3VjaHNocm9vbS9jbGllbnQvanMvbWFpbi5qcyIsIi9ob21lL2hla3Rvcncvd29ya3NwYWNlL3RvdWNoc2hyb29tL2NsaWVudC9qcy9zb3VuZG1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0NPLEtBQUssMkJBQU0sZ0JBQWdCOztJQUdiLEdBQUc7QUFFWCxXQUZRLEdBQUcsR0FFUjswQkFGSyxHQUFHO0dBRUw7O2VBRkUsR0FBRztBQUl0QixRQUFJO2FBQUEsZ0JBQUc7QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiOzs7O1NBTmtCLEdBQUc7OztpQkFBSCxHQUFHOzs7Ozs7O0lDSGpCLEdBQUcsMkJBQU0sT0FBTzs7QUFFdkIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDOzs7Ozs7Ozs7SUNGbkIsS0FBSztBQUViLFdBRlEsS0FBSyxHQUVWOzBCQUZLLEtBQUs7O0FBR3RCLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0dBQzNCOztlQVBrQixLQUFLO0FBU3hCLFFBQUk7YUFBQSxnQkFBRztBQUNMLFlBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3hC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RSxDQUFDO0FBQ3pDLGFBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakMsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUU5QyxhQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFbkMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNqQjs7QUFFRCxrQkFBYzthQUFBLHdCQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQy9CLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDakMsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7O0FBRS9CLFlBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQzs7QUFFbkQsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxtQkFBZTthQUFBLDJCQUFHO0FBQ2hCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzlFOzs7O1NBMUZrQixLQUFLOzs7aUJBQUwsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmltcG9ydCBTb3VuZCBmcm9tICcuL3NvdW5kbWFuYWdlcic7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIHtcblxuICBjb25zdHJ1Y3RvcigpIHsgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsIlxuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCdcblxudmFyIGFwcCA9IHdpbmRvdy5hcHAgPSBuZXcgQXBwKCkuaW5pdCgpOyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291bmQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICB0aGlzLnNvdW5kcyA9IFtdO1xuICAgIHRoaXMuc291bmRfbmFtZXMgPSBbXTtcbiAgICB0aGlzLnN0YXJ0dXBfZXZlbnQgPSBudWxsO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAoIXdpbmRvdy5BdWRpb0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiQXVkaW9Db250ZXh0IG5vdCBzdXBwb3J0ZWQgYnkgYnJvd3NlclwiO1xuICAgIH1cblxuICAgIHRoaXMuY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4gICAgdGhpcy5pbml0U291bmRzKCk7XG4gIH1cblxuXG4gIGluaXRTb3VuZHMoKSB7ICBcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNC53YXYnLCAnYzQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNC53YXYnLCAnZDQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9lNC53YXYnLCAnZTQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9mNC53YXYnLCAnZjQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9nNC53YXYnLCAnZzQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9hNC53YXYnLCAnYTQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9iNC53YXYnLCAnYjQnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNS53YXYnLCAnYzUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNS53YXYnLCAnZDUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9lNS53YXYnLCAnZTUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9mNS53YXYnLCAnZjUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9nNS53YXYnLCAnZzUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9hNS53YXYnLCAnYTUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9iNS53YXYnLCAnYjUnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9jNi53YXYnLCAnYzYnKTtcbiAgICB0aGlzLmxvYWRTb3VuZCgnc291bmQvbWFyaW1iYS9kNi53YXYnLCAnZDYnKTtcbiAgfVxuXG5cbiAgbG9hZFNvdW5kKHVybCwgbmFtZSkge1xuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICBcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgdGhpcy5jdHguZGVjb2RlQXVkaW9EYXRhKHhoci5yZXNwb25zZSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICB0aGlzLnNvdW5kX25hbWVzLnB1c2gobmFtZSk7XG4gICAgICAgIHRoaXMuc291bmRzW25hbWVdID0gYnVmZmVyO1xuXG4gICAgICAgIGlmKHRoaXMuc3RhcnR1cF9ldmVudCA9PT0gbnVsbCl7XG4gICAgICAgICAgdGhpcy5zdGFydHVwX2V2ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU291bmQoKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5zdGFydHVwX2V2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuc3RhcnR1cF9ldmVudCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgeGhyLnNlbmQoKTtcbiAgfVxuXG5cbiAgcGxheVNvdW5kKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuc291bmRzW25hbWVdKSByZXR1cm47XG5cbiAgICBsZXQgc291bmQgPSB0aGlzLnR4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHNvdW5kLmJ1ZmZlciA9IHRoaXMuc291bmRzW25hbWVdO1xuXG4gICAgbGV0IGdhaW4gPSB0aGlzLmNyZWF0ZUdhaW5Ob2RlKDAuOCwgMC4wLCAwLjQpO1xuXG4gICAgc291bmQuY29ubmVjdChnYWluKTtcbiAgICBnYWluLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xuXG4gICAgc291bmQubm90ZU9uKDApO1xuICB9XG5cbiAgY3JlYXRlR2Fpbk5vZGUoc3RhcnQsIGVuZCwgdGltZSkge1xuICAgIGxldCBub2RlID0gdGhpcy5jdHguY3JlYXRlR2FpbigpO1xuICAgIGxldCBub3cgPSB0aGlzLmN0eC5jdXJyZW50VGltZTtcblxuICAgIG5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShzdGFydCwgbm93KTtcbiAgICBub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZW5kLCBub3cgKyB0aW1lKTtcblxuICAgIHJldHVybiBnYWluO1xuICB9XG5cbiAgcGxheVJhbmRvbVNvdW5kKCkge1xuICAgIHRoaXMucGxheVNvdW5kKHRoaXMuc291bmRfbmFtZXNbcmFuZG9tUmFuZ2VJbnQoMCwgdGhpcy5zb3VuZF9uYW1lcy5sZW5ndGgpXSk7XG4gIH1cbn0iXX0=
