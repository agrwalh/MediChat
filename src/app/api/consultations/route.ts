import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getConsultationsCollection } from '@/lib/db';
import { getSession } from '@/lib/session';

export interface Consultation {
  _id?: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  patientEmail: string;
  doctorEmail: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  roomId: string; // Jitsi/Twilio room ID
  notes?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/consultations
 * Get user's consultations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const upcoming = url.searchParams.get('upcoming') === 'true';

    const consultationsCollection = await getConsultationsCollection();

    const query: any = {
      $or: [{ patientId: session.sub }, { doctorId: session.sub }],
    };

    if (status) {
      query.status = status;
    }

    if (upcoming) {
      query.scheduledAt = { $gte: new Date() };
    }

    const consultations = await consultationsCollection
      .find(query)
      .sort({ scheduledAt: -1 })
      .toArray();

    return NextResponse.json({
      consultations: consultations.map((c) => ({
        ...c,
        _id: c._id?.toString(),
      })),
      total: consultations.length,
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consultations
 * Schedule a new consultation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      doctorId,
      doctorName,
      doctorEmail,
      scheduledAt,
      duration = 30,
      notes,
    } = body;

    if (!doctorId || !doctorName || !doctorEmail || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const consultationsCollection = await getConsultationsCollection();

    // Generate unique room ID
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const consultation: Consultation = {
      patientId: session.sub,
      doctorId,
      patientName: body.patientName || 'Patient',
      doctorName,
      patientEmail: session.email,
      doctorEmail,
      scheduledAt: new Date(scheduledAt),
      duration,
      status: 'scheduled',
      roomId,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await consultationsCollection.insertOne(consultation as any);

    return NextResponse.json(
      {
        message: 'Consultation scheduled successfully',
        consultation: {
          _id: result.insertedId.toString(),
          ...consultation,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error scheduling consultation:', error);
    return NextResponse.json(
      { error: 'Failed to schedule consultation' },
      { status: 500 }
    );
  }
}
