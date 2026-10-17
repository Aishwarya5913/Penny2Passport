import { createServerFn } from '@tanstack/react-start';

// Firebase web configuration is intentionally public; never return Admin credentials.
export const getFirebaseWebConfig = createServerFn({ method: 'GET' }).handler(async () => {
  const apiKey = process.env['GOOGLE_API_KEY']?.trim();
  const measurementId = process.env['GOOGLE_ANALYTICS_MEASUREMENT_ID']?.trim();
  if (!apiKey || !/^AIza[\w-]{35}$/.test(apiKey)) {
    return { config: null, error: 'The saved Firebase web API key is missing or invalid. Update GOOGLE_API_KEY with the web app key from Firebase Project settings.' };
  }
  return {
    config: { apiKey, authDomain: 'penny2passport.firebaseapp.com', projectId: 'penny2passport', storageBucket: 'penny2passport.firebasestorage.app', messagingSenderId: '197199499771', appId: '1:197199499771:web:9122a8ecca4d60593c7b5e', ...(measurementId?.startsWith('G-') ? { measurementId } : {}) },
    error: null,
  };
});