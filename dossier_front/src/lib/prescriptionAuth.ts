const API_URL = process.env.NEXT_PUBLIC_PRESCRIPTION_API_URL!;
const EMAIL = process.env.NEXT_PUBLIC_PRESCRIPTION_EMAIL!;
const PASSWORD = process.env.NEXT_PUBLIC_PRESCRIPTION_PASSWORD!;

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

function parseJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpiredOrSoon(token: string): boolean {
  const expiry = parseJwtExpiry(token);
  if (!expiry) return true;
  // Renouvelle si expire dans moins de 10 minutes
  return Date.now() > expiry - 10 * 60 * 1000;
}

async function login(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) throw new Error('Échec login Prescription API');

  const data = await res.json();
  const token = data.access_token;
  cachedToken = token;
  tokenExpiry = parseJwtExpiry(token);
  return token;
}

export async function getPrescriptionToken(): Promise<string> {
  // Utilise le token en cache s'il est encore valide
  if (cachedToken && !isTokenExpiredOrSoon(cachedToken)) {
    return cachedToken;
  }

  // Essaie d'abord le token du .env
  const envToken = process.env.NEXT_PUBLIC_PRESCRIPTION_TOKEN;
  if (envToken && !isTokenExpiredOrSoon(envToken)) {
    cachedToken = envToken;
    return envToken;
  }

  // Sinon, relogin automatiquement
  return await login();
}

export async function prescriptionFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getPrescriptionToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Si 401, force relogin et réessaie une fois
  if (response.status === 401) {
    cachedToken = null;
    const newToken = await login();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return response;
}
