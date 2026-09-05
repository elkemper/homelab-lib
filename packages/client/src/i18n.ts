export type Lang = 'ru' | 'en';

const dict = {
  ru: {
    'app.name': 'HomeLab Lib',
    'app.tagline': 'Домашняя библиотека',
    'nav.search': 'Поиск',
    'nav.users': 'Пользователи',
    'nav.logout': 'Выйти',
    'search.label': 'Поиск книг',
    'search.placeholder': 'Например: Оруэлл 1984',
    'search.button': 'Найти',
    'search.clear': 'Очистить',
    'search.hint': 'Минимум 2 символа. Работают префиксы: «har»* найдёт Harbor.',
    'search.found': 'Найдено: {count}',
    'search.pageOf': 'Стр. {page} из {pages}',
    'search.empty': 'Ничего не найдено по запросу «{q}».',
    'search.idle': 'Введите запрос и нажмите «Найти».',
    'search.loading': 'Загрузка…',
    'search.error': 'Ошибка поиска. Проверьте соединение.',
    'pagination.prev': 'Назад',
    'pagination.next': 'Вперёд',
    'pagination.page': 'Страница',
    'pagination.go': 'Перейти',
    'book.series': 'Серия',
    'book.download': 'FB2',
    'book.downloading': '…',
    'book.downloadError': 'Не удалось скачать',
    'login.title': 'Вход',
    'login.username': 'Логин',
    'login.password': 'Пароль',
    'login.submit': 'Войти',
    'login.error': 'Неверный логин или пароль',
    'users.title': 'Пользователи',
    'users.create': 'Создать',
    'users.delete': 'Удалить',
    'users.confirmDelete': 'Удалить пользователя?',
    'common.close': 'Закрыть',
  },
  en: {
    'app.name': 'HomeLab Lib',
    'app.tagline': 'Home library',
    'nav.search': 'Search',
    'nav.users': 'Users',
    'nav.logout': 'Log out',
    'search.label': 'Book search',
    'search.placeholder': 'E.g. Orwell 1984',
    'search.button': 'Search',
    'search.clear': 'Clear',
    'search.hint': 'At least 2 characters. Prefix match: "har"* finds Harbor.',
    'search.found': 'Found: {count}',
    'search.pageOf': 'Page {page} of {pages}',
    'search.empty': 'Nothing found for "{q}".',
    'search.idle': 'Type a query and press Search.',
    'search.loading': 'Loading…',
    'search.error': 'Search failed. Check connection.',
    'pagination.prev': 'Prev',
    'pagination.next': 'Next',
    'pagination.page': 'Page',
    'pagination.go': 'Go',
    'book.series': 'Series',
    'book.download': 'FB2',
    'book.downloading': '…',
    'book.downloadError': 'Download failed',
    'login.title': 'Sign in',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.submit': 'Sign in',
    'login.error': 'Wrong username or password',
    'users.title': 'Users',
    'users.create': 'Create',
    'users.delete': 'Delete',
    'users.confirmDelete': 'Delete this user?',
    'common.close': 'Close',
  },
} as const;

export type MsgKey = keyof (typeof dict)['ru'];

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('hl-lang');
    if (saved === 'ru' || saved === 'en') return saved;
    const nav = navigator.language || 'ru';
    return nav.toLowerCase().startsWith('ru') ? 'ru' : 'en';
  } catch {
    return 'ru';
  }
}

export function translate(lang: Lang, key: MsgKey, vars?: Record<string, string | number>): string {
  let s: string = (dict[lang][key] ?? dict.en[key] ?? key) as string;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace('{' + k + '}', String(vars[k]));
    }
  }
  return s;
}

export const messages = dict;
