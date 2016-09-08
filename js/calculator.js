/*global $*/
math.config({
  number: 'BigNumber', // Default type of number:
                       // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 64        // Number of significant digits for BigNumbers
});

var operators = "+-&divide;&times;÷×";
var operatorConversion = {
    "+": "+",
    "-": "-",
    "&divide;": "/",
    "&times;":"*",
    "÷": "/",
    "×": "*",
    "*": "×",
    "/": "÷"
};

function isOperator(char){
    return operators.indexOf(char) !== -1;
}

var model = {
    init: function(){
        this.currentResult= "";
        this.currentNumber = "0";
        this.currentChain= "0";
        this.waitingOperation = false;
    },
    reset: function(){
        this.init();
    },
    compute: function(){
        if(this.waitingOperation){
            var chain = this.currentChain.replace(/÷/g, "/");
            chain = chain.replace( /×/g, "*");
            if(isOperator(model.currentChain.slice(-1)))
                chain = chain.slice(0, -1);
            this.currentResult = math.eval(chain);
        }
    }
};

// Using octopus as an alias for controller - inspired by this course:
// https://www.udacity.com/course/javascript-design-patterns--ud989
var octopus = {
    getCurrentResult: function() {
        var result = model.currentResult;
        if(result === ""){
            return "";
        }else{
            return math.format(result, 10);
        }},
    getCurrentChain: function() {return model.currentChain},
    pressedDigit: function(){
        var pressedNumber = $(this).text();
       if(model.currentNumber === "0"){ //if theres a zero, we dont want repeated zeros
                model.currentChain = model.currentChain.slice(0, -1)+pressedNumber;
                model.currentNumber = pressedNumber;
            }else{
        model.currentNumber += pressedNumber;
        model.currentChain += pressedNumber;}
        model.compute();
        view.render();
    },
    pressedDecimal: function(){
        
        if(model.currentNumber.indexOf(".") === -1){
            model.currentNumber += ".";
            model.currentChain += ".";
            view.render();
        }
    },
    pressedOperator: function(){
        var operator = $(this).text();
        if(!isOperator(model.currentChain.slice(-1))){
            model.currentNumber = "";
            model.currentChain += operator;
            model.waitingOperation = true;
        }else{
            model.currentChain = model.currentChain.slice(0, -1)+operator;
        }
        view.render();
    },
    clearAll: function(){
        model.reset();
        view.render();
    },
    correctEntry: function(){
        if(isOperator(model.currentChain.slice(-1))){
            return;
        }
        var toDelete = model.currentNumber.length;
        if(model.currentChain.length === toDelete){
            model.currentChain = "0";
            model.currentNumber = "0";
        }else{
        model.currentChain = model.currentChain.slice(0, -toDelete);
        model.currentNumber = "";
        }
        model.compute();
        view.render();
    },
    equal: function(){
        var result = model.currentResult;
        model.reset();
        if(result != ""){
            model.currentChain = result.toString();
            model.currentNumber = result.toString();
        }
        view.render();
    },
    keyboard: function(event){

        if ( event.which == 13 ) {//if enter, make the result appear
          event.preventDefault();
          $("button.equal").click();
        }
        else if(event.which == 46){
            $("button.clearAll").click();
        }
        else if(event.which == 8){
            event.preventDefault();
            $("button.correctEntry").click();
        }
        else if("0123456789".indexOf(event.key) != -1) {//if one of the numbers
            $("button.number:contains("+event.key+")").click();
        }
        else if(event.keyCode == 110){
            $("button.decimal").click();
        }
        else if("+-*/".indexOf(event.key) != -1){
            var op = operatorConversion[event.key];
            $("button.operator:contains("+op+")").click();
        }}
};

var view = {
    init: function(){
        $("button.number").click(octopus.pressedDigit);
        $("button.decimal").click(octopus.pressedDecimal);
        $("button.operator").click(octopus.pressedOperator);
        $("button.clearAll").click(octopus.clearAll);
        $("button.correctEntry").click(octopus.correctEntry);
        $("button.equal").click(octopus.equal);
        $("body").keydown(octopus.keyboard);
        this.render();
        
    },
    render: function(){
        $("#currentResult").text(octopus.getCurrentResult());
        $("#currentChain").text(octopus.getCurrentChain());
    }
};

$(document).ready(function(){
    model.init();
    view.init();
})
