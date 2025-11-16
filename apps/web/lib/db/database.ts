import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const db = new Database(path.join(process.cwd(), 'video-library.db'));

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Create tables
export function initDatabase() {
  // Series table
  db.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail TEXT,
      totalSeasons INTEGER NOT NULL DEFAULT 1,
      genre TEXT NOT NULL DEFAULT '[]',
      releaseYear INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seasons table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY,
      seriesId TEXT NOT NULL,
      seasonNumber INTEGER NOT NULL,
      title TEXT NOT NULL,
      episodeCount INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE CASCADE
    )
  `);

  // Episodes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS episodes (
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
    )
  `);

  // User progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      episodeId TEXT PRIMARY KEY,
      watched BOOLEAN DEFAULT FALSE,
      watchedAt DATETIME,
      progress INTEGER DEFAULT 0,
      FOREIGN KEY (episodeId) REFERENCES episodes(id) ON DELETE CASCADE
    )
  `);

  // User stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY DEFAULT 1,
      totalXP INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      totalEpisodesWatched INTEGER DEFAULT 0,
      totalWatchTime INTEGER DEFAULT 0,
      currentStreak INTEGER DEFAULT 0,
      longestStreak INTEGER DEFAULT 0,
      lastWatchedDate DATE
    )
  `);

  // Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      xpReward INTEGER NOT NULL,
      requirementType TEXT NOT NULL,
      requirementValue INTEGER NOT NULL,
      requirementMetadata TEXT
    )
  `);

  // User achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      achievementId TEXT PRIMARY KEY,
      unlockedAt DATETIME NOT NULL,
      progress INTEGER DEFAULT 0,
      isUnlocked BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE
    )
  `);

  // Initialize user stats if not exists
  const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get();
  if (!stats) {
    db.prepare('INSERT INTO user_stats (id) VALUES (1)').run();
  }
}

export default db;
