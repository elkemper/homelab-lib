import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Search from './pages/Search';
import Users from './pages/Users';
import { useRoute } from './lib/router';

function Shell() {
  const { isLoggedIn } = useAuth();
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
  return (
    <>
      <Header />
      <main className="container">
        {route.name === 'users' ? <Users /> : <Search route={route} />}
      </main>
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
