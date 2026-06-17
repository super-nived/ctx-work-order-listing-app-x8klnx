const TOKEN_URLS: Record<string, string> = {
  uat:  'https://auth.uat.industryapps.net/auth/realms/IndustryApps/protocol/openid-connect/token',
  prod: 'https://auth.industryapps.net/auth/realms/IndustryApps/protocol/openid-connect/token',
};
const GATEWAY: Record<string, string> = {
  uat:  'https://connect-v1.uat.industryapps.net',
  prod: 'https://connect-v1.industryapps.net',
};

export interface DataSpaceCreds {
  client_id: string;
  client_secret: string;
  company_code: string;
  plant_code: string;
  environment: string;
}

let _tokenCache: { token: string; expires: number } | null = null;
let _creds: DataSpaceCreds | null = null;

export function setCredentials(creds: DataSpaceCreds) {
  _creds = creds;
  _tokenCache = null;
}

export function getCredentials(): DataSpaceCreds | null {
  return _creds;
}

export function loadCredentialsFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('ds_creds');
    if (!raw) return false;
    const creds = JSON.parse(raw) as DataSpaceCreds;
    if (creds.client_id && creds.client_secret && creds.company_code && creds.plant_code) {
      setCredentials(creds);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function saveCredentialsToStorage(creds: DataSpaceCreds) {
  localStorage.setItem('ds_creds', JSON.stringify(creds));
}

export function clearCredentials() {
  _creds = null;
  _tokenCache = null;
  localStorage.removeItem('ds_creds');
}

async function getToken(): Promise<string> {
  if (!_creds) throw new Error('DataSpace credentials not set');
  if (_tokenCache && Date.now() < _tokenCache.expires) return _tokenCache.token;
  const env = _creds.environment || 'uat';
  const res = await fetch(TOKEN_URLS[env], {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: _creds.client_id,
      client_secret: _creds.client_secret,
    }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('AUTH_FAILED');
    throw new Error(`Auth failed: ${await res.text()}`);
  }
  const data = await res.json();
  _tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return _tokenCache.token;
}

function base(): string {
  if (!_creds) throw new Error('DataSpace credentials not set');
  const env = _creds.environment || 'uat';
  return `${GATEWAY[env]}/${_creds.company_code}`;
}

export async function fetchCollection<T = Record<string, unknown>>(
  collection: string,
  params?: { startDate?: string; endDate?: string; status?: string }
): Promise<T[]> {
  if (!_creds) throw new Error('DataSpace credentials not set');
  const token = await getToken();
  const url = new URL(`${base()}/transaction/${_creds.plant_code}_${collection}/records`);
  if (params?.startDate) url.searchParams.set('startDate', params.startDate);
  if (params?.endDate) url.searchParams.set('endDate', params.endDate);
  if (params?.status) url.searchParams.set('status', params.status);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('AUTH_FAILED');
    throw new Error(`DataSpace error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.data ?? data.records ?? (Array.isArray(data) ? data : []);
}
