export function resolveApiBase(): string {
  // Forcer l'URL directe en développement
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/api/backend';
  return (process.env.INTERNAL_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
}
