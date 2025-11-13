import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate TOTP Secret and QR Code for 2FA setup
 */
export async function generateTOTPSecret(email: string, appName: string = 'AidFusion') {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${email})`,
    issuer: appName,
    length: 32,
  });

  // Generate QR Code as data URL
  const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    backupCodes: generateBackupCodes(8),
    qrCode,
  };
}

/**
 * Verify TOTP Token
 */
export function verifyTOTPToken(secret: string, token: string, window: number = 2): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window,
  });
}

/**
 * Generate Backup Codes for 2FA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Verify Backup Code
 */
export function verifyBackupCode(code: string, backupCodes: string[]): boolean {
  return backupCodes.some((bc) => bc === code.toUpperCase());
}

/**
 * Consume Backup Code (remove from list)
 */
export function consumeBackupCode(code: string, backupCodes: string[]): string[] {
  return backupCodes.filter((bc) => bc !== code.toUpperCase());
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify hashed backup code
 */
export function verifyHashedBackupCode(code: string, hash: string): boolean {
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  return codeHash === hash;
}
