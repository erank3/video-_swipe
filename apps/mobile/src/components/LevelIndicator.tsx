import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface LevelIndicatorProps {
  level: number;
  xp: number;
  levelProgress: number; // 0-100
  nextLevelXP?: number;
}

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  level,
  xp,
  levelProgress,
  nextLevelXP = 100
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Pulse animation for level badge
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);
  
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Level Badge */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#fbbf24',
            borderWidth: 4,
            borderColor: '#f59e0b',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#fbbf24',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1e1b4b',
            }}
          >
            {level}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: '#1e1b4b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Level
          </Text>
        </View>
      </Animated.View>
      
      {/* XP Display */}
      <Text
        style={{
          color: '#fbbf24',
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 8,
          textShadowColor: 'rgba(251, 191, 36, 0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}
      >
        {xp} XP
      </Text>
      
      {/* Progress to Next Level */}
      <View style={{ width: 200 }}>
        <ProgressBar
          progress={levelProgress}
          label="Next Level"
          color="#fbbf24"
          backgroundColor="#44403c"
          height={16}
          showPercentage={true}
        />
        <Text
          style={{
            color: '#a8a29e',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {Math.round((levelProgress / 100) * nextLevelXP)}/{nextLevelXP} XP
        </Text>
      </View>
    </View>
  );
};
