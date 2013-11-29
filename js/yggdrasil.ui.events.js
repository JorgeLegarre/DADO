/*jslint browser:true */
/*global $: false, chat:false, yggdrasil:false, jQuery:false,alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
yggdrasil.ui.events = (function () {
    "use strict";
    var launchNumber = 1,
        previousValue = 0,
        savedActions = [],
        //remove all selected dices and restore them to no-select
        //dice: class of the div that contain 1 dice, values: "caracDice" || "furorDice"
        //sel: first part of the class for select a element, ex: selCarac, function add 1 | 2 | 3 | ... to complete class name ex: selCarac1
        //noSel: first part of the class for a non-selected element ex:carac, function add 1 | 2 | 3 | ... to complete class name ex: carac1
        removeSelClass = function (dice, sel, noSel) {
            $("." + dice + " img").each(function () {
                $(this).removeClass(sel + $(this).attr("alt"));
                $(this).addClass(noSel + $(this).attr("alt"));
            });
        },

        //---------------------------------------------------------------------------

        cleanScreen = function () {
            removeSelClass("caracDice", "selCarac", "carac");
            removeSelClass("furorDice", "selFuror", "furor");
            $("#habilidad").val("0");
            $("#negativos").val("0");
            previousValue = 0;

            $("input[type=radio]").prop("checked", false);
            $("input[type=radio]").eq(0).prop("checked", true);

            $("input[type=checkbox]").prop("checked", true);

        },

        deselectList = function () {
            $("#actions").children().removeClass().addClass("noSelList");
        },

        setClickClear = function () {
            $("#cleanScreen").click(function () {
                cleanScreen();
                deselectList();
            });
        },

        //---------------------------------------------------------------------------

        //events for the click in one dice, "caracteristica" or "furor"
        //dice: class of the div that contain 1 dice, values: "caracDice" || "furorDice"
        //sel: first part of the class for select a element, ex: selCarac, function add 1 | 2 | 3 | ... to complete class name ex: selCarac1
        //noSel: first part of the class for a non-selected element ex:carac, function add 1 | 2 | 3 | ... to complete class name ex: carac1
        setClickDado = function (dice, sel, noSel) {
            $("." + dice + " img").click(function () {
                //we obtain if the dice was selected before the click
                var isSelected = $(this).attr("class") === (sel + $(this).attr("alt"));

                removeSelClass(dice, sel, noSel);

                //if it was not selected, we select it
                if (!isSelected) {
                    //we remove the current carac
                    $(this).removeClass(noSel + $(this).attr("alt"));
                    //we add the sel carac
                    $(this).addClass(sel + $(this).attr("alt"));
                }
                //else, it was selected, so we want to unselect if. we dont have to do nothing.
            });
        },

        //---------------------------------------------------------------------------

        //las siguientes dos funciones sirven para poner el cursor en una posicion determinada
        //la funcion de entrada es setCaretToPos
        //fijarse que para hacer la llamada a setSelectionRange hay que dejar un poquito de margen
        // y no puede llamarse en el mismo evento on focus, asi que
        //hacemos un setTimeout de tan solo un milisegundo para engañar al javascript
        //setTimeout(function () {
        //            setCaretToPos(document.getElementById(inputText), 0);
        //        }, 1);
        setSelectionRange = function (input, selectionStart, selectionEnd) {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            } else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        },

        setCaretToPos = function (input, pos) {
            setTimeout(function () {
                setSelectionRange(input, pos, pos);
            }, 1);
        },

        //---------------------------------------------------------------------------

        inFocus = false,
        inputTextFocusEvents = function (inputText) {
            $("#" + inputText).focusin(function () {
                previousValue = $("#" + inputText).val();
                $("#" + inputText).css("color", "#D8D8D8");

                setCaretToPos(document.getElementById(inputText), 0);

                inFocus = true;
            });

            $("#" + inputText).focusout(function () {
                $("#" + inputText).css("color", "#000000");
                if ($("#" + inputText).val() === "" || !jQuery.isNumeric($("#" + inputText).val())) {
                    $("#" + inputText).val(previousValue);
                }
            });

            $("#" + inputText).keypress(function () {
                //if is not intro
                if (event.which !== 13) {
                    if (inFocus && (/\d/).test(String.fromCharCode(event.keyCode))) {
                        //var charac = String.fromCharCode(e.which);
                        $("#" + inputText).val("");
                        $("#" + inputText).css("color", "#000000");
                        inFocus = false;
                        return true;
                    }
                    return (/\d/).test(String.fromCharCode(event.keyCode));
                }

                //else, is intro
                $("#launch").focus();
                //$("#launch").click();

            });
        },

        //---------------------------------------------------------------------------

        getDice = function (dice) {
            var sel = -1;
            $("." + dice).children().each(function (index) {
                if ($(this).attr("class").substring(0, 3) === "sel") {
                    sel = index;
                }
            });
            return (sel === -1) ? sel : sel + 1;
        },

        getRadioSel = function (name) {
            var radioButtons = $("input:radio[name='" + name + "']"),
                selectedIndex = radioButtons.index(radioButtons.filter(':checked'));

            return selectedIndex;
        },

        getAction = function () {
            var characteristic = getDice("caracDice"),
                skill = Number($("#habilidad").val()),
                furor = getDice("furorDice"),
                negatives = Number($("#negativos").val()),
                save = Number($("input[type=radio][name='guardar']")[getRadioSel("guardar")].value),
                explode = $('#explotar').prop('checked');

            return new yggdrasil.model.Action(characteristic, skill, furor, negatives, save, explode);

        },

        setClickAdd = function () {
            $("#add").click(function () {
                $("#newName").show();
                $("#newName").val("newAction");
                $("#newName").focus();

                savedActions.unshift(getAction());
                deselectList();
            });

        },

        //---------------------------------------------------------------------------

        launchDice = function (dice) {
            return Math.floor((Math.random() * dice) + 1);
        },

        calcDicesResults = function (nDices, explode) {
            var results = [],
                lastResult,
                i;

            for (i = 0; i < nDices; i = i + 1) {
                lastResult = launchDice(10);
                results[i] = lastResult;

                if (explode) {
                    while (lastResult === 10) {
                        lastResult = launchDice(10);
                        results[i] += lastResult;
                    }
                }
            }

            return results;
        },

        sendLaunchRTC = function (actionResult) {
            chat.logic.sendData(actionResult);
        },

        launchDices = function () {
            var action = getAction(),
                resultsCarac = calcDicesResults(action.characteristic, action.explode),
                resultsFuror = calcDicesResults(action.furor, action.explode),
                actionResult = new yggdrasil.model.ActionResult(launchNumber, action, resultsCarac, resultsFuror);
            launchNumber += 1;

            sendLaunchRTC(actionResult);
            yggdrasil.ui.printResult(actionResult, localStorage.username);
        },

        //click over button "launch"
        setClickLaunch = function () {
            $("#launch").click(function () {
                launchDices();
            });
        },

        //---------------------------------------------------------------------------

        getSelectedAction = function () {
            var retorno = -1;
            $("#actions").children().each(function (index) {
                if ($(this).attr("class") === "selList") {
                    retorno = index;
                }
            });
            return retorno;
        },

        removeAction = function (index) {
            savedActions.splice(index, 1);
        },

        setClickRemove = function () {
            $("#remove").click(function () {
                var selectedAction = getSelectedAction();
                if (selectedAction !== -1) {
                    removeAction(selectedAction);
                    $("#actions").children().eq(selectedAction).remove();
                }
            });

        },

        //---------------------------------------------------------------------------

        loadAction = function (index) {
            if (index >= 0 && index < savedActions.length) {
                var action = savedActions[index];
                removeSelClass("caracDice", "selCarac", "carac");
                if (action.characteristic !== -1) {
                    $(".caracDice").children().eq(action.characteristic - 1).click();
                }

                $("#habilidad").val(action.skill);

                removeSelClass("furorDice", "selFuror", "furor");
                if (action.furor !== -1) {
                    $(".furorDice").children().eq(action.furor - 1).click();
                }

                $("#negativos").val(action.negatives);

                jQuery("input[type=radio][name='guardar'][value='" + action.save + "']").prop('checked', true);

                $('#explotar').prop('checked', action.explode);

            }
        },

        selList = function (elem) {
            deselectList();
            $(elem).removeClass("noSelList").addClass("selList");

            loadAction(getSelectedAction());
        },

        editTextPosition = -1,
        addActionList = function (name) {
            var setNewInputTextEvents = function (nit) {
                nit.focus(function () {
                    var inputText = $(this),
                        span = $(this).parent().children().eq(1);
                    editTextPosition = getSelectedAction();
                    inputText.val(span.text());
                });

                nit.focusout(function () {
                    var inputText = $(this),
                        span = $(this).parent().children().eq(1);

                    if (inputText.val() !== "") {
                        span.text(inputText.val());
                    }

                    savedActions[editTextPosition].actionName = span.text();

                    inputText.hide();
                    span.show(); //span

                    $("#launch").focus();
                });
                nit.keypress(function (e) {
                    if (e.which === 13) {
                        $("#launch").focus();
                    }
                });
            },
                newLi = $("<li>"),
                newInputText = $("<input type='text' class='action'>"),
                newSpan = $("<span>"),
                lu = $("#actions"),
                textVal = (name !== "") ? name : "newAction";

            newInputText = $("<input type='text' class='action' id='" + textVal + "' value='" + textVal + "'>");
            setNewInputTextEvents(newInputText);

            newSpan.text(textVal);

            newLi.append(newInputText);
            newLi.append(newSpan);

            newLi.click(function () {
                if ($(this).attr("class") !== "selList") {
                    selList(newLi);
                } else {
                    $(".selList input").show();
                    $(".selList input").focus();
                    $(".selList span").hide();
                }
            });

            lu.prepend(newLi);

            return textVal;
        },

        inFocusNewText = false,
        setNewNameEvents = function () {
            $("#newName").focusin(function () {
                $("#newName").css("color", "#D8D8D8");

                setCaretToPos(document.getElementById("newName"), 0);

                inFocusNewText = true;
            });

            $("#newName").focusout(function () {
                var name = addActionList($("#newName").val());

                savedActions[0].actionName = name;

                $("#newName").hide();

                inFocusNewText = false;
            });

            $("#newName").keypress(function () {
                //if is not intro
                if (event.which !== 13) {
                    if (inFocusNewText) {
                        //var charac = String.fromCharCode(e.which);
                        $("#newName").val("");
                        $("#newName").css("color", "#000000");
                        inFocusNewText = false;
                    }
                    return true;
                }

                //else, is intro
                $("#launch").focus();

            });

        },

        //---------------------------------------------------------------------------

        selListIndex = function (index) {
            var elem = $("#actions").children().eq(index);

            selList(elem);

            $("#launch").focus();
        },

        saveSavedActions = function () {
            localStorage.yggdrasil = JSON.stringify(savedActions);
        },

        loadSavedActions = function () {
            var i;
            if (localStorage.yggdrasil !== undefined) {

                savedActions = JSON.parse(localStorage.yggdrasil);

                for (i = savedActions.length - 1; i >= 0; i = i - 1) {
                    addActionList(savedActions[i].actionName);
                }

            }
        },

        setWindowEvents = function () {
            $(window).resize(function () {
                yggdrasil.ui.adjustWindowSize();
            });

            $(window).keydown(function (event) {
                var lineSelect = getSelectedAction();
                if (lineSelect !== -1) {
                    switch (event.which) {
                    case 38: //up
                        if (lineSelect > 0) {
                            selListIndex(lineSelect - 1);
                        }
                        break;
                    case 40: //down
                        if (lineSelect < ($("#actions").children().length - 1)) {
                            selListIndex(lineSelect + 1);
                        }
                        break;
                        //case 8: //delete
                        //    $("#remove").click();
                        //    break;
                    }
                } else {
                    if (event.which === 38 || event.which === 40) {
                        selListIndex(0);
                    }
                }
            });

            //TODO convertir a jquery version de onload $(window).load(function(){...})
            //puede que la app deje de funcionar y no cargue las partidas guardadas, si pasa, es porque hay que
            //llamar a loadSavedActions directamente en vez de en en el evento onlad
            window.onload = function () {
                loadSavedActions();
            };

            //TODO convertir a jquery version $(window).beforeunload(fucntion(){...})
            window.onbeforeunload = function () {
                saveSavedActions();
            };
        },

        //---------------------------------------------------------------------------

        setHideShowControl = function () {
            $("#hide").click(function () {
                $(".dadoControl").toggle();

                yggdrasil.ui.adjustWindowSize();

                if ($("#hide").val() === "Ocultar Dados") {
                    $("#hide").val("Mostrar Dados");
                } else {
                    $("#hide").val("Ocultar Dados");
                }
            });
        },

        //---------------------------------------------------------------------------

        //function that initialize the events for the yggdrasil game
        initEvents = function () {
            //Click to dices
            setClickDado("caracDice", "selCarac", "carac");
            setClickDado("furorDice", "selFuror", "furor");

            //events on focus textfields
            inputTextFocusEvents("habilidad");
            inputTextFocusEvents("negativos");

            //click on launch button
            setClickLaunch();

            //click on clean screen button
            setClickClear();

            //click to add/save action(save action)
            setClickAdd();

            //click to remove action
            setClickRemove();

            //set events of newElement (in list savedActions)
            setNewNameEvents();

            //Hide/show control panel
            setHideShowControl();

            setWindowEvents();
        };

    return {
        initEvents: initEvents
    };
}());