import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0a3c] text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-transparent bg-clip-text">
              Video Library MVP
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A gamified video streaming experience with achievements, XP, and progress tracking
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151] hover:border-[#6366f1] transition-colors">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-4 text-[#6366f1]">Gamified Experience</h3>
              <p className="text-gray-300">
                Earn XP for every episode watched, unlock achievements, and level up your profile
              </p>
            </div>

            <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151] hover:border-[#6366f1] transition-colors">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-[#6366f1]">Progress Tracking</h3>
              <p className="text-gray-300">
                Track your viewing progress across series, seasons, and episodes with detailed stats
              </p>
            </div>

            <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151] hover:border-[#6366f1] transition-colors">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-4 text-[#6366f1]">Achievements</h3>
              <p className="text-gray-300">
                Unlock special achievements for watching milestones and maintaining streaks
              </p>
            </div>

            <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151] hover:border-[#6366f1] transition-colors">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-4 text-[#6366f1]">Mobile First</h3>
              <p className="text-gray-300">
                Built with React Native for a seamless mobile experience on iOS and Android
              </p>
            </div>
          </div>

          {/* API Documentation */}
          <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151] mb-8">
            <h2 className="text-3xl font-bold mb-6 text-[#6366f1]">API Endpoints</h2>
            <div className="space-y-4">
              <div>
                <code className="bg-[#0f0a3c] px-3 py-1 rounded text-[#fbbf24]">GET /api/series</code>
                <p className="text-gray-300 mt-2">Get all series with progress information</p>
              </div>
              <div>
                <code className="bg-[#0f0a3c] px-3 py-1 rounded text-[#fbbf24]">GET /api/series/[id]</code>
                <p className="text-gray-300 mt-2">Get specific series with episodes</p>
              </div>
              <div>
                <code className="bg-[#0f0a3c] px-3 py-1 rounded text-[#fbbf24]">POST /api/episodes/[id]/watch</code>
                <p className="text-gray-300 mt-2">Mark episode as watched</p>
              </div>
              <div>
                <code className="bg-[#0f0a3c] px-3 py-1 rounded text-[#fbbf24]">GET /api/achievements</code>
                <p className="text-gray-300 mt-2">Get all achievements with unlock status</p>
              </div>
              <div>
                <code className="bg-[#0f0a3c] px-3 py-1 rounded text-[#fbbf24]">GET /api/stats</code>
                <p className="text-gray-300 mt-2">Get user statistics and level</p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-[#1e1b4b] p-8 rounded-lg border-2 border-[#374151]">
            <h2 className="text-3xl font-bold mb-6 text-[#6366f1]">Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
              <div>✓ Next.js 13</div>
              <div>✓ React Native</div>
              <div>✓ TypeScript</div>
              <div>✓ SQLite</div>
              <div>✓ Expo</div>
              <div>✓ Zustand</div>
              <div>✓ NativeWind</div>
              <div>✓ React Navigation</div>
              <div>✓ Vercel</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-400">
            <p>Video Library MVP - Built for demonstration purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}