document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const isDark = localStorage.getItem('theme') === 'dark';

  document.body.classList.toggle('dark-theme', isDark);

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.addEventListener('click', () => {
      console.log('Botão do tema clicado');

      const isDark = document.body.classList.toggle('dark-theme');
      themeToggle.setAttribute('aria-pressed', String(isDark));
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
});
