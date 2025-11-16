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
    const { id: episodeId } = await params;
    EpisodeModel.markAsWatched(episodeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking episode as watched:', error);
    return NextResponse.json({ error: 'Failed to update episode' }, { status: 500 });
  }
}
