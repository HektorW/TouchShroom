/** TODO
 * -    [Bug] Base sometimes doesn't change owner on client but seems to on server.
 *         Base receivs new resources instead of diminishing when sent by client but
 *         client can't controll it and it isn't colored correctly
 */



// --------------------------------------------------------------
/** [ TOUCH ]
 * 
 */
var TOUCH = {
    down: false,
    x: -1, y: -1,
    start_x: -1, start_y: -1,
    end_x: -1, end_y: -1,
    prev_x: -1, prev_y: -1,
    start_time: -1
};



// --------------------------------------------------------------
/** [ SOUND ]
 *
 */
var SOUND = {
    ctx: null,
    sounds: [],
    sound_names: [],
    startup_event: null
};
SOUND.init = function(){
    if(!window.AudioContext){
        return;
    }

    SOUND.ctx = new AudioContext();

    SOUND.loadSound('sound/marimba/c4.wav', 'c4');
    SOUND.loadSound('sound/marimba/d4.wav', 'd4');
    SOUND.loadSound('sound/marimba/e4.wav', 'e4');
    SOUND.loadSound('sound/marimba/f4.wav', 'f4');
    SOUND.loadSound('sound/marimba/g4.wav', 'g4');
    SOUND.loadSound('sound/marimba/a4.wav', 'a4');
    SOUND.loadSound('sound/marimba/b4.wav', 'b4');
    SOUND.loadSound('sound/marimba/c5.wav', 'c5');
    SOUND.loadSound('sound/marimba/d5.wav', 'd5');
    SOUND.loadSound('sound/marimba/e5.wav', 'e5');
    SOUND.loadSound('sound/marimba/f5.wav', 'f5');
    SOUND.loadSound('sound/marimba/g5.wav', 'g5');
    SOUND.loadSound('sound/marimba/a5.wav', 'a5');
    SOUND.loadSound('sound/marimba/b5.wav', 'b5');
    SOUND.loadSound('sound/marimba/c6.wav', 'c6');
    SOUND.loadSound('sound/marimba/d6.wav', 'd6');
};
SOUND.loadSound = function(url, name){
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(){
        SOUND.ctx.decodeAudioData(xhr.response, function(buffer){
            SOUND.sound_names.push(name);
            SOUND.sounds[name] = buffer;

            if(SOUND.startup_event === null){
                SOUND.startup_event = function(){
                    SOUND.playRandomSound();
                    window.removeEventListener('touchstart', SOUND.startup_event, false);
                };
                window.addEventListener('touchstart', SOUND.startup_event, false);
            }
        });
    };
    xhr.open('GET', url);
    xhr.send();
};
SOUND.playSound = function(note){
    if(!SOUND.sounds[note])
        return;
    var s = SOUND.ctx.createBufferSource();
    s.buffer = SOUND.sounds[note];
    var now = SOUND.ctx.currentTime;

    var gain = SOUND.gainNode(0.8, 0.0, 0.4);
    s.connect(gain);
    gain.connect(SOUND.ctx.destination);

    // s.noteOn(0);
    s.start()
};
SOUND.playRandomSound = function(){
    SOUND.playSound(SOUND.sound_names[randomRangeInt(0, SOUND.sound_names.length)]);
};
SOUND.gainNode = function(start, end, time){
    var g = SOUND.ctx.createGain();
    var n = SOUND.ctx.currentTime;
    g.gain.linearRampToValueAtTime(start, n);
    g.gain.linearRampToValueAtTime(end, n + time);
    return g;
};





// --------------------------------------------------------------
/** [ GAME ]
 * 
 */
var GAME = {
    canvas: null, ctx: null,
    last_time: -1, now: -1,
    selected_base: null, hovered_base: null, targeted_base: null,
    bases: [],
    players: [],
    minions: [],
    particles: [],
    me: null,
    animationFrame: null
};
/**
 * { INIT }
 * Main entry point for initialization
 * General initialization not bound to a game instance
 */
GAME.init = function(){
    window.addEventListener('click', () => SOUND.init());
    // SOUND.init();

    GAME.canvas = document.querySelector('#canvas');
    GAME.ctx = GAME.canvas.getContext('2d');

    // Find element in array by property
    GAME.players.findBy = function(prop, value){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i][prop] === value)
                return this[i];
        }
        return undefined;
    };
    GAME.players.byID = function(id){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i].id === id)
                return this[i];
        }
    };

    // Add method to base list
    GAME.bases.indexByID = function(id){
        for (var i = this.length - 1; i >= 0; i--) {
            if(this[i].id === id)
                return i;
        }
        return undefined;
    };
    GAME.bases.byID = function(id){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i].id === id)
                return this[i];
        }
    };

    // MINION
    GAME.minions.byID = function(id){
        for(var i = 0, len = this.length; i < len; i++){
            if(this[i].id === id)
                return this[i];
        }
    };

    GAME.resize();

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
 * { RESIZE }
 * Resize canvas and fix scales
 */
GAME.resize = function(){
    var i;

    GAME.width  = GAME.canvas.width  = window.innerWidth;
    GAME.height = GAME.canvas.height = window.innerHeight;

    function r(e){e.resize();}
    GAME.bases.forEach(r);
    GAME.minions.forEach(r);
    GAME.particles.forEach(r);
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


        /////////
        // OLD //
        /////////
        // if(!b.selected && pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
        //     if(this.selected_base){
        //         b.targeted = true;
        //         this.targeted_base = b;

        //         if(this.selected_base.spawn_delay <= 0.0){
        //             // Send to server
        //             NET.socket.emit('p.minion', {
        //                 source_id: this.selected_base.player_id,
        //                 target_id: this.targeted_base.player_id
        //             });

        //             // this.minions.push(
        //             //     new Minion(this.selected_base, this.targeted_base)
        //             //     );

        //             this.selected_base.spawn_delay = this.selected_base.spawn_delay_max;
        //         }
        //     } else {
        //         b.hovered = true;
        //         this.hovered_base = b;
        //     }
        // }
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
    var i, len, b, m, x, y;

    GAME.ctx.clearRect(0, 0, GAME.width, GAME.height);

    //////////////////
    // Draw minions //
    //////////////////
    for(i = 0, len = this.minions.length; i < len; i++){
        m = this.minions[i];
        if(m.active)
            m.draw(this.ctx);
    }

    ///////////////
    // Draw line //
    ///////////////
    if(this.selected_base){
        b = this.selected_base;
        if(this.targeted_base){
            x = this.targeted_base.x;
            y = this.targeted_base.y;
        }
        else {
            x = TOUCH.x;
            y = TOUCH.y;
        }

        GAME.ctx.save();

        GAME.ctx.globalAlpha = 0.3;
        var line_size = 5;
        var color = GAME.me.color || '#AAA' ;
        drawLine(GAME.ctx, b.x, b.y, x, y, color, line_size);
        drawCircle(GAME.ctx, x, y, line_size / 2, color);

        GAME.ctx.restore();
    }

    ////////////////
    // Draw bases //
    ////////////////
    for(i = 0, len = this.bases.length; i < len; i++){
        this.bases[i].draw(this.ctx);
    }

    ////////////////////
    // DRAW PARTICLES //
    ////////////////////
    for(i = 0, len = this.particles.length; i < len; i++){
        this.particles[i].draw(this.ctx);
    }


    ////////////////
    // DRAW SCORE //
    ////////////////
    GAME.drawScoreBar();
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
    var x, y, w, h, i, len, r, total, a, xt, wt, text;

    GAME.ctx.save();

    w = GAME.width / 1.5;
    h = GAME.height / 20;
    x = (GAME.width / 2) - (w / 2);
    y = (GAME.height / 20) - (h / 2);

    r = [];
    total = 0;
    for(i = 0, len = GAME.players.length; i < len; i++){
        r[i] = GAME.players[i].totalResources();
        total += r[i];
    }

    xt = x;
    for(i = 0, len = GAME.players.length; i < len; i++){
        GAME.ctx.fillStyle = GAME.players[i].color;
        wt = (r[i] / total) * w;
        GAME.ctx.fillRect(
            xt,
            y,
            wt,
            h
        );
        text = GAME.players[i].name + ' - ' + r[i];
        GAME.ctx.fillStyle = 'black';
        GAME.ctx.fillText(text, xt + (wt/2) - (GAME.ctx.measureText(text).width/2), y+(h/2));

        xt += wt;
    }


    GAME.ctx.strokeStyle = 'white';
    GAME.ctx.strokeRect(x, y, w, h);

    GAME.ctx.restore();
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






// --------------------------------------------------------------
/** [ MINION ]
 * Base class for all minions
 * @param {Base}    source
 * @param {Base}    target
 * @param {Number}  scale
 * @param {String}  color
 */
function Minion(id, source, target, scale){
    this.id = id;

    this.source_base = source;
    this.target_base = target;

    this.x = this.source_base.x;
    this.y = this.source_base.y;
    this.scale = scale || 0.01;
    this.size = 10;
    this.color = this.source_base.color;

    this.active = true;
    this.dead_by_server = false;

    this.start_time = window.performance.now();
    this.active_time = 0;

    this.speed = 3;

    this.resize();
}
/** 
 * { RESIZE }
 */
Minion.prototype.resize = function() {
    var delta_speed = ((GAME.width > GAME.height)? GAME.width : GAME.height) / this.speed;

    var distance = vecDistance(this.source_base.x, this.source_base.y, this.target_base.x, this.target_base.y);
    var distance_x = this.target_base.x - this.source_base.x;
    var distance_y = this.target_base.y - this.source_base.y;

    this.vel_x = (distance_x / Math.abs((distance / delta_speed))) || 0;
    this.vel_y = (distance_y / Math.abs((distance / delta_speed))) || 0;

    this.size = ((GAME.width > GAME.height)? GAME.height : GAME.width) * this.scale;
};
/** 
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Minion.prototype.update = function(t) {
    this.active_time += t;

    this.x = this.source_base.x + this.vel_x * this.active_time;
    this.y = this.source_base.y + this.vel_y * this.active_time;

    if(pointInCircle(this.x, this.y, this.target_base.x, this.target_base.y, this.target_base.size)){
        this.active = false;
    }
};
/**
 * { DRAW }
 * @param  {Context} ctx    Rendering context
 */
Minion.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
    ctx.fill();
};







// --------------------------------------------------------------
/** [ BASE ]
 * Base class for buildings
 * @param {Number} id
 * @param {Number} left     Value (0.0 - 1.0) percentage x
 * @param {Number} top      Value (0.0 - 1.0) percentage y
 * @param {Number} scale
 * @param {Number} resources
 */
function Base(id, left, top, scale, resources, resources_max){
    this.id = id;

    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.1;
    this.shadow_size = 30;

    this.color = '#AAAAAA';

    this.selected = false;
    this.hovered = false;
    this.targeted = false;

    this.spawn_delay = 0;
    this.spawn_delay_max = 0.5;

    this.resources = resources || 0;
    this.resources_max = resources_max;

    this.player = null;

    this.resize();
}
Base.prototype.resize = function() {
    if(GAME.width > GAME.height) {
        this.x = GAME.width * this.left;
        this.y = GAME.height * this.top;
        this.size = GAME.height * this.scale;
    } else {
        this.x = GAME.width - (GAME.width * this.top);
        this.y = GAME.height * this.left;
        this.size = GAME.width * this.scale;
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

    this.color = player.color;
    this.player = player;
    this.player.addBase(this);
};
/**
 * { CAN SEND MINION }
 * Tests if the base can send a minion
 */
Base.prototype.canSendMinion = function() {
    return (this.spawn_delay <= 0.0);

    // if(this.spawn_delay <= 0.0){
    //     this.spawn_delay = this.spawn_delay_max;
    //     return true;
    // }
    // return false;
};
Base.prototype.sendMinion = function() {
    this.spawn_delay = this.spawn_delay_max;
    --this.resources;
};

/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Base.prototype.update = function(t) {
    if(this.spawn_delay > 0)
        this.spawn_delay -= t;
};
/**
 * { DRAW }
 * @param  {Context} ctx    Rendering context
 */
Base.prototype.draw = function(ctx) {
    ctx.save();

    ctx.fillStyle = this.color;

    if(this.hovered){
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
    }
    else if(this.selected){
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
    ctx.fill();


    // Draw text
    ctx.fillStyle = 'black';
    var text = this.resources + ((this.player)? '/' + this.resources_max : '');
    var m = ctx.measureText(text);
    ctx.fillText(text, this.x - m.width/2, this.y);

    ctx.restore();
};







// --------------------------------------------------------------
/** [ PLAYER ]
 * Player
 * @param {Number} id
 * @param {String} color
 */
function Player(id, name, color){
    this.id = id;
    this.name = name;
    this.color = color;

    this.bases_id = [];
}
/**
 * { ADD BASE }
 * Adds a base to player
 * @param  {Base} base
 */
Player.prototype.addBase = function(base) {
    if(!this.bases_id.contains(base.id))
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
/**
 * { TOTAL RESOURCES }
 * Calculates players total resources based on bases
 */
Player.prototype.totalResources = function() {
    var t = 0, index, i, len;
    for(i = 0, len = this.bases_id.length; i < len; i++){
        index = GAME.bases.indexByID(this.bases_id[i]);
        t += GAME.bases[index].resources;
     }
     return t;
};






// --------------------------------------------------------------
/** [ PARTICLE ]
 * 
 */
function Particle(left, top, scale, color){
    this.x = -1;
    this.y = -1;
    this.size = -1;

    this.left = left;
    this.top = top;
    this.scale = scale || 0.01;

    this.color = color || '#AAAAAA';
    this.rgba = hexcolorToRGB(this.color);
    this.rgba[3] = 1.0;

    this.active = true;
    this.live_count = 0.0;

    this.resize();
}
/**
 * { RESIZE }
 */
Particle.prototype.resize = function() {
    if(GAME.width > GAME.height) {
        this.x = GAME.width * this.left;
        this.y = GAME.height * this.top;
        this.size = GAME.height * this.scale;
    } else {
        this.x = GAME.width - (GAME.width * this.top);
        this.y = GAME.height * this.left;
        this.size = GAME.width * this.scale;
    }
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update
 */
Particle.prototype.update = function(t) {
    this.live_count += t;
    this.rgba[3] -= t * 0.5;

    if(this.rgba[3] < 0)
        this.active = false;
};
/**
 * { DRAW }
 * @param  {Context} ctx    Rendering context
 */
Particle.prototype.draw = function(ctx) {
    ctx.save();

    ctx.strokeStyle = String.prototype.format.apply('rgba({0},{1},{2},{3})', this.rgba);
    // ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + (this.live_count * 10), Math.PI*2, false);
    ctx.stroke();

    ctx.restore();
};






// --------------------------------------------------------------
/** DRAW UTIL
 * 
 */
function drawLine(ctx, x1, y1, x2, y2, color, width){
    if(color)
        ctx.strokeStyle = color;
    if(width)
        ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function drawCircle(ctx, x, y, r, color, style){
    style = style || 'fill';
    if(color)
        ctx[style+'Style'] = color;

    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, false);
    ctx[style]();
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
function hexcharToDec(hexval){
    var c = hexval.toUpperCase().charCodeAt(0);
    return (c < 60)? (c-48) : (c-55);
}
function hexcolorToRGB(hex){
    hex = hex.replace('#', '');
    var rgb = [];
    var inc = (hex.length < 6)? 1 : 2;
    for(var i = 0, len = hex.length; i < len; i+=inc){
        // var v = hex.substr(i, inc);
        rgb.push(parseInt(hex.substr(i, inc), 16));
    }

    // switch(hex.length){
    //     case 3: { // #FFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[0]),
    //             (hexcharToDec(hex[1]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[2])
    //         ];
    //     } break;
    //     case 4: { // #FFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[0]),
    //             (hexcharToDec(hex[1]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[2]),
    //             (hexcharToDec(hex[3]) * 16) + hexcharToDec(hex[3])
    //         ];
    //     } break;
    //     case 6: { // #FFFFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[3]),
    //             (hexcharToDec(hex[4]) * 16) + hexcharToDec(hex[5])
    //         ];
    //     } break;
    //     case 8: { // #FFFFFFFF
    //         rgb = [
    //             (hexcharToDec(hex[0]) * 16) + hexcharToDec(hex[1]),
    //             (hexcharToDec(hex[2]) * 16) + hexcharToDec(hex[3]),
    //             (hexcharToDec(hex[4]) * 16) + hexcharToDec(hex[5]),
    //             (hexcharToDec(hex[6]) * 16) + hexcharToDec(hex[7])
    //         ];
    //     } break;
    // }
    return rgb;
}






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
/** SETUP PRE-FIXES
 * 
 */
window.performance = window.performance || {};
window.performance.now =
        window.performance.now ||
        window.performance.webkitNow ||
        window.performance.mozNow ||
        window.performance.msNow ||
        function(){ return Date.now(); };
window.requestAnimationFrame =
        window.requestAnimationFrame ||
        /*window.webkitRequestAnimationFrame ||*/ // Ipad be wierd ?!
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            setTimeout(function(){
                callback(window.performance.now());
            }, 1000/60);
        };
window.cancelAnimationFrame =
        window.cancelAnimationFrame ||
        /*window.webkitCancelAnimationFrame ||*/ // Ipad is wierd
        window.mozCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function(id){
            clearTimeout(id);
        };
window.AudioContext =
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozNow ||
        window.msNow ||
        undefined;


/**
 * GRADIENT CODE
 */
// var grd = GAME.ctx.createRadialGradient(x, y, ir, x, y, or);
// grd.addColorStop(0, 'rgba(255, 0, 0, 1.0)');
// grd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
// GAME.ctx.fillStyle = grd;
// GAME.ctx.fillRect(x-or, y-or, or*2, or*2);

/**
 * OLD DRAW DOTS
 */
// function draw(){
//     GAME.ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
//     var ir = 2;
//     var or = 30;

//     var num_balls = 5;
//     var delta_x = (TOUCH.x - TOUCH.start_x) / num_balls;
//     var delta_y = (TOUCH.y - TOUCH.start_y) / num_balls;
//     var delta_scale = 5;
//     var start_scale = 10;
//     GAME.ctx.fillStyle = 'red';
//     GAME.ctx.shadowBlur = 40;
//     GAME.ctx.shadowColor = 'red';

//     GAME.ctx.beginPath();
//     for(var i = 0; i < num_balls; i++){
//         GAME.ctx.arc(TOUCH.start_x + (delta_x * i), TOUCH.start_y + (delta_y * i), start_scale + (delta_scale * i), Math.PI*2, false);
//     }
//     GAME.ctx.fill();
// }


/** Initialize GAME
 * 
 */
// window.addEventListener('load', GAME.init, false);