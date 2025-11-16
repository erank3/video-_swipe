// Core data types for the video library app

export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalSeasons: number;
  genre: string[];
  releaseYear: number;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  episodeCount: number;
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonId: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  duration: number; // in seconds
  thumbnail: string;
  videoUrl: string;
  releaseDate: string;
}

export interface UserProgress {
  episodeId: string;
  watched: boolean;
  watchedAt?: string;
  progress: number; // percentage watched (0-100)
}

export interface UserStats {
  totalXP: number;
  level: number;
  totalEpisodesWatched: number;
  totalWatchTime: number; // in seconds
  currentStreak: number; // days
  longestStreak: number; // days
  lastWatchedDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: 'episodes_watched' | 'series_completed' | 'seasons_completed' | 'streak_days' | 'specific_action';
    value: number;
    metadata?: any;
  };
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number; // 0-100
  isUnlocked: boolean;
}

// API Response types
export interface SeriesWithProgress extends Series {
  seasons: SeasonWithProgress[];
  progress: {
    watchedEpisodes: number;
    totalEpisodes: number;
    percentage: number;
  };
}

export interface SeasonWithProgress extends Season {
  episodes: EpisodeWithProgress[];
  progress: {
    watchedEpisodes: number;
    percentage: number;
  };
}

export interface EpisodeWithProgress extends Episode {
  watched: boolean;
  watchedAt?: string;
  progress: number;
}

// Gamification constants
export const XP_PER_EPISODE = 10;
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

export const calculateLevel = (xp: number): number => {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
};

export const calculateLevelProgress = (xp: number): number => {
  const currentLevelXP = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  const progressInLevel = xp - currentLevelXP;
  return (progressInLevel / XP_PER_LEVEL) * 100;
};

// Filter and sort options
export type FilterOption = 'all' | 'watched' | 'unwatched' | 'in_progress';
export type SortOption = 'release_date' | 'alphabetical' | 'progress' | 'recently_watched';
