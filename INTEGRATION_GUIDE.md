# AidFusion - Integration Setup Guide

This guide will help you integrate all 5 features into your AidFusion project.

## 📋 Features to Integrate

1. **Extended User Profiles** ✓
2. **Two-Factor Authentication (2FA)** ✓
3. **Email/SMS Notifications** ✓
4. **Medical Records Management** ✓
5. **Telemedicine Integration** ✓

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install nodemailer twilio speakeasy qrcode aws-sdk
npm install --save-dev @types/nodemailer @types/speakeasy
```

### Step 2: Environment Variables

Create or update your `.env.local` file with the following:

```env
# Database
MONGODB_URI=mongodb+srv://harsh:HARSH123@medi.h6pp7fi.mongodb.net/aidfusion?retryWrites=true&w=majority&appName=medi
MONGODB_DB=aidfusion
JWT_SECRET=78756d7cd74203958419227d3fd396ec38bcf101d010d5bd87bfb965666d45e1

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@aidfusion.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=aidfusion-medical-records

# Jitsi (Telemedicine)
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
NEXT_PUBLIC_JITSI_ROOM_PREFIX=aidfusion-

# Gemini API
GEMINI_API_KEY=AIzaSyD_jh0kkKn2UkermrKYWvdhmpKW6cLBzN0
```

### Step 3: Setup External Services

#### Gmail (for Email Notifications)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Generate an App Password for Gmail
4. Use this password as `EMAIL_PASSWORD`

#### Twilio (for SMS Notifications)
1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Buy a phone number for SMS
4. Update `.env.local` with your credentials

#### AWS S3 (for Medical Records Storage)
1. Create an AWS account
2. Create an IAM user with S3 permissions
3. Create an S3 bucket for medical records
4. Update `.env.local` with your AWS credentials

#### Jitsi (for Telemedicine)
- Jitsi is free and requires no setup
- It's self-hosted at `meet.jit.si`
- Rooms are created dynamically

---

## 📁 File Structure

New files created:

```
src/
├── lib/
│   ├── models/
│   │   └── user.ts                 # User data models
│   ├── db.ts                        # Database collections setup
│   ├── two-factor.ts               # 2FA utilities
│   └── notifications.ts            # Email/SMS notifications
├── app/
│   └── api/
│       ├── user/
│       │   ├── profile/
│       │   │   └── route.ts        # User profile API
│       │   └── medical-records/
│       │       └── route.ts        # Medical records API
│       ├── auth/
│       │   └── 2fa/
│       │       ├── setup/
│       │       │   └── route.ts    # 2FA setup API
│       │       └── verify/
│       │           └── route.ts    # 2FA verify API
│       └── consultations/
│           └── route.ts            # Telemedicine API
└── components/
    └── app/
        ├── profile-management.tsx  # User profile UI
        ├── two-factor-setup.tsx    # 2FA setup UI
        ├── medical-records.tsx     # Medical records UI
        └── telemedicine.tsx        # Telemedicine UI
```

---

## 🔌 Integration Points

### 1. Extended User Profiles
- **Location**: `/src/components/app/profile-management.tsx`
- **API**: `POST /api/user/profile`, `GET /api/user/profile`
- **Features**:
  - Store health metrics
  - Emergency contacts
  - Insurance information
  - Preferences (language, timezone, notifications)

### 2. Two-Factor Authentication
- **Location**: `/src/components/app/two-factor-setup.tsx`
- **API**: `GET /api/auth/2fa/setup`, `POST /api/auth/2fa/verify`
- **Features**:
  - TOTP-based authentication
  - QR code generation
  - Backup codes
  - SMS option available

### 3. Email/SMS Notifications
- **Location**: `/src/lib/notifications.ts`
- **Features**:
  - Welcome emails
  - 2FA codes
  - Medication reminders
  - Appointment reminders
  - Weekly health digest
  - SMS notifications via Twilio

### 4. Medical Records Management
- **Location**: `/src/components/app/medical-records.tsx`
- **API**: `GET/POST /api/user/medical-records`
- **Features**:
  - Upload medical documents
  - Organize by type
  - OCR support (ready for integration)
  - Secure storage
  - File metadata tracking

### 5. Telemedicine Integration
- **Location**: `/src/components/app/telemedicine.tsx`
- **API**: `GET/POST /api/consultations`
- **Features**:
  - Schedule consultations
  - Video call integration with Jitsi
  - Consultation recording
  - Doctor/patient matching
  - Calendar integration

---

## 🛠️ Development Setup

### Update App Shell

Add the new features to your app shell (`src/components/app/app-shell.tsx`):

```tsx
import ProfileManagement from '@/components/app/profile-management';
import TwoFactorSetup from '@/components/app/two-factor-setup';
import MedicalRecords from '@/components/app/medical-records';
import TelemedicineConsultations from '@/components/app/telemedicine';

// Add to VIEW_DEFINITIONS array:
{
  id: 'profile',
  label: 'Profile Settings',
  icon: User,
  roles: ['user', 'admin'],
  heading: 'Manage your health profile',
},
{
  id: '2fa',
  label: 'Security',
  icon: Shield,
  roles: ['user', 'admin'],
  heading: 'Secure your account',
},
{
  id: 'medical-records',
  label: 'Medical Records',
  icon: FileText,
  roles: ['user', 'admin'],
  heading: 'Your medical documents',
},
{
  id: 'telemedicine',
  label: 'Consultations',
  icon: Video,
  roles: ['user', 'admin'],
  heading: 'Video consultations',
},
```

---

## 🧪 Testing

### Test Email Notifications

```typescript
import { sendWelcomeEmail } from '@/lib/notifications';

await sendWelcomeEmail('user@example.com', 'John');
```

### Test 2FA Setup

```typescript
import { generateTOTPSecret, verifyTOTPToken } from '@/lib/two-factor';

const { secret, qrCode } = await generateTOTPSecret('user@example.com');
const isValid = verifyTOTPToken(secret, '123456');
```

### Test Medical Records Upload

```bash
curl -X POST http://localhost:3000/api/user/medical-records \
  -F "file=@document.pdf" \
  -F "recordType=lab-report" \
  -F "description=Blood test results"
```

---

## 🔐 Security Considerations

1. **2FA Implementation**:
   - Store secrets hashed in database
   - Use time-based OTP (TOTP) standard
   - Implement backup codes for recovery

2. **Medical Records**:
   - Encrypt files at rest
   - Use HTTPS for file transfers
   - Implement access controls

3. **Telemedicine**:
   - Use end-to-end encryption (Jitsi handles this)
   - HIPAA-compliant data handling
   - Secure room ID generation

4. **Email/SMS**:
   - Never log sensitive data
   - Rate-limit notifications
   - Verify phone numbers before SMS

---

## 📊 Database Collections

Your MongoDB will have these collections:

```
aidfusion
├── users                    # User authentication
├── user_profiles           # Extended user data
├── two_factor_secrets      # 2FA secrets
├── medical_records         # Medical documents metadata
├── notifications           # Notification history
└── consultations          # Telemedicine consultations
```

---

## 🚢 Deployment Checklist

- [ ] All environment variables set on production
- [ ] Email service credentials configured
- [ ] SMS service credentials configured
- [ ] S3 bucket created and configured
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] HIPAA compliance verified
- [ ] Security audit completed

---

## 📞 Support

For questions or issues:
1. Check the relevant component/API file
2. Review error logs
3. Test with curl commands
4. Check environment variables

---

## 🎯 Next Steps

1. Complete environment variable setup
2. Install all dependencies
3. Run database migrations
4. Test each feature individually
5. Integrate with app shell
6. Deploy to staging
7. Run security audit
8. Deploy to production

---

**Last Updated**: November 13, 2025
**Version**: 1.0
