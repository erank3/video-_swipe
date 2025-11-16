import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { AchievementCard, LevelIndicator } from '../components';

export const AchievementsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { achievements, userStats, setAchievements, setUserStats, setLoading } = useStore();
  
  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        api.getAchievements(),
        api.getUserStats(),
      ]);
      setAchievements(achievementsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAchievements();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalXPEarned = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>ACHIEVEMENTS</Text>
      
      {userStats && (
        <View style={styles.levelSection}>
          <LevelIndicator
            level={userStats.level}
            xp={userStats.totalXP}
            levelProgress={userStats.levelProgress || 0}
          />
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalXPEarned}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
      </View>
      
      <View style={styles.progressOverview}>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(unlockedCount / achievements.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((unlockedCount / achievements.length) * 100)}% Complete
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={achievements}
        renderItem={({ item }) => (
          <AchievementCard achievement={item} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a3c',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
    ...Platform.select({
      web: {
        textShadow: '0px 2px 10px #6366f1',
      },
      default: {
        textShadowColor: '#6366f1',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
    }),
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    minWidth: 90,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressOverview: {
    backgroundColor: '#1e1b4b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#374151',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
      },
      default: {
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
    }),
  },
  progressText: {
    fontSize: 14,
    color: '#a8a29e',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
