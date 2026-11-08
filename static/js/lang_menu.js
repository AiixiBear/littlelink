document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang-select');
  const languagePrompt = document.getElementById('language-prompt');

  const currentPath = window.location.pathname;

  // Set default language selection based on the current URL path
  let currentLang = 'zh-TW';
  if (currentPath.startsWith('/en/')) currentLang = 'en';
  if (currentPath.startsWith('/ja/')) currentLang = 'ja';

  if (langSelect) {
    langSelect.value = currentLang;
  }

  // Handle language selection change events
  langSelect?.addEventListener('change', (e) => {
    const selectedLang = e.target.value;

    const routes = {
      'zh-TW': '/zh-tw/',
      'en': '/en/',
      'ja': '/ja/'
    };

    if (routes[selectedLang]) {
      window.location.href = routes[selectedLang];
    }
  });

  if (!languagePrompt) return;

  const supportedLanguages = {
    'zh-tw': { label: '繁體中文', path: '/zh-tw/' },
    en: { label: 'English', path: '/en/' },
    ja: { label: '日本語', path: '/ja/' },
  };

  const promptTranslations = {
    'zh-tw': {
      prefix: '偵測到您使用的語言為',
      question: '是否要切換過去？',
      switch: '切換至',
      stay: '留在當前語言',
    },
    'zh-cn': {
      prefix: '检测到您的浏览器语言为简体中文，本站提供',
      question: '是否需要切换？',
      switch: '切换至',
      stay: '留在当前语言',
    },
    en: {
      prefix: 'It looks like your preferred language is',
      question: 'Would you like to switch?',
      switch: 'Switch to',
      stay: 'Stay in current language',
    },
    ja: {
      prefix: '優先言語が',
      question: '切り替えますか？',
      switch: '切替：',
      stay: '現在の言語のままにする',
    },
  };

  const currentLocale = languagePrompt.dataset.currentLocale;

  const getBrowserLanguages = () => {
    return navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
  };

  // Map the primary browser language to a supported site language.
  const getPreferredLanguage = (browserLanguage) => {
    const normalizedLanguage = browserLanguage.toLowerCase();
    
    // 繁體中文
    if (normalizedLanguage.startsWith('zh-tw') || normalizedLanguage.startsWith('zh-hant')) {
      return { targetKey: 'zh-tw', promptKey: 'zh-tw' };
    }
    // 簡體中文：目標頁面導向 zh-tw，但選用 zh-cn 的提示語系
    if (normalizedLanguage.startsWith('zh')) {
      return { targetKey: 'zh-tw', promptKey: 'zh-cn' };
    }
    // 英文
    if (normalizedLanguage.startsWith('en')) {
      return { targetKey: 'en', promptKey: 'en' };
    }
    // 日文
    if (normalizedLanguage.startsWith('ja')) {
      return { targetKey: 'ja', promptKey: 'ja' };
    }

    return null;
  };

  const browserLanguage = getBrowserLanguages()[0] || 'en';
  const preferred = getPreferredLanguage(browserLanguage);
  
  const targetLanguage = preferred ? supportedLanguages[preferred.targetKey] : null;
  const promptKey = preferred ? preferred.promptKey : null;

  const supportedMessage = document.getElementById('language-prompt-supported');
  const unsupportedMessage = document.getElementById('language-prompt-unsupported');
  const targetLabel = document.getElementById('language-prompt-target');
  const promptPrefix = document.getElementById('language-prompt-prefix');
  const promptQuestion = document.getElementById('language-prompt-question');
  const availabilityMessage = document.getElementById('language-prompt-availability');
  const browsingMessage = document.getElementById('language-prompt-browsing');
  const switchButton = document.getElementById('language-prompt-switch');
  const stayButton = document.getElementById('language-prompt-stay');

  if (
    !supportedMessage ||
    !unsupportedMessage ||
    !targetLabel ||
    !promptPrefix ||
    !promptQuestion ||
    !availabilityMessage ||
    !browsingMessage ||
    !switchButton ||
    !stayButton
  ) return;

  // 如果目標語言與目前所在頁面語系相同，就不跳出提示
  if (targetLanguage && preferred.targetKey === currentLocale) return;

  const availableLanguageLabels = Object.values(supportedLanguages).map((language) => language.label);
  const availableLanguagesText = `${availableLanguageLabels.slice(0, -1).join(', ')}, and ${availableLanguageLabels.at(-1)}`;

  const getBrowserLanguageName = (languageTag) => {
    const baseLanguage = languageTag.split('-')[0];
    try {
      return new Intl.DisplayNames(['en'], { type: 'language' }).of(baseLanguage) || languageTag;
    } catch {
      return languageTag;
    }
  };

  // Handle cases where the browser language is not directly supported by the site
  if (!targetLanguage) {
    supportedMessage.hidden = true;
    unsupportedMessage.hidden = false;
    
    availabilityMessage.textContent = `This page is available in ${availableLanguagesText}. You can switch languages manually using the selector.`;
    browsingMessage.textContent = `Your browser language is set to ${getBrowserLanguageName(browserLanguage)}.`;
    
    switchButton.hidden = true;
    stayButton.hidden = false;
    stayButton.textContent = 'Got it';
    languagePrompt.hidden = false;
  } else {
    const translation = promptTranslations[promptKey] || promptTranslations.en;
    promptPrefix.textContent = translation.prefix;
    promptQuestion.textContent = translation.question;
    targetLabel.textContent = targetLanguage.label;
    switchButton.textContent = `${translation.switch} ${targetLanguage.label}`;
    stayButton.textContent = translation.stay;
    languagePrompt.hidden = false;
  }

  const dismissPrompt = () => {
    languagePrompt.hidden = true;
  };

  if (targetLanguage) {
    switchButton.addEventListener('click', () => {
      dismissPrompt();
      window.location.href = targetLanguage.path;
    });
  } else {
    switchButton.addEventListener('click', () => {
      dismissPrompt();
      window.location.href = supportedLanguages.en.path;
    });
  }
  stayButton.addEventListener('click', dismissPrompt);
});