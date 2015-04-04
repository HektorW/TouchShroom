/** TODO
 *
 * { LOBBY }
 * -    Add some kind of lobby
 *         or other way of choosing opponent
 * 
 * { GAME }
 * -    Say that player is joining game (DONE)
 * -    Bind listeners to all events
 *         Save listeners on player so they can be removed
 * -    Send information about all players in game (DONE)
 * -    Send information about game (DONE)
 *         Create some kind of level
 *         Create bases
 * -    Start countdown -> start game
 * -    Game logic
 * 
 */




/** COMMENT (23/6)
 *      Setup lvl on game instead
 *      Fixed bug with bases not getting correct start_state
 *      Fixed bug with scorebar
 */

/**
 * Hann inte skriva klart logik för att skicka grejer
 */





// --------------------------------------------------------------
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

    socket.emit('SERVER.yourname', { name: client.name });
    socket.emit('SERVER.num_players', { num_players: CONTROLLER.clients.length });
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
    CONTROLLER.games.push(g);
};
/**
 * { END GAME }
 * Ends a game, removes it from list and sets state for clients
 * @param  {Game} game
 */
CONTROLLER.endgame = function(game){
    // Send to clients, end game
    game.players.forEach(function(p){
        p.send('GAME.end', {});
        p.client.status = 'none';
        p.client.game_id = -1;
    });


    // Remove game from list
    var index = CONTROLLER.games.indexOf(game);
    if(index != -1){
        CONTROLLER.games.splice(index, 1);
    }
};









// --------------------------------------------------------------
/** [ CLIENT ]
 * 
 */
function Client(socket){
    this.socket = socket;

    this.id = uniqueID('client');
    this.status = 'none';

    this.name = randomName();

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








// --------------------------------------------------------------
/** [ GAME ]
 * Instance of a game
 */
function Game(clients){
    this.id = uniqueID('game');

    /////////////
    // PLAYERS //
    /////////////
    this.players = [];
    this.players.byID = function(id){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i].id === id)
                return this[i];
        }
    };
    var game = this;
    clients.forEach(function(c){
        c.status = 'ingame';
        c.game_id = game.id;
        c.send('SERVER.initgame');

        var p = new Player(c, game);
        game.players.push(p);
    });

    // STATE
    this.state = 'none';

    // Update vars
    this.last_update = -1;
    this.interval_id = undefined;
    this.interval = 1000 / 30;

    // Needed for callback in loop
    this.bound_loop = this.loop.bind(this);


    // MINIONS
    this.minions = [];

    ///////////
    // LEVEL //
    ///////////
    this.bases = [];
    this.bases.byID = function(id){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i].id === id)
                return this[i];
        }
    };
    this.start_state = [];
    this.level_name = undefined;
    InitLevel(this, 'Simple');

    // INIT
    this.setup();
}
/**
 * { SETUP }
 */
Game.prototype.setup = function(){

    // Object for all setup data
    var setup_data = {
        my_id: -1,
        players: this.players.map(function(p){ return p.setupJSON(); }),
        bases: this.bases.map(function(b){ return b.setupJSON(); }),
        start_state: this.start_state,
        level_name: this.level_name
        /*level: this.level.setupJSON()*/
    };

    this.state = 'setup';
    // Send setup data
    this.players.forEach(function(p){
        // !May be dangerous, but should probably work!
        setup_data.my_id = p.id;
        // Send it
        p.send('GAME.setup', setup_data);
    });
};
/**
 * { START GAME }
 * Start the game
 */
Game.prototype.start = function() {
    this.state = 'started';
    this.broadcast('GAME.start');

    this.last_update = Date.now();
    this.loop();
};
/**
 * { END }
 * End the game
 */
Game.prototype.end = function() {
    clearInterval(this.interval_id);

    this.players.forEach(function(p){
        p.destroy();
    });

    this.state = 'ended';
    CONTROLLER.endgame(this);
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */

Game.prototype.loop = function() {
    var now = Date.now();
    var elapsed = (now - this.last_update) / 1000.0;
    this.last_update = now;

    this.update(elapsed);

    setTimeout(this.bound_loop, this.interval);
};
Game.prototype.update = function(t){
    var i, m, len;

    // Update bases
    for(i = 0, len = this.bases.length; i < len; i++){
        this.bases[i].update(t);
    }

    for(i = 0, len = this.minions.length; i < len; i++){
        m = this.minions[i];
        m.update(t);


        if(pointInCircle(m.left, m.top, m.target_base.left, m.target_base.top, m.target_base.scale)){
            m.active = false;
            m.target_base.hitByMinion(m);
        }

        if(!m.active){
            this.minions.splice(i--, 1);
            --len;
        }
    }
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
    GAME.players.push(p);
    GAME.broadcast('p.connection', setup_data);
};
/**
 * { DISCONNECTION }
 * @param  {Socket} socket  Disconnected socket
 */
Game.prototype.disconnection = function(player){
    this.players.forEach(function(p){
        if(p.id !== player.id){
            p.send('GAME.disconnection', {
                player_id: player.id
            });
        }
    });

    this.end();

    // for(var i = 0; i < this.players.length; i++){
    //     if(this.players[i].socket.id === socket.id){

    //         GAME.broadcast('p.disconnection', { player_id: this.players[i].player_id });

    //         this.players.splice(i, 1);
    //         break;
    //     }
    // }
};
Game.prototype.playerReady = function(player) {
    var start = this.players.every(function(p){
        return (p.ready);
    });

    if(start)
        this.start();
};
/**
 * { BROADCAST }
 * Sends message to all connected clients
 * @param  {String} type    Identifier for message
 * @param  {Object} data    Data to be sent
 */
Game.prototype.broadcast = function(type, data){
    for (var i = this.players.length - 1; i >= 0; i--) {
        this.players[i].send(type, data);
    }
};

Game.prototype.trySendMinion = function(source_id, target_id) {
    var source = this.bases.byID(source_id);
    var target = this.bases.byID(target_id);


    /*
     * This might cause problem if 'source' switches player before this is getting called
     * Might be wrong player
     */
    var player = source.player;

    if(!source || !target || !player)
        return;

    if(source.trySendMinion()){
        var m = new Minion(player.id, source, target, 0.008);

        this.minions.push(m);
        this.broadcast('GAME.minion', {
            minion: m.setupJSON()
        });
    }
};









// --------------------------------------------------------------
/** [ LEVEL ]
 * Initialize a level
 * @param {Game} game 
 * @param {String} name     Name of the level
 */
function InitLevel(game, name){
    game.level_name = name;
    game.bases.length = 0;
    game.start_state.length = 0;

    switch(name){
        case 'Simple': {

            game.bases[0] = new Base(game, 0.20, 0.25, 0.07, 10);
            game.bases[1] = new Base(game, 0.20, 0.75, 0.07, 10);
            game.bases[2] = new Base(game, 0.5,  0.5,  0.10, 20, 50); // MIDDLE
            game.bases[3] = new Base(game, 0.80, 0.25, 0.07, 10);
            game.bases[4] = new Base(game, 0.80, 0.75, 0.07, 10);

            game.start_state[0] = [0];
            game.start_state[1] = [4];
        } break;
    }

    var i, j, len, lenj;

    // Set owners according to start state
    for(i = 0, len = game.start_state.length; i < len; i++){
        var p = game.players[i];
        for(j = 0, lenj = game.start_state[i].length; j < lenj; j++){
            var index = game.start_state[i][j];
            game.bases[index].setPlayer(p);

        }
    }
}







// --------------------------------------------------------------
/** [ BASE ]
 *
 */
function Base(game, left, top, scale, resources, resources_max){
    this.game = game;

    this.left = left;
    this.top = top;
    this.scale = scale;

    this.id = uniqueID('base');

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







// --------------------------------------------------------------
/** [ MINION ]
 * Base class for all minions
 * @param {Base}    source
 * @param {Base}    target
 * @param {Number}  size
 * @param {String}  color
 */
function Minion(player_id, source, target, scale){
    this.source_base = source;
    this.target_base = target;

    this.player_id = player_id;

    this.id = uniqueID('minion');

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








// --------------------------------------------------------------
/** [ PLAYER ]
 * 
 */
function Player(client, game){
    this.client = client;
    this.socket = client.socket;

    this.game = game;
    this.bases_id = [];
    this.ready = false;

    this.color = randomColor();
    this.id = uniqueID('player');

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







// --------------------------------------------------------------
/** MATH
 * 
 */
function vecDistanceSq(x1, y1, x2, y2){
    return Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
}
function vecDistance(x1, y1, x2, y2){
    return Math.sqrt(vecDistanceSq(x1, y1, x2, y2));
}
function pointInCircle(px, py, cx, cy, cr){
    return (vecDistanceSq(px, py, cx, cy) < Math.pow(cr, 2));
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
var randomColor = (function(){
    var colors = [];

    var f = function(){
        if(colors.length <= 0){
            colors = [
                '#F0F8FF',
                '#FAEBD7','#00FFFF','#7FFFD4','#F0FFFF','#F5F5DC','#FFE4C4','#04060E','#FFEBCD','#0000FF',
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
                '#F5DEB3','#F2F46F','#F5F5F5','#FFFF00','#9ACD32'
            ];
        }

        return colors.splice(randomRangeInt(0, colors.length), 1)[0];
    };

    return f;
})();
var randomName = (function(){
    var names = [];

    var f = function(){
        if(names.length === 0){
            names = [
                'Gorgeous Greg', 'Splendid Steve', 'Marvelous Marve',
                'Fantastic Freddy', 'Brilliant Brian', 'Contagious Cedric',
                'Pragmatic Phil'
            ];
        }

        var index = randomRangeInt(0, names.length);
        return names.splice(index, 1)[0];
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






// --------------------------------------------------------------
//////////////
// START IO //
//////////////
var io = require('socket.io').listen(8888);
io.set('log level', 1);
io.sockets.on('connection', CONTROLLER.connection);