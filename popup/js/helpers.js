/**
 * escapeHTML method
 *  - Use Mustache escape method
 *  - attempt to avoid double-escaping
 */
var original_mustache_escape = Mustache.escape;
APP.escapeHTML = function (text) {
    var el = document.createElement('span');

    // First, "unescape" any special sequences with DOM
    el.innerHTML = text;
    text = el.innerText;

    return original_mustache_escape(text);
}

/**
 * Logging method - based on config setting
 * Update via console (APP.Config.verbose = true)
 *  then save settings page to cache locally
 */
APP.log = function (data) {
    if (APP.Config.verbose) {
        console.log(data);
    }
}

APP.logLine = function () {
    APP.log('--------------------------------------------------');
}

/**
 * Random integer method
 * either call with (min,max) - inclusive
 * or just (max) - inclusive, will assume min=0
 * or () = assume min 0, max 1 - coin flip
 */
APP.random = function (min, max) {

    if (typeof max == 'undefined') {
        if (typeof min == 'undefined') {
            max = 1;
        } else {
            max = min;
        }

        min = 0;
    }

    return ( min + Math.floor( Math.random() * (max + 1 - min) ) );
}

/**
 * Add a shuffle method to Arrays
 * - using Fisher-Yates
 */
Array.prototype.shuffle = function () {
  var currentIndex = this.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = this[currentIndex];
    this[currentIndex] = this[randomIndex];
    this[randomIndex] = temporaryValue;
  }

  return this;
}

/**
 * jQuery method - get trimmed html contents
 */
jQuery.fn.ht = function () {
    return $(this).html().trim();
}
