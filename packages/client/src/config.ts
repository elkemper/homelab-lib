interface Config {
  apiUrl: string;
}

// Vite exposes env via import.meta.env (typed in vite-env.d.ts).
const apiUrl = (import.meta.env && import.meta.env.VITE_API_URL) || '/api';

const config: Config = { apiUrl };

export default config;
