// Generate tokens

export function tokenize(input) {
  const tokens = [];
  let i = 0;

  function isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }

  function isLetter(ch) {
    return /[a-zA-Z]/.test(ch);
  }

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // ----- NUMBER (with decimals + exponent notation)
    if (isDigit(ch) || ch === ".") {
      let numStr = "";
      let hasDot = false;

      // integer or decimal
      while (isDigit(input[i]) || (!hasDot && input[i] === ".")) {
        if (input[i] === ".") hasDot = true;
        numStr += input[i++];
      }

      // exponent notation: 1e3, 2.1e-4
      if (input[i] && (input[i] === "e" || input[i] === "E")) {
        numStr += input[i++];
        if (input[i] === "+" || input[i] === "-") {
          numStr += input[i++];
        }
        while (isDigit(input[i])) {
          numStr += input[i++];
        }
      }

      tokens.push({ type: "number", value: parseFloat(numStr) });
      continue;
    }

    // ----- IDENTIFIER (functions, constants)
    if (isLetter(ch)) {
      let id = "";
      while (isLetter(input[i])) {
        id += input[i++];
      }

      // classify
      if (
        ["cbrt", "sqrt", "sin", "cos", "tan", "log", "ln", "exp"].includes(id)
      ) {
        tokens.push({ type: "function", value: id });
      } else if (["pi", "e"].includes(id)) {
        tokens.push({ type: "constant", value: id });
      } else if (id === "root") {
        //treat root like a binary operator
        tokens.push({ type: "operator", value: "root" });
      } else {
        throw new Error("Unknown identifier: " + id);
      }

      continue;
    }

    // ----- PARENTHESES
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }

    // ----- OPERATORS
    if ("+-*/%^".includes(ch)) {
      // unary minus detection:
      const prev = tokens[tokens.length - 1];
      const isUnary =
        ch === "-" && (!prev || prev.type === "operator" || prev.value === "(");

      if (isUnary) {
        tokens.push({ type: "operator", value: "unary-" });
      } else {
        tokens.push({ type: "operator", value: ch });
      }

      i++;
      continue;
    }

    throw new Error("Unexpected character: " + ch);
  }

  return tokens;
}

// Parse Tokens

export function toRPN(tokens) {
  const output = [];
  const stack = [];

  const PRECEDENCE = {
    "unary-": 6,
    "^": 5,
    root: 5,
    "*": 4,
    "/": 4,
    "%": 4,
    "+": 3,
    "-": 3,
  };

  const RIGHT_ASSOC = {
    "^": true,
    "unary-": true,
    root: true,
  };

  for (const token of tokens) {
    // ----- NUMBERS
    if (token.type === "number") {
      output.push(token);
      continue;
    }

    // ----- CONSTANTS
    if (token.type === "constant") {
      output.push(token);
      continue;
    }

    // ----- FUNCTIONS
    if (token.type === "function") {
      stack.push(token);
      continue;
    }

    // ----- OPERATORS (binary + unary)
    if (token.type === "operator") {
      const o1 = token.value;

      while (true) {
        const top = stack[stack.length - 1];
        if (!top || top.type !== "operator") break;

        const o2 = top.value;
        const p1 = PRECEDENCE[o1];
        const p2 = PRECEDENCE[o2];

        if ((RIGHT_ASSOC[o1] && p1 < p2) || (!RIGHT_ASSOC[o1] && p1 <= p2)) {
          output.push(stack.pop());
        } else break;
      }

      stack.push(token);
      continue;
    }

    // ----- LEFT PAREN
    if (token.type === "paren" && token.value === "(") {
      stack.push(token);
      continue;
    }

    // ----- RIGHT PAREN
    if (token.type === "paren" && token.value === ")") {
      // pop until "("
      while (stack.length && stack[stack.length - 1].value !== "(") {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error("Mismatched Parenthesis");
      stack.pop(); // discard "("

      // if function on top → output it
      const top = stack[stack.length - 1];
      if (top && top.type === "function") {
        output.push(stack.pop());
      }

      continue;
    }

    throw new Error("Unknown token in parser: " + JSON.stringify(token));
  }

  // Pop remaining stack
  while (stack.length) {
    const top = stack.pop();
    if (top.type === "paren") {
      throw new Error("Mismatched parentheses");
    }
    output.push(top);
  }

  return output;
}

// Evaluate RPN

export function evaluateRPN(rpn) {
  const stack = [];

  const CONSTANTS = {
    pi: Math.PI,
    e: Math.E,
  };

  const FUNCTIONS = {
    sqrt: (x) => Math.sqrt(x),
    cbrt: (x) => Math.cbrt(x),
    sin: (x) => Math.sin(x),
    cos: (x) => Math.cos(x),
    tan: (x) => Math.tan(x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    exp: (x) => Math.exp(x),
  };

  const OPERATORS = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "%": (a, b) => a % b,
    "^": (a, b) => Math.pow(a, b),
    root: (a, b) => Math.pow(b, 1 / a),
    "unary-": (a) => -a,
  };

  for (const token of rpn) {
    // ----- NUMBER
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }

    // ----- CONSTANT
    if (token.type === "constant") {
      stack.push(CONSTANTS[token.value]);
      continue;
    }

    // ----- FUNCTION
    if (token.type === "function") {
      const a = stack.pop();
      if (a === undefined) {
        throw new Error("Missing argument for function " + token.value);
      }
      stack.push(FUNCTIONS[token.value](a));
      continue;
    }

    // ----- OPERATOR
    if (token.type === "operator") {
      const op = token.value;

      // Unary operator (1 argument)
      if (op === "unary-") {
        const a = stack.pop();
        if (a === undefined) throw new Error("Missing operand for unary -");
        stack.push(OPERATORS["unary-"](a));
        continue;
      }

      // Binary operator (2 arguments)
      const b = stack.pop();
      const a = stack.pop();

      // If left operand is missing but we have b
      // treat percent as unary postfix: b5 -> b / 100
      if ((a === undefined || a === null) && b !== undefined) {
        if (op === "%") {
          stack.push(b / 100);
          continue;
        } else {
          throw new Error("Missing operands for operator " + op);
        }
      }

      if (a === undefined && b === undefined) {
        throw new Error(
          "Missing operands for operators: a few numbers wouldn't hurt - " + op
        );
      }

      const opertorFn = OPERATORS[op];
      if (!opertorFn) {
        throw new Error("Unknown operator");
      }

      stack.push(opertorFn(a, b));
      continue;
    }

    throw new Error("Unknown RPN token: " + JSON.stringify(token));
  }

  if (stack.length !== 1) {
    throw new Error("Invalid RPN expression. Remaining stack: " + stack);
  }

  return stack[0];
}

export function normalizePercent(expr) {
  let input = expr;

  // exp
  input = input.replace(
    /(\d+[^]+)\s*\(([^()]+)\)\s*%/g,
    (_, fn, inner) => `( ${fn}(${inner}) / 100)`
  );

  // ============================================================
  // 1. Percent applied to a FUNCTION CALL:
  //    sin(30)% → (sin(30) / 100)
  //    asin(0.5)% → (asin(0.5) / 100)
  //
  //    FUNCTION_NAME ( ANYTHING INSIDE PARENS ) %
  //
  //    Function name: any letters (asin, acos, log, ln, sin, sqrt, exp...)
  // ============================================================
  input = input.replace(
    /([a-zA-Z]+)\s*\(([^()]+)\)\s*%/g,
    (_, fn, inner) => `( ${fn}(${inner}) / 100)`
  );

  // ============================================================
  // 2. Percent applied to a PARENTHESIZED expression:  (X)% → (X)/100
  // ============================================================
  input = input.replace(
    /\(([^()]+)\)\s*%/g,
    (_, inner) => `((${inner}) / 100)`
  );

  // ============================================================
  // 3. Standalone number%  →  number/100
  //    but only when NOT part of A op B%
  // ============================================================
  input = input.replace(
    /(?<![\d.])(\d+(\.\d+)?)%(?!\s*[+\-*/])/g,
    (_, a) => `(${a} / 100)`
  );

  // ============================================================
  // 4. Classic right-hand percentage (same as real calculators)
  //    A op B%
  // ============================================================
  input = input.replace(
    /(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)%/g,
    (_, a, __, op, b) => {
      switch (op) {
        case "+":
          return `(${a} + (${a} * ${b} / 100))`;
        case "-":
          return `(${a} - (${a} * ${b} / 100))`;
        case "*":
          return `(${a} * (${b} / 100))`;
        case "/":
          return `(${a} / (${b} / 100))`;
      }
    }
  );

  // ============================================================
  // 5. Left-hand percentage
  //    A% op B
  // ============================================================
  input = input.replace(
    /(\d+(\.\d+)?)%\s*([+\-*/])\s*(\d+(\.\d+)?)/g,
    (_, a, __, op, b) => `((${a} / 100) ${op} ${b})`
  );

  console.log(input);

  return input;
}
