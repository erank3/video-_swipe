import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/database';
import { UserStatsModel } from '@/lib/db/models';
import { calculateLevelProgress } from '@video-library/shared';

// Initialize database on server start
initDatabase();

export async function GET() {
  try {
    const stats = UserStatsModel.get();
    const levelProgress = calculateLevelProgress(stats.totalXP);
    
    return NextResponse.json({
      ...stats,
      levelProgress
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
