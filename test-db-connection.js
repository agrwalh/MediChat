#!/usr/bin/env node

/**
 * Test MongoDB Connection and Create Admin User
 * Run: node test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  console.log('🔄 Testing MongoDB Connection...');
  console.log(`📍 Connecting to: ${uri.split('@')[1]}`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(process.env.MONGODB_DB || 'aidfusion');
    const result = await db.command({ ping: 1 });
    console.log('✅ Database ping successful');

    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('\n🔧 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = {
        email: 'admin@aidfusion.com',
        passwordHash: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(adminUser);
      console.log('✅ Admin user created!');
      console.log('   Email: admin@aidfusion.com');
      console.log('   Password: admin123');
      console.log(`   ID: ${result.insertedId}`);
    } else {
      console.log('\n📝 Existing users:');
      const users = await usersCollection.find({}, { projection: { passwordHash: 0 } }).toArray();
      users.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    console.log('\n✅ All checks passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check if MongoDB URI is correct in .env.local');
    console.error('   2. Verify MongoDB cluster is running');
    console.error('   3. Check if IP address is whitelisted in MongoDB Atlas');
    console.error('   4. Ensure network connection is stable');
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
