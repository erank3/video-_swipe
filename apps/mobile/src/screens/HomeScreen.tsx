import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { SeriesCard, LevelIndicator, GameButton } from '../components';
import { FilterOption, SortOption } from '@video-library/shared';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  const {
    series,
    userStats,
    filterOption,
    sortOption,
    setSeries,
    setUserStats,
    setFilterOption,
    setSortOption,
    getFilteredSeries,
    isLoading,
    setLoading,
  } = useStore();
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [seriesData, statsData] = await Promise.all([
        api.getAllSeries(),
        api.getUserStats(),
      ]);
      setSeries(seriesData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const filteredSeries = getFilteredSeries();
  
  const renderHeader = () => (
    <View style={styles.header}>
      {userStats && (
        <LevelIndicator
          level={userStats.level}
          xp={userStats.totalXP}
          levelProgress={userStats.levelProgress || 0}
        />
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats?.totalEpisodesWatched || 0}</Text>
          <Text style={styles.statLabel}>Episodes Watched</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <GameButton
          title="Filter & Sort"
          onPress={() => setFilterModalVisible(true)}
          variant="secondary"
          size="small"
        />
      </View>
    </View>
  );
  
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter & Sort</Text>
          
          <Text style={styles.sectionTitle}>Filter By:</Text>
          {(['all', 'watched', 'unwatched', 'in_progress'] as FilterOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                filterOption === option && styles.optionButtonActive,
              ]}
              onPress={() => setFilterOption(option)}
            >
              <Text style={[
                styles.optionText,
                filterOption === option && styles.optionTextActive,
              ]}>
                {option.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Sort By:</Text>
          {(['alphabetical', 'progress', 'release_date'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                sortOption === option && styles.optionButtonActive,
              ]}
              onPress={() => setSortOption(option)}
            >
              <Text style={[
                styles.optionText,
                sortOption === option && styles.optionTextActive,
              ]}>
                {option.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
          
          <GameButton
            title="Done"
            onPress={() => setFilterModalVisible(false)}
            variant="primary"
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredSeries}
        renderItem={({ item }) => (
          <SeriesCard
            series={item}
            onPress={() => navigation.navigate('Series', { seriesId: item.id })}
          />
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
      {renderFilterModal()}
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
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#a8a29e',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  filterContainer: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1b4b',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a8a29e',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  optionButton: {
    backgroundColor: '#0f0a3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#374151',
  },
  optionButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#8b5cf6',
  },
  optionText: {
    color: '#a8a29e',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: 'white',
  },
});
