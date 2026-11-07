// The payload (including images) is encrypted before it enters the repository.
// No password, key, plaintext data or password verifier is shipped to visitors.
export const iterations = 600000;
const decode = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
export async function unlockArchive(password, envelope, subtle = crypto.subtle) {
  if (envelope.v !== 1 || envelope.kdf !== 'PBKDF2-SHA256' || envelope.iterations !== iterations) throw new Error('Unsupported archive');
  const material = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey({name:'PBKDF2', salt:decode(envelope.salt), iterations, hash:'SHA-256'}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
  const bytes = await subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv),additionalData:new TextEncoder().encode('psrmalam-ancestry-v1')}, key, decode(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(bytes));
}
