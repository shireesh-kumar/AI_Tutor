const config = {
  apiUrl: import.meta.env.PROD 
    ? (import.meta.env.VITE_API_URL_PROD as string)
    : (import.meta.env.VITE_API_URL as string),
};

export default config;
