document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  const currentPath = window.location.pathname;

  // 根據目前網址路徑設定選單預設值
  let currentLang = 'zh-TW';
  if (currentPath.startsWith('/en/')) currentLang = 'en';
  if (currentPath.startsWith('/ja/')) currentLang = 'ja';

  langSelect.value = currentLang;

  // 監聽選單切換事件
  langSelect.addEventListener('change', (e) => {
    const selectedLang = e.target.value;

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