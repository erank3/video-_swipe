import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/database';
import { SeriesModel } from '@/lib/db/models';

// Initialize database on server start
initDatabase();

export async function GET() {
  try {
    const series = SeriesModel.getAllWithProgress();
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}
