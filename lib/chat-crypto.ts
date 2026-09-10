import crypto from 'node:crypto';

function key() {
  const raw = process.env.CHAT_ENCRYPTION_KEY || process.env.APP_ENCRYPTION_SECRET;
  if (!raw) throw new Error('CHAT_ENCRYPTION_KEY or APP_ENCRYPTION_SECRET is required for chat encryption.');
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptMessage(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptMessage(value: string) {
  const [iv, tag, data] = value.split('.');
  if (!iv || !tag || !data) throw new Error('Invalid encrypted message.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
}
