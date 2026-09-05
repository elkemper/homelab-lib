import { useAuth } from '../AuthContext';
import { navigate } from '../lib/router';

export default function Header() {
  const { isLoggedIn, isAdmin, logout, lang, setLang, t } = useAuth();
  if (!isLoggedIn) {
    return (
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">{t('app.name')}</span>
          <div className="topbar-actions">
            <button
              className={lang === 'ru' ? 'langbtn is-active' : 'langbtn'}
              onClick={() => setLang('ru')}
              aria-pressed={lang === 'ru'}
            >
              RU
            </button>
            <button
              className={lang === 'en' ? 'langbtn is-active' : 'langbtn'}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#/search">
          {t('app.name')}
        </a>
        <nav className="nav" aria-label="main">
          <a href="#/search">{t('nav.search')}</a>
          {isAdmin && <a href="#/users">{t('nav.users')}</a>}
        </nav>
        <div className="topbar-actions">
          <button
            className={lang === 'ru' ? 'langbtn is-active' : 'langbtn'}
            onClick={() => setLang('ru')}
            aria-pressed={lang === 'ru'}
          >
            RU
          </button>
          <button
            className={lang === 'en' ? 'langbtn is-active' : 'langbtn'}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate({ name: 'login', query: '', page: 0, bookId: null });
            }}
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}
