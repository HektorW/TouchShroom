
var util = require('./util.js');

function Client(socket){
    this.socket = socket;

    this.id = util.uniqueID('client');
    this.status = 'none';

    this.name = util.randomName();

    this.game_id = -1;
}
/**
 * { SEND }
 * Sends data to client of msg-type
 * @param  {String} msg     Message-type
 * @param  {Object} data    Data to send
 */
Client.prototype.send = function(msg, data) {
    this.socket.emit(msg, data);
};


module.exports = Client;