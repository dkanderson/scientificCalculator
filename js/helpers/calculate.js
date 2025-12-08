import { tokenize, toRPN, evaluateRPN } from "./expression_eval.js";

export function computeBinary(a, b, opKey) {
  const aN = Number(a);
  const bN = Number(b);

  switch (opKey) {
    case "divide":
      return aN / bN;
    case "multiply":
      return aN * bN;
    case "subtract":
      return aN - bN;
    case "plus":
      return aN + bN;
    case "%":
      return aN % bN;
    default:
      throw new Error("Unknown operator: " + opKey);
  }
}

export function calculate(numbers, operators) {
  // Defensive copies
  const nums = numbers.map((n) => Number(n));
  const ops = operators.slice(); // might be shorter or longer

  if (nums.length === 0) return 0;

  // If operators length is >= numbers length, drop trailing operators (they are likely 'equals' or leftover)
  while (ops.length >= nums.length) {
    ops.pop();
  }

  // Two-pass evaluation: first handle * and /, producing new arrays
  const nums2 = [];
  const ops2 = [];
  nums2.push(nums[0]);

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const nextNum = nums[i + 1] !== undefined ? nums[i + 1] : 0;

    if (op === "multiply" || op === "divide") {
      // apply immediately to last number in nums2
      const last = nums2.pop();
      const computed = computeBinary(last, nextNum, op);
      nums2.push(computed);
    } else {
      // push operator and next number to the second arrays
      ops2.push(op);
      nums2.push(nextNum);
    }
  }

  // Second pass: handle + and -
  let result = nums2[0];
  for (let i = 0; i < ops2.length; i++) {
    result = computeBinary(result, nums2[i + 1], ops2[i]);
  }

  return result;
}

export function compute(expression) {
  const tokens = tokenize(expression);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn);
}

export function cleanExp(exp) {
  // Replace visual operators with valid operators
  let validExp = exp
    .replaceAll("&times;", "*")
    .replaceAll("&divide;", "/")
    .replaceAll("&#43;", "+")
    .replaceAll("&minus;", "-")
    .replaceAll("&radic;", "sqrt");

  return validExp;
}
