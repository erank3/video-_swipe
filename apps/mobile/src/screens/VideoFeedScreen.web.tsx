import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { api } from '../services/api';
import { EpisodeWithProgress } from '@video-library/shared';
import { VerticalVideoPlayer } from '../components';

interface FeedEpisode extends EpisodeWithProgress {
  seriesId: string;
  seriesTitle: string;
  seriesThumbnail: string;
  seasonNumber: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VideoFeedScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [episodes, setEpisodes] = useState<FeedEpisode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadInitialFeed();
  }, []);

  const loadInitialFeed = async () => {
    try {
      setIsLoading(true);
      const response = await api.getVideoFeed(10, 0);
      console.log('Initial feed loaded:', response.episodes.length, 'episodes');
      setEpisodes(response.episodes);
      setHasMore(response.hasMore);
      setOffset(response.nextOffset);
    } catch (error) {
      console.error('Failed to load video feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVideos = async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    
    try {
      setIsLoadingMore(true);
      console.log('Loading more videos with offset:', offset);
      const response = await api.getVideoFeed(10, offset);
      
      // Filter out any episodes we already have to avoid duplicates
      const existingIds = new Set(episodes.map(ep => ep.id));
      const newEpisodes = response.episodes.filter(ep => !existingIds.has(ep.id));
      
      console.log('Loaded', response.episodes.length, 'episodes, kept', newEpisodes.length, 'new ones');
      
      if (newEpisodes.length > 0) {
        setEpisodes(prev => [...prev, ...newEpisodes]);
      }
      
      setHasMore(response.hasMore && newEpisodes.length > 0);
      setOffset(response.nextOffset);
    } catch (error) {
      console.error('Failed to load more videos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const newIndex = Math.round(contentOffset.y / layoutMeasurement.height);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
    
    // Load more videos when approaching the end
    const totalHeight = episodes.length * layoutMeasurement.height;
    if (contentOffset.y + layoutMeasurement.height >= totalHeight - (layoutMeasurement.height * 3)) {
      loadMoreVideos();
    }
  }, [currentIndex, episodes.length]);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      y: index * screenHeight,
      animated: true,
    });
  };

  if (isLoading && episodes.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
      >
        {episodes.map((episode, index) => {
          // Use a combination of id and index for unique keys
          const uniqueKey = `${episode.id}-${index}`;
          return (
            <View key={uniqueKey} style={styles.pageContainer}>
              <VerticalVideoPlayer
                episode={episode}
                isActive={index === currentIndex}
                index={index}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    height: screenHeight,
    width: screenWidth,
  },
});
