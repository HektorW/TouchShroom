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


var Client = require('./Client.js');
var Game = require('./Game.js');


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

  // Bind events
  socket.on('disconnect', function(){ CONTROLLER.remove(client); });

  socket.on('CLIENT.play', function(){ CONTROLLER.clientPlayRequest(client); });

  socket.emit('SERVER.yourname', { name: client.name });
  socket.emit('SERVER.num_players', { num_players: CONTROLLER.clients.length });
};

/**
 * { REMOVE }
 * Remove client
 * @param  {Client} client
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
  console.log('Client ' + client.name + ' wish to start a game');
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
  console.log('Starting a game');
  var g = new Game(this, clients);
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
//////////////
// START IO //
//////////////
var io = require('socket.io').listen(8888);
io.set('log level', 1);
io.sockets.on('connection', CONTROLLER.connection);