import { create } from 'zustand';
import { 
  SeriesWithProgress, 
  UserStats, 
  Achievement, 
  UserAchievement,
  FilterOption,
  SortOption 
} from '@video-library/shared';

interface AppState {
  // Data
  series: SeriesWithProgress[];
  currentSeries: SeriesWithProgress | null;
  userStats: UserStats | null;
  achievements: (Achievement & UserAchievement)[];
  
  // UI State
  filterOption: FilterOption;
  sortOption: SortOption;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSeries: (series: SeriesWithProgress[]) => void;
  setCurrentSeries: (series: SeriesWithProgress | null) => void;
  setUserStats: (stats: UserStats) => void;
  setAchievements: (achievements: (Achievement & UserAchievement)[]) => void;
  setFilterOption: (option: FilterOption) => void;
  setSortOption: (option: SortOption) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getFilteredSeries: () => SeriesWithProgress[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  series: [],
  currentSeries: null,
  userStats: null,
  achievements: [],
  filterOption: 'all',
  sortOption: 'alphabetical',
  isLoading: false,
  error: null,
  
  // Actions
  setSeries: (series) => set({ series }),
  setCurrentSeries: (currentSeries) => set({ currentSeries }),
  setUserStats: (userStats) => set({ userStats }),
  setAchievements: (achievements) => set({ achievements }),
  setFilterOption: (filterOption) => set({ filterOption }),
  setSortOption: (sortOption) => set({ sortOption }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Computed
  getFilteredSeries: () => {
    const { series, filterOption, sortOption } = get();
    
    // Filter
    let filtered = series;
    switch (filterOption) {
      case 'watched':
        filtered = series.filter(s => s.progress.percentage === 100);
        break;
      case 'unwatched':
        filtered = series.filter(s => s.progress.watchedEpisodes === 0);
        break;
      case 'in_progress':
        filtered = series.filter(s => 
          s.progress.watchedEpisodes > 0 && s.progress.percentage < 100
        );
        break;
    }
    
    // Sort
    const sorted = [...filtered];
    switch (sortOption) {
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        sorted.sort((a, b) => b.progress.percentage - a.progress.percentage);
        break;
      case 'release_date':
        sorted.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      case 'recently_watched':
        // This would need last watched date tracking
        break;
    }
    
    return sorted;
  }
}));
