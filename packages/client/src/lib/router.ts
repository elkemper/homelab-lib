import { useEffect, useState } from 'preact/hooks';

export interface Route {
  name: 'search' | 'login' | 'users' | 'book';
  query: string;
  page: number;
  bookId: string | null;
}

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '') || '/search';
  const [pathPart, queryPart] = h.split('?');
  const params = new URLSearchParams(queryPart || '');
  const q = params.get('q') || '';
  const pRaw = params.get('p') || '0';
  const pNum = Number(pRaw);
  const page = Number.isInteger(pNum) && pNum >= 0 ? pNum : 0;
  if (pathPart === '/login') return { name: 'login', query: '', page: 0, bookId: null };
  if (pathPart === '/users') return { name: 'users', query: '', page: 0, bookId: null };
  const bookMatch = pathPart.match(/^\/book\/(\d+)$/);
  if (bookMatch) return { name: 'book', query: '', page: 0, bookId: bookMatch[1] };
  return { name: 'search', query: q, page, bookId: null };
}

export function buildHash(route: Route): string {
  if (route.name === 'login') return '#/login';
  if (route.name === 'users') return '#/users';
  if (route.name === 'book' && route.bookId) return '#/book/' + route.bookId;
  const params = new URLSearchParams();
  if (route.query) params.set('q', route.query);
  if (route.page > 0) params.set('p', String(route.page));
  const qs = params.toString();
  return '#/search' + (qs ? '?' + qs : '');
}

export function navigate(route: Route): void {
  window.location.hash = buildHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
