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