import calculate from "./helpers/calculate.js";

(()=>{

    const calculator = document.getElementById("scientific-calculator");
    const simpleToggle = document.getElementById("simple-toggle");
    const buttons = calculator.querySelectorAll("button");

    const State = {
        cache: [],
        numache: [],
        displayText: [],
        operator: [],
        expression: [],
        inputStop: false,
        deceimalFlag: false,
        operatorOnce: false
    }

    // console.log(buttons);

    simpleToggle.addEventListener("click", function(){
        calculator.classList.toggle("simple");
    });

    buttons.forEach((button) => {
        button.addEventListener("click", function(){
            handleClick(button.getAttribute("class"), this)
        })
    });

    function handleClick(className, button){
        switch(true){
            case className === "number":
                const num = button.getAttribute("data-number");
                State.operatorOnce = false;
                State.cache.push(num);
                State.expression.push(num);
                updateScreen(State.expression.join(""));
                break;
            case className === "simple-function":
                const sfunc = button.getAttribute("data-function");
                
                switch(sfunc){
                    case "cancel":
                        State.cache = [];
                        State.numache = [];
                        State.expression = [];
                        State.operator = [];
                        State.inputStop = false;
                        State.deceimalFlag = false;
                        State.operatorOnce = false;
                        updateScreen("0");
                        updateScreen("", true);
                        break;
                    case "pos-neg":
                        console.log("pos-neg");
                        break;
                    case "percentage":
                        console.log("percentage");
                        break;
                    default:
                        console.error("Unknown function request");
                }
                break;
            case className === "special-function":
                console.log(button);
                break;
            case className === "basic-operator":
                if(State.operatorOnce){
                    return;
                }

                const op =  button.getAttribute("data-operator");

                State.operatorOnce = true;
                State.numache.push(parseFloat(State.cache.join("")));
                State.cache = [];
                State.deceimalFlag = false;
                State.operator.push( op );
                State.expression.push(operatorSymbol(op));
                updateScreen(State.expression.join(""));
                if(State.operator[State.operator.length -1] === "equals"){
                    console.log(State.numache, State.operator);
                    updateScreen(State.expression.join(""), true);
                    updateScreen(calculate(State.numache, State.operator));
                }
                
                break;
            case className === "decimal":
                if(State.deceimalFlag === true){
                    return;
                }
                State.deceimalFlag = true;
                State.cache.push('.');
                updateScreen(State.cache.join(""));
                console.log("decimal");
                break;
            default:
                console.log("what the hell did you click");
                return;
        }
    }

    function updateScreen(displayText, exp){
        const display = document.getElementById("display-text");
        const expression = document.getElementById("expression");
        
        if(exp){
            expression.innerHTML = displayText;
        } else {
            display.innerHTML = displayText;
        } 
    }

    function operatorSymbol(operator){
        switch(operator){
            case "divide":
                return "&divide;";
            case "multiply":
                return "&times;"
            case "subtract":
                return "&minus;";
            case "plus":
                return "&#43;"
            default:
                return;
        }
    }

    const proxyHandler = {
        set: function(obj, prop, value){
            console.log(`The property ${prop} has changed from ${obj[prop]} to ${value}`);

            obj[prop] = value;
        }
    }

    const observableState = new Proxy(State, proxyHandler);

    // observableState.deceimalFlag = true;

})();