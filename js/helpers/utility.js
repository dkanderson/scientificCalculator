export function toggleActive(id, className = "active") {
  const btn = document.getElementById(id);
  btn.classList.toggle(className);
}

export function subExprLength(exp) {
  let i = exp.length,
    sub = 0,
    last = "";

  if (exp.length === 0) return 0;

  while (i > 0) {
    const token = exp[i];
    sub++;

    if (["&divide;", "&times;", "&minus;", "&#43;", "%"].includes(token)) {
      last = token;
      break;
    }
    i--;
  }

  return {
    index: i,
    last: last,
    subCount: sub,
  };
}
