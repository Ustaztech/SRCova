const PBKDF2_ITERATIONS = 210_000;
const HASH_PREFIX = 'pbkdf2-sha256';

const encodeBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const getCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('Secure password operations are unavailable. Use HTTPS or localhost.');
  }
  return globalThis.crypto;
};

const deriveKey = async (password: string, salt: Uint8Array, iterations: number) => {
  const cryptoApi = getCrypto();
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const saltBuffer = new Uint8Array(salt).buffer;
  const bits = await cryptoApi.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = getCrypto().getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${encodeBase64Url(salt)}$${encodeBase64Url(derivedKey)}`;
};

export const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> => {
  getCrypto();
  const [prefix, iterationText, saltText, keyText, extra] = storedHash.split('$');

  if (prefix !== HASH_PREFIX || !iterationText || !saltText || !keyText || extra !== undefined) {
    return { valid: storedHash === password, needsRehash: storedHash === password };
  }

  const iterations = Number(iterationText);
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 1_000_000) {
    return { valid: false, needsRehash: false };
  }

  try {
    const expected = decodeBase64Url(keyText);
    const salt = decodeBase64Url(saltText);
    if (salt.length !== 16 || expected.length !== 32) {
      return { valid: false, needsRehash: false };
    }
    const actual = await deriveKey(password, salt, iterations);
    if (expected.length !== actual.length) return { valid: false, needsRehash: false };

    let difference = 0;
    for (let index = 0; index < expected.length; index += 1) {
      difference |= expected[index] ^ actual[index];
    }

    return {
      valid: difference === 0,
      needsRehash: difference === 0 && iterations < PBKDF2_ITERATIONS,
    };
  } catch {
    return { valid: false, needsRehash: false };
  }
};

export const generateTemporaryPassword = () => {
  const bytes = getCrypto().getRandomValues(new Uint8Array(24));
  return `SRC-${encodeBase64Url(bytes)}`;
};

export const isValidPassword = (password: string) =>
  password.length >= 12 && password.length <= 128;
