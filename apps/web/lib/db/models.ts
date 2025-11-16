import db from './database';
import { 
  Series, Season, Episode, UserProgress, UserStats, 
  Achievement, UserAchievement, SeriesWithProgress,
  SeasonWithProgress, EpisodeWithProgress, XP_PER_EPISODE
} from '@video-library/shared';

// Series Model
export const SeriesModel = {
  getAll(): Series[] {
    const rows = db.prepare('SELECT * FROM series ORDER BY title').all();
    return rows.map((row: any) => ({
      ...row,
      genre: JSON.parse(row.genre || '[]')
    }));
  },

  getById(id: string): Series | null {
    const row = db.prepare('SELECT * FROM series WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row as any,
      genre: JSON.parse((row as any).genre || '[]')
    };
  },

  getWithProgress(id: string): SeriesWithProgress | null {
    const series = this.getById(id);
    if (!series) return null;

    const seasons = SeasonModel.getBySeriesWithProgress(id);
    const totalEpisodes = seasons.reduce((sum, season) => sum + season.episodeCount, 0);
    const watchedEpisodes = seasons.reduce((sum, season) => 
      sum + season.progress.watchedEpisodes, 0
    );

    return {
      ...series,
      seasons,
      progress: {
        watchedEpisodes,
        totalEpisodes,
        percentage: totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0
      }
    };
  },

  getAllWithProgress(): SeriesWithProgress[] {
    const seriesList = this.getAll();
    return seriesList.map(series => this.getWithProgress(series.id)!).filter(Boolean);
  }
};

// Season Model
export const SeasonModel = {
  getBySeries(seriesId: string): Season[] {
    return db.prepare(
      'SELECT * FROM seasons WHERE seriesId = ? ORDER BY seasonNumber'
    ).all(seriesId) as Season[];
  },

  getBySeriesWithProgress(seriesId: string): SeasonWithProgress[] {
    const seasons = this.getBySeries(seriesId);
    return seasons.map(season => {
      const episodes = EpisodeModel.getBySeasonWithProgress(season.id);
      const watchedEpisodes = episodes.filter(ep => ep.watched).length;
      
      return {
        ...season,
        episodes,
        progress: {
          watchedEpisodes,
          percentage: season.episodeCount > 0 
            ? (watchedEpisodes / season.episodeCount) * 100 : 0
        }
      };
    });
  }
};

// Episode Model
export const EpisodeModel = {
  getBySeason(seasonId: string): Episode[] {
    return db.prepare(
      'SELECT * FROM episodes WHERE seasonId = ? ORDER BY episodeNumber'
    ).all(seasonId) as Episode[];
  },

  getBySeasonWithProgress(seasonId: string): EpisodeWithProgress[] {
    const query = `
      SELECT e.*, 
        COALESCE(up.watched, 0) as watched,
        up.watchedAt,
        COALESCE(up.progress, 0) as progress
      FROM episodes e
      LEFT JOIN user_progress up ON e.id = up.episodeId
      WHERE e.seasonId = ?
      ORDER BY e.episodeNumber
    `;
    
    return db.prepare(query).all(seasonId) as EpisodeWithProgress[];
  },

  getById(id: string): Episode | null {
    return db.prepare('SELECT * FROM episodes WHERE id = ?').get(id) as Episode | null;
  },

  markAsWatched(episodeId: string): void {
    const episode = this.getById(episodeId);
    if (!episode) throw new Error('Episode not found');

    db.transaction(() => {
      // Update or insert progress
      db.prepare(`
        INSERT INTO user_progress (episodeId, watched, watchedAt, progress)
        VALUES (?, 1, CURRENT_TIMESTAMP, 100)
        ON CONFLICT(episodeId) DO UPDATE SET
          watched = 1,
          watchedAt = CURRENT_TIMESTAMP,
          progress = 100
      `).run(episodeId);

      // Update user stats
      const stats = UserStatsModel.get();
      const wasWatched = db.prepare(
        'SELECT watched FROM user_progress WHERE episodeId = ? AND watched = 1'
      ).get(episodeId);

      if (!wasWatched) {
        UserStatsModel.update({
          totalXP: stats.totalXP + XP_PER_EPISODE,
          totalEpisodesWatched: stats.totalEpisodesWatched + 1,
          totalWatchTime: stats.totalWatchTime + episode.duration,
          lastWatchedDate: new Date().toISOString().split('T')[0]
        });

        // Check achievements
        AchievementModel.checkAndUnlock();
      }
    })();
  },

  updateProgress(episodeId: string, progress: number): void {
    db.prepare(`
      INSERT INTO user_progress (episodeId, progress)
      VALUES (?, ?)
      ON CONFLICT(episodeId) DO UPDATE SET progress = ?
    `).run(episodeId, progress, progress);
  },

  getFeed(limit: number, offset: number): any[] {
    // First get all episode IDs in a consistent order
    const allEpisodeIds = db.prepare(`
      SELECT id FROM episodes ORDER BY id
    `).all() as { id: string }[];
    
    // Shuffle using a daily seed to maintain consistency within a day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Improved seeded random function
    let rndSeed = seed;
    const seededRandom = () => {
      const x = Math.sin(rndSeed++) * 10000;
      return x - Math.floor(x);
    };
    
    // Fisher-Yates shuffle with improved seeded random
    const shuffled = [...allEpisodeIds];
    let m = shuffled.length;
    while (m) {
      const i = Math.floor(seededRandom() * m--);
      [shuffled[m], shuffled[i]] = [shuffled[i], shuffled[m]];
    }
    
    // Get the IDs for this page
    const pageIds = shuffled.slice(offset, offset + limit).map(e => e.id);
    
    if (pageIds.length === 0) {
      return [];
    }
    
    // Fetch full episode data for these IDs
    const placeholders = pageIds.map(() => '?').join(',');
    const query = `
      SELECT e.*, 
        COALESCE(up.watched, 0) as watched,
        up.watchedAt,
        COALESCE(up.progress, 0) as progress,
        s.title as seriesTitle,
        s.thumbnail as seriesThumbnail,
        e.seasonNumber
      FROM episodes e
      INNER JOIN series s ON e.seriesId = s.id
      LEFT JOIN user_progress up ON e.id = up.episodeId
      WHERE e.id IN (${placeholders})
    `;
    
    const episodes = db.prepare(query).all(...pageIds);
    
    // Return episodes in the shuffled order
    const episodeMap = new Map(episodes.map(ep => [ep.id, ep]));
    return pageIds.map(id => episodeMap.get(id)).filter(Boolean);
  }
};

// User Stats Model
export const UserStatsModel = {
  get(): UserStats {
    const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get() as any;
    return {
      totalXP: stats.totalXP,
      level: Math.min(Math.floor(stats.totalXP / 100) + 1, 50),
      totalEpisodesWatched: stats.totalEpisodesWatched,
      totalWatchTime: stats.totalWatchTime,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastWatchedDate: stats.lastWatchedDate
    };
  },

  update(updates: Partial<UserStats>): void {
    const entries = Object.entries(updates);
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    
    db.prepare(`UPDATE user_stats SET ${setClause} WHERE id = 1`).run(...values);
  }
};

// Achievement Model
export const AchievementModel = {
  getAll(): Achievement[] {
    const rows = db.prepare('SELECT * FROM achievements').all();
    return rows.map((row: any) => ({
      ...row,
      requirement: {
        type: row.requirementType,
        value: row.requirementValue,
        metadata: row.requirementMetadata ? JSON.parse(row.requirementMetadata) : undefined
      }
    }));
  },

  getUserAchievements(): UserAchievement[] {
    return db.prepare('SELECT * FROM user_achievements').all() as UserAchievement[];
  },

  getAllWithProgress(): (Achievement & UserAchievement)[] {
    const query = `
      SELECT a.*, 
        COALESCE(ua.unlockedAt, NULL) as unlockedAt,
        COALESCE(ua.progress, 0) as progress,
        COALESCE(ua.isUnlocked, 0) as isUnlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievementId
    `;
    
    const rows = db.prepare(query).all();
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      xpReward: row.xpReward,
      requirement: {
        type: row.requirementType,
        value: row.requirementValue,
        metadata: row.requirementMetadata ? JSON.parse(row.requirementMetadata) : undefined
      },
      unlockedAt: row.unlockedAt,
      progress: row.progress,
      isUnlocked: Boolean(row.isUnlocked),
      achievementId: row.id
    }));
  },

  checkAndUnlock(): void {
    const stats = UserStatsModel.get();
    const achievements = this.getAll();

    achievements.forEach(achievement => {
      const userAchievement = db.prepare(
        'SELECT * FROM user_achievements WHERE achievementId = ?'
      ).get(achievement.id) as UserAchievement | undefined;

      if (userAchievement?.isUnlocked) return;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'episodes_watched':
          progress = Math.min(100, (stats.totalEpisodesWatched / achievement.requirement.value) * 100);
          shouldUnlock = stats.totalEpisodesWatched >= achievement.requirement.value;
          break;
        case 'streak_days':
          progress = Math.min(100, (stats.currentStreak / achievement.requirement.value) * 100);
          shouldUnlock = stats.currentStreak >= achievement.requirement.value;
          break;
      }

      if (shouldUnlock) {
        db.prepare(`
          INSERT INTO user_achievements (achievementId, unlockedAt, progress, isUnlocked)
          VALUES (?, CURRENT_TIMESTAMP, 100, 1)
          ON CONFLICT(achievementId) DO UPDATE SET
            unlockedAt = CURRENT_TIMESTAMP,
            progress = 100,
            isUnlocked = 1
        `).run(achievement.id);

        // Add XP reward
        UserStatsModel.update({
          totalXP: stats.totalXP + achievement.xpReward
        });
      } else if (progress > 0) {
        db.prepare(`
          INSERT INTO user_achievements (achievementId, unlockedAt, progress, isUnlocked)
          VALUES (?, NULL, ?, 0)
          ON CONFLICT(achievementId) DO UPDATE SET progress = ?
        `).run(achievement.id, progress, progress);
      }
    });
  }
};
