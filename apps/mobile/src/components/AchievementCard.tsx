import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { Achievement, UserAchievement } from '@video-library/shared';
import { ProgressBar } from './ProgressBar';

interface AchievementCardProps {
  achievement: Achievement & UserAchievement;
  onUnlock?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement,
  onUnlock 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (achievement.isUnlocked && onUnlock) {
      // Unlock animation
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onUnlock();
      });
    }
  }, [achievement.isUnlocked]);
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const getBackgroundColor = () => {
    if (!achievement.isUnlocked) return '#1e1b4b';
    
    // Color based on XP reward (rarity)
    if (achievement.xpReward >= 500) return '#ffd700'; // Gold
    if (achievement.xpReward >= 200) return '#c0c0c0'; // Silver
    return '#cd7f32'; // Bronze
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: achievement.isUnlocked ? 1 : 0.6,
          transform: [{ rotate: spin }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          { color: achievement.isUnlocked ? '#0f0a3c' : '#6b7280' }
        ]}>
          {achievement.title}
        </Text>
        
        <Text style={[
          styles.description,
          { color: achievement.isUnlocked ? '#1e1b4b' : '#4b5563' }
        ]}>
          {achievement.description}
        </Text>
        
        {!achievement.isUnlocked && (
          <ProgressBar
            progress={achievement.progress}
            color="#6366f1"
            backgroundColor="#374151"
            height={8}
            showPercentage={false}
            style={{ marginTop: 8 }}
          />
        )}
        
        <View style={styles.footer}>
          <Text style={[
            styles.xpReward,
            { color: achievement.isUnlocked ? '#0f0a3c' : '#fbbf24' }
          ]}>
            +{achievement.xpReward} XP
          </Text>
          
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  xpReward: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unlockedDate: {
    fontSize: 10,
    color: '#1e1b4b',
  },
});
