/** TODO
 *
 * { GAME }
 * -    Get information about players in game (DONE)
 *         Save players in some list (DONE)
 * -    Get information about game (DONE)
 * -    Bind listeners for game
 *         Save listener to be able to remove
 * -    Count down start -> start game
 * -    Game logic
 */

var CONTROLLER = {
    current_screen: null
};
/**
 * { INIT }
 */
CONTROLLER.init = function(){
    NET.init();
    GAME.init();

    CONTROLLER.current_screen = 'loading';

    CONTROLLER.bindevents();
};
/**
 * { BIND EVENTS }
 * Binds listeners and flow logic
 */
CONTROLLER.bindevents = function(){
    // Setup listeners
    DOM.on('#btn_play', 'click', function(){
        CONTROLLER.requestPlay();
    });
};

/**
 * { RESUQEST PLAY }
 * Called when client clicks 'Play'
 */
CONTROLLER.requestPlay = function(){
    NET.send('CLIENT.play');
    CONTROLLER.setScreen('waiting');
};

/**
 * { SET SCREEN }
 * Sets the active screen
 * @param  {String} screen  Name for the screen, e.g game/start/loading, !NOT HTML-DOM-id, e.g #screen_game!
 */
CONTROLLER.setScreen = function(screen){
    var s = DOM('#screen_' + screen);
    if(s){
        if(CONTROLLER.current_screen)
            DOM.addClass('#screen_' + CONTROLLER.current_screen, 'hidden');
        CONTROLLER.current_screen = screen;
        DOM.removeClass(s, 'hidden');
    }
};
/**
 * { OVERLAY MESSAGE }
 * Displays an overlay message
 * @param  {String} msg
 */
CONTROLLER.overlayMessage = function(msg){
    DOM.removeClass('#overlay', 'hidden');
    DOM.text('#overlay_message', "<h2>{0}</h2>".format(msg));
};
/**
 * { OVERLAY HIDE }
 * Hides the overlay
 */
CONTROLLER.overlayHide = function(){
    DOM.addClass('#overlay', 'hidden');
};
/**
 * { CONNECTED }
 */
CONTROLLER.connected = function(){
    timed('Connected!');
    CONTROLLER.setScreen('start');
};
/** 
 * { NO CONNECT}
 * Could not connect to server
 */
CONTROLLER.noconnect = function(){
    timed('Could not connect to server!');
    CONTROLLER.setScreen('noconnect');
};
/**
 * { DISCONNECTED }
 */
CONTROLLER.disconnected = function(){
    timed('Disconnected from server!');
    CONTROLLER.setScreen('noconnect');
};

/**
 * { START GAME }
 * Starts game
 */
CONTROLLER.startgame = function(){
    CONTROLLER.setScreen('game');
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
        reconnect: true
    });

    this.socket.on('error', function(){
        if(!NET.connected){
            CONTROLLER.noconnect();
        }
    });
    this.socket.on('connect', function(){
        NET.connected = true;
        CONTROLLER.connected();
    });
    this.socket.on('disconnect', function(){
        NET.connected = false;
        CONTROLLER.disconnected();
    });


    ////////////////
    // CONTROLLER //
    ////////////////
    this.socket.on('SERVER.yourname', function(data){
        timed("You shall be known as '{0}'".format(data.name));
    });
    this.socket.on('SERVER.num_players', function(data){
        timed('Players online: ' + data.num_players);
    });


    this.socket.on('SERVER.initgame', function(){
        CONTROLLER.startgame();
    });


    //////////
    // GAME //
    //////////
    this.socket.on('GAME.setup', function(data){
        GAME.setup(data);
    });
    this.socket.on('GAME.start', function(){
        GAME.start();
    });
    this.socket.on('GAME.disconnection', function(data){
        GAME.disconnection(data);
    });
    this.socket.on('GAME.end', function(){
        GAME.end();
    });


    ////////////
    // MINION //
    ////////////
    this.socket.on('GAME.minion', function(data){
        GAME.newMinion(data);
    });
    this.socket.on('MINION.hit', function(data){
        GAME.minionHit(data);
    });


    //////////
    // BASE //
    //////////
    this.socket.on('BASE.resources', function(data){
        GAME.baseResources(data);
    });




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
/**
 * { SEND }
 * Sends data to server of msg-type
 * @param  {String} msg     Message-type
 * @param  {Object} data    Data to send
 */
NET.send = function(msg, data){
    NET.socket.emit(msg, data);
};






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
if(!Array.prototype.contains){
    Array.prototype.contains = function(search, start){
        start = start || 0;
        return (this.indexOf(search) >= start);
    };
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
    String.prototype.contains = function(search, start){
        start = start || 0;
        return (this.indexOf(search) >= start);
    };
}



/** DEBUG UTIL
 * 
 */
var DEBUG = (function(){
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
        var name, msg;

        switch(args.length){
            case 1: {
                newElem(JSON.stringify(args[0]));
            } break;
            case 2: {
                name = args[0];
                msg = JSON.stringify(args[1]);
                if(msgs[name]){
                    msgs[name].innerHTML = name + ': ' + msg;
                } else {
                    msgs[name] = newElem(msg, name);
                }
            } break;
        }
    };

    return f;
})();


/** UTIL
 * 
 */
var DOM = (function(){
    var f = function(selector){
        if(selector.contains('#'))
            return document.querySelector(selector);
        return document.querySelectorAll(selector);
    };

    f.addClass = function(elem, cls){
        if(typeof(elem) === 'string')
            elem = document.querySelector(elem);
        if(elem)
            elem.classList.add(cls);
    };
    f.removeClass = function(elem, cls){
        if(typeof(elem) === 'string')
            elem = document.querySelector(elem);
        if(elem)
            elem.classList.remove(cls);
    };

    f.text = function(elem, text){
        if(typeof(elem) === 'string')
            elem = document.querySelector(elem);
        if(elem)
            elem.innerHTML = text;
    };

    f.on = function(elem, event, callback, capture){
        if(typeof(elem) === 'string')
            elem = document.querySelector(elem);
        if(elem)
            elem.addEventListener(event, callback, capture || false);
    };
    return f;
})();

var timed = (function(){
    var Q = [];
    var container = null;
    var elem = null;
    var timer = null;
    var delay = 3000;

    window.addEventListener('load', function(){
        container = document.createElement('div');
        var div = document.createElement('div');
        elem = document.createElement('h2');

        container.classList.add('centered_absolute');
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


window.addEventListener('load', CONTROLLER.init, false);