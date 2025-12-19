import { operatorSymbol } from "./operator_symbol.js";
import { compute, cleanExp } from "./calculate.js";
import { toggleActive } from "./utility.js";

function handleSpecialFunction(func, State, button) {
  switch (func) {
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

    case "factorial":
      handleFactorial(State);
      break;

    case "sine":
      handleSine(State);
      break;

    case "cosine":
      handleCosine(State);
      break;

    case "tangent":
      handleTangent(State);
      break;

    case "e":
      handlee(State);
      break;

    case "EE":
      handleEE(State);
      break;

    case "rad":
      handleRad(State);
      break;

    case "sine-h":
      handleSineH(State);
      break;

    case "cosine-h":
      handleCosineH(State);
      break;

    case "tangent-h":
      handleTangentH(State);
      break;

    case "pi":
      handlePi(State);
      break;

    case "random":
      handleRandom(State);
      break;

    default:
      console.error("Error: invalid function or feature not installed");
  }
}

function updateScreen(displayText, exp) {
  const display = document.getElementById("display-text");
  const expression = document.getElementById("expression");

  if (exp) {
    expression.innerHTML = displayText;
  } else {
    display.innerHTML = displayText;
  }
}

function handleBrackets(func, State) {
  if (func === "right-bracket" && State.openBracket === 0) {
    return;
  }

  if (func === "left-bracket") {
    if (
      (State.cache.length === 0 && State.expression.length === 0) ||
      (State.cache.length === 1 && State.cache[0] === "0")
    ) {
      State.openBracket += 1; // count the number of open brackets
      State.hasBrackets = true; // set flag true
      State.cache = []; // reset cache
      State.expression = []; // reset expression
      State.expression.push("("); // add open bracket
      updateScreen(State.expression.join(""));
    } else {
      State.openBracket += 1; // count the number of open brackets
      State.hasBrackets = true;

      if (!State.operatorOnce) {
        State.operator.push("multiply");

        State.cache = []; // clear cache
        State.expression.push(operatorSymbol("multiply") + "("); // convert operator to easily understood symbol and add it to the expression array
      } else {
        State.expression.push("(");
        updateScreen(State.expression.join(""));
      }

      updateScreen(State.expression.join("")); // update screen with multiply symbol
    }
  } else {
    if (State.openBracket === 0) {
      return;
    }

    State.openBracket -= 1; // reduce count of open brackets each time by 1
    State.expression.push(")");
    updateScreen(State.expression.join(""));

    if (State.yxroot) {
      const yxrtButton = document.getElementById("yxrt");
      yxrtButton.classList.add("active");
      State.waitingForY = true;
    }

    if (State.logy) {
      State.waitingForLogY = true;
    }

    State.operatorNext = true;
  }
}

function handleMemory(func, State) {
  const mrButton = document.getElementById("memory-recall");
  let calculatedValue = 0;

  switch (func) {
    case "memory-plus":
      if (!State.cache.length && State.memory === null) {
        State.memory = 0;
      }

      mrButton.classList.add("active");

      if (State.operator.length) {
        if (State.operatorOnce) {
          // console.log(State.expression);
          State.expression.pop();
          State.operatorOnce = false;
        }

        let validExp = cleanExp(State.expression.join("")); // replace HTML entities with valid operators

        calculatedValue = compute(validExp) + (State.memory || 0);
        State.memory = calculatedValue;
        State.cache = [];
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
      if (State.memory === null) {
        return;
      }

      mrButton.classList.add("active");

      if (State.operator.length) {
        if (State.operatorOnce) {
          // console.log(State.expression);
          State.expression.pop();
          State.operatorOnce = false;
        }

        let validExp = cleanExp(State.expression.join("")); // replace HTML entities with valid operators

        calculatedValue = (State.memory || 0) - eval(validExp);
        State.memory = calculatedValue;
        State.cache = [];
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
      if (State.memory === null) {
        return;
      }

      if ((!State.cache.length && !State.expression.length) || State.equated) {
        State.cache = [];
        State.expression = [];
        State.cache.push(State.memory.toString());
        State.expression.push(State.memory.toString());
        updateScreen(State.expression.join(""));
        updateScreen("", true);
      } else if (State.operatorOnce) {
        State.operatorOnce = false;
        State.cache = [];
        State.cache.push(State.memory.toString());
        State.expression.push(State.memory.toString());
        updateScreen(State.expression.join(""));
      } else {
        State.operator.push("multiply");
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
      console.error("Error: Not a memory function");
  }
}

function handleSecondToggle(button, State) {
  const buttons = document.getElementById("buttons");
  buttons.classList.toggle("second");
  button.classList.toggle("active");
  State.secondToggle = true;
  // console.log(buttons);
}

function handleXsquared(State) {
  if (!State.cache.length) {
    State.expression.push("0");
    State.cache.push("0");
  }

  State.expression.push("^(2)");
  State.operatorOnce = false;
  State.hasExp.push({ exp: 2, value: State.cache.join("") });
  updateScreen(State.expression.join(""));
}

function handleXcubed(State) {
  if (!State.cache.length) {
    State.expression.push("0"); // no entry? Default to zero
    State.cache.push("0");
  }

  State.expression.push("^(3)"); // update expression with exponential notation for x cubed
  State.operatorOnce = false;
  State.hasExp.push({ exp: 3, value: State.cache.join("") }); // update has exponential object to be handled
  updateScreen(State.expression.join(""));
}

function handleXtty(State) {
  if (State.xtty.active) {
    State.xtty.active = false;
    const xttyBtn = document.getElementById("xtty"); // get DOM element for xtty button
    xttyBtn.classList.remove("active"); // set class to active (highlight)
    return; // if the button is already active do nothing
  }

  const xttyBtn = document.getElementById("xtty"); // get DOM element for xtty button
  xttyBtn.classList.add("active"); // set class to active (highlight)

  if (!State.cache.length) {
    State.expression.push("0"); // no entry? Default to zero
    State.cache.push("0");
  }

  State.xtty.active = true; // set object properties active true and
}

function handleEttx(State) {
  if (!State.secondToggle) {
    if (State.cache.length) {
      State.hasExp.push({
        exp: parseFloat(State.cache.join("")),
        value: State.e,
      }); // Set the exponential object
      // console.log("Expression: ", State.expression);
      // console.log("Cache: ", State.cache);
      let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
      State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
      State.expression.push("e^(" + State.cache.join("") + ")"); // Put the number into exponential notation
      updateScreen(State.expression.join(""));
    } else {
      State.hasExp.push({ exp: 0, value: State.e }); // Set the exponential object default to zero if cache is empty

      let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
      State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
      State.expression.push("e^(0)"); // Put the number into exponential notation default to zero if cache is empty
      updateScreen(State.expression.join(""));
    }

    State.operatorNext = true;
  } else {
    if (State.specialFunction.active) return;

    const ettxBtn = document.getElementById("ettx");
    ettxBtn.classList.toggle("active");
    State.yx = !State.yx;

    if (State.yx) {
      if (State.cache.length === 0) {
        State.expression.push(...["^", "(", "0", ")"]);
        updateScreen(State.expression.join(""));
      } else {
        let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
        State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
        State.expression.push(...["^", "(", State.cache.join(""), ")"]);
        updateScreen(State.expression.join(""));
      }
      State.waitingForY = true;
    }
  }
}

function handleTenttx(State) {
  const val = State.secondToggle ? 2 : 10;

  if (State.cache.length) {
    State.hasExp.push({ exp: parseFloat(State.cache.join("")), value: val }); // Set the exponential object
    // console.log("Expression: ", State.expression);
    // console.log("Cache: ", State.cache);
    let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
    State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
    State.expression.push(...[val, "^", "(", State.cache.join(""), ")"]); // Put the number into exponential notation
    updateScreen(State.expression.join(""));
  } else {
    let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
    State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
    State.expression.push(...[val, "^", "(", "0", ")"]); // Put the number into exponential notation default to zero if cache is empty
    updateScreen(State.expression.join(""));
  }

  State.operatorNext = true;
}

function handleOneoverx(State) {
  if (!State.expression.length) {
    State.expression.push("(1&divide;0)");
    updateScreen(State.expression.join(""));
    State.operator.push("divide");
    State.operatorNext = true;
  } else {
    let lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
    State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
    State.expression.push("(1&divide;" + State.cache.join("") + ")");
    updateScreen(State.expression.join(""));
    State.operator.push("divide");
    State.operatorNext = true;
  }
}

// Reusable function to manage input for functional inputs

function wrapFunction(func, State) {
  console.log("/---------------------------------------------");
  console.log("Func: ", func);
  console.log("Current: ", State.specialFunction);

  let lastIndex = 0;
  State.expCache = [];

  if (State.expression.length === 0 || State.operatorOnce) {
    State.expression.push(func);
    State.expression.push("(");
    State.openBracket += 1;
    updateScreen(State.expression.join(""));
  } else if (State.expression.length && !State.specialFunction.active) {
    lastIndex = State.expression.length - State.cache.length; // Get the start index of the number entered
    State.expression.splice(lastIndex, State.cache.length); // Remove the entered number from the expressioin
    State.expression.push(func);
    State.expression.push("(");
    if (State.cache.length !== 0) {
      console.log(State);
      State.expression.push(...State.cache);
      State.expression.push(")");
      if (func === "root") {
        State.waitingForY = true;
        const yxrootBtn = document.getElementById("yxrt"); // get DOM element for xtty button
        yxrootBtn.classList.add("active");
      } else if (func === "log" && State.logy) {
        State.waitingForLogY = true;
      }
    } else {
      State.openBracket += 1;
    }

    updateScreen(State.expression.join(""));
  } else if (State.specialFunction.active) {
    lastIndex = State.specialFunction.index;
    let funcStart = [func, "("];
    State.expression.splice(lastIndex, 0, ...funcStart);
    State.openBracket += 1;
    updateScreen(State.expression.join(""));
  }

  State.specialFunction = {
    active: true,
    type: func,
    index: lastIndex,
  };
}

// End Wrap Funtion ----------------------------------------------------------------------

function handleSquareroot(State) {
  wrapFunction("&radic;", State);
}

function handleCuberoot(State) {
  wrapFunction("cbrt", State);
}

function handleYXroot(State) {
  if (State.yxroot) {
    return;
  }

  State.yxroot = true;
  wrapFunction("root", State);
}

function handleLn(State) {
  if (!State.secondToggle) {
    wrapFunction("ln", State);
  } else {
    State.logy = true;
    wrapFunction("log", State);
  }
}

function handleLogten(State) {
  if (!State.secondToggle) {
    wrapFunction("log", State);
  } else {
    // log2
    wrapFunction("logII", State);
  }
}

function handleFactorial(State) {
  let lastIndex = 0 || State.specialFunction.index;

  if (!State.specialFunction.index && State.expression.length - 1 > 0) {
    lastIndex = State.expression.length - 1;
  }

  if (!State.expression.length || State.operatorOnce) {
    State.expression.push(...["0", "!"]);
  } else {
    if (!State.specialFunction.active) {
      State.expression.push("!");
    } else {
      State.expression.splice(State.specialFunction.index, 0, "(");
      State.expression.push(...[")", "!"]);
    }
  }

  State.specialFunction = {
    active: true,
    type: "factorial",
    index: lastIndex,
  };

  updateScreen(State.expression.join(""));
}

function handleSine(State) {
  if (!State.secondToggle) {
    wrapFunction("sin", State);
  } else {
    wrapFunction("asin", State);
  }
}

function handleCosine(State) {
  if (!State.secondToggle) {
    wrapFunction("cos", State);
  } else {
    wrapFunction("acos", State);
  }
}

function handleTangent(State) {
  if (!State.secondToggle) {
    wrapFunction("tan", State);
  } else {
    wrapFunction("atan", State);
  }
}

function handlee(State) {
  const op = operatorSymbol("multiply");

  if (!State.expression.length) {
    State.expression.push("e");
  } else {
    if (State.operatorNext || State.cache.length) {
      State.expression.push(...[op, "e"]);
    } else {
      State.expression.push("e");
    }
  }

  State.cache.push("e");
  State.operatorOnce = false;
  State.operatorNext = true;
  updateScreen(State.expression.join(""));
}

function handleEE(State) {
  State.EE = true;
  State.operatorOnce = true;

  if (State.expression.length === 0 || State.expression.operatorOnce) {
    State.expression.push(...["0", "EE"]);
  } else {
    State.expression.push("EE");
  }
  updateScreen(State.expression.join(""));
}

function handleRad(State) {
  toggleActive("rad", "radians");
  toggleActive("rad-toggle");

  if (State.mode === "DEG") {
    State.mode = "RAD";
  } else {
    State.mode = "DEG";
  }
}

function handleSineH(State) {
  if (!State.secondToggle) {
    wrapFunction("sinh", State);
  } else {
    wrapFunction("asinh", State);
  }
}

function handleCosineH(State) {
  if (!State.secondToggle) {
    wrapFunction("cosh", State);
  } else {
    wrapFunction("acosh", State);
  }
}

function handleTangentH(State) {
  if (!State.secondToggle) {
    wrapFunction("tanh", State);
  } else {
    wrapFunction("atanh", State);
  }
}

function handlePi(State) {
  let pi = "&pi;";

  const op = operatorSymbol("multiply");

  if (!State.expression.length) {
    State.expression.push(pi);
  } else {
    if (State.operatorNext || State.cache.length) {
      State.expression.push(...[op, pi]);
    } else {
      State.expression.push(pi);
    }
  }

  State.cache.push(pi);
  State.operatorOnce = false;
  State.operatorNext = true;
  updateScreen(State.expression.join(""));
}

function handleRandom(State) {
  const rand = Math.random();

  const op = operatorSymbol("multiply");

  if (!State.expression.length) {
    State.expression.push(rand);
  } else {
    if (State.operatorNext || State.cache.length) {
      State.expression.push(...[op, rand]);
    } else {
      State.expression.push(rand);
    }
  }
  State.cache.push(rand);
  State.operatorOnce = false;
  State.operatorNext = true;
  updateScreen(State.expression.join(""));
}

export default handleSpecialFunction;
