export function validateSupabaseConfig(url: string | undefined, key: string | undefined) {
  if (!url || !key)
    throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.');
  const parsed = new URL(url);
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  )
    throw new Error('Use the HTTPS Supabase project URL, without a path or credentials.');
  if (!key.startsWith('sb_publishable_'))
    throw new Error('Use a Supabase publishable key, never a secret or service-role key.');
  return { url: parsed.origin, key };
}

export function parseAuthCallback(
  url: string,
):
  | { kind: 'tokens'; accessToken: string; refreshToken: string; recovery: boolean }
  | { kind: 'code'; code: string; recovery: false } {
  const parsed = new URL(url);
  const native =
    parsed.protocol === 'talaride:' &&
    parsed.hostname === 'auth-callback' &&
    (parsed.pathname === '' || parsed.pathname === '/');
  const web = ['http:', 'https:'].includes(parsed.protocol) && parsed.pathname === '/auth-callback';
  if (!native && !web) throw new Error('Invalid authentication callback.');
  const params = new URLSearchParams(parsed.hash.slice(1) || parsed.search.slice(1));
  if (params.has('error') || params.has('error_code'))
    throw new Error('The authentication link is invalid or expired. Request a new link.');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');
  if (accessToken && refreshToken)
    return {
      kind: 'tokens',
      accessToken,
      refreshToken,
      recovery: params.get('type') === 'recovery',
    };
  if (code) return { kind: 'code', code, recovery: false };
  throw new Error('This link does not contain an authentication session.');
}
