

var Player = require('./Player.js');
var Minion = require('./Minion.js');
var Base = require('./Base.js');

var util = require('./util.js');
var pointInCircle = require('./math.js').pointInCircle;


// --------------------------------------------------------------
/** [ GAME ]
 * Instance of a game
 */
function Game(controller, clients){
    this.controller = controller;

    this.id = util.uniqueID('game');

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
    this.controller.endgame(this);
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








module.exports = Game;