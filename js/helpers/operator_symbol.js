export function operatorSymbol(operator){
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