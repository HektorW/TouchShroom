
let requestAnimationFrame = (function() {
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback){
              setTimeout(function(){
                  callback(window.performance.now());
              }, 1000/60);
          };
}());

let cancelAnimationFrame = (function() {
  return  window.cancelAnimationFrame ||
          window.webkitCancelAnimationFrame ||
          window.mozCancelAnimationFrame ||
          window.msCancelAnimationFrame ||
          window.clearTimeout(id);
}());


let performance = window.performance = {};
performance.now = performance.now ||
                  performance.webkitNow ||
                  performance.mozNow ||
                  performance.msNow ||
                  function() { return (new Date()).getTime(); };


let AudioContext = window.AudioContext ||
                   window.webkitAudioContext ||
                   window.mozNow ||
                   window.msNow ||
                   undefined;


module.exports = {
  requestAnimationFrame,
  cancelAnimationFrame,
  performance,
  AudioContext
};