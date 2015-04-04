
export let requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            function(callback) {
                                setTimeout(function(){
                                    callback(window.performance.now());
                                }, 1000/60);
                            };

export let cancelAnimationFrame = window.cancelAnimationFrame ||
                           window.webkitCancelAnimationFrame ||
                           window.mozCancelAnimationFrame ||
                           window.msCancelAnimationFrame ||
                           window.clearTimeout;


export let performance = window.performance = {};
performance.now = performance.now ||
                  performance.webkitNow ||
                  performance.mozNow ||
                  performance.msNow ||
                  function() { return (new Date()).getTime(); };


export let AudioContext = window.AudioContext ||
                   window.webkitAudioContext ||
                   window.mozAudioContext ||
                   undefined;


/*module.exports = {
  requestAnimationFrame,
  cancelAnimationFrame,
  performance,
  AudioContext
};*/