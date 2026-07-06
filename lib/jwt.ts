import { SignJWT, jwtVerify, decodeProtectedHeader, base64url } from 'jose';

export const SUPPORTED_ALGS = ['HS256', 'HS384', 'HS512'] as const;
export type SupportedAlg = (typeof SUPPORTED_ALGS)[number];

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

export function isJwt(text: string): boolean {
  return JWT_PATTERN.test(text.trim());
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export class JwtError extends Error {}

function parseJsonObject(text: string, what: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    throw new JwtError(`${what} is not valid JSON: ${(e as Error).message}`);
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new JwtError(`${what} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT from raw header/payload JSON text and a secret.
 * The `alg` is taken from the header and must be an HMAC algorithm.
 */
export async function signJwt(
  headerText: string,
  payloadText: string,
  secret: string,
): Promise<string> {
  const header = parseJsonObject(headerText, 'Header');
  const payload = parseJsonObject(payloadText, 'Payload');
  const alg = header.alg;
  if (typeof alg !== 'string' || !SUPPORTED_ALGS.includes(alg as SupportedAlg)) {
    throw new JwtError(
      `Header "alg" must be one of ${SUPPORTED_ALGS.join(', ')} (got ${JSON.stringify(alg ?? null)})`,
    );
  }
  if (!secret) {
    throw new JwtError('Secret is empty');
  }
  return new SignJWT(payload)
    .setProtectedHeader(header as { alg: SupportedAlg } & Record<string, unknown>)
    .sign(secretKey(secret));
}

/** Decode a JWT without verifying its signature. */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (!isJwt(trimmed)) {
    throw new JwtError('Not a valid JWT (expected three base64url sections separated by dots)');
  }
  const [, payloadPart, signaturePart] = trimmed.split('.');
  let header: Record<string, unknown>;
  try {
    header = decodeProtectedHeader(trimmed) as Record<string, unknown>;
  } catch {
    throw new JwtError('Failed to decode JWT header');
  }
  let payload: Record<string, unknown>;
  try {
    const json = new TextDecoder().decode(base64url.decode(payloadPart));
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('payload is not an object');
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    throw new JwtError('Failed to decode JWT payload');
  }
  return { header, payload, signature: signaturePart };
}

/** Verify an HMAC-signed JWT. Returns true when the signature matches. */
export async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token.trim(), secretKey(secret), {
      algorithms: [...SUPPORTED_ALGS],
      // We only check the signature here; expiry is surfaced separately in the UI.
      clockTolerance: Number.MAX_SAFE_INTEGER,
    });
    return true;
  } catch {
    return false;
  }
}

/** Format a numeric date claim (seconds since epoch) for display. */
export function formatClaimDate(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toLocaleString();
}

export function isExpired(payload: Record<string, unknown>): boolean | null {
  const exp = payload.exp;
  if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
  return exp * 1000 < Date.now();
}
