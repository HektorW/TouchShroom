 var CONTROLLER = {
};

CONTROLLER.init = function(){
    // Setup listeners
    var btn_play = DOM('#btn_play');
    DOM.on(btn_play, 'click', function(){
        DOM.addClass('#screen_start', 'hidden');
        DOM.removeClass('#screen_waiting', 'hidden');
    });
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
    String.prototype.contains = function(needle, start){
        start = start || 0;
        return (this.indexOf(needle) >= start);
    };
}


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
            elem = document.querySelectorAll(elem)[0];
        if(elem)
            elem.classList.add(cls);
    };
    f.removeClass = function(elem, cls){
        if(typeof(elem) === 'string')
            elem = document.querySelectorAll(elem)[0];
        if(elem)
            elem.classList.remove(cls);
    };

    f.on = function(elem, event, callback, capture){
        elem.addEventListener(event, callback, capture || false);
    };
    return f;
})();


window.addEventListener('load', CONTROLLER.init, false);