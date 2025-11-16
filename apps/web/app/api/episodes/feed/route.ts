import { NextResponse } from 'next/server';
import { EpisodeModel } from '@/lib/db/models';
import { EpisodeWithProgress } from '@video-library/shared';

// Extended type for feed episodes with additional metadata
interface FeedEpisode extends EpisodeWithProgress {
  seriesId: string;
  seriesTitle: string;
  seriesThumbnail: string;
  seasonNumber: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get feed episodes with series metadata
    const episodes = EpisodeModel.getFeed(limit, offset) as FeedEpisode[];
    
    return NextResponse.json({
      episodes,
      hasMore: episodes.length === limit,
      nextOffset: offset + episodes.length
    });
  } catch (error) {
    console.error('Failed to fetch episode feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
