# Video Library MVP

A gamified video streaming application built with React Native and Next.js, featuring achievements, XP system, and progress tracking.

## 🎮 Features

- **Gamification System**
  - Earn XP for watching episodes (10 XP per episode)
  - Level progression system (Level 1-50)
  - Achievement system with progress tracking
  - Visual progress bars for series, seasons, and episodes

- **Video Library**
  - Browse series with multiple seasons
  - Track watching progress
  - Filter content (all, watched, unwatched, in progress)
  - Sort by alphabetical, progress, or release date

- **Achievements**
  - "First Steps" - Watch your first episode
  - "Binge Watcher" - Watch 5 episodes in one day
  - "Season Finale" - Complete an entire season
  - "Series Master" - Complete an entire series
  - And more!

- **Mobile-First Design**
  - Game-inspired UI with neon color scheme
  - Smooth animations and transitions
  - Dark theme optimized for viewing

## 🛠 Tech Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Next.js 13 with App Router
- **Database**: SQLite with better-sqlite3
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: React Navigation
- **Video Player**: expo-av
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
video-library-app/
├── apps/
│   ├── mobile/          # React Native mobile app
│   └── web/             # Next.js backend + web preview
├── packages/
│   └── shared/          # Shared TypeScript types
└── package.json         # Monorepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo Go app on your phone (for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd video-library-app
```

2. Install dependencies:
```bash
npm install
```

3. Build shared packages:
```bash
npm run build -w @video-library/shared
```

4. Initialize the database:
```bash
npm run db:init -w @video-library/web
```

### Running the Application

#### Backend (Next.js):
```bash
npm run dev
```
The backend will be available at http://localhost:3600

#### Mobile App (React Native):
```bash
npm run dev:mobile
```
Then scan the QR code with Expo Go app on your phone.

## 📱 API Endpoints

- `GET /api/series` - Get all series with progress
- `GET /api/series/[id]` - Get specific series details
- `POST /api/episodes/[id]/watch` - Mark episode as watched
- `POST /api/episodes/[id]/progress` - Update episode progress
- `GET /api/achievements` - Get all achievements
- `GET /api/stats` - Get user statistics

## 🎨 Design Decisions

1. **Gamification**: Implemented XP system and achievements to increase user engagement
2. **SQLite**: Chose SQLite for simplicity and portability in MVP
3. **Monorepo**: Used npm workspaces for code sharing between web and mobile
4. **Mock Data**: Pre-populated database with sample series and episodes
5. **No Authentication**: Simplified to single-user for MVP scope

## 🚀 Deployment

### Backend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `apps/web`
4. Deploy

### Mobile App

Use Expo EAS Build for production builds:
```bash
cd apps/mobile
eas build --platform all
```

## 🔮 Future Enhancements

- User authentication and profiles
- Social features (friends, leaderboards)
- Video upload functionality
- Push notifications for achievements
- Offline support with video downloads
- Recommendation system
- Watch party feature

## 📸 Demo

The app features:
- Game-inspired dark theme with neon accents
- Animated level indicators and progress bars
- Achievement unlock animations
- XP gain notifications
- Smooth transitions between screens

## ⚡ Performance Considerations

- Lazy loading for series images
- Optimized database queries with indexes
- Efficient state management with Zustand
- Video streaming with adaptive quality

## 🧪 Testing

Due to time constraints, testing was not implemented but would include:
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for video playback

## 📝 License

MIT License - This is an MVP demonstration project.
