import { useCallback, useEffect, useState } from 'preact/hooks';
import { useAuth } from '../AuthContext';
import { ApiError, createUserReq, deleteUserReq, listUsers, type ManagedUser } from '../lib/api';

export default function Users() {
  const { token, t } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await listUsers(token));
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await createUserReq(token, username, password);
      setUsername('');
      setPassword('');
      await load();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (id === 0) return;
    if (!window.confirm(t('users.confirmDelete'))) return;
    try {
      await deleteUserReq(token, id);
      await load();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">{t('users.title')}</h1>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <form className="card form form-inline" onSubmit={create}>
        <input
          className="input"
          type="text"
          autoComplete="username"
          placeholder={t('login.username')}
          value={username}
          onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
        />
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          placeholder={t('login.password')}
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {t('users.create')}
        </button>
      </form>
      <ul className="booklist">
        {users.map((u) => (
          <li key={u.id} className="book">
            <div className="book-main">
              <div className="book-title">{u.username}</div>
              <div className="book-meta book-meta-dim">id: {u.id}</div>
            </div>
            <div className="book-side">
              {u.id !== 0 && (
                <button className="btn btn-ghost btn-danger" onClick={() => remove(u.id)}>
                  {t('users.delete')}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
