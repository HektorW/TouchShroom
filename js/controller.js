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