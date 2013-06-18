var io = require('socket.io').listen(8888);
io.set('log level', 2);



/** [ GAME ]
 * 
 */
var GAME = {
    player_list: [],
    players: []
};
/**
 * { INIT }
 */
GAME.init = function(){
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
GAME.update = function(t){
};

/**
 * { NEW CONNECTION }
 * @param  {Socket} socket  Connected socket
 */
GAME.connection = function(socket){
    var p = new Player(socket);

    /////////////////
    // Bind events //
    /////////////////
    socket.on('disconnect', function(){
        GAME.disconnection(socket);
    });
    socket.on('select', function(data){
    });
    socket.on('hover', function(data){
    });
    socket.on('target', function(data){
    });
    // MINION
    socket.on('p.minion', function(data){
        GAME.broadcast('b.minion', data);
    });


    var setup_data = {
        player: p.setupJSON()
    };
    // Initialize game info for client
    socket.emit('my player', setup_data);
    // All other players
    GAME.sendAllPlayers(socket);

    // this.players[socket.id] = p;

    // Announce and add to game
    GAME.player_list.push(p);
    GAME.broadcast('p.connection', setup_data);
};
/**
 * { DISCONNECTION }
 * @param  {Socket} socket  Disconnected socket
 */
GAME.disconnection = function(socket){
    // delete this.players[socket.id];
    for(var i = 0; i < this.player_list.length; i++){
        if(this.player_list[i].socket.id === socket.id){

            GAME.broadcast('p.disconnection', { player_id: this.player_list[i].player_id });

            this.player_list.splice(i, 1);
            break;
        }
    }
};
/**
 * { BROADCAST }
 * Sends message to all connected clients
 * @param  {String} type    Identifier for message
 * @param  {Object} data    Data to be sent
 */
GAME.broadcast = function(type, data){
    for (var i = this.player_list.length - 1; i >= 0; i--) {
        this.player_list[i].socket.emit(type, data);
    }
};
GAME.sendAllPlayers = function(socket){
    var i;
    var data = {
        players: []
    };
    for (i = GAME.player_list.length - 1; i >= 0; i--) {
        data.players.push(GAME.player_list[i].setupJSON());
    }

    if(socket)
        socket.emit('g.players', data);
    else
        GAME.broadcast('g.players', data);
};




/** [ PLAYER ]
 * 
 */
function Player(socket, color){
    this.socket = socket;
    this.color = randomColor();
    this.player_id = uniqueID();

    this.aspect_left = randomRangeInt(1, 10) / 10;
    this.aspect_top = randomRangeInt(1, 10) / 10;
    this.aspect_size = 0.05;
}
Player.prototype.setupJSON = function() {
    var self = this;
    return {
        player_id: self.player_id,
        color: self.color,
        aspect_left : self.aspect_left,
        aspect_top  : self.aspect_top,
        aspect_size : self.aspect_size
    };
};




/** UTIL
 * 
 */
function randomRange(min, max){
    return ((Math.random() * (max-min)) + min);
}
function randomRangeInt(min, max){
    return (Math.floor(Math.random() * (max-min)) + min);
}
var randomColor = (function(){
    var colors = [];

    var f = function(){
        if(colors.length <= 0){
            // colors = [
            //     '#59111E',
            //     '#BFA07A',
            //     '#F28D35',
            //     '#D95829',
            //     '#D93030'
            // ];
            colors = [
                '#F0F8FF',
                '#FAEBD7','#00FFFF','#7FFFD4','#F0FFFF','#F5F5DC','#FFE4C4','#000000','#FFEBCD','#0000FF',
                '#8A2BE2','#A52A2A','#DEB887','#5F9EA0','#7FFF00','#D2691E','#FF7F50','#6495ED','#FFF8DC',
                '#DC143C','#00FFFF','#00008B','#008B8B','#B8860B','#A9A9A9','#006400','#BDB76B','#8B008B',
                '#556B2F','#FF8C00','#9932CC','#8B0000','#E9967A','#8FBC8F','#483D8B','#2F4F4F','#00CED1',
                '#9400D3','#FF1493','#00BFFF','#696969','#696969','#1E90FF','#B22222','#FFFAF0','#228B22',
                '#FF00FF','#DCDCDC','#F8F8FF','#FFD700','#DAA520','#808080','#008000','#ADFF2F','#F0FFF0',
                '#FF69B4','#CD5C5C','#4B0082','#FFFFF0','#F0E68C','#E6E6FA','#FFF0F5','#7CFC00','#FFFACD',
                '#ADD8E6','#F08080','#E0FFFF','#FAFAD2','#D3D3D3','#90EE90','#FFB6C1','#FFA07A','#20B2AA',
                '#87CEFA','#778899','#B0C4DE','#FFFFE0','#00FF00','#32CD32','#FAF0E6','#FF00FF','#800000',
                '#66CDAA','#0000CD','#BA55D3','#9370DB','#3CB371','#7B68EE','#00FA9A','#48D1CC','#C71585',
                '#191970','#F5FFFA','#FFE4E1','#FFE4B5','#FFDEAD','#000080','#FDF5E6','#808000','#6B8E23',
                '#FFA500','#FF4500','#DA70D6','#EEE8AA','#98FB98','#AFEEEE','#DB7093','#FFEFD5','#FFDAB9',
                '#CD853F','#FFC0CB','#DDA0DD','#B0E0E6','#800080','#FF0000','#BC8F8F','#4169E1','#8B4513',
                '#FA8072','#F4A460','#2E8B57','#FFF5EE','#A0522D','#C0C0C0','#87CEEB','#6A5ACD','#708090',
                '#FFFAFA','#00FF7F','#4682B4','#D2B48C','#008080','#D8BFD8','#FF6347','#40E0D0','#EE82EE',
                '#F5DEB3','#FFFFFF','#F5F5F5','#FFFF00','#9ACD32'
            ];
        }

        return colors.splice(randomRangeInt(0, colors.length), 1)[0];
    };

    return f;
})();
var uniqueID = (function(){
    var id = 0;
    return function(){
        return id++;
    };
})();





//////////////
// START IO //
//////////////
io.sockets.on('connection', GAME.connection);