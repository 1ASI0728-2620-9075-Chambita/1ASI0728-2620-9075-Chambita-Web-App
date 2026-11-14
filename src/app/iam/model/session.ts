export type Role = 'STUDENT' | 'CLIENT' | 'ADMIN';

/** Answer of POST /authentication/sign-in. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studentVerified: boolean;
  token: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

/** Seconds since epoch when the JWT expires, or null if it cannot be read. */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload)) as { exp?: number };
    return typeof claims.exp === 'number' ? claims.exp : null;
  } catch {
    return null;
  }
}

export function isExpired(token: string, nowSeconds = Date.now() / 1000): boolean {
  const expiry = tokenExpiry(token);
  return expiry === null || expiry <= nowSeconds;
}
