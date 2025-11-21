(() => {
  const root = document.documentElement;
  const THEME_KEY = 'techmatch-theme';
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
  const storedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = storedTheme || (prefersLight.matches ? 'light' : 'dark');

  let themeToggle;

  const updateToggleState = (theme) => {
    const toggle = themeToggle || document.querySelector('[data-theme-toggle]');
    if (!toggle) {
      return;
    }

    const isLight = theme === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));

    const icon = toggle.querySelector('.theme-toggle__icon');
    const label = toggle.querySelector('.theme-toggle__label');
    if (icon) {
      icon.textContent = isLight ? '☀️' : '🌙';
    }
    if (label) {
      label.textContent = isLight ? 'Modo claro' : 'Modo escuro';
    }
  };

  const applyTheme = (theme, { persist = true } = {}) => {
    root.dataset.theme = theme;
    if (persist) {
      localStorage.setItem(THEME_KEY, theme);
    }
    updateToggleState(theme);
  };

  applyTheme(initialTheme, { persist: Boolean(storedTheme) });

  prefersLight.addEventListener('change', (event) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(event.matches ? 'light' : 'dark', { persist: false });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    themeToggle = document.querySelector('[data-theme-toggle]');
    updateToggleState(root.dataset.theme);

    themeToggle?.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  });
})();
