
var util = require('./util.js');


function Player(client, game){
    this.client = client;
    this.socket = client.socket;

    this.game = game;
    this.bases_id = [];
    this.ready = false;

    this.color = util.randomColor();
    this.id = util.uniqueID('player');

    this.listeners = {};

    this.addListeners();
}
Player.prototype.destroy = function() {
    this.removeListeners();
};
///////////////
// LISTENERS //
///////////////
Player.prototype.disconnect = function() {
    this.game.disconnection(this);
};
///////////////
/**
 * { BIND LISTENERS}
 * Bind all listeners for game
 */
Player.prototype.addListeners = function() {
    ///////////////
    // LISTENERS //
    ///////////////
    var self = this;

    this.listeners['disconnect'] = function(){
        self.disconnect();
    };
    this.listeners['PLAYER.ready'] = function(){
        self.ready = true;
        self.game.playerReady(this);
    };
    // Action :)
    this.listeners['BASE.minion'] = function(data){
        self.game.trySendMinion(
            data.source_id,
            data.target_id
        );
    };


    // Bind all listeners
    for(var l in this.listeners){
        this.client.socket.on(l, this.listeners[l]);
    }


    // this.client.socket.on('disconnect', this.listeners['disconnect']);

    // Send minion [source, target]
};
Player.prototype.removeListeners = function() {
    for(var l in this.listeners){
        this.client.socket.removeListener(l, this.listeners[l]);
    }

    // this.client.socket.removeListener('disconnect', this.disconnect);
};
/**
 * { SETUP JSON }
 * Get information that is shared across network
 */
Player.prototype.setupJSON = function() {
    return {
        id: this.id,
        color: this.color,
        name: this.client.name
    };
};
/**
 * { SEND }
 * Sends data to player of msg-type
 * @param  {String} msg     Message-type
 * @param  {Object} data    Data to send
 */
Player.prototype.send = function(msg, data) {
    this.client.send(msg, data);
};
/**
 * { ADD BASE }
 * Adds a base to player
 * @param  {Base} base
 */
Player.prototype.addBase = function(base) {
    var i = this.bases_id.indexOf(base.id);
    if(i === -1)
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


module.exports = Player;