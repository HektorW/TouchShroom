
var util = require('./util.js');


function Base(game, left, top, scale, resources, resources_max){
    this.game = game;

    this.left = left;
    this.top = top;
    this.scale = scale;

    this.id = util.uniqueID('base');

    this.player = null;

    this.resources = resources || 10;
    this.resources_max = resources_max || 20;

    this.spawn_delay = 0;
    this.spawn_delay_max = 0.1;

    this.resource_increase_delay_max = 2.0;
    this.resource_increase_delay = this.resource_increase_delay_max;
}
/**
 * { SETUP JSON }
 * Get information that is shared across network
 */
Base.prototype.setupJSON = function() {
    return {
        id: this.id,
        resources: this.resources,
        resources_max: this.resources_max,
        left: this.left,
        top: this.top,
        scale: this.scale,
        spawn_delay: this.spawn_delay_max
    };
};
/**
 * { UPDATE }
 * @param  {Number} t
 */
Base.prototype.update = function(t) {
    if(this.spawn_delay > 0)
        this.spawn_delay -= t;

    if(this.player){
        this.resource_increase_delay -= t;
        if(this.resource_increase_delay <= 0){
            this.resource_increase_delay = this.resource_increase_delay_max;

            ++this.resources;

            if(this.resources > this.resources_max)
                this.resources = this.resources_max;

            this.game.broadcast('BASE.resources', {
                base_id: this.id,
                resources: this.resources
            });
        }
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

    this.player = player;
    this.player.addBase(this);
};
/**
 * { TRY SEND MINION }
 * Tests if the base can send a minion
 * Returns the result and sets new delay if able
 */
Base.prototype.trySendMinion = function() {
    if(this.spawn_delay <= 0.0 && this.resources > 0){
        this.spawn_delay = this.spawn_delay_max;
        --this.resources;
        return true;
    }
    return false;
};

Base.prototype.hitByMinion = function(minion){
    var send_data = {
        minion_id: minion.id
    };

    // See if it is own minion
    if(this.player && minion.player_id === this.player.id){
        ++this.resources;
    }
    else {
        --this.resources;

        // See if resources go below zero
        //  and should changed owner
        if(this.resources < 0){
            this.resources = 1;

            // Fetch player
            var player = this.game.players.byID(minion.player_id);

            // Set player as owner
            this.setPlayer(player);

            // Add to send data
            send_data.new_player_id = player.id;
        }
    }

    send_data.resources = this.resources;

    this.game.broadcast('MINION.hit', send_data);
};


module.exports = Base;