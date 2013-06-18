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

    s.noteOn(0);
};
SOUND.playRandomSound = function(){
    SOUND.playSound(SOUND.sound_names[randomRangeInt(0, SOUND.sound_names.length)]);
};
SOUND.gainNode = function(start, end, time){
    var g = SOUND.ctx.createGainNode();
    var n = SOUND.ctx.currentTime;
    g.gain.linearRampToValueAtTime(start, n);
    g.gain.linearRampToValueAtTime(end, n + time);
    return g;
};



/** [ NET ]
 * @type {Object}
 */
var NET = {
    socket: null,
    connected: false
};
/** { INIT }
 *
 */
NET.init = function(){
    this.socket = io.connect(':8888', {
        reconnect: false
    });

    this.socket.on('error', function(){
        if(!NET.connected){
            document.querySelector('#loading_msg').classList.add('hidden');
            document.querySelector('#no_connect_msg').classList.remove('hidden');
        }
    });
    this.socket.on('connect', function(){
        NET.connected = true;
        document.querySelector('#loading_msg').classList.add('hidden');
        timed('Connected!');
        timed('Enjoy your stay :)');
        // document.querySelector('#connected_msg').classList.remove('hidden');
    });

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


/** [ GAME ]
 * 
 */
var GAME = {
    canvas: null, ctx: null,
    last_time: -1, now: -1,
    selected_base: null, hovered_base: null, targeted_base: null,
    bases: [],
    minions: [],
    particles: [],
    me: null
};
/**
 * { INIT }
 * Main entry point for initialization
 */
GAME.init = function(){
    NET.init();
    SOUND.init();

    GAME.canvas = document.querySelector('#canvas');
    GAME.ctx = GAME.canvas.getContext('2d');

    // ADD BASES (singeplay?)
    // GAME.bases.push(new Base(0.25, 0.5, 0.08));
    // GAME.bases.push(new Base(0.75, 0.5, 0.08));
    // GAME.bases.push(new Base(0.5, 0.25, 0.08));
    // GAME.bases.push(new Base(0.5, 0.75, 0.08));

    // ADD BASES (singeplay?)
    // var i = 0; var b = new Base(0.25, 0.5, 0.08); b.player_id = i++;
    // GAME.bases.push(b);
    // b = new Base(0.75, 0.5, 0.08); b.player_id = i++;
    // GAME.bases.push(b);
    // b = new Base(0.5, 0.25, 0.08); b.player_id = i++;
    // GAME.bases.push(b);
    // b = new Base(0.5, 0.75, 0.08); b.player_id = i++;
    // GAME.bases.push(b);


    // Add method to player list
    GAME.bases.indexByID = function(id){
        for (var i = this.length - 1; i >= 0; i--) {
            if(this[i].player_id === id)
                return i;
        }
        return undefined;
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


    ////////////////
    // START GAME //
    ////////////////
    GAME.now = GAME.last_time = window.performance.now();
    window.requestAnimationFrame(GAME.loop);
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

    window.requestAnimationFrame(GAME.loop);
};
/**
 * { UPDATE }
 * @param  {Number} t   Elapsed time since last update (seconds)
 */
GAME.update = function(t){
    var i, len, b, m, p;

    this.hovered_base = null;
    this.targeted_base = null;
    for(i = 0, len = this.bases.length; i < len; i++){
        b = this.bases[i];

        b.update(t);

        b.hovered = false;
        b.targeted = false;

        if(!b.selected && pointInCircle(TOUCH.x, TOUCH.y, b.x, b.y, b.size)){
            if(this.selected_base){
                b.targeted = true;
                this.targeted_base = b;

                if(this.selected_base.spawn_delay <= 0.0){
                    // Send to server
                    NET.socket.emit('p.minion', {
                        source_id: this.selected_base.player_id,
                        target_id: this.targeted_base.player_id
                    });

                    // this.minions.push(
                    //     new Minion(this.selected_base, this.targeted_base)
                    //     );

                    this.selected_base.spawn_delay = this.selected_base.spawn_delay_max;
                }
            } else {
                b.hovered = true;
                this.hovered_base = b;
            }
        }
    }

    for(i = 0, len = this.minions.length; i < len; i++){
        m = this.minions[i];
        m.update(t);

        if(!m.active){
            this.minions.splice(i--, 1);
            --len;
            SOUND.playRandomSound();

            this.particles.push(
                new Particle(m.target_base.aspect_left, m.target_base.aspect_top, m.target_base.aspect_size, m.source_base.color)
                );
        }
    }

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

        var line_size = 5;
        var color = GAME.me.color || '#AAA';
        drawLine(GAME.ctx, b.x, b.y, x, y, color, line_size);
        drawCircle(GAME.ctx, x, y, line_size / 2, color);
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
};

GAME.startTouch = function(){
    var i, b;

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

    // Test just against [me]
    if(pointInCircle(TOUCH.x, TOUCH.y, GAME.me.x, GAME.me.y, GAME.me.size)){
        GAME.me.selected = true;
        GAME.selected_base = GAME.me;
    }
};
GAME.endTouch = function(){
    if(GAME.selected_base){
        // Add new minion
        if(GAME.targeted_base){

        }
        GAME.selected_base.selected = false;
        GAME.selected_base = null;
    }
};




/** [ MINION ]
 * Base class for all minions
 * @param {Base}    source
 * @param {Base}    target
 * @param {Number}  size
 * @param {String}  color
 */
function Minion(source, target, size){
    this.source_base = source;
    this.target_base = target;

    this.x = this.source_base.x;
    this.y = this.source_base.y;
    this.size = size || 10;
    this.color = this.source_base.color;

    this.active = true;

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






/** [ BASE ]
 * Base class for buildings
 * @param {Number} aspect_left  Value (0.0 - 1.0) percentage x
 * @param {Number} aspect_top   Value (0.0 - 1.0) percentage y
 * @param {Number} aspect_size  
 * @param {String} color
 */
function Base(aspect_left, aspect_top, aspect_size, color){
    this.x = -1;
    this.y = -1;

    this.aspect_left = aspect_left;
    this.aspect_top = aspect_top;
    this.aspect_size = aspect_size || 0.1;
    this.shadow_size = 30;

    this.color = color || '#AAAAAA';

    this.selected = false;
    this.hovered = false;
    this.targeted = false;

    this.spawn_delay = 0;
    this.spawn_delay_max = 0.5;

    this.animation_timer = 0.0;

    this.resize();
}
Base.prototype.resize = function() {
    if(GAME.width > GAME.height) {
        this.x = GAME.width * this.aspect_left;
        this.y = GAME.height * this.aspect_top;
        this.size = GAME.height * this.aspect_size;
    } else {
        this.x = GAME.width - (GAME.width * this.aspect_top);
        this.y = GAME.height * this.aspect_left;
        this.size = GAME.width * this.aspect_size;
    }
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

    // var style =
    //     (this.selected && 'green') ||
    //     (this.targeted && 'red') ||
    //     (this.hovered && 'yellow') ||
    //      this.color;
    ctx.fillStyle = this.color;

    if(this.hovered || this.selected){
        ctx.shadowColor = this.color || '#000';
        ctx.shadowBlur = this.size;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
    ctx.fill();

    ctx.restore();
};










/** [ PARTICLE ]
 * 
 */
function Particle(aspect_left, aspect_top, aspect_size, color){
    this.x = -1;
    this.y = -1;

    this.aspect_left = aspect_left;
    this.aspect_top = aspect_top;
    this.aspect_size = aspect_size || 0.01;

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
        this.x = GAME.width * this.aspect_left;
        this.y = GAME.height * this.aspect_top;
        this.size = GAME.height * this.aspect_size;
    } else {
        this.x = GAME.width - (GAME.width * this.aspect_top);
        this.y = GAME.height * this.aspect_left;
        this.size = GAME.width * this.aspect_size;
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









/** DEBUG UTIL
 * 
 */
var out = (function(){
    var msgs = {};
    var elem;

    window.addEventListener('load', function(){
        elem = document.querySelector('#output');
    }, false);

    function newElem(content, name){
        var e = document.createElement('div');
        elem.appendChild(e);
        e.innerHTML = (name)? name + ': ' + content: content;
        return e;
    }

    var f = function(){
        var args = arguments;
        var name;

        switch(args.length){
            case 1: {
                newElem(args[0]);
            } break;
            case 2: {
                name = args[0];
                if(msgs[name]){
                    msgs[name].innerHTML = name + ': ' + args[1];
                } else {
                    msgs[name] = newElem(args[1], name);
                }
            } break;
        }
    };

    return f;
})();
var timed = (function(){
    var Q = [];
    var container = null;
    var elem = null;
    var timer = null;
    var delay = 4000;

    window.addEventListener('load', function(){
        container = document.createElement('div');
        var div = document.createElement('div');
        elem = document.createElement('h2');

        container.classList.add('centered_msg');
        container.classList.add('hidden');
        div.appendChild(elem);
        container.appendChild(div);

        document.body.appendChild(container);
    }, false);

    var timeout = function(){
        if(Q.length > 0){
            elem.innerHTML = Q.shift();
            timer = setTimeout(timeout, delay);
        } else {
            timer = null;
            container.classList.add('hidden');
        }
    };

    var f = function(msg){
        if(timer === null){
            elem.innerHTML = msg;
            container.classList.remove('hidden');
            timer = setTimeout(timeout, delay);
        } else {
            Q.push(msg);
        }
    };

    return f;
})();


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