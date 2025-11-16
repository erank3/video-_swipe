/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'game-primary': '#6366f1',
        'game-secondary': '#8b5cf6',
        'game-accent': '#ec4899',
        'game-dark': '#1e1b4b',
        'game-darker': '#0f0a3c',
        'xp-gold': '#fbbf24',
        'achievement-bronze': '#cd7f32',
        'achievement-silver': '#c0c0c0',
        'achievement-gold': '#ffd700',
      },
      fontFamily: {
        'game': ['Orbitron', 'monospace'],
      },
      animation: {
        'level-up': 'levelUp 0.5s ease-out',
        'xp-gain': 'xpGain 1s ease-out',
        'achievement-unlock': 'achievementUnlock 1s ease-out',
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(0.5)', opacity: 0 },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        xpGain: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(-50px)', opacity: 0 }
        },
        achievementUnlock: {
          '0%': { transform: 'rotate(0deg) scale(0.5)', opacity: 0 },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)', opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}
