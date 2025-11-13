# 🎯 VISUAL GUIDE - Where Are The Features?

## Your AidFusion Dashboard

When you log in and go to the dashboard at `http://localhost:9002/dashboard`, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│                        AidFusion Dashboard                   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                                │
│  SIDEBAR     │  MAIN CONTENT AREA                           │
│              │                                                │
│  ☐ AI Doctor│  ┌──────────────────────────────────────┐    │
│  ☐ Mental   │  │  Feature Title                        │    │
│    Health   │  │  Feature Description                 │    │
│  ☐ Symptom  │  │                                       │    │
│    Analyzer │  │  [Forms/Content for Selected Feature] │    │
│  ☐ Medicine │  │                                       │    │
│    Info     │  │                                       │    │
│  ☐ Pharmacy │  └──────────────────────────────────────┘    │
│  ☐ Health   │                                                │
│    Reports  │                                                │
│  ━━━━━━━━━━ │  ← NEW FEATURES BELOW ↓                       │
│  ☐ My       │  ← "My Profile" (NEW!)                        │
│    Profile  │                                                │
│  ☐ 2FA      │  ← "Two-Factor Auth" (NEW!)                   │
│  ☐ Medical  │  ← "Medical Records" (NEW!)                   │
│    Records  │                                                │
│  ☐ Tele     │  ← "Telemedicine" (NEW!)                      │
│    medicine │                                                │
│  ━━━━━━━━━━ │                                                │
│  ☐ Admin    │  ← Admin only                                  │
│  ☐ Controls │  ← Admin only                                  │
│              │                                                │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🗂️ File Structure - Where Everything Lives

### Backend Code

```
src/lib/
├── notifications.ts          ← EMAIL & SMS SERVICE ⚡
│   - sendWelcomeEmail()
│   - sendEmailNotification()
│   - sendSMSNotification()
│   - sendTwoFactorEmail()
│   - sendTwoFactorSMS()
│   - sendMedicationReminderEmail()
│   - sendAppointmentReminderEmail()
│   - sendHealthDigestEmail()
│
├── two-factor.ts            ← 2FA/TOTP SERVICE 🔐
│   - generateTOTPSecret()
│   - verifyTOTPToken()
│   - generateBackupCodes()
│   - verifyBackupCode()
│   - consumeBackupCode()
│   - hashBackupCode()
│
├── models/user.ts           ← DATA MODELS 📊
│   - UserProfile interface
│   - Medication interface
│   - EmergencyContact interface
│   - InsuranceInfo interface
│   - MedicalRecord interface
│   - Consultation interface
│   - TwoFactorSecret interface
│
├── db.ts                    ← DATABASE SETUP 🗄️
│   - connectToDatabase()
│   - getUserProfilesCollection()
│   - getMedicalRecordsCollection()
│   - getTwoFactorCollection()
│   - getConsultationsCollection()
│
└── mongodb.ts               ← MONGODB CONNECTION
    - getMongoClient()
    - getUsersCollection()
```

### API Routes

```
src/app/api/
├── user/
│   ├── profile/
│   │   └── route.ts         ← PROFILE API ⚙️
│   │       - GET    /api/user/profile
│   │       - POST   /api/user/profile
│   │       - PUT    /api/user/profile
│   │
│   └── medical-records/
│       └── route.ts         ← MEDICAL RECORDS API 📄
│           - GET    /api/user/medical-records
│           - POST   /api/user/medical-records
│
├── auth/
│   └── 2fa/
│       └── setup/
│           └── route.ts     ← 2FA SETUP API 🔑
│               - GET    /api/auth/2fa/setup
│               - POST   /api/auth/2fa/verify
│
├── consultations/
│   └── route.ts             ← TELEMEDICINE API 📹
│       - GET    /api/consultations
│       - POST   /api/consultations
│
└── admin/
    └── users/
        ├── route.ts         ← ADMIN API 👥
        │   - GET    /api/admin/users
        │   - PATCH  /api/admin/users/{id}
        │
        └── [id]/route.ts
```

### Frontend Components

```
src/components/app/
├── profile-management.tsx    ← MY PROFILE COMPONENT 👤
│   - Personal information form
│   - Health metrics section
│   - Preferences section
│   - API integration: /api/user/profile
│
├── two-factor-setup.tsx      ← 2FA COMPONENT 🔒
│   - Step 1: Setup instructions
│   - Step 2: QR code + backup codes
│   - Step 3: Verify code + success
│   - API integration: /api/auth/2fa/setup
│
├── medical-records.tsx       ← MEDICAL RECORDS COMPONENT 📋
│   - File upload form
│   - Record type selector
│   - Records list with filtering
│   - API integration: /api/user/medical-records
│
├── telemedicine.tsx          ← TELEMEDICINE COMPONENT 🎥
│   - Consultation booking form
│   - Consultations list
│   - Status tracking (scheduled/in-progress/completed)
│   - Jitsi Meet integration
│   - API integration: /api/consultations
│
└── admin-controls.tsx        ← ADMIN CONTROLS (already existed)
    - User management
    - Role promotion/revocation
    - API integration: /api/admin/users
```

---

## 🔌 How Data Flows

### Example: When User Fills Profile Form

```
1. USER FILLS FORM
   │
   ├─ React Component (profile-management.tsx)
   │  └─ Form state with React Hook Form
   │
2. USER CLICKS SUBMIT
   │
   ├─ Component calls: POST /api/user/profile
   │  └─ Sends JSON: { firstName, lastName, height, weight, ... }
   │
3. API RECEIVES REQUEST
   │
   ├─ API Route (src/app/api/user/profile/route.ts)
   │  ├─ Verify session (await getSession())
   │  ├─ Connect to MongoDB (await getUserProfilesCollection())
   │  └─ Insert/Update profile data
   │
4. DATABASE STORES DATA
   │
   ├─ MongoDB Collection: user_profiles
   │  └─ Document: { userId, firstName, lastName, height, weight, ... }
   │
5. API RETURNS RESPONSE
   │
   ├─ Component receives: { success: true, profile: {...} }
   │  └─ Shows toast: "Profile saved!"
   │
6. USER SEES SUCCESS MESSAGE ✅
```

---

## 📧 Email Service Integration

The `notifications.ts` file handles all email sending:

### When Does Email Get Sent?

1. **Welcome Email** - When user signs up
2. **2FA Code Email** - When user enables 2FA verification via email
3. **Medication Reminder** - Can be triggered on schedule
4. **Appointment Reminder** - Before scheduled consultations
5. **Health Digest** - Weekly summary email

### How to Send Email (Example Code)

```typescript
// In any API route or backend function:
import { sendWelcomeEmail, sendMedicationReminderEmail } from '@/lib/notifications';

// Send welcome email
await sendWelcomeEmail(userEmail, firstName);

// Send medication reminder
await sendMedicationReminderEmail(
  userEmail,
  "Aspirin",
  "100mg tablet"
);
```

### To Enable Email Sending:

1. Open `.env.local`
2. Configure Gmail:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```
3. Save file
4. Restart dev server (npm run dev)
5. Test by signing up new user

---

## 🔑 2FA Service Integration

The `two-factor.ts` file handles all 2FA logic:

### 2FA Flow

```
1. User clicks "Enable 2FA"
   │
2. Backend generates:
   ├─ TOTP secret (base32 encoded)
   ├─ QR code image (for scanning)
   └─ 10 backup codes (for recovery)
   │
3. Frontend displays:
   ├─ QR code image
   ├─ Manual entry code
   └─ Backup codes list
   │
4. User scans QR with authenticator app (Google Authenticator, Authy, etc.)
   │
5. User enters 6-digit code from app
   │
6. Backend verifies:
   ├─ Validates TOTP token
   ├─ Stores secret in DB
   └─ Saves backup codes
   │
7. 2FA enabled! ✅
```

---

## 📄 Medical Records Service

The `medical-records.tsx` component handles document uploads:

### Supported File Types

- **PDF** - Scan documents, reports
- **DOC/DOCX** - Text documents
- **JPG/PNG** - Scanned images, photos

### Record Categories

- Prescription
- Lab Report
- Discharge Summary
- Imaging
- Other

### Storage Flow

```
1. User selects file
2. Frontend validates:
   ├─ File size (max 10MB)
   ├─ File type (PDF, DOC, JPG, PNG)
   └─ Record type (required)
3. Frontend sends FormData to API
4. API stores:
   ├─ File metadata in MongoDB
   ├─ File path/URL for retrieval
   └─ Timestamps and tags
5. User can filter & search records
```

---

## 🎥 Telemedicine Service

The `telemedicine.tsx` component handles video consultations:

### How Telemedicine Works

```
1. User books consultation:
   ├─ Select doctor name & email
   ├─ Choose date & time
   ├─ Add notes (optional)
   │
2. Backend generates:
   ├─ Unique room ID (format: room-{timestamp}-{random})
   └─ Jitsi Meet URL
   │
3. Consultation stored in DB:
   ├─ Patient ID & Doctor ID
   ├─ Scheduled time
   ├─ Status: "scheduled"
   │
4. User can "Join Consultation":
   ├─ Clicks button → Opens Jitsi room
   ├─ Video call starts
   ├─ Status changes to: "in-progress"
   │
5. After call ends:
   ├─ User marks as "completed"
   ├─ Recording saved (if enabled)
   └─ Notes recorded
```

---

## ✨ All Together: Complete Feature List

| Feature | File | Type | Access |
|---------|------|------|--------|
| **My Profile** | profile-management.tsx | Component | All users |
| **2FA Setup** | two-factor-setup.tsx | Component | All users |
| **Medical Records** | medical-records.tsx | Component | All users |
| **Telemedicine** | telemedicine.tsx | Component | All users |
| **Profile API** | /api/user/profile | Route | All users |
| **Records API** | /api/user/medical-records | Route | All users |
| **2FA API** | /api/auth/2fa/setup | Route | All users |
| **Consultations API** | /api/consultations | Route | All users |
| **Email Service** | notifications.ts | Utility | Backend |
| **2FA Service** | two-factor.ts | Utility | Backend |
| **Data Models** | models/user.ts | Types | All |
| **DB Setup** | db.ts | Utility | Backend |

---

## 🚀 Quick Start

1. **Login**: `http://localhost:9002/login`
   - Email: `harsh@gmail.com`
   - Password: `harsh1`

2. **Go to Dashboard**: `http://localhost:9002/dashboard`

3. **Try Features**:
   - Sidebar → "My Profile" → Fill form
   - Sidebar → "Two-Factor Auth" → Enable 2FA
   - Sidebar → "Medical Records" → Upload file
   - Sidebar → "Telemedicine" → Schedule call

4. **Check Email**: Look for test emails (if Gmail configured)

5. **Check MongoDB**: View data with MongoDB Compass

---

**Everything is fully integrated and ready to use!** 🎉
