
function randomRange(min, max){
    return ((Math.random() * (max-min)) + min);
}
function randomRangeInt(min, max){
    return (Math.floor(Math.random() * (max-min)) + min);
}

module.exports = {
  randomRange,
  randomRangeInt
}