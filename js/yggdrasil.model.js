/*jslint browser:true */
/*global $: false, yggdrasil:false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
yggdrasil.model = (function () {
    "use strict";
    var Action = function (characteristic, skill, furor, negatives, save, explode) {
        this.actionName = "";
        this.characteristic = characteristic;
        this.skill = skill;
        this.furor = furor;
        this.negatives = negatives;
        this.save = save;
        this.explode = explode;
    },
        ActionResult = function (launchNumber, action, resultsCharac, resultsFuror) {
            this.launchNumber = launchNumber;
            this.action = action;
            this.resultsCharac = resultsCharac;
            this.resultsFuror = resultsFuror;
        };

    return {
        Action: Action,
        ActionResult: ActionResult
    };
}());