import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUserProfilesCollection } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { UserProfile } from '@/lib/models/user';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profilesCollection = await getUserProfilesCollection();
    const profile = await profilesCollection.findOne({ userId: session.sub });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Remove sensitive data before sending
    const safeProfile = { ...profile };
    delete (safeProfile as any).twoFactorSecret;

    return NextResponse.json({ profile: safeProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const profilesCollection = await getUserProfilesCollection();

    const profile: UserProfile = {
      userId: session.sub,
      email: session.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      phone: body.phone,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender,
      bloodType: body.bloodType,
      height: body.height,
      weight: body.weight,
      allergies: body.allergies || [],
      chronicConditions: body.chronicConditions || [],
      currentMedications: body.currentMedications || [],
      emergencyContacts: body.emergencyContacts || [],
      insuranceInfo: body.insuranceInfo,
      preferences: {
        language: body.preferences?.language || 'en',
        timezone: body.preferences?.timezone || 'UTC',
        notificationPreferences: body.preferences?.notificationPreferences || {
          emailNotifications: true,
          smsNotifications: false,
          medicationReminders: true,
          appointmentReminders: true,
          healthTips: true,
          weeklyDigest: false,
          marketing: false,
        },
        theme: body.preferences?.theme || 'system',
        twoFactorEnabled: body.preferences?.twoFactorEnabled || false,
        twoFactorMethod: body.preferences?.twoFactorMethod || 'none',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await profilesCollection.updateOne(
      { userId: session.sub },
      { $set: profile },
      { upsert: true }
    );

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const profilesCollection = await getUserProfilesCollection();

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Parse dates if provided
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth);
    }

    const result = await profilesCollection.findOneAndUpdate(
      { userId: session.sub },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: result.value,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
