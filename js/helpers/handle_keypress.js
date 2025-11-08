// Handle Keyboard Events
 function handleKeyPress( evt ) {

    console.log(evt);

    let invalidKey = false,
        inputObject = {};

    
    if ( evt.keyCode === 61 || evt.keyCode === 13 ) {

      inputObject = { type: "operator", equals: true };

    } else if ( evt.keyCode >= 42 && evt.keyCode <= 47 ) { // fix
      
      switch ( evt.keyCode ) {

          case 42:

            inputObject = { type: "operator", multiply: true };
            break;

          case 43:

            inputObject = { type: "operator", plus: true };
            break;

          case 44:

            invalidKey = true;
            break;

          case 45:

            inputObject = { type: "operator", minus: true };
            break;

          case 46:

            inputObject = { type: "dot", dot: true };
            break;

          case 47:

            inputObject = { type: "operator", divide: true };
            break;

          default:

            invalidKey = true;
            break;
      }

    } else if ( evt.keyCode >= 48 && evt.keyCode <= 57 ) {
        
        inputObject = { type: "number", number: evt.key };

     } else if ( evt.keyCode === 37) {

        inputObject = { type: "sf", percentage: true };

     } else if ( evt.keyCode === 99 ) {

        inputObject = { type: "sf", ac: true };

     } else if ( evt.keyCode === 112 ) {

        inputObject = { type: "sf", pm: true };

     } else {

      invalidKey = true;

     }

    // Call eventManager
    if ( !invalidKey && evt.keyCode !== 16 ) {

     return inputObject;

    }
    

  };

export default handleKeyPress;