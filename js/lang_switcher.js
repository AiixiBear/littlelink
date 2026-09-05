(function () {
  const routes = {
    'zh-TW': '/',
    'en': '/en/',
    'ja': '/ja/'
  };

  const currentPath = window.location.pathname;

  function getLangFromPath(path) {
    if (path.startsWith('/en/')) return 'en';
    if (path.startsWith('/ja/')) return 'ja';
    return 'zh-TW';
  }

  let targetLang = localStorage.getItem('user_lang');

  if (!targetLang) {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();

    if (browserLang.startsWith('ja')) {
      targetLang = 'ja';
    } else if (browserLang.startsWith('en')) {
      targetLang = 'en';
    } else {
      targetLang = 'zh-TW';
    }
  }

  if (currentPath === '/' && targetLang !== 'zh-TW') {
    window.location.href = routes[targetLang];
  } else {
    const currentLang = getLangFromPath(currentPath);
    localStorage.setItem('user_lang', currentLang);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  const currentPath = window.location.pathname;
  
  let currentLang = 'zh-TW';
  if (currentPath.startsWith('/en/')) currentLang = 'en';
  if (currentPath.startsWith('/ja/')) currentLang = 'ja';

  langSelect.value = currentLang;

  langSelect.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('user_lang', selectedLang);

    const routes = {
      'zh-TW': '/',
      'en': '/en/',
      'ja': '/ja/'
    };

    if (routes[selectedLang]) {
      window.location.href = routes[selectedLang];
    }
  });
});