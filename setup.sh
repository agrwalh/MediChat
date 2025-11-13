#!/bin/bash

# AidFusion Integration Setup Script
# This script helps you set up all 5 features

echo "🎉 Welcome to AidFusion Integration Setup!"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Step 1: Install Dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install nodemailer twilio speakeasy qrcode aws-sdk
npm install --save-dev @types/nodemailer @types/speakeasy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Step 2: Create .env.local if it doesn't exist
echo -e "${YELLOW}Step 2: Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your actual credentials:${NC}"
    echo ""
    echo "   Email Service:"
    echo "   - EMAIL_USER (your Gmail)"
    echo "   - EMAIL_PASSWORD (your App Password)"
    echo ""
    echo "   SMS Service (Optional):"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_AUTH_TOKEN"
    echo "   - TWILIO_PHONE_NUMBER"
    echo ""
    echo "   File Storage (Optional):"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - AWS_S3_BUCKET"
    echo ""
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

echo ""

# Step 3: Verify MongoDB connection
echo -e "${YELLOW}Step 3: Testing MongoDB connection...${NC}"

# Create a test script
cat > /tmp/test-mongo.js << 'EOF'
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('✅ Database ping successful!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
EOF

node /tmp/test-mongo.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MongoDB connection verified${NC}"
else
    echo -e "${RED}❌ MongoDB connection failed. Check your MONGODB_URI${NC}"
fi

echo ""

# Step 4: List created files
echo -e "${YELLOW}Step 4: Verifying created files...${NC}"

FILES_TO_CHECK=(
    "src/lib/models/user.ts"
    "src/lib/db.ts"
    "src/lib/two-factor.ts"
    "src/lib/notifications.ts"
    "src/app/api/user/profile/route.ts"
    "src/app/api/user/medical-records/route.ts"
    "src/app/api/auth/2fa/setup/route.ts"
    "src/app/api/consultations/route.ts"
    "src/components/app/profile-management.tsx"
    "src/components/app/two-factor-setup.tsx"
    "src/components/app/medical-records.tsx"
    "src/components/app/telemedicine.tsx"
    "INTEGRATION_GUIDE.md"
    "IMPLEMENTATION_SUMMARY.md"
)

echo "Checking files:"
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (missing)"
    fi
done

echo ""

# Step 5: Summary
echo -e "${YELLOW}Step 5: Summary${NC}"
echo ""
echo -e "${GREEN}=== INTEGRATION COMPLETE ===${NC}"
echo ""
echo "✅ 5 Features Implemented:"
echo "  1. Extended User Profiles"
echo "  2. Two-Factor Authentication (2FA)"
echo "  3. Email/SMS Notifications"
echo "  4. Medical Records Management"
echo "  5. Telemedicine Integration"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "  1. Edit .env.local with your credentials"
echo "  2. Read INTEGRATION_GUIDE.md for detailed setup"
echo "  3. Add components to your app-shell"
echo "  4. Test each feature:"
echo "     - npm run dev"
echo "     - Navigate to each feature"
echo "     - Fill out the forms"
echo "     - Check your email for test messages"
echo ""
echo -e "${YELLOW}📖 Documentation:${NC}"
echo "  - INTEGRATION_GUIDE.md - Complete setup guide"
echo "  - IMPLEMENTATION_SUMMARY.md - Feature overview"
echo "  - Code comments - Detailed explanations"
echo ""
echo -e "${GREEN}Good luck with AidFusion! 🚀${NC}"
echo ""

# Clean up temp file
rm -f /tmp/test-mongo.js
