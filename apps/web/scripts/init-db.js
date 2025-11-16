const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

// Initialize database
const db = new Database(path.join(process.cwd(), 'video-library.db'));

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Drop existing tables
db.exec(`
  DROP TABLE IF EXISTS user_achievements;
  DROP TABLE IF EXISTS achievements;
  DROP TABLE IF EXISTS user_stats;
  DROP TABLE IF EXISTS user_progress;
  DROP TABLE IF EXISTS episodes;
  DROP TABLE IF EXISTS seasons;
  DROP TABLE IF EXISTS series;
`);

// Create tables
console.log('Creating tables...');
db.exec(`
  CREATE TABLE series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    totalSeasons INTEGER NOT NULL DEFAULT 1,
    genre TEXT NOT NULL DEFAULT '[]',
    releaseYear INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE seasons (
    id TEXT PRIMARY KEY,
    seriesId TEXT NOT NULL,
    seasonNumber INTEGER NOT NULL,
    title TEXT NOT NULL,
    episodeCount INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE CASCADE
  );

  CREATE TABLE episodes (
    id TEXT PRIMARY KEY,
    seriesId TEXT NOT NULL,
    seasonId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    seasonNumber INTEGER NOT NULL,
    episodeNumber INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    thumbnail TEXT,
    videoUrl TEXT NOT NULL,
    releaseDate DATE NOT NULL,
    FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (seasonId) REFERENCES seasons(id) ON DELETE CASCADE
  );

  CREATE TABLE user_progress (
    episodeId TEXT PRIMARY KEY,
    watched BOOLEAN DEFAULT FALSE,
    watchedAt DATETIME,
    progress INTEGER DEFAULT 0,
    FOREIGN KEY (episodeId) REFERENCES episodes(id) ON DELETE CASCADE
  );

  CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    totalXP INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    totalEpisodesWatched INTEGER DEFAULT 0,
    totalWatchTime INTEGER DEFAULT 0,
    currentStreak INTEGER DEFAULT 0,
    longestStreak INTEGER DEFAULT 0,
    lastWatchedDate DATE
  );

  CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xpReward INTEGER NOT NULL,
    requirementType TEXT NOT NULL,
    requirementValue INTEGER NOT NULL,
    requirementMetadata TEXT
  );

  CREATE TABLE user_achievements (
    achievementId TEXT PRIMARY KEY,
    unlockedAt DATETIME NOT NULL,
    progress INTEGER DEFAULT 0,
    isUnlocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE
  );
`);

// Insert mock data
console.log('Inserting mock data...');

// Mock series data
const seriesData = [
  {
    id: randomUUID(),
    title: 'Cyber Quest Chronicles',
    description: 'Follow the adventures of digital heroes in a virtual world filled with challenges and mysteries.',
    thumbnail: 'https://picsum.photos/seed/series1/400/600',
    totalSeasons: 3,
    genre: JSON.stringify(['Sci-Fi', 'Adventure', 'Action']),
    releaseYear: 2022
  },
  {
    id: randomUUID(),
    title: 'Pixel Warriors',
    description: 'Epic battles in retro-styled worlds where pixels collide and heroes rise.',
    thumbnail: 'https://picsum.photos/seed/series2/400/600',
    totalSeasons: 2,
    genre: JSON.stringify(['Action', 'Fantasy', 'Adventure']),
    releaseYear: 2023
  },
  {
    id: randomUUID(),
    title: 'Code Breakers',
    description: 'Elite programmers solve mysteries using their coding skills in this tech thriller.',
    thumbnail: 'https://picsum.photos/seed/series3/400/600',
    totalSeasons: 2,
    genre: JSON.stringify(['Mystery', 'Tech', 'Drama']),
    releaseYear: 2023
  }
];

// Sample video URLs (using Pexels vertical video as placeholder for TikTok-like experience)
const videoUrls = [
  'https://www.pexels.com/download/video/6010489/',
  'https://www.pexels.com/download/video/4434150/',
  'https://www.pexels.com/download/video/2785536/',
  'https://www.pexels.com/download/video/3959544/',
  'https://www.pexels.com/download/video/4065943/',
  'https://www.pexels.com/download/video/4057150/'
];

const insertSeries = db.prepare(`
  INSERT INTO series (id, title, description, thumbnail, totalSeasons, genre, releaseYear)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertSeason = db.prepare(`
  INSERT INTO seasons (id, seriesId, seasonNumber, title, episodeCount)
  VALUES (?, ?, ?, ?, ?)
`);

const insertEpisode = db.prepare(`
  INSERT INTO episodes (id, seriesId, seasonId, title, description, seasonNumber, episodeNumber, duration, thumbnail, videoUrl, releaseDate)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Removed videoUrlIndex - now using random video selection

seriesData.forEach(series => {
  insertSeries.run(series.id, series.title, series.description, series.thumbnail, series.totalSeasons, series.genre, series.releaseYear);
  
  for (let seasonNum = 1; seasonNum <= series.totalSeasons; seasonNum++) {
    const seasonId = randomUUID();
    const episodeCount = 8 + Math.floor(Math.random() * 3); // 8-10 episodes per season
    
    insertSeason.run(seasonId, series.id, seasonNum, `Season ${seasonNum}`, episodeCount);
    
    for (let episodeNum = 1; episodeNum <= episodeCount; episodeNum++) {
      const episodeId = randomUUID();
      const releaseDate = new Date(2023, seasonNum - 1, episodeNum).toISOString().split('T')[0];
      
      insertEpisode.run(
        episodeId,
        series.id,
        seasonId,
        `${series.title} - S${seasonNum}E${episodeNum}`,
        `Episode ${episodeNum} of Season ${seasonNum}. An exciting adventure awaits!`,
        seasonNum,
        episodeNum,
        1200 + Math.floor(Math.random() * 600), // 20-30 minutes
        `https://picsum.photos/seed/ep${episodeId}/400/225`,
        videoUrls[Math.floor(Math.random() * videoUrls.length)],
        releaseDate
      );
      
      // Random video selection - no need to increment index
    }
  }
});

// Insert achievements
console.log('Inserting achievements...');

const achievements = [
  {
    id: 'first-episode',
    title: 'First Steps',
    description: 'Watch your first episode',
    icon: '🎬',
    xpReward: 50,
    requirementType: 'episodes_watched',
    requirementValue: 1,
    requirementMetadata: null
  },
  {
    id: 'binge-watcher',
    title: 'Binge Watcher',
    description: 'Watch 5 episodes in one day',
    icon: '🍿',
    xpReward: 100,
    requirementType: 'episodes_watched',
    requirementValue: 5,
    requirementMetadata: JSON.stringify({ timeframe: 'day' })
  },
  {
    id: 'season-finale',
    title: 'Season Finale',
    description: 'Complete an entire season',
    icon: '🏆',
    xpReward: 200,
    requirementType: 'seasons_completed',
    requirementValue: 1,
    requirementMetadata: null
  },
  {
    id: 'series-master',
    title: 'Series Master',
    description: 'Complete an entire series',
    icon: '👑',
    xpReward: 500,
    requirementType: 'series_completed',
    requirementValue: 1,
    requirementMetadata: null
  },
  {
    id: 'dedicated-viewer',
    title: 'Dedicated Viewer',
    description: 'Watch 10 episodes',
    icon: '⭐',
    xpReward: 150,
    requirementType: 'episodes_watched',
    requirementValue: 10,
    requirementMetadata: null
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Watch 25 episodes',
    icon: '🏃',
    xpReward: 300,
    requirementType: 'episodes_watched',
    requirementValue: 25,
    requirementMetadata: null
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 200,
    requirementType: 'streak_days',
    requirementValue: 7,
    requirementMetadata: null
  }
];

const insertAchievement = db.prepare(`
  INSERT INTO achievements (id, title, description, icon, xpReward, requirementType, requirementValue, requirementMetadata)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

achievements.forEach(achievement => {
  insertAchievement.run(
    achievement.id,
    achievement.title,
    achievement.description,
    achievement.icon,
    achievement.xpReward,
    achievement.requirementType,
    achievement.requirementValue,
    achievement.requirementMetadata
  );
});

// Initialize user stats
db.prepare('INSERT INTO user_stats (id) VALUES (1)').run();

console.log('Database initialized successfully!');
console.log(`Created ${seriesData.length} series with mock data.`);
console.log(`Created ${achievements.length} achievements.`);

db.close();
