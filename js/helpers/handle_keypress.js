// Handle Keyboard Events
 function handleKeyPress( evt ) {

    console.log(evt);

    let invalidKey = false,
        inputObject = {};


        switch (evt.key) {

          case "0":

            inputObject = { type: "number", number: "0"};
            break;

          case "1":

            inputObject = { type: "number", number: "1" };
            break;

          case "2":

            inputObject = { type: "number", number: "2"};
            break;

          case "3":

            inputObject = { type: "number", number: "3"};
            break;

          case "4":

            inputObject = { type: "number", number: "4"};
            break;

          case "5":

            inputObject = { type: "number", number: "5"};
            break;

          case "6":

            inputObject = { type: "number", number: "6"};
            break;

          case "7":

            inputObject = { type: "number", number: "7"};
            break;

          case "8":

            inputObject = { type: "number", number: "8"};
            break;

          case "9":

            inputObject = { type: "number", number: "9"};
            break;

          case "/":

            inputObject = { type: "operator", op: "divide"};
            break;

          case "*":

            inputObject = { type: "operator", op: "multiply"};
            break;

          case "+":

            inputObject = { type: "operator", op: "plus"};
            break;

          case "-":

            inputObject = { type: "operator", op: "subtract"};
            break;

          case "=":

            inputObject = { type: "operator", op: "equals"};
            break;
          
          case ".":

            inputObject = { type: "decimal", value: "."};
            break;

          case "Escape":

            inputObject = { type: "simple-function", func: "cancel"};
            break;

          case "%":

            inputObject = { type: "simple-function", func: "percentage"};
            break;

          default:

            invalidKey = true;

        }

  
    
    if ( !invalidKey) {

     return inputObject;

    }
    

  };

export default handleKeyPress;