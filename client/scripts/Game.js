
import { requestAnimationFrame, cancelAnimationFrame, performance } from './util/prefixer';
import { drawLine, drawCircle } from './util/draw';
import { pointInCircle } from './util/math';

import InputManager from './inputmanager';

import Particle from './objects/particle';
import Player from './objects/player';
import Base from './objects/base';
import Minion from './objects/minion';

import BaseScreen from './screens/BaseScreen';


export default class Game extends BaseScreen {

  constructor(networkManager, soundManager) {    
    super(networkManager, soundManager);

    // this.networkManager = networkManager;
    // this.soundManager = soundManager;

    this.inputManager = null;

    this.canvas = null;
    this.ctx = null;

    this.last_time = -1;
    this.now = -1;

    this.selected_base = null;
    this.hovered_base = null;
    this.targeted_base = null;

    this.bases = [];
    this.players = [];
    this.minions = [];
    this.particles = [];

    this.me = null;
    this.animationFrame = null;

    this.template = `
      <h1 style="position:fixed; top:0; width:100%; left:0; text-align:center;">GAME</h1>
      <div id="screen_game" class="screen">
      </div>
    `;

    this.domEvents = {
      'resize window': 'resize'
    };

    this.networkEvents = {

    };
  }

  activate() {
    super.activate();

    this.init();
  }


  init() {
    this.inputManager = new InputManager(this).init();

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindFunctions();
    this.initDOMEvents();
    this.setupWierdArrayFunctions();

    this.resize();

    return this;
  }

  bindFunctions() {
    this.loop = this.loop.bind(this);
  }


  setupWierdArrayFunctions() {
    this.players.findBy = function(prop, value) {
      for (let i = this.length; i--; ) {
        if (this[i][prop] === value) return this[i];
      }
    };

    this.players.byID = function(id) {
      for (let i = this.length; i--; ) {
        if (this[i].id === id) return this[i];
      }
    };

    // Add method to base list
    this.bases.indexByID = function(id) {
      for (var i = this.length; i--; ) {
        if(this[i].id === id) return i;
      }
    };

    this.bases.byID = function(id){
      for(var i = this.length; i--; ){
        if(this[i].id === id) return this[i];
      }
    };

    // MINION
    this.minions.byID = function(id){
      for(var i = this.length; i--; ){
        if(this[i].id === id) return this[i];
      }
    };
  }


  setup(data) {
    const lvl_name = data.level_name;
    const my_id = data.my_id;
    const players = data.players;

    // timed('Level: ' + lvl_name);

    for(let i = 0, len = data.bases.length; i < len; i++){
      let base = data.bases[i];
      this.bases.push(
        new Base(this, base.id, base.left, base.top, base.scale, base.resources, base.resources_max)
      );
    }
    for(let i = 0, len = players.length; i < len; i++){
      let playerData = players[i];

      let player = new Player(
        this,
        playerData.id,
        playerData.name,
        playerData.color
      );

      let startStates = data.start_state[i];
      startStates.forEach(i => this.bases[i].setPlayer(player));

      this.players.push(player);

      if (playerData.id === my_id){
        this.me = player;
      }
    }

    this.networkManager.send('PLAYER.ready');
  }


  start() {
    this.now = this.last_time = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  end() {
    if(this.animationFrame) cancelAnimationFrame(this.animationFrame);

    // CLEAN UP GAME
    this.bases.length = 0;
    this.players.length = 0;
    this.me = null;
    this.minions.length = 0;
    this.particles.length = 0;

    // Temporary solution to hide overlay and go back to START
    setTimeout(function(){
      // CONTROLLER.overlayHide();
      // CONTROLLER.setScreen('start');
    }, 3000);
  }


  loop() {
    requestAnimationFrame(this.loop);

    if (this.draw_time)
      this.draw_time = time - this.draw_time;

    this.now = time;
    var elapsed = (time - this.last_time) / 1000.0;
    this.last_time = time;

    this.update_time = time;
    this.update(elapsed);
    this.update_time = performance.now() - this.update_time;

    this.draw_time = performance.now();
    this.draw();
  }


  update(time) {
    this.inputManager.update(time);

    let pointerState = this.inputManager.getState();

    var i, len, b, m, p;

    // Reset hovered and targeted
    this.hovered_base = null;
    this.targeted_base = null;

    for(i = 0, len = this.bases.length; i < len; i++){
      b = this.bases[i];

      // Update base
      b.update(t);

      // Reset base hovered & targeted state
      b.hovered = false;
      b.targeted = false;


      /////////////////
      // CHECK INPUT //
      /////////////////
      // Mouse is over base
      if(pointInCircle(pointerState.x, pointerState.y, b.x, b.y, b.size)){
        // See if there is any selected base and it isn't the one tested
        if(this.selected_base && this.selected_base !== b){
          // Set the base as targeted and try to send
          GAME.trySendMinion(b);
        }
        else {
          // Check if base belons to 'me'
          if(this.me.bases_id.indexOf(b.id) !== -1){
            // Set the base as hovered
            b.hovered = true;
          }
        }
      }

      if(this.me.bases_id.indexOf(b.id) != -1){
        if(!b.selected && pointInCircle(pointerState.x, pointerState.y, b.x, b.y, b.size)){
          b.hovered = true;
          this.hovered_base = b;
        }
      }
    }



    // Update minions
    for(i = 0, len = this.minions.length; i < len; i++){
      m = this.minions[i];
      if(m.active){
        m.update(t);

        if(!m.active){
          SOUND.playRandomSound();

          this.particles.push(
            new Particle(m.target_base.left, m.target_base.top, m.target_base.scale, m.source_base.color)
            );
        }
      }
      if(m.dead_by_server && !m.active){
        this.minions.splice(i--, 1);
        --len;
      }
    }

    // Update paticles
    for(i = 0, len = this.particles.length; i < len; i++){
      p = this.particles[i];
      p.update(t);

      if(!p.active){
        this.particles.splice(i--, 1);
        --len;
      }
    }
  }


  draw () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);


    for(let i = 0, len = this.minions.length; i < len; i++) {
      let m = this.minions[i];
      if (m.active) m.draw(ctx);
    }


    ///////////////
    // Draw line //
    ///////////////
    if (this.selected_base){
      let b = this.selected_base;

      let x, y;
      if (this.targeted_base){
        x = this.targeted_base.x;
        y = this.targeted_base.y;
      } else {
        x = this.inputManager.pointer.x;
        y = this.inputManager.pointer.y;
      }

      ctx.save();

      ctx.globalAlpha = 0.3;
      let line_size = 5;
      let color = this.me.color || '#AAA' ;
      drawLine(ctx, b.x, b.y, x, y, color, line_size);
      drawCircle(ctx, x, y, line_size / 2, color);

      ctx.restore();
    }

    for(let i = 0, len = this.bases.length; i < len; i++){
      this.bases[i].draw(ctx);
    }

    for(let i = 0, len = this.particles.length; i < len; i++){
      this.particles[i].draw(ctx);
    }

    this.drawScoreBar(ctx);
  }

  drawScoreBar(ctx) {
    ctx.save();

    let w = width / 1.5;
    let h = height / 20;
    let x = (width / 2) - (w / 2);
    let y = (height / 20) - (h / 2);

    let r = [];
    let total = 0;
    for (let i = 0, len = this.players.length; i < len; i++){
      r[i] = this.players[i].totalResources();
      total += r[i];
    }

    let xt = x;
    for (let i = 0, len = this.players.length; i < len; i++){
      ctx.fillStyle = this.players[i].color;
      let wt = (r[i] / total) * w;
      ctx.fillRect(xt, y, wt, h);
      let text = this.players[i].name + ' - ' + r[i];
      ctx.fillStyle = 'black';
      ctx.fillText(text, xt + (wt/2) - (ctx.measureText(text).width/2), y+(h/2));

      xt += wt;
    }


    ctx.strokeStyle = 'white';
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  }


  resize() {
    this.width  = this.canvas.width  = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    this.bases.forEach(e => e.resize());
    this.minions.forEach(e => e.resize());
    this.particles.forEach(e => e.resize());
  }



  trySendMinion(target) {
    target.targeted = true;
    this.targeted_base = target;

    // Call 'canSendMinion' on selected_base
    // [CHANGED] Allways ask server to send
    if (this.selected_base.canSendMinion() || true){
      this.networkManager.send('BASE.minion', {
        source_id: this.selected_base.id,
        target_id: target.id
      });
    }
  }

  getByID(list, id) {
    for (let i = list.length; i--; ) {
      let item = list[i];
      if (item && item.id == id) {
        return item;
      }
    }
    return undefined;
  }

}




function heheScopeAwaySillyImplementation() {



  ////////////
  // EVENTS //
  ////////////
  /**
   * { DISCONNECTION }
   * Called when a player disconnects from the game
   * @param  {Object} data
   */
  GAME.disconnection = function(data){
    var p = this.players.findBy('id', data.player_id);

    if(p !== undefined){
      CONTROLLER.overlayMessage("'{0}' disconnected".format(p.name));
    }
  };
  /**
   * { BASE RESOURCES }
   * When a base got updated resources from server
   * @param  {Object} data
   */
  GAME.baseResources = function(data){
    var b = GAME.bases.byID(data.base_id);

    if(b)
      b.resources = data.resources;
  };
  /**
   * { NEW MINION }
   * Called when server sends a new minion
   * @param  {Object} data
   */
  GAME.newMinion = function(data){
    var m = data.minion;

    var source = this.bases.byID(m.source_id);
    var target = this.bases.byID(m.target_id);

    var minion = new Minion(
      m.id,
      source,
      target,
      m.scale
    );

    source.sendMinion();

    this.minions.push(minion);
  };
  /**
   * { MINION HIT }
   * Called by server when minion reaches target base
   * @param  {Object} data
   */
  GAME.minionHit = function(data){
    var minion_id = data.minion_id;
    var new_player_id = data.new_player_id;
    var resources = data.resources;

    // Fetch minion
    var minion = this.minions.byID(minion_id);

    if(!minion){
      alert('Minion gone');
      return;
    }

    minion.dead_by_server = true;

    // Get target base
    var target = minion.target_base;
    // Set resources for base
    target.resources = resources;

    if(new_player_id !== undefined){
      var player = this.players.byID(new_player_id);
      target.setPlayer(player);
    }
  };
  



  /**
   * { START TOUCH }
   */
  GAME.startTouch = function(){
    var i, b, len;

    if(!GAME.me)
      return;

    for(i = 0, len = GAME.me.bases_id.length; i < len; i++){
      b = GAME.bases[GAME.bases.indexByID(GAME.me.bases_id[i])];

      if(pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
        b.selected = true;
        GAME.selected_base = b;
        break;
      }
    }
  };

  /**
   * { END TOUCH }
   */
  GAME.endTouch = function(){
    if(GAME.selected_base){
      // Add new minion
      if(GAME.targeted_base){

      }
      GAME.selected_base.selected = false;
      GAME.selected_base = null;
    }
  };
}