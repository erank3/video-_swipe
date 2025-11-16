import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SeriesWithProgress } from '@video-library/shared';
import { ProgressBar } from './ProgressBar';

interface SeriesCardProps {
  series: SeriesWithProgress;
  onPress: () => void;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, onPress }) => {
  const isCompleted = series.progress.percentage === 100;
  const isStarted = series.progress.watchedEpisodes > 0;
  
  const getBorderColor = () => {
    if (isCompleted) return '#10b981'; // green for completed
    if (isStarted) return '#6366f1'; // purple for in progress
    return '#1e1b4b'; // dark for not started
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getBorderColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: series.thumbnail }}
        style={styles.thumbnail}
      />
      
      {/* Completion Badge */}
      {isCompleted && (
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>✓</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {series.title}
        </Text>
        
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {series.totalSeasons} Season{series.totalSeasons > 1 ? 's' : ''}
          </Text>
          <Text style={styles.metadataText}>•</Text>
          <Text style={styles.metadataText}>
            {series.progress.totalEpisodes} Episodes
          </Text>
        </View>
        
        <View style={styles.genreContainer}>
          {series.genre.slice(0, 2).map((genre, index) => (
            <View key={index} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
        
        <ProgressBar
          progress={series.progress.percentage}
          label={`${series.progress.watchedEpisodes}/${series.progress.totalEpisodes} watched`}
          height={12}
          showPercentage={false}
          style={{ marginTop: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0a3c',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 3,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      },
    }),
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e1b4b',
  },
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
      },
      default: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
      },
    }),
  },
  completionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metadataText: {
    color: '#a8a29e',
    fontSize: 12,
  },
  genreContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  genreTag: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
