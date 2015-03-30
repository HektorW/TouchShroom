
import { requestAnimationFrame, cancelAnimationFrame, performance } from './util/prefixer';
import { drawLine, drawCircle } from './util/draw';

import Sound from './soundmanager';
import Particle from './objects/particle';


export default class Game {

  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.soundManager = null;

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
  }

  bindFunctions() {
    this.loop = this.loop.bind(this);
  }


  init() {
    this.soundManager = new Sound().init();

    this.canvas = document.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindFunctions();
    this.setupWierdArrayFunctions();
    this.initEvents();

    this.resize();

    return this;
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


  initEvents() {

  }



  start() {
    this.now = this.last_time = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
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



  update() {

  }

  draw () {
    var ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    //////////////////
    // Draw minions //
    //////////////////
    for(let i = 0, len = this.minions.length; i < len; i++) {
      let m = this.minions[i];
      if(m.active) m.draw(ctx);
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
      }
      else {
        x = TOUCH.x;
        y = TOUCH.y;
      }

      ctx.save();

      ctx.globalAlpha = 0.3;
      let line_size = 5;
      let color = GAME.me.color || '#AAA' ;
      drawLine(ctx, b.x, b.y, x, y, color, line_size);
      drawCircle(ctx, x, y, line_size / 2, color);

      ctx.restore();
    }

    ////////////////
    // Draw bases //
    ////////////////
    for(let i = 0, len = this.bases.length; i < len; i++){
      this.bases[i].draw(ctx);
    }

    ////////////////////
    // DRAW PARTICLES //
    ////////////////////
    for(let i = 0, len = this.particles.length; i < len; i++){
      this.particles[i].draw(ctx);
    }


    ////////////////
    // DRAW SCORE //
    ////////////////
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
}




function heheScopeAwaySillyImplementation() {

  /**
   * { INIT }
   * Main entry point for initialization
   * General initialization not bound to a game instance
   */
  GAME.init = function(){

    ////////////////////
    // SETUP CONTROLS //
    ////////////////////
    function startTouch(x, y){
      TOUCH.down = true;
      TOUCH.start_x = TOUCH.x = x;
      TOUCH.start_y = TOUCH.y = y;
      GAME.startTouch();
    }
    function drag(x, y){
      TOUCH.old_x = TOUCH.x;
      TOUCH.old_y = TOUCH.y;
      TOUCH.x = x;
      TOUCH.y = y;
    }
    function endTouch(x, y){
      TOUCH.down = false;
      TOUCH.end_x = x;
      TOUCH.end_y = y;
      TOUCH.x = -1;
      TOUCH.y = -1;
      GAME.endTouch();
    }
    GAME.canvas.addEventListener('mousedown', function(e){
      e.preventDefault();
      startTouch(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener('mousemove', function(e){
      e.preventDefault();
      drag(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener('mouseup', function(e){
      e.preventDefault();
      endTouch(e.pageX, e.pageY);
    }, false);
    GAME.canvas.addEventListener('touchstart', function(e){
      e.preventDefault();
      startTouch(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    GAME.canvas.addEventListener('touchend', function(e){
      e.preventDefault();
      endTouch(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    GAME.canvas.addEventListener('touchmove', function(e){
      e.preventDefault();
      drag(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, false);
    window.addEventListener('resize', GAME.resize, false);
  };
  /**
   * { SETUP }
   * Setup a specific game with info from server
   * @param  {Object} data  Setup data from server (players, level)
   */
  GAME.setup = function(data){
    var i, b, p, len;

    var lvl_name = data.level_name;
    var my_id = data.my_id;
    var players = data.players;

    timed('Level: ' + lvl_name);

    for(i = 0, len = data.bases.length; i < len; i++){
      b = data.bases[i];
      this.bases.push(
        new Base(b.id, b.left, b.top, b.scale, b.resources, b.resources_max)
      );
    }
    for(i = 0, len = players.length; i < len; i++){
      p = new Player(
        players[i].id,
        players[i].name,
        players[i].color
      );

      b = data.start_state[i];
      b.forEach(function(i){ // Know that this will push closer to GC (garbage collector)
        this.bases[i].setPlayer(p);
      }, this);

      GAME.players.push(p);

      if(players[i].id === my_id){
        GAME.me = p;
      }
    }

    GAME.send('PLAYER.ready');

    // GAME.draw();
  };


  /**
   * { START }
   * Starts the game
   */
  GAME.start = function(){
    GAME.now = GAME.last_time = window.performance.now();
    GAME.animationFrame = window.requestAnimationFrame(GAME.loop);
  };
  /**
   * { END }
   * Called when server tells to end game
   */
  GAME.end = function(){
    if(GAME.animationFrame)
      window.cancelAnimationFrame(GAME.animationFrame);


    // CLEAN UP GAME
    GAME.bases.length = 0;
    GAME.players.length = 0;
    GAME.me = null;
    GAME.minions.length = 0;
    GAME.particles.length = 0;

    // Temporary solution to hide overlay and go back to START
    setTimeout(function(){
      CONTROLLER.overlayHide();
      CONTROLLER.setScreen('start');
    }, 3000);
  };

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
   * { LOOP }
   * First entry point for game loop
   * @param  {Number} time    Time from performance.now
   */
  GAME.loop = function(time){
    if(GAME.draw_time)
      GAME.draw_time = time - GAME.draw_time;
    GAME.now = time;
    var elapsed = (time - GAME.last_time) / 1000.0;
    GAME.last_time = time;

    GAME.update_time = time;
    GAME.update(elapsed);
    GAME.update_time = performance.now() - GAME.update_time;

    // out('update', GAME.update_time);
    // out('draw', GAME.draw_time);

    GAME.draw_time = performance.now();
    GAME.draw();

    GAME.animationFrame = window.requestAnimationFrame(GAME.loop);
  };
  /**
   * { UPDATE }
   * @param  {Number} t   Elapsed time since last update (seconds)
   */
  GAME.update = function(t){
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
      if(pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
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
        if(!b.selected && pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
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
  };
  /**
   * { DRAW }
   * Draw the scene
   */
  GAME.draw = function(){
    
  };
  GAME.send = function(msg, data){
    NET.send(msg, data);
  };
  /**
   * { DRAW SCORE }
   * Draw a score bar
   * Needs to be tuned for some performance probably
   *     Only update when score has updated
   */
  GAME.drawScoreBar = function(){
    
  };
  /**
   * { START TOUCH }
   */
  GAME.startTouch = function(){
    var i, b, len;

    // Test collision against all
    // for(i = 0; i < this.bases.length; i++){
    //     b = this.bases[i];

    //     if(pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
    //         b.selected = true;
    //         GAME.selected_base = b;
    //     }
    // }

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


    /////////
    // OLD //
    /////////
    // // Test just against [me]
    // if(pointInCircle(TOUCH.x, TOUCH.y, GAME.me.x, GAME.me.y, GAME.me.size)){
    //     GAME.me.selected = true;
    //     GAME.selected_base = GAME.me;
    // }
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
  /**
   * { SEND MINION }
   * Tries to send a minion
   */
  GAME.trySendMinion = function(target){
    target.targeted = true;
    this.targeted_base = target;

    // Call 'canSendMinion' on selected_base
    // [CHANGED] Allways ask server to send
    if(GAME.selected_base.canSendMinion() || true){
      GAME.send('BASE.minion', {
        source_id: this.selected_base.id,
        target_id: target.id
      });
    }
  };

}