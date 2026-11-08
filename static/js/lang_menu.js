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
      question: '，是否要切換過去？',
      switch: '切換至',
      stay: '留在當前語言',
    },
    en: {
      prefix: 'It looks like your preferred language is',
      question: '. Would you like to switch?',
      switch: 'Switch to',
      stay: 'Stay in current language',
    },
    ja: {
      prefix: '優先言語が',
      question: 'に設定されています。切り替えますか？',
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
    if (normalizedLanguage.startsWith('zh-tw') || normalizedLanguage.startsWith('zh-hant')) {
      return 'zh-tw';
    }
    if (normalizedLanguage.startsWith('en')) return 'en';
    if (normalizedLanguage.startsWith('ja')) return 'ja';

    return null;
  };

  const browserLanguage = getBrowserLanguages()[0] || 'en';
  const preferredLanguage = getPreferredLanguage(browserLanguage);
  const targetLanguage = preferredLanguage && supportedLanguages[preferredLanguage];

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

  if (targetLanguage && preferredLanguage === currentLocale) return;

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

  if (!targetLanguage) {
    supportedMessage.hidden = true;
    unsupportedMessage.hidden = false;
    availabilityMessage.textContent = `This page is available in ${availableLanguagesText}.`;
    browsingMessage.textContent = `You're browsing in ${getBrowserLanguageName(browserLanguage)}.`;
    switchButton.hidden = false;
    switchButton.textContent = 'Switch to English';
    stayButton.hidden = false;
    stayButton.textContent = 'Stay in the current language';
    languagePrompt.hidden = false;
  } else {
    const translation = promptTranslations[preferredLanguage];
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