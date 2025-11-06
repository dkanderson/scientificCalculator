import calculate from "./helpers/calculate.js";

(()=>{
    // get dom elements
    const calculator = document.getElementById("scientific-calculator");
    const simpleToggle = document.getElementById("simple-toggle");
    const buttons = calculator.querySelectorAll("button");

    const State = {
        cache: [],
        numCache: [],
        displayText: [],
        operator: [],
        expression: [],
        inputStop: false,
        deceimalFlag: false,
        operatorOnce: false
    }


    simpleToggle.addEventListener("click", function(){              // toggle simple/scientific calculator
        calculator.classList.toggle("simple");
    });

    buttons.forEach((button) => {                                   // handle mouse click on buttons
        button.addEventListener("click", function(){
            handleClick(button.getAttribute("class"), this)
        })
    });

    function handleClick(className, button){
        switch(true){
            case className === "number":
                const num = button.getAttribute("data-number");     // get the number associated with the button from the data attribute
                State.operatorOnce = false;                         // reset operator once flag ( makes sure there are no duplicate operators)
                State.cache.push(num);                              // store each number into an array
                State.expression.push(num);                         // store each number into the expression array
                updateScreen(State.expression.join(""));            // update the screen with the full expression
                break;

            case className === "simple-function":
                const sfunc = button.getAttribute("data-function");
                
                switch(sfunc){
                    case "cancel":
                        // Reset all values when then AC button is pressed
                        State.cache = [];
                        State.numCache = [];
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
                if(State.operatorOnce){                             //ensure operator is only pressed once
                    return;
                }

                const op =  button.getAttribute("data-operator");   //get the operator type from the data attribute of the button

                if(!State.numCache.length){                         //make sure zero (0) is the default number on expressions
                    State.cache.push("0");
                    State.expression.push("0");
                }

                State.operatorOnce = true;                          //set operator once flag to true (operator button has been pressed once and no numbers have been entered)
                State.numCache.push(parseFloat(State.cache.join(""))); // store the last number entered into an array
                State.cache = [];                                   // reset the cache
                State.deceimalFlag = false;                         // set the decimal flag to false (decimals only once)
                State.operator.push( op );                          // store the operator in an array
                State.expression.push(operatorSymbol(op));          // convert operator to easily understood symbol and add it to the expression array
                updateScreen(State.expression.join(""));            // update the screen with what is in the expression array

                if(State.operator[State.operator.length -1] === "equals"){  // if the operator is the equals button
                     console.log(State.numCache, State.operator);
                    let result = calculate(State.numCache, State.operator); // calculate result based on simple mathematical operator precedence
                   
                    // reset
                    State.numCache = [];
                    State.operator = [];
                    State.cache = [];

                    
                    State.cache.push(result.toString());            // update cache with the result
                    updateScreen(State.expression.join(""), true);  // move the expression to secondary display above and
                    updateScreen(result);                           // display the result of the expression below
                    State.operatorOnce = false;                     // reset operator once
                    State.expression = [];                          // reset expression array
                    State.expression.push(result.toString());       // the result becomes the new expression
                }
                
                break;

            case className === "decimal":
                if(State.deceimalFlag === true){                    // make sure decimal only appears once
                    return;
                }
                State.deceimalFlag = true;                          // set the decimal flag once the button in pressed
                State.cache.push('.');                              // add the decimal to the number cache
                updateScreen(State.cache.join(""));                 // update the screen with the contents of the cahce 
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