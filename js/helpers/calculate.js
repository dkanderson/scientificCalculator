function calculate(numbers, operators){

    const expMap = numbers.map((number, i) => {
                        if(operators[i] === "equals"){
                            return number
                        }
                    return number + operatorSymbol(operators[i])
                    });

    return eval(expMap.join(""));
}

function operatorSymbol(operator){
        switch(operator){
            case "divide":
                return "/";
            case "multiply":
                return "*"
            case "subtract":
                return "-";
            case "plus":
                return "+"
            default:
                return;
        }
    }

function calc(num1, num2, operator){
    let result = 0;

    switch(operator){
        case "divide":
           result = num1 / num2;
           break;
        case "multiply":
            result = num1 * num2;
            break;
        case "subtract":
            result = num1 - num2;
            break;
        case "plus": 
            result = num1 + num2;
            break;
        default:
            result = 1;
            break;
    }

    return result;
}

export default calculate;