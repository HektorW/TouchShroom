
// temp
function timed() { console.log(arguments[0]); }

import { EventEmitter } from 'events';

export default class NetworkManager extends EventEmitter {

  constructor(controller, game) {
    this.controller = controller;
    this.game = game;

    this.socket = null;
    this.connected = false;
  }

  setGame(game) {
    this.game = game;
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

  off(event, callback) {
    this.socket.removeListener(event, callback);
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  send(event, data) {
    this.socket.emit(event, data);
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

    socket.on('BASE.resources', this.onBaseResources.bind(this));

    socket.on('my player', this.onMyPlayer.bind(this));

    socket.on('g.players', this.onGPlayers.bind(this));

    socket.on('p.connection', this.onPConnection.bind(this));
    socket.on('p.disconnection', this.onPDisconnection.bind(this));
    
    socket.on('b.minion', this.onBMinion.bind(this));
  }

  send(msg, data) {
    this.socket.emit(msg, data);
  }


  onSocketError() {
    if (!this.connected) {
      // this.controller.noconnect();
      this.emit('noconnection');
    }
  }
  onSocketConnect() {
    this.connected = true;
    this.emit('connect');
    // this.controller.connected();
  }
  onSocketDisconnect() {
    this.conected = false;
    this.emit('disconnect');
    // this.controller.disconnected();
  }

  onServerYourname(data) {
    timed(`You shall be known as '${data.name}'`);
  }
  onServerNumPlayers(data) {
    timed('Players online: ' + data.num_players);
  }
  onServerInitgame() {
    // this.controller.startgame();
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
    this.game.me = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
    this.game.me.player_id = data.player.player_id;
    this.game.bases.push(this.game.me);
  }

  // Probably unused
  // logic seems to be wrong
  onGPlayers(data) {
    let players = data.players;
    let bases = this.game.bases;
    for(let i = 0, len = players.length; i < len; i++){
      let index = game.bases.indexByID(players[i].player_id);

      // If player is not in game -> Add
      if(index === undefined){
        let base = new Base(players[i].aspect_left, players[i].aspect_top, players[i].aspect_size, players[i].color);
        base.player_id = players[i].player_id;
        GAME.bases.push(base);
      }
      // Else set values correct
      else {
        let base = bases[index];
        base.aspect_left = players[i].aspect_left;
        base.aspect_top = players[i].aspect_top;
        base.aspect_size = players[i].aspect_size;
        base.color = players[i].color;
      }
    }

    // Call resize to fix aspects
    this.game.resize();
  }

  onPConnection(data) {
    if(data.player.player_id !== this.game.me.player_id){
      var b = new Base(data.player.aspect_left, data.player.aspect_top, data.player.aspect_size, data.player.color);
      b.player_id = data.player.player_id;
      this.game.bases.push(b);
    }
  }

  // Seems to be unused, logic seems wrong
  onPDisconnection(data) {
    var i = this.game.bases.indexByID(data.player_id);
    if(i !== undefined){
      this.game.bases.splice(i, 1);
    }
  }

  onBMinion(data) {
    let game = this.game;
    let bases = game.bases;
    let sourceBase = game.getByID(bases, data.source_id);
    let targetBase = game.getByID(bases, data.target_id);

    if (!!sourceBase && !!targetBase) {
      game.minions.push(
        new Minion(sourceBase, targetBase)
      );
    }

    // var source_index = this.game.bases.indexByID(data.source_id);
    // var target_index = this.game.bases.indexByID(data.target_id);

    // if(source_index !== undefined && target_index !== undefined){
    //     this.game.minions.push(
    //       new Minion(this.game.bases[source_index], this.game.bases[target_index])
    //     );
    // }
  }
}