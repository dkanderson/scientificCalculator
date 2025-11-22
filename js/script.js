import calculate from "./helpers/calculate.js";
import handleSpecialFunction from "./helpers/handleSpecial.js";
import handleKeyPress from "./helpers/handle_keypress.js";

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
        decimalFlag: false,
        operatorOnce: false,
        negativeFlag: false,
        equated: false,
        percentage: false,
        openBracket: 0,
        hasBrackets: false,
        memory: null,
        hasExp: [],
        operatorNext: false,
        xtty: {active: false, exp: [], value: null},
        e: Math.E,
        hasRoot: {status: false, root: null, value: null},
        yxroot: false,
        waitingForY: false,
        expCache: []
    }


    simpleToggle.addEventListener("click", function(){              // toggle simple/scientific calculator
        calculator.classList.toggle("simple");
    });

    buttons.forEach((button) => {                                   // handle mouse click on buttons
        button.addEventListener("click", function(){
            handleClick(button.getAttribute("class"), this);
            console.log(button.getAttribute("class"))
        })
    });

    window.addEventListener("keydown", handleKeyPressEvent);

    function handleClick(className, button){

        switch(true){
            case className === "number":
                const num = button.getAttribute("data-number");     // get the number associated with the button from the data attribute
                handleNumber(num);
                break;

            case className === "simple-function":
                const sfunc = button.getAttribute("data-function");
                
                handleSimpleFunction(sfunc);
                break;

            case className.includes("special-function"):
                const func = button.getAttribute("data-function");

                handleSpecialFunction(func, State, button);
                break;

            case className === "basic-operator":
                const op =  button.getAttribute("data-operator");   //get the operator type from the data attribute of the button

                handleOperator(op);
                break;

            case className === "decimal":
                
                handleDecimal();
                break;

            default:
                console.log("what the hell did you click");
                return;
        }
    }

    function handleKeyPressEvent(event){

        const keyObj = handleKeyPress(event);
        
        if(keyObj){

            switch(keyObj.type){

                case "number":
                    
                    handleNumber(keyObj.number);
                    break;
                
                case "operator":
                    
                    handleOperator(keyObj.op);
                    break;

                case "simple-function":

                    handleSimpleFunction(keyObj.func);
                    break;

                case "decimal":

                    handleDecimal();
                    break;

                default:

                    console.error("Error: Invalid Key");
            }
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

    function handlePercentage(){

        let index = State.operator.indexOf("%");
        let num = State.numCache[index];

        num = num / 100;
        State.numCache.splice(index,1,num);
        State.operator.splice(index,1);
    
    }

    function handleSimpleFunction(sfunc){
        switch(sfunc){
            case "cancel":
                // Reset all values when then AC button is pressed
                State.cache = [];
                State.numCache = [];
                State.expression = [];
                State.operator = [];
                State.inputStop = false;
                State.decimalFlag = false;
                State.negativeFlag = false;
                State.operatorOnce = false;
                State.equated = false;
                State.percentage = false;
                State.openBracket = 0;
                State.hasBrackets = false;
                State.hasExp = [];
                State.xtty = { active: false, exp: [], value: null};
                State.operatorNext = false;
                State.hasRoot = {status: false, root: null, value: null};
                State.yxroot = false;
                State.waitingForY = false;
                updateScreen("0");
                updateScreen("", true);
                const yxrtButton = document.getElementById("yxrt");
                yxrtButton.classList.remove("active");
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
                State.percentage = true;
                
                if(!State.cache.length){                         //make sure zero (0) is the default number on expressions
                    State.cache.push("0");
                    State.expression.push("0");
                    State.numCache.push(parseFloat(State.cache.join("")));
                }

                State.numCache.push(parseFloat(State.cache.join(""))); // store the last number entered into an array
                State.cache = [];                                   // reset the cache
                State.operator.push("%");
                State.expression.push("%");
                updateScreen(State.expression.join(""));
                

                console.log(State.numCache);
                break;
            default:
                console.error("Unknown function request");
        }
    }

    function handleNumber(num){
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

            if(State.negativeFlag || State.operatorNext){

                if(State.hasRoot.status && !State.waitingForY){
                    handleRoot();
                } else {
                    
                    State.expCache.push(num);
                    if(State.expCache.length > 1){
                        State.expression.splice(0, State.expCache.length - 1)
                    }
                    State.expression.unshift(State.expCache.join(""));

                    State.hasRoot.root = parseFloat(State.expCache.join(""));
                    updateScreen(State.expression.join(""));
                    return;
                }

                State.operatorNext = false;
                State.negativeFlag = false;                     // set negative flag to false ( next number has not been negated)
                State.operator.push("multiply");                // add a "multiply" operator to the operators array
                State.numCache.push(parseFloat(State.cache.join("")));      // update number cache with the last negated number
                State.cache = [];                               // clear cache
                State.expression.push(operatorSymbol("multiply"));          // convert operator to easily understood symbol and add it to the expression array
                updateScreen(State.expression.join(""));        // update screen with multiply symbol
                
            }

            if(State.xtty.active){
                console.log(State.xtty);

                if(!State.xtty.exp.length){
                    State.xtty.exp.push(num);                                       // store number in the xtty object
                    State.expression.push("^(" + State.xtty.exp.join("") + ")");    // wrap the number in the exponential notation
                   // State.hasExp.push({exp: parseFloat(State.xtty.exp.join("")), value: State.xtty.value}); // pass the values to the has Exponential objected to be calculated by handler function
                    updateScreen(State.expression.join(""));
                } else {
                    State.xtty.exp.push(num);
                    // console.log(State.expression);
                    State.expression.pop();                                         // remove last item from expression (exp notation)            
                    State.expression.push("^(" + State.xtty.exp.join("") + ")");    // replace with multiple digits
                    //State.hasExp.push({exp: parseFloat(State.xtty.exp.join("")), value: State.xtty.value}); // pass values to hasExp object
                    updateScreen(State.expression.join(""));
                }
                
                return;
            }

            if(State.cache.length === 1 && State.cache[0] === '0'){     // no leading zeroes
                State.cache = [];
                State.expression = [];
            }

            
            State.percentage = false;
            State.operatorOnce = false;                         // reset operator once flag ( makes sure there are no duplicate operators)
            State.cache.push(num);                              // store each number into an array
            State.expression.push(num);                         // store each number into the expression array
            updateScreen(State.expression.join(""));            // update the screen with the full expression
    }

    function handleOperator(op){
        if(State.operatorOnce){                             //ensure operator is only pressed once
            return;
        } 

        if(!State.cache.length === 0 && State.expression.length === 0 && !State.percentage && !State.hasExp.length === 0){                         //make sure zero (0) is the default number on expressions
            State.cache.push("0");
            State.expression.push("0");
        }

        if(State.percentage){
            handlePercentage();
            
        }

        if(State.xtty.active){

            const xttyBtn = document.getElementById("xtty");                    // get DOM element for xtty button
            xttyBtn.classList.remove("active");  

            // push the completed exponent object if there is one
            if(State.xtty.exp.length){
                State.hasExp.push({ exp: parseFloat(State.xtty.exp.join("")), value: State.xtty.value });
            }
            State.xtty = {active: false, exp: [], value: null}
            
        }

        if(State.hasRoot.status){
           
            if(State.openBracket > 0){
                
                State.openBracket -= 1;                             // reduce count of open brackets each time by 1
                State.expression.push(")");                         // Close bracket automatically if operator is used
                updateScreen(State.expression.join(""));
            
            }

            if(State.hasRoot.value === null){
                State.hasRoot.value = parseFloat(State.cache.join(""));
            }

            handleRoot();
        }

        if(State.hasExp.length){
            handleExponent();
        }

        if(State.xtty.active){
            
            const xttyBtn = document.getElementById("xtty");
            xttyBtn.classList.remove("active");

            State.xtty = {active: false, exp: [], value: null}
        }

        State.negativeFlag = false;
        State.operatorOnce = true;                          //set operator once flag to true (operator button has been pressed once and no numbers have been entered)
        State.equated = false;
       
        if(State.cache.length){
        State.numCache.push(parseFloat(State.cache.join(""))); // store the last number entered into an array
        }
        State.cache = [];                                   // reset the cache
        State.decimalFlag = false;                         // set the decimal flag to false (decimals only once)
        State.operator.push( op );                          // store the operator in an array
        State.expression.push(operatorSymbol(op));          // convert operator to easily understood symbol and add it to the expression array
        updateScreen(State.expression.join(""));            // update the screen with what is in the expression array

        if(State.operator[State.operator.length -1] === "equals"){  // if the operator is the equals button
            
            let result = 0; 
            
            if(State.hasBrackets){

                // console.log(State.openBracket);
                if(State.openBracket > 0){
                    let brackets = ")".repeat(State.openBracket);       // close all brackets
                    State.expression.push(brackets);
                    State.openBracket = 0;
                    updateScreen(State.expression.join(""));
                }

                let validExp = State.expression.join("")                // Replace visual operators with valid operators
                                .replaceAll("&times;", "*")
                                .replaceAll("&divide;", "/")
                                .replaceAll("&#43;", "+")
                                .replaceAll("&minus;", "-"); console.log(validExp);

                result = eval(validExp);
                State.hasBrackets = false;

            } else {

                result = calculate(State.numCache, State.operator); // calculate result based on simple mathematical operator precedence

            }
            
            
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
    }

    function handleDecimal(){
        if(State.decimalFlag === true){                    // make sure decimal only appears once
            return;
        }
        State.decimalFlag = true;                          // set the decimal flag once the button in pressed
        
        if(!State.cache.length){
            State.cache.push("0.");
            State.expression.push("0.");
        } else {
            State.cache.push('.');
            State.expression.push('.');                              // add the decimal to the number cache
        }
        updateScreen(State.expression.join(""));                 // update the screen with the contents of the cahce 
    }

    function handleExponent(){

    // console.log("show exp: ", State.hasExp);
       
        
        State.hasExp.forEach((exp) => {
            let total = Math.pow(parseFloat(exp.value), exp.exp);

            State.cache = [];
            State.cache.push(total.toString());
            // console.log(State.hasExp, State.cache)
           
        })

        State.hasExp = [];
    }

    function handleRoot(){
        let val = 0;

        if(State.hasRoot.root === 2){

            val = Math.sqrt(State.hasRoot.value);
            State.cache = [];
            State.cache.push(val);
            State.hasRoot.status = false;

        }

        if(State.hasRoot.root === 3){

            val = Math.cbrt(State.hasRoot.value);
            State.cache = [];
            State.cache.push(val);
            State.hasRoot.status = false;

        }

        if(State.hasRoot.root > 3 || State.hasRoot.root < 2){

            val = Math.pow(State.hasRoot.value, (1/State.hasRoot.root));
            State.cache = [];
            State.cache.push(val);
            State.hasRoot.status = false;

        }
    }

    // const proxyHandler = {
    //     set: function(obj, prop, value){
    //         console.log(`The property ${prop} has changed from ${obj[prop]} to ${value}`);

    //         obj[prop] = value;
    //     }
    // }

    const observableState = new Proxy(State, proxyHandler);

    // observableState.deceimalFlag = true;

})();