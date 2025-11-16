import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/database';
import { SeriesModel } from '@/lib/db/models';

// Initialize database on server start
initDatabase();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const series = SeriesModel.getWithProgress(id);
    
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}
