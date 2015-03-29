/** TODO
 * -    [Bug] Base sometimes doesn't change owner on client but seems to on server.
 *         Base receivs new resources instead of diminishing when sent by client but
 *         client can't controll it and it isn't colored correctly
 */



// --------------------------------------------------------------
/** [ TOUCH ]
 * 
 */
var TOUCH = {
    down: false,
    x: -1, y: -1,
    start_x: -1, start_y: -1,
    end_x: -1, end_y: -1,
    prev_x: -1, prev_y: -1,
    start_time: -1
};





















// --------------------------------------------------------------
/** [ BASE ]
 * Base class for buildings
 * @param {Number} id
 * @param {Number} left     Value (0.0 - 1.0) percentage x
 * @param {Number} top      Value (0.0 - 1.0) percentage y
 * @param {Number} scale
 * @param {Number} resources
 */
function Base(id, left, top, scale, resources, resources_max){
    this.id = id;

    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.1;
    this.shadow_size = 30;

    this.color = '#AAAAAA';

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
Base.prototype.resize = function() {
    if(GAME.width > GAME.height) {
        this.x = GAME.width * this.left;
        this.y = GAME.height * this.top;
        this.size = GAME.height * this.scale;
    } else {
        this.x = GAME.width - (GAME.width * this.top);
        this.y = GAME.height * this.left;
        this.size = GAME.width * this.scale;
    }
};
/**
 * { SET PLAYER }
 * Sets which player owns the base
 * @param  {Player} player
 */
Base.prototype.setPlayer = function(player) {
    if(this.player){
        this.player.removeBase(this);
    }

    this.color = player.color;
    this.player = player;
    this.player.addBase(this);
};
/**
 * { CAN SEND MINION }
 * Tests if the base can send a minion
 */
Base.prototype.canSendMinion = function() {
    return (this.spawn_delay <= 0.0);

    // if(this.spawn_delay <= 0.0){
    //     this.spawn_delay = this.spawn_delay_max;
    //     return true;
    // }
    // return false;
};
Base.prototype.sendMinion = function() {
    this.spawn_delay = this.spawn_delay_max;
    --this.resources;
};

/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Base.prototype.update = function(t) {
    if(this.spawn_delay > 0)
        this.spawn_delay -= t;
};
/**
 * { DRAW }
 * @param  {Context} ctx    Rendering context
 */
Base.prototype.draw = function(ctx) {
    ctx.save();

    ctx.fillStyle = this.color;

    if(this.hovered){
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
    }
    else if(this.selected){
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
    ctx.fill();


    // Draw text
    ctx.fillStyle = 'black';
    var text = this.resources + ((this.player)? '/' + this.resources_max : '');
    var m = ctx.measureText(text);
    ctx.fillText(text, this.x - m.width/2, this.y);

    ctx.restore();
};







// --------------------------------------------------------------
/** [ PLAYER ]
 * Player
 * @param {Number} id
 * @param {String} color
 */
function Player(id, name, color){
    this.id = id;
    this.name = name;
    this.color = color;

    this.bases_id = [];
}
/**
 * { ADD BASE }
 * Adds a base to player
 * @param  {Base} base
 */
Player.prototype.addBase = function(base) {
    if(!this.bases_id.contains(base.id))
        this.bases_id.push(base.id);
};
/**
 * { REMOVE BASE }
 * Removes a base from player
 * @param  {Base} base
 */
Player.prototype.removeBase = function(base) {
    var i = this.bases_id.indexOf(base.id);
    if(i !== -1)
        this.bases_id.splice(i, 1);
};
/**
 * { TOTAL RESOURCES }
 * Calculates players total resources based on bases
 */
Player.prototype.totalResources = function() {
    var t = 0, index, i, len;
    for(i = 0, len = this.bases_id.length; i < len; i++){
        index = GAME.bases.indexByID(this.bases_id[i]);
        t += GAME.bases[index].resources;
     }
     return t;
};






// --------------------------------------------------------------
/** [ PARTICLE ]
 * 
 */
function Particle(left, top, scale, color){
    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.01;

    this.color = color || '#AAAAAA';
    this.rgba = hexcolorToRGB(this.color);
    this.rgba[3] = 1.0;

    this.active = true;
    this.live_count = 0.0;

    this.resize();
}
/**
 * { RESIZE }
 */
Particle.prototype.resize = function() {
    if(GAME.width > GAME.height) {
        this.x = GAME.width * this.left;
        this.y = GAME.height * this.top;
        this.size = GAME.height * this.scale;
    } else {
        this.x = GAME.width - (GAME.width * this.top);
        this.y = GAME.height * this.left;
        this.size = GAME.width * this.scale;
    }
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Particle.prototype.update = function(t) {
    this.live_count += t;
    this.rgba[3] -= t * 0.5;

    if(this.rgba[3] < 0)
        this.active = false;
};
/**
 * { DRAW }
 * @param  {Context} ctx    Rendering context
 */
Particle.prototype.draw = function(ctx) {
    ctx.save();

    ctx.strokeStyle = String.prototype.format.apply('rgba({0},{1},{2},{3})', this.rgba);
    // ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + (this.live_count * 10), Math.PI*2, false);
    ctx.stroke();

    ctx.restore();
};






// --------------------------------------------------------------
/** DRAW UTIL
 * 
 */
function drawLine(ctx, x1, y1, x2, y2, color, width){
    if(color)
        ctx.strokeStyle = color;
    if(width)
        ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function drawCircle(ctx, x, y, r, color, style){
    style = style || 'fill';
    if(color)
        ctx[style+'Style'] = color;

    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, false);
    ctx[style]();
}






// --------------------------------------------------------------
/** UTIL
 * 
 */
function randomRange(min, max){
    return ((Math.random() * (max-min)) + min);
}
function randomRangeInt(min, max){
    return (Math.floor(Math.random() * (max-min)) + min);
}
function hexcharToDec(hexval){
    var c = hexval.toUpperCase().charCodeAt(0);
    return (c < 60)? (c-48) : (c-55);
}
function hexcolorToRGB(hex){
    hex = hex.replace('#', '');
    var rgb = [];
    var inc = (hex.length < 6)? 1 : 2;
    for(var i = 0, len = hex.length; i < len; i+=inc){
        // var v = hex.substr(i, inc);
        rgb.push(parseInt(hex.substr(i, inc), 16));
    }

    // switch(hex.length){
    //     case 3: { // #FFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[0]),
    //             (hexcharToDec(hex[1]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[2])
    //         ];
    //     } break;
    //     case 4: { // #FFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[0]),
    //             (hexcharToDec(hex[1]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[2]),
    //             (hexcharToDec(hex[3]) * 16) + hexcharToDec(hex[3])
    //         ];
    //     } break;
    //     case 6: { // #FFFFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[3]),
    //             (hexcharToDec(hex[4]) * 16) + hexcharToDec(hex[5])
    //         ];
    //     } break;
    //     case 8: { // #FFFFFFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[3]),
    //             (hexcharToDec(hex[4]) * 16) + hexcharToDec(hex[5]),
    //             (hexcharToDec(hex[6]) * 16) + hexcharToDec(hex[7])
    //         ];
    //     } break;
    // }
    return rgb;
}





// --------------------------------------------------------------
/** SETUP PRE-FIXES
 * 
 */
window.performance = window.performance || {};
window.performance.now =
        window.performance.now ||
        window.performance.webkitNow ||
        window.performance.mozNow ||
        window.performance.msNow ||
        function(){ return Date.now(); };


/**
 * GRADIENT CODE
 */
// var grd = GAME.ctx.createRadialGradient(x, y, ir, x, y, or);
// grd.addColorStop(0, 'rgba(255, 0, 0, 1.0)');
// grd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
// GAME.ctx.fillStyle = grd;
// GAME.ctx.fillRect(x-or, y-or, or*2, or*2);

/**
 * OLD DRAW DOTS
 */
// function draw(){
//     GAME.ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
//     var ir = 2;
//     var or = 30;

//     var num_balls = 5;
//     var delta_x = (TOUCH.x - TOUCH.start_x) / num_balls;
//     var delta_y = (TOUCH.y - TOUCH.start_y) / num_balls;
//     var delta_scale = 5;
//     var start_scale = 10;
//     GAME.ctx.fillStyle = 'red';
//     GAME.ctx.shadowBlur = 40;
//     GAME.ctx.shadowColor = 'red';

//     GAME.ctx.beginPath();
//     for(var i = 0; i < num_balls; i++){
//         GAME.ctx.arc(TOUCH.start_x + (delta_x * i), TOUCH.start_y + (delta_y * i), start_scale + (delta_scale * i), Math.PI*2, false);
//     }
//     GAME.ctx.fill();
// }


/** Initialize GAME
 * 
 */
// window.addEventListener('load', GAME.init, false);