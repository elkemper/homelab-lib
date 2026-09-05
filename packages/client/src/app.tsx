import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Search from './pages/Search';
import Users from './pages/Users';
import { useRoute } from './lib/router';

function Shell() {
  const { isLoggedIn, isAdmin } = useAuth();
  const route = useRoute();

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <main className="container">
          <Login />
        </main>
      </>
    );
  }
  // Server enforces RBAC (requireAdmin); this guard is UX-only so a
  // non-admin never sees the admin page. 'book' has no page yet and
  // falls back to search until the book card route lands.
  const showUsers = route.name === 'users' && isAdmin;
  return (
    <>
      <Header />
      <main className="container">{showUsers ? <Users /> : <Search route={route} />}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
