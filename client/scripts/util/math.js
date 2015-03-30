
function vecDistanceSq(x1, y1, x2, y2){
    return Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
}
function vecDistance(x1, y1, x2, y2){
    return Math.sqrt(vecDistanceSq(x1, y1, x2, y2));
}
function pointInCircle(px, py, cx, cy, cr){
    return (vecDistanceSq(px, py, cx, cy) < Math.pow(cr, 2));
}


module.exports = {
  vecDistanceSq,
  vecDistance,
  pointInCircle
};