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
    return rgb;
}




module.exports = {
    hexcharToDec,
    hexcolorToRGB
};