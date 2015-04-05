
var util = require('./util.js');
var vecDistance = require('./math.js').vecDistance;

function Minion(player_id, source, target, scale){
    this.source_base = source;
    this.target_base = target;

    this.player_id = player_id;

    this.id = util.uniqueID('minion');

    this.left = this.source_base.left;
    this.top = this.source_base.top;
    this.scale = scale || 0.001;
    // this.color = this.source_base.color;

    this.active = true;

    this.start_time = Date.now();
    this.active_time = 0;

    this.speed = 3;

    this.calcSpeed();
}
/** 
 * { CALCULATE SPEED }
 */
Minion.prototype.calcSpeed = function() {
    var delta_speed = 1 / this.speed;

    var distance = vecDistance(this.source_base.left, this.source_base.top, this.target_base.left, this.target_base.top);
    var distance_left = this.target_base.left - this.source_base.left;
    var distance_top = this.target_base.top - this.source_base.top;

    this.vel_left = (distance_left / Math.abs((distance / delta_speed))) || 0;
    this.vel_top = (distance_top / Math.abs((distance / delta_speed))) || 0;
};
/** 
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Minion.prototype.update = function(t) {
    this.active_time += t;

    this.left = this.source_base.left + this.vel_left * this.active_time;
    this.top = this.source_base.top + this.vel_top * this.active_time;
};
/**
 * { SETUP JSON }
 * Get information that is shared across network
 */
Minion.prototype.setupJSON = function() {
    return {
        id: this.id,
        player_id: this.player_id,
        // left: this.left,
        // top: this.top,
        scale: this.scale,
        source_id: this.source_base.id,
        target_id: this.target_base.id
    };
};



module.exports = Minion;