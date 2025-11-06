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
        operatorOnce: false,
        negativeFlag: false,
        equated: false
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
                
                if(State.equated){
                    // reset
                    State.cache = [];
                    State.expression = [];
                    State.operator = [];
                    State.numCache = [];
                    State.equated = false;
                    updateScreen("");
                    updateScreen("", true);
                }

                if(State.negativeFlag){
                    State.negativeFlag = false;                     // set negative flag to false ( next number has not been negated)
                    State.operator.push("multiply");                // add a "multiply" operator to the operators array
                    State.numCache.push(parseFloat(State.cache.join("")));      // update number cache with the last negated number
                    State.cache = [];                               // clear cache
                    State.expression.push(operatorSymbol("multiply"));          // convert operator to easily understood symbol and add it to the expression array
                    updateScreen(State.expression.join(""));        // update screen with multiply symbol
                }

                const num = button.getAttribute("data-number");     // get the number associated with the button from the data attribute
                State.operatorOnce = false;                         // reset operator once flag ( makes sure there are no duplicate operators)
                State.cache.push(num);                              // store each number into an array
                State.expression.push(num);                         // store each number into the expression array
                updateScreen(State.expression.join(""));            // update the screen with the full expression
               console.log(State.expression, State.cache);
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
                        if(State.expression.length && !State.negativeFlag){             // --if there is an expression and no negative flag has been set
                            const pos = State.expression.length - State.cache.length;   // calculate offset position in the array to insert bracket and neg symbol
                            State.cache.unshift("-");                                   // add neg symbol to the cache
                            
                            State.expression.splice(pos, 0, ("(-"));                    // surround last operand with parenthesis and a negative symbol (front)
                            State.expression.push(")");                                 // (back)
                            updateScreen(State.expression.join(""));                    // update screen with the changes 
                            State.negativeFlag = true;                                  // set the negative flag to true (a number has been negated)
                            console.log(State.cache);
                        } else

                        if(State.expression.length && State.negativeFlag){              // --if there is an expression and the negative flag has been set
                            const pos = State.expression.length - ( State.cache.length + 1);    // calculate the offset position of the parenthesis for removal
                            State.cache.shift();                                        // remove negative symbol from the cache

                            State.expression.splice(pos, 1);                            // remove left bracket and neg from expression array
                            State.expression.pop();                                     // remove right bracket from expression array
                            updateScreen(State.expression.join(""));                    // update screen with changes
                            State.negativeFlag = false;                                 // set the negative flag to false

                            console.log("Expression: ", State.expression);
                            console.log("Cache: ", State.cache)
                        }
                        
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

                if(!State.cache.length){                         //make sure zero (0) is the default number on expressions
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

                    State.equated = true;
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