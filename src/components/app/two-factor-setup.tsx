'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TwoFactorSetup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<'setup' | 'verify' | 'success'>('setup');
  const [qrCode, setQrCode] = React.useState<string>('');
  const [secret, setSecret] = React.useState<string>('');
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);

  const setupTwoFactor = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup');
      if (!res.ok) throw new Error('Failed to setup 2FA');

      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('verify');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to setup 2FA. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter a valid 6-digit code.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          secret,
        }),
      });

      if (!res.ok) throw new Error('Failed to verify code');

      setIs2FAEnabled(true);
      setStep('success');
      toast({
        title: 'Success',
        description: 'Two-factor authentication has been enabled.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The code you entered is incorrect. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Code copied to clipboard.',
    });
  };

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Two-factor authentication adds an extra security step when you log in. You'll need access to your phone or authentication app.
            </div>
          </div>
          <Button onClick={setupTwoFactor} disabled={isLoading} className="w-full">
            {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Your Authenticator</CardTitle>
          <CardDescription>Scan the QR code with your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="border rounded-lg p-2" width={300} height={300} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Manual Entry Code</label>
            <div className="flex gap-2">
              <Input
                value={secret}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(secret)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              If you can't scan the QR code, enter this code manually in your authenticator app.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Enter 6-Digit Code</label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Save Your Backup Codes</h3>
            <p className="text-xs text-muted-foreground">
              Save these codes in a secure location. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-2 border rounded bg-slate-50 font-mono text-sm flex items-center justify-between"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={verifyAndEnable} disabled={isLoading} className="w-full">
            {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle>Two-Factor Authentication Enabled</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account is now protected with two-factor authentication. You'll need to enter a code from your authenticator app when you log in.
          </p>
          <Button className="w-full">Back to Settings</Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
