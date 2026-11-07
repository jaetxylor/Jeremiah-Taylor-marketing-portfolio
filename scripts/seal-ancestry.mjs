// Usage: supply {password,payload} as JSON on stdin. Never commit that input.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, webcrypto } from 'node:crypto';
import { iterations } from '../assets/ancestry-crypto.mjs';
export async function sealArchive(password,payload) {
  if (typeof password !== 'string' || password.length < 8) throw new Error('Archive password must be at least eight characters');
  const salt=randomBytes(16),iv=randomBytes(12),enc=new TextEncoder();
  const material=await webcrypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
  const key=await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);
  const bytes=await webcrypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode('psrmalam-ancestry-v1')},key,enc.encode(JSON.stringify(payload)));
  return {v:1,kdf:'PBKDF2-SHA256',iterations,salt:salt.toString('base64'),iv:iv.toString('base64'),ciphertext:Buffer.from(bytes).toString('base64')};
}
if (process.argv[1] && import.meta.url === new URL('file://'+path.resolve(process.argv[1])).href) {
  const chunks=[];for await(const chunk of process.stdin)chunks.push(chunk);
  const {password,payload}=JSON.parse(Buffer.concat(chunks).toString());
  if(!payload?.people?.length || !payload?.media?.length)throw new Error('Missing archive content');
  const sealed=await sealArchive(password,payload);
  const destination=path.resolve('assets/ancestry.vault.json');
  fs.writeFileSync(destination,JSON.stringify(sealed));
  console.log('Encrypted archive saved. Plaintext is not included in the site.');
}
