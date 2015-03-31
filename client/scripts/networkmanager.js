
// temp
function timed() { console.log(arguments[0]); }



export default class NetworkManager {

  constructor(controller, game) {
    this.controller = controller;
    this.game = game;

    this.socket = null;
    this.connected = false;
  }


  init() {
    this.connect();
    this.setupSocketEventHandlers();
  }

  connect() {
    this.socket = io.connect(':8888', {
        reconnect: true
    });
  }

  setupSocketEventHandlers() {
    let socket = this.socket;

    socket.on('error', this.onSocketError.bind(this));
    socket.on('connect', this.onSocketConnect.bind(this));
    socket.on('disconnect', this.onSocketDisconnect.bind(this));

    socket.on('SERVER.yourname', this.onServerYourname.bind(this));
    socket.on('SERVER.num_players', this.onServerNumPlayers.bind(this));
    socket.on('SERVER.initgame', this.onServerInitgame.bind(this));

    socket.on('GAME.setup', this.onGameSetup.bind(this));
    socket.on('GAME.start', this.onGameStart.bind(this));
    socket.on('GAME.end', this.onGameEnd.bind(this));
    socket.on('GAME.disconnection', this.onGameDisconnection.bind(this));
    socket.on('GAME.minion', this.onGameMinion.bind(this));

    socket.on('MINION.hit', this.onMinionHit.bind(this));

    socket.on('BASE.resources', this.onBaseResources.bind(thits));
  }

  send(msg, data) {
    this.socket.emit(msg, data);
  }


  onSocketError() {
    if (!this.connected) {
      this.controller.noconnect();
    }
  }
  onSocketConnect() {
    this.connected = true;
    this.controller.connected();
  }
  onSocketDisconnect() {
    this.conected = false;
    this.controller.disconnected();
  }

  onServerYourname(data) {
    timed(`You shall be known as '${data.name}'`);
  }
  onServerNumPlayers(data) {
    timed('Players online: ' + data.num_players);
  }
  onServerInitgame() {
    this.controller.startgame();
  }

  onGameSetup(data) {
    this.game.setup(data);
  }
  onGameStart() {
    this.game.start(); 
  }
  onGameEnd() {
    this.game.end();
  }
  onGameDisconnection(data) {
    this.game.disconnection(data);
  }
  onGameMinion(data) {
    this.game.newMinion(data);
  }

  onMinionHit(data) {
    this.game.minionHit(data);
  }

  onBaseResources(data) {
    this.game.baseResources(data);
  }

  onMyPlayer(data) {
    
  }
}


/** { INIT }
 *
 */
NET.init = function(){




    //////////////
    // GAME OLD //
    //////////////
    this.socket.on('my player', function(data){
        GAME.me = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
        GAME.me.player_id = data.player.player_id;
        GAME.bases.push(GAME.me);
    });

    this.socket.on('g.players', function(data){
        var i, b, len;
        var p = data.players;
        for(i = 0, len = p.length; i < len; i++){
            var index = GAME.bases.indexByID(p[i].player_id);

            // If player is not in game -> Add
            if(index === undefined){
                b = new Base(p[i].aspect_left, p[i].aspect_top, p[i].aspect_size, p[i].color);
                b.player_id = p[i].player_id;
                GAME.bases.push(b);
            }
            // Else set values correct
            else {
                b = GAME.bases[index];
                b.aspect_left = p[i].aspect_left;
                b.aspect_top = p[i].aspect_top;
                b.aspect_size = p[i].aspect_size;
                b.color = p[i].color;
            }
        }

        // Call resize to fix aspects
        GAME.resize();
    });

    this.socket.on('p.connection', function(data){
        if(data.player.player_id !== GAME.me.player_id){
            var b = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
            b.player_id = data.player.player_id;
            GAME.bases.push(b);
        }
    });
    this.socket.on('p.disconnection', function(data){
        var i = GAME.bases.indexByID(data.player_id);
        if(i !== undefined){
            GAME.bases.splice(i, 1);
        }
    });

    this.socket.on('b.minion', function(data){
        var source_index = GAME.bases.indexByID(data.source_id);
        var target_index = GAME.bases.indexByID(data.target_id);

        if(source_index !== undefined && target_index !== undefined){
            GAME.minions.push(
                new Minion(GAME.bases[source_index], GAME.bases[target_index])
                );
        }
    });
};