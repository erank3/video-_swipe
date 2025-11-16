import { 
  SeriesWithProgress, 
  UserStats, 
  Achievement, 
  UserAchievement 
} from '@video-library/shared';

// Use localhost for development - update for production
const API_BASE_URL = 'http://localhost:3600/api';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }
  
  // Series endpoints
  async getAllSeries(): Promise<SeriesWithProgress[]> {
    return this.fetch<SeriesWithProgress[]>('/series');
  }
  
  async getSeriesById(id: string): Promise<SeriesWithProgress> {
    return this.fetch<SeriesWithProgress>(`/series/${id}`);
  }
  
  // Episode endpoints
  async markEpisodeAsWatched(episodeId: string): Promise<void> {
    await this.fetch(`/episodes/${episodeId}/watch`, {
      method: 'POST',
    });
  }
  
  // MVP: Progress tracking is disabled - this method is not currently used
  async updateEpisodeProgress(episodeId: string, progress: number): Promise<void> {
    await this.fetch(`/episodes/${episodeId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    });
  }
  
  // Stats endpoints
  async getUserStats(): Promise<UserStats & { levelProgress: number }> {
    return this.fetch<UserStats & { levelProgress: number }>('/stats');
  }
  
  // Achievement endpoints
  async getAchievements(): Promise<(Achievement & UserAchievement)[]> {
    return this.fetch<(Achievement & UserAchievement)[]>('/achievements');
  }
  
  // Feed endpoints
  async getVideoFeed(limit: number = 20, offset: number = 0): Promise<{
    episodes: (EpisodeWithProgress & {
      seriesId: string;
      seriesTitle: string;
      seriesThumbnail: string;
      seasonNumber: number;
    })[];
    hasMore: boolean;
    nextOffset: number;
  }> {
    return this.fetch(`/episodes/feed?limit=${limit}&offset=${offset}`);
  }
}

export const api = new ApiService();
