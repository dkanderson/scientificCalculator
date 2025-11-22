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

        case "one-over-x":
            handleOneoverx(State);
            break;

        case "square-root":
            handleSquareroot(State);
            break;
        
        case "cube-root":
            handleCuberoot(State);
            break;

        case "yx-root":
            handleYXroot(State);
            break;

        case "ln":
            handleLn(State);
            break;

        case "log-ten":
            handleLogten(State);
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
        
            State.openBracket += 1;                     // count the number of open brackets
            State.hasBrackets = true;                   // set flag true
            State.cache = [];                           // reset cache
            State.expression = [];                      // reset expression
            State.expression.push("(");                 // add open bracket
            updateScreen(State.expression.join(""));

        } else {

            State.openBracket += 1;                      // count the number of open brackets
            State.hasBrackets = true;

            if(!State.operatorOnce){
                
                State.operator.push("multiply");
                State.numCache.push(parseFloat(State.cache.join("")));      // update number cache with the last number
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

        State.openBracket -= 1;                             // reduce count of open brackets each time by 1
        State.expression.push(")");
        updateScreen(State.expression.join(""));

        if(State.hasRoot.status){
            if(State.yxroot){
                const yxrtButton = document.getElementById("yxrt");
                yxrtButton.classList.add("active");
                State.waitingForY = true;
            }
            State.operatorNext = true; 
            State.hasRoot.value = parseFloat(State.cache.join(""));
        }

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
    State.hasExp.push({ exp: 2, value: State.cache.join("") });
    updateScreen(State.expression.join(""));

}

function handleXcubed(State){

     if(!State.cache.length){
        State.expression.push("0");                                     // no entry? Default to zero
        State.cache.push("0");
    }

    State.expression.push("^(3)");                                      // update expression with exponential notation for x cubed
    State.operatorOnce = false;
    State.hasExp.push({ exp: 3, value: State.cache.join("") });         // update has exponential object to be handled 
    updateScreen(State.expression.join(""))
  
}

function handleXtty(State){

    if(State.xtty.length){
        return;                                                         // if the button is already active do nothing
    }

    const xttyBtn = document.getElementById("xtty");                    // get DOM element for xtty button
    xttyBtn.classList.add("active");                                    // set class to active (highlight)

    if(!State.cache.length){
        State.expression.push("0");                                     // no entry? Default to zero
        State.cache.push("0");
    }

    State.xtty.active = true;                                           // set object properties active true and
    State.xtty.value = State.cache.join("");                            // value is set to the value stored in cache joined as a string

    

}

function handleEttx(State){

    if(State.cache.length){

        State.hasExp.push({exp: parseFloat(State.cache.join("")), value: State.e}); // Set the exponential object
        // console.log("Expression: ", State.expression);
        // console.log("Cache: ", State.cache);
        let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
        State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
        State.expression.push("e^(" + State.cache.join("") + ")");                  // Put the number into exponential notation
        updateScreen(State.expression.join(""));
    } else {

        State.hasExp.push({exp: 0, value: State.e});                               // Set the exponential object default to zero if cache is empty
        
        let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
        State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
        State.expression.push("e^(0)");                                             // Put the number into exponential notation default to zero if cache is empty
        updateScreen(State.expression.join(""));

    }

    State.operatorNext = true;

}

function handleTenttx(State){

     if(State.cache.length){

        State.hasExp.push({exp: parseFloat(State.cache.join("")), value: 10}); // Set the exponential object
        // console.log("Expression: ", State.expression);
        // console.log("Cache: ", State.cache);
        let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
        State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
        State.expression.push("10^(" + State.cache.join("") + ")");                  // Put the number into exponential notation
        updateScreen(State.expression.join(""));
    } else {

        State.hasExp.push({exp: 0, value: 10});                               // Set the exponential object default to zero if cache is empty
        
        let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
        State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
        State.expression.push("10^(0)");                                             // Put the number into exponential notation default to zero if cache is empty
        updateScreen(State.expression.join(""));

    }

    State.operatorNext = true;

}

function handleOneoverx(State){

    if(!State.expression.length){

        State.expression.push("(1&divide;0)");
        updateScreen(State.expression.join(""));
        State.numCache.push(1);
        State.operator.push("divide");
        State.operatorNext = true;
        
    } else {

         let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
        State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
        State.expression.push("(1&divide;" + State.cache.join("") + ")");
        updateScreen(State.expression.join(""));
        State.numCache.push(1);
        State.operator.push("divide");
        State.operatorNext = true;

    }

}

function handleSquareroot(State){

    if(State.hasRoot.status){
        return;
    }

    State.hasRoot.status = true;
    State.hasRoot.root = 2;

    if(!State.cache.length){
        
        State.openBracket += 1;
        State.expression.push("&radic;(");
        updateScreen(State.expression.join(""));

    } else {
        console.log(State);
        State.operatorNext = true;
        if(!State.operatorOnce){

            State.hasRoot.value = parseFloat(State.cache.join(""));
            let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
            State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
            State.expression.push("&radic;(" + State.cache.join("") + ")");
            updateScreen(State.expression.join(""));

        } else {
            State.hasRoot.value = parseFloat(State.cache.join(""));
            State.openBracket += 1;
            State.expression.push("&radic;(");
            updateScreen(State.expression.join(""));
        }
        

    }

}

function handleCuberoot(State){

     if(State.hasRoot.status){
        return;
    }

    State.hasRoot.status = true;
    State.hasRoot.root = 3;

    if(!State.cache.length){
        
        State.openBracket += 1;
        State.expression.push("cbrt(");
        updateScreen(State.expression.join(""));

    } else {
        
        State.operatorNext = true;
        if(!State.operatorOnce){

            State.hasRoot.value = parseFloat(State.cache.join(""));
            let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
            State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
            State.expression.push("cbrt(" + State.cache.join("") + ")");
            updateScreen(State.expression.join(""));

        } else {
            State.hasRoot.value = parseFloat(State.cache.join(""));
            State.openBracket += 1;
            State.expression.push("cbrt(");
            updateScreen(State.expression.join(""));
        }
        

    }

}

function handleYXroot(State){

    if(State.yxroot){
        return;
    }

    State.yxroot = true;
    State.hasRoot.status = true;
    State.hasRoot.root = 2;

    if(!State.cache.length){
        
        State.openBracket += 1;
        State.expression.push("&radic;(");
        updateScreen(State.expression.join(""));

    } else {
        console.log(State);
        State.operatorNext = true;
        if(!State.operatorOnce){

            State.hasRoot.value = parseFloat(State.cache.join(""));
            let lastIndex = State.expression.length - State.cache.length;               // Get the start index of the number entered 
            State.expression.splice(lastIndex, State.cache.length);                     // Remove the entered number from the expressioin
            State.expression.push("&radic;(" + State.cache.join("") + ")");
            State.waitingForY = true;
            updateScreen(State.expression.join(""));

        } else {
            State.hasRoot.value = parseFloat(State.cache.join(""));
            State.openBracket += 1;
            State.expression.push("&radic;(");
            updateScreen(State.expression.join(""));
        }
        

    }



}

function handleLn(State){

}

function handleLogten(State){

}

export default handleSpecialFunction;