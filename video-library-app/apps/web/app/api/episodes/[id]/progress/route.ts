import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/database';
import { EpisodeModel } from '@/lib/db/models';

// Initialize database on server start
initDatabase();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { progress } = body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 });
    }
    
    EpisodeModel.updateProgress(id, progress);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating episode progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
