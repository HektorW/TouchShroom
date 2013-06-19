var io = require('socket.io').listen(8888);
io.set('log level', 1);


/** [ CONTROLLER ]
 * 
 */
var CONTROLLER = {
    clients: [],
    game_queue: [],
    games: []
};
/**
 * { CONNECTION }
 * @param  {Socket} socket
 */
CONTROLLER.connection = function(socket){
    // SETUP CLIENT
    var client = new Client(socket);
    CONTROLLER.clients.push(client);

    /////////////////
    // BIND EVENTS //
    /////////////////
    socket.on('disconnect', function(){
        CONTROLLER.remove(client);
    });

    socket.on('CLIENT.play', function(){
        CONTROLLER.clientPlayRequest(client);
    });


    socket.emit('SERVER.num_players', {num_players: CONTROLLER.clients.length});
};
/**
 * { REMOVE }
 * Remove client
 * @param  {Socket} socket
 */
CONTROLLER.remove = function(client){
    var index = -1;
    CONTROLLER.clients.forEach(function(e, i){
        if(e.id === client.id)
            index = i;
    });
    if(index != -1)
        CONTROLLER.clients.splice(index, 1);
};
/**
 * { CLIENT PLAY REQUEST }
 * Called when a client wants to play
 * Checks if other clients want to play, otherwise put in Q
 * @param  {Client} client
 */
CONTROLLER.clientPlayRequest = function(client){
    if(CONTROLLER.game_queue.length > 0){

        CONTROLLER.startgame([
                CONTROLLER.game_queue.shift(),
                client
            ]);
    } else {
        CONTROLLER.game_queue.push(client);
    }
};
/**
 * { START GAME }
 * Start a new game with clients
 * @param  {Array} clients  Array of clients to play
 */
CONTROLLER.startgame = function(clients){
    var g = new Game(clients);
    clients.forEach(function(c){
        c.status = 'ingame';
        c.game_id = g.id;

        c.send('SERVER.game', {});
    });
};






/** [ CLIENT ]
 * 
 */
function Client(socket){
    this.socket = socket;

    this.id = uniqueID('client');
    this.status = 'none';

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







/** [ GAME ]
 * Instance of a game
 */
function Game(clients){
    this.player_list = [];
    var game = this;
    clients.forEach(function(c){
        var p = new Player(c);
        game.player_list.push(p);
    });

    this.id = uniqueID('game');
}
/**
 * { INIT }
 */
Game.prototype.init = function(){
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Game.prototype.update = function(t){
};

/**
 * { NEW CONNECTION }
 * @param  {Socket} socket  Connected socket
 */
Game.prototype.connection = function(socket){
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
        this.broadcast('b.minion', data);
    });


    var setup_data = {
        player: p.setupJSON()
    };
    // Initialize game info for client
    socket.emit('my player', setup_data);
    // All other players
    GAME.sendAllPlayers(socket);

    // Announce and add to game
    GAME.player_list.push(p);
    GAME.broadcast('p.connection', setup_data);
};
/**
 * { DISCONNECTION }
 * @param  {Socket} socket  Disconnected socket
 */
Game.prototype.disconnection = function(socket){
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
Game.prototype.broadcast = function(type, data){
    for (var i = this.player_list.length - 1; i >= 0; i--) {
        this.player_list[i].socket.emit(type, data);
    }
};
Game.prototype.sendAllPlayers = function(socket){
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
function Player(client){
    this.client = client;
    this.socket = client.socket;
    this.color = randomColor();
    this.id = uniqueID('player');

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
    var types = {};
    return function(type){
        if(type){
            if(!types[type])
                types[type] = 0;
            return types[type]++;
        }

        return id++;
    };
})();

var log = (function(){
    var f = function(){
        console.log(arguments);
    };

    return f;
})();


/** SETUP PROTOTYPES
 * 
 */
// ARRAY
if(!Array.prototype.forEach){
    (function(GLOBAL){
        Array.prototype.forEach = function(callback, thisarg){
            thisarg = thisarg || GLOBAL;
            for(var i = 0, len = this.length; i < len; i++){
                callback.call(thisarg, this[i], i, this);
            }
        };
    })(this);
}
// STRING
if(!String.prototype.format){
    String.prototype.format = function(){
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number){
            return (args[number] !== undefined)? args[number] : match;
        });
    };
}
if(!String.prototype.contains){
    String.prototype.contains = function(needle, start){
        start = start || 0;
        return (this.indexOf(needle) >= start);
    };
}




//////////////
// START IO //
//////////////
io.sockets.on('connection', CONTROLLER.connection);