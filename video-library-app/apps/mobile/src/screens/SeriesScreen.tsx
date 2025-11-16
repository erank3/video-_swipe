import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { ProgressBar, GameButton } from '../components';
import { EpisodeWithProgress, SeasonWithProgress } from '@video-library/shared';

type SeriesRouteProps = RouteProp<{ Series: { seriesId: string } }, 'Series'>;

export const SeriesScreen: React.FC = () => {
  const route = useRoute<SeriesRouteProps>();
  const navigation = useNavigation<any>();
  const { seriesId } = route.params;
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { currentSeries, setCurrentSeries, setLoading } = useStore();
  
  useEffect(() => {
    loadSeriesDetails();
  }, [seriesId]);
  
  const loadSeriesDetails = async () => {
    try {
      setLoading(true);
      const series = await api.getSeriesById(seriesId);
      setCurrentSeries(series);
      if (series.seasons.length > 0) {
        setSelectedSeason(series.seasons[0].seasonNumber);
      }
    } catch (error) {
      console.error('Error loading series:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentSeries) {
    return null;
  }
  
  const currentSeasonData = currentSeries.seasons.find(
    (s) => s.seasonNumber === selectedSeason
  );
  
  const renderEpisode = (episode: EpisodeWithProgress) => (
    <TouchableOpacity
      key={episode.id}
      style={[
        styles.episodeCard,
        episode.watched && styles.episodeCardWatched,
      ]}
      onPress={() => navigation.navigate('VideoPlayer', { episode })}
    >
      <Image
        source={{ uri: episode.thumbnail }}
        style={styles.episodeThumbnail}
      />
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle}>
          Episode {episode.episodeNumber}: {episode.title}
        </Text>
        <Text style={styles.episodeDescription} numberOfLines={2}>
          {episode.description}
        </Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeDuration}>
            {Math.floor(episode.duration / 60)} min
          </Text>
          {episode.watched && (
            <View style={styles.watchedBadge}>
              <Text style={styles.watchedText}>WATCHED</Text>
            </View>
          )}
        </View>
        {episode.progress > 0 && episode.progress < 100 && (
          <ProgressBar
            progress={episode.progress}
            height={6}
            showPercentage={false}
            style={{ marginTop: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Series Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: currentSeries.thumbnail }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>{currentSeries.title}</Text>
            <Text style={styles.description}>{currentSeries.description}</Text>
            <View style={styles.metadata}>
              <Text style={styles.metaText}>
                {currentSeries.releaseYear} • {currentSeries.genre.join(', ')}
              </Text>
            </View>
            <ProgressBar
              progress={currentSeries.progress.percentage}
              label={`${currentSeries.progress.watchedEpisodes}/${currentSeries.progress.totalEpisodes} episodes watched`}
              color="#10b981"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
        
        {/* Season Selector */}
        <View style={styles.seasonSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentSeries.seasons.map((season) => (
              <TouchableOpacity
                key={season.id}
                style={[
                  styles.seasonButton,
                  selectedSeason === season.seasonNumber && styles.seasonButtonActive,
                ]}
                onPress={() => setSelectedSeason(season.seasonNumber)}
              >
                <Text
                  style={[
                    styles.seasonButtonText,
                    selectedSeason === season.seasonNumber && styles.seasonButtonTextActive,
                  ]}
                >
                  Season {season.seasonNumber}
                </Text>
                {season.progress.percentage === 100 && (
                  <View style={styles.seasonCompleteBadge}>
                    <Text style={styles.seasonCompleteText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Episodes List */}
        <View style={styles.episodesList}>
          {currentSeasonData?.episodes.map(renderEpisode)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a3c',
  },
  header: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 60, 0.8)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
  },
  metaText: {
    color: '#a8a29e',
    fontSize: 12,
  },
  seasonSelector: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  seasonButton: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
  },
  seasonButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#8b5cf6',
  },
  seasonButtonText: {
    color: '#a8a29e',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: 'white',
  },
  seasonCompleteBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  seasonCompleteText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  episodesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
  },
  episodeCardWatched: {
    opacity: 0.7,
    borderColor: '#10b981',
  },
  episodeThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: '#374151',
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 12,
    color: '#a8a29e',
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  watchedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  watchedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
