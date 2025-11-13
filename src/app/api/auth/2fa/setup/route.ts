import { NextRequest, NextResponse } from 'next/server';
import { getTwoFactorCollection, getUserProfilesCollection } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  generateTOTPSecret,
  verifyTOTPToken,
  verifyBackupCode,
  consumeBackupCode,
  hashBackupCode,
} from '@/lib/two-factor';
import { sendTwoFactorEmail, sendTwoFactorSMS } from '@/lib/notifications';

/**
 * GET /api/auth/2fa/setup
 * Generate 2FA setup credentials
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secret, backupCodes, qrCode } = await generateTOTPSecret(session.email);

    return NextResponse.json({
      secret,
      backupCodes,
      qrCode,
      message: 'Scan QR code with authenticator app',
    });
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    return NextResponse.json(
      { error: 'Failed to generate 2FA credentials' },
      { status: 500 }
    );
  }
}
