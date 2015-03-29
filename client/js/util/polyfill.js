
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



module.exports = {
  requestAnimationFrame,
  cancelAnimationFrame
};