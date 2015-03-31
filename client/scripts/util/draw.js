
function drawLine(ctx, x1, y1, x2, y2, color, width){

  if(color) ctx.strokeStyle = color;
  if(width) ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCircle(ctx, x, y, r, color, style = 'fill'){

  if(color) ctx[style+'Style'] = color;

  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI*2, false);
  ctx[style]();
}


module.exports = {
  drawLine,
  drawCircle
}