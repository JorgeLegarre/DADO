/*jslint browser:true */
/*global $: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
/*jslint browser:true */
/*global $: false, yggdrasil:true, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
yggdrasil.logic = (function () {
    "use strict";
    //private area
    var init = function () {
        yggdrasil.ui.events.initEvents();
    };

    return {
        init: init
    };
}());