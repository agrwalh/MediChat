import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMedicalRecordsCollection } from '@/lib/db';
import { getSession } from '@/lib/session';

export interface MedicalRecord {
  _id?: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  recordType: 'prescription' | 'lab-report' | 'discharge-summary' | 'imaging' | 'other';
  uploadedAt: Date;
  description?: string;
  fileUrl: string;
  storagePath: string;
  ocrText?: string; // Text extracted via OCR
  tags?: string[];
}

/**
 * GET /api/user/medical-records
 * Retrieve user's medical records
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const recordType = url.searchParams.get('recordType');

    const recordsCollection = await getMedicalRecordsCollection();

    const query: any = { userId: session.sub };
    if (recordType) {
      query.recordType = recordType;
    }

    const records = await recordsCollection
      .find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await recordsCollection.countDocuments(query);

    return NextResponse.json({
      records: records.map((record) => ({
        ...record,
        _id: record._id?.toString(),
      })),
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/medical-records
 * Upload a new medical record
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const recordType = formData.get('recordType') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!recordType) {
      return NextResponse.json({ error: 'Record type is required' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // In production, you would upload to S3 or similar
    // For now, we'll store the file metadata and path
    const storagePath = `medical-records/${session.sub}/${Date.now()}-${file.name}`;
    const fileUrl = `/api/files/${storagePath}`;

    const recordsCollection = await getMedicalRecordsCollection();

    const record: MedicalRecord = {
      userId: session.sub,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      recordType: recordType as any,
      uploadedAt: new Date(),
      description,
      fileUrl,
      storagePath,
      tags,
    };

    const result = await recordsCollection.insertOne(record as any);

    return NextResponse.json(
      {
        message: 'Medical record uploaded successfully',
        record: {
          _id: result.insertedId.toString(),
          ...record,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading medical record:', error);
    return NextResponse.json(
      { error: 'Failed to upload medical record' },
      { status: 500 }
    );
  }
}
