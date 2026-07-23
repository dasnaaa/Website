// Mobile nav toggle
const burger = document.getElementById('burger');
const links = document.querySelector('.nav__links');
if (burger && links) {
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Cursor blob (desktop only)
const blob = document.querySelector('.cursor-blob');
if (blob && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const colors = ['#FF2E93', '#0057FF', '#05C793', '#FFD23F', '#FF6B35'];
  let colorIndex = 0;
  window.addEventListener('pointermove', (e) => {
    blob.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  window.addEventListener('pointerdown', () => {
    colorIndex = (colorIndex + 1) % colors.length;
    blob.style.background = colors[colorIndex];
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
