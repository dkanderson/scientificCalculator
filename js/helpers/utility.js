export function toggleActive(id, className = "active") {
  const btn = document.getElementById(id);
  btn.classList.toggle(className);
}
