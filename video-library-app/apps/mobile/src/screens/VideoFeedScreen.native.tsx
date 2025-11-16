import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { api } from '../services/api';
import { EpisodeWithProgress } from '@video-library/shared';
import { VerticalVideoPlayer } from '../components';
import { useStore } from '../store/useStore';

interface FeedEpisode extends EpisodeWithProgress {
  seriesId: string;
  seriesTitle: string;
  seriesThumbnail: string;
  seasonNumber: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VideoFeedScreen: React.FC = () => {
  const pagerRef = useRef<PagerView>(null);
  
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
      const response = await api.getVideoFeed(10, offset);
      
      // Filter out any episodes we already have to avoid duplicates
      const existingIds = new Set(episodes.map(ep => ep.id));
      const newEpisodes = response.episodes.filter(ep => !existingIds.has(ep.id));
      
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

  const onPageSelected = useCallback((e: any) => {
    const newIndex = e.nativeEvent.position;
    setCurrentIndex(newIndex);
    
    // Load more videos when approaching the end
    if (newIndex >= episodes.length - 3) {
      loadMoreVideos();
    }
  }, [episodes.length]);

  const renderVideo = (episode: FeedEpisode, index: number) => {
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
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        orientation="vertical"
        onPageSelected={onPageSelected}
        initialPage={0}
      >
        {episodes.map((episode, index) => renderVideo(episode, index))}
      </PagerView>
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
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
});
