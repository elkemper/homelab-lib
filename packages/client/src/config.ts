interface Config {
  apiUrl: string;
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL ?? `/api`,
};

export default config;
