import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/database';
import { AchievementModel } from '@/lib/db/models';

// Initialize database on server start
initDatabase();

export async function GET() {
  try {
    const achievements = AchievementModel.getAllWithProgress();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
