/*jslint browser:true */
/*global $: false, yggdrasil:false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
yggdrasil.ui = (function () {
    "use strict";
    var adjustWindowSize = function () {
        $("#dado").css("height", $(window).height() - 35);
        if ($(".dadoControl").css("display") === "block") {
            $(".dadoResult").css("height", $("#dado").height() - $(".dadoControl").height());
        } else {
            $(".dadoResult").css("height", $("#dado").height());
        }
    },
        sortResultDices = function (resultDices) {
            return resultDices.sort(function (a, b) {
                return b - a;
            });
        },

        calcResult = function (results, saved) {
            var i,
                result = 0;
            for (i = 0; i < saved && i < results.length; i += 1) {
                result += results[i];
            }
            return result;
        },
        getDiceResult = function (results) {
            var retorno = "",
                i,
                aux;
            for (i = 0; i < results.length; i += 1) {
                if (results[i] < 10) {
                    retorno += results[i];
                } else {
                    retorno += "(";
                    aux = results[i];
                    while (aux > 10) {
                        retorno += "10 + ";
                        aux -= 10;
                    }
                    retorno += aux;
                    retorno += ")";
                }
                retorno += " + ";
            }
            return retorno.substring(0, retorno.length - 3);
        },

        printResult = function (actionResult, user) {
            var resultsCaracSorted = sortResultDices(actionResult.resultsCharac.slice()),
                resultChar = calcResult(resultsCaracSorted, actionResult.action.save),
                resultFuror = calcResult(actionResult.resultsFuror, actionResult.resultsFuror.length),
                result = resultChar + resultFuror + actionResult.action.skill - actionResult.action.negatives,
                newDivResult,
                newP,
                newSpan;

            newDivResult = $('<div class="resultBlock">');

            newP = $("<p>");
            newP.text("Tirada de " + user + " numero " + actionResult.launchNumber);
            newDivResult.append(newP);

            newP = $("<h1>");
            newP.append("Resultado: ");
            newSpan = $("<span class='resultDice'>");
            newSpan.text(result);
            newP.append(newSpan);
            newP.append(" = " + resultChar + " + " + actionResult.action.skill + " + " + resultFuror + " - " + actionResult.action.negatives);
            newDivResult.append(newP);

            newP = $("<p>");
            newP.append("Caracteristica(" + actionResult.action.characteristic + "): ");
            newSpan = $("<span class='resultDice'>");
            newSpan.text(resultChar);
            newP.append(newSpan);
            newP.append(" = " + getDiceResult(actionResult.resultsCharac));
            newDivResult.append(newP);

            newP = $("<p>");
            newP.append("Habilidad(" + actionResult.action.skill + "): ");
            newSpan = $("<span class='resultDice'>");
            newSpan.text(actionResult.action.skill);
            newP.append(newSpan);
            newDivResult.append(newP);

            newP = $("<p>");
            newP.append("Furor(" + actionResult.action.furor + "): ");
            newSpan = $("<span class='resultDice'>");
            newSpan.text(resultFuror);
            newP.append(newSpan);
            newP.append(" = " + getDiceResult(actionResult.resultsFuror));
            newDivResult.append(newP);

            newP = $("<p>");
            newP.append("Negativos(" + actionResult.action.negatives + "): ");
            newSpan = $("<span class='resultNegatives'>");
            newSpan.text(actionResult.action.negatives);
            newP.append(newSpan);
            newDivResult.append(newP);

            $("#dadoResult").prepend(newDivResult);
        };

    return {
        adjustWindowSize: adjustWindowSize,
        printResult: printResult
    };
}());