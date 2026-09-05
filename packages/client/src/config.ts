interface Config {
  apiUrl: string;
}

// Vite exposes env via import.meta.env (typed in vite-env.d.ts).
// REACT_APP_API_URL is kept as an alias so existing deploys keep working.
const apiUrl =
  (import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) || '/api';

const config: Config = { apiUrl };

export default config;
