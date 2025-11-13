function handleSpecialFunction(func, State, button){
    console.log(func, State, button);

    switch(func){

        case "left-bracket":
            handleBrackets(func, State);
            break;
        
        case "right-bracket":
            handleBrackets(func, State);
            break;

        case "memory-cancel":
            handleMemory(func, State);
            break;

        case "memory-plus":
            handleMemory(func, State);
            break;

        case "memory-minus":
            handleMemory(func, State);
            break;

        case "memory-recall":
            handleMemory(func, State);
            break;

        case "second-toggle":
            handleSecondToggle(button, State);
            break;

        case "x-squared":
            handleXsquared(State);
            break;

        case "x-cubed":
            handleXcubed(State);
            break;

        case "x-to-the-y":
            handleXtty(State);
            break;

        case "e-to-the-x":
            handleEttx(State);
            break;

        case "ten-to-the-x":
            handleTenttx(State);
            break;

        default:
            console.error("Error: invalid function or feature not installed");
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



function handleBrackets(func, State){

    if(func === "right-bracket" && State.openBracket === 0){
        return;
    }

    if(func === "left-bracket"){

        if(State.cache.length === 0 && State.expression.length === 0 || ( State.cache.length === 1 && State.cache[0] === '0' )){
        
            State.openBracket += 1;
            State.hasBrackets = true;
            State.cache = [];
            State.expression = [];
            State.expression.push("(");
            updateScreen(State.expression.join(""));

        } else {

            State.openBracket += 1;
            State.hasBrackets = true;

            if(!State.operatorOnce){
                
                State.operator.push("multiply");
                State.numCache.push(parseFloat(State.cache.join("")));      // update number cache with the last negated number
                State.cache = [];                               // clear cache
                State.expression.push(operatorSymbol("multiply") + "(");          // convert operator to easily understood symbol and add it to the expression array
           
            } else {

                State.expression.push("(");
                updateScreen(State.expression.join(""));

            }
            
            updateScreen(State.expression.join(""));        // update screen with multiply symbol
            
        }

    } else {

        if(State.openBracket === 0){
            return;
        }

        State.openBracket -= 1;
        State.expression.push(")");
        updateScreen(State.expression.join(""));

    }

    
}

function handleMemory(func, State){

    const mrButton = document.getElementById("memory-recall");
    let calculatedValue = 0;

    switch(func){

        case "memory-plus":

            if(!State.cache.length && State.memory === null){
                State.memory = 0;
            } 

            mrButton.classList.add("active");

            if(State.operator.length){

                 if(State.operatorOnce){
                    // console.log(State.expression);
                    State.expression.pop();
                    State.operatorOnce = false;
                }


                let validExp = State.expression.join("")
                                    .replaceAll("&times;", "*")
                                    .replaceAll("&divide;", "/")
                                    .replaceAll("&#43;", "+")
                                    .replaceAll("&minus;", "-"); console.log(validExp);
                
                calculatedValue = eval(validExp) + ( State.memory || 0 );
                State.memory = calculatedValue;
                State.cache = [];
                State.numCache = [];
                State.expression = [];
                State.operator = [];
                State.expression.push(calculatedValue.toString());
                State.cache.push(calculatedValue.toString());
                updateScreen(State.cache.join(""));
             

            } else { 

                State.memory += parseFloat(State.cache.join(""));
                State.cache = [];
                State.expression = [];
                

            }

            break;

        case "memory-minus":

            if( State.memory === null ){
                return;
            }

            mrButton.classList.add("active");

             if(State.operator.length){

                 if(State.operatorOnce){
                    // console.log(State.expression);
                    State.expression.pop();
                    State.operatorOnce = false;
                }


                let validExp = State.expression.join("")
                                    .replaceAll("&times;", "*")
                                    .replaceAll("&divide;", "/")
                                    .replaceAll("&#43;", "+")
                                    .replaceAll("&minus;", "-"); console.log(validExp);
                
                calculatedValue = ( State.memory || 0 ) - eval(validExp);
                State.memory = calculatedValue;
                State.cache = [];
                State.numCache = [];
                State.expression = [];
                State.operator = [];
                State.expression.push(calculatedValue.toString());
                State.cache.push(calculatedValue.toString());
                updateScreen(State.cache.join(""));
                 

            } else { 

                State.memory -= parseFloat(State.cache.join(""));
                State.cache = [];
                State.expression = [];
                

            }

            break;

        case "memory-recall":
            
            if( State.memory === null ){
                return;
            }

            if( ( !State.cache.length && !State.expression.length ) || State.equated){

                State.cache = [];
                State.expression = [];
                State.cache.push(State.memory.toString());
                State.expression.push(State.memory.toString());
                updateScreen(State.expression.join(""));
                updateScreen("", true);
            } else

            if(State.operatorOnce){

                State.operatorOnce = false;
                State.cache = [];
                State.cache.push(State.memory.toString());
                State.expression.push(State.memory.toString());
                updateScreen(State.expression.join(""));
            } else {

                State.operator.push("multiply");
                State.numCache.push(parseFloat(State.cache.join("")));
                State.expression.push(operatorSymbol("multiply"));
                State.cache = [];
                State.cache.push(State.memory.toString());
                State.expression.push(State.memory.toString());
                updateScreen(State.expression.join(""));

            }
            console.log("State memory: ", State.memory);
            break;

        case "memory-cancel":
            State.memory = null;
            mrButton.classList.remove("active");
            break;

        default:
            console.error("Error: Not a memory function")
    }
}

function handleSecondToggle(button, State){
    const buttons = document.getElementById("buttons");
    buttons.classList.toggle("second")
    button.classList.toggle("active");
    State.secondToggle = true;
    // console.log(buttons);
}

function handleXsquared(State){

    if(!State.cache.length){
        State.expression.push("0");
        State.cache.push("0");
    }

    State.expression.push("^(2)");
    State.operatorOnce = false;
    State.hasExp.push({ exp: 3, value: State.cache.join("") });
    updateScreen(State.expression.join(""))
    // console.log(State.expression)

}

function handleXcubed(State){

}

function handleXtty(State){

}

function handleEttx(State){

}

function handleTenttx(State){

}

export default handleSpecialFunction;