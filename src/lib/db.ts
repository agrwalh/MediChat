import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'aidfusion';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// User Profiles Collection
export async function getUserProfilesCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  
  const collection = db.collection('user_profiles');
  
  // Create indexes
  await collection.createIndex({ userId: 1 }, { unique: true });
  await collection.createIndex({ email: 1 });
  await collection.createIndex({ createdAt: 1 });
  
  return collection;
}

// Two-Factor Secrets Collection
export async function getTwoFactorCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  
  const collection = db.collection('two_factor_secrets');
  
  // Create indexes
  await collection.createIndex({ userId: 1 }, { unique: true });
  await collection.createIndex({ createdAt: 1 });
  await collection.createIndex({ verifiedAt: 1 });
  
  return collection;
}

// Medical Records Collection
export async function getMedicalRecordsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  
  const collection = db.collection('medical_records');
  
  // Create indexes
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ recordType: 1 });
  await collection.createIndex({ uploadedAt: 1 });
  await collection.createIndex({ userId: 1, uploadedAt: -1 });
  
  return collection;
}

// Notifications Collection
export async function getNotificationsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  
  const collection = db.collection('notifications');
  
  // Create indexes
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ createdAt: 1 });
  await collection.createIndex({ read: 1 });
  await collection.createIndex({ userId: 1, createdAt: -1 });
  
  return collection;
}

// Telemedicine Consultations Collection
export async function getConsultationsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  
  const collection = db.collection('consultations');
  
  // Create indexes
  await collection.createIndex({ patientId: 1 });
  await collection.createIndex({ doctorId: 1 });
  await collection.createIndex({ scheduledAt: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ patientId: 1, scheduledAt: -1 });
  
  return collection;
}
