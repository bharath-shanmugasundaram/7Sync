export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG ?? "",
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
