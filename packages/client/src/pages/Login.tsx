import { useState } from 'preact/hooks';
import { useAuth } from '../AuthContext';
import { ApiError, loginRequest } from '../lib/api';
import { navigate } from '../lib/router';

export default function Login() {
  const { login, t } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const token = await loginRequest(username, password);
      login(token);
      navigate({ name: 'search', query: '', page: 0, bookId: null });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        setError(t('login.error'));
      } else {
        setError(t('search.error'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authwrap">
      <form className="card form" onSubmit={submit}>
        <h1 className="card-title">{t('login.title')}</h1>
        <label className="label" htmlFor="username">
          {t('login.username')}
        </label>
        <input
          id="username"
          className="input"
          type="text"
          autoComplete="username"
          value={username}
          onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
        />
        <label className="label" htmlFor="password">
          {t('login.password')}
        </label>
        <div className="pwrow">
          <input
            id="password"
            className="input"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <button type="button" className="btn btn-ghost" onClick={() => setShowPw(!showPw)} aria-pressed={showPw}>
            {showPw ? '–' : '•••'}
          </button>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {t('login.submit')}
        </button>
      </form>
    </div>
  );
}
