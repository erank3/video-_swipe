import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeWithProgress, XP_PER_EPISODE } from '@video-library/shared';
import { api } from '../services/api';
import { GameButton, ProgressBar } from '../components';
import { useStore } from '../store/useStore';

type VideoPlayerRouteProps = RouteProp<{ VideoPlayer: { episode: EpisodeWithProgress } }, 'VideoPlayer'>;

export const VideoPlayerScreen: React.FC = () => {
  const route = useRoute<VideoPlayerRouteProps>();
  const navigation = useNavigation();
  const { episode } = route.params;
  
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(episode.progress || 0);
  const [hasCompletedEpisode, setHasCompletedEpisode] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  const { userStats, setUserStats } = useStore();
  
  useEffect(() => {
    // Hide controls after 3 seconds
    const timer = setTimeout(() => {
      hideControls();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showControls]);
  
  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };
  
  const toggleControls = () => {
    if (!showControls) {
      setShowControls(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      hideControls();
    }
  };
  
  const onPlaybackStatusUpdate = async (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded) {
      const currentProgress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
      setProgress(currentProgress);
      
      // MVP: Disabled progress tracking - only mark as complete when 90% watched
      // if (Math.floor(currentProgress / 10) > Math.floor(progress / 10)) {
      //   await api.updateEpisodeProgress(episode.id, currentProgress);
      // }
      
      // Mark as completed when 90% watched
      if (currentProgress >= 90 && !hasCompletedEpisode && !episode.watched) {
        setHasCompletedEpisode(true);
        await completeEpisode();
      }
    }
  };
  
  const completeEpisode = async () => {
    try {
      await api.markEpisodeAsWatched(episode.id);
      
      // Update local stats
      if (userStats) {
        const newStats = {
          ...userStats,
          totalXP: userStats.totalXP + XP_PER_EPISODE,
          totalEpisodesWatched: userStats.totalEpisodesWatched + 1,
        };
        setUserStats(newStats);
      }
      
      // Show XP reward modal
      showXPReward();
    } catch (error) {
      console.error('Error completing episode:', error);
    }
  };
  
  const showXPReward = () => {
    setShowXPModal(true);
    
    // Animate XP gain
    Animated.parallel([
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      Animated.timing(xpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowXPModal(false));
    }, 3000);
  };
  
  const handlePlayPause = async () => {
    if (status?.isLoaded) {
      if (status.isPlaying) {
        await video.current?.pauseAsync();
      } else {
        await video.current?.playAsync();
      }
    }
  };
  
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={toggleControls}
      >
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: episode.videoUrl }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
        
        {/* Custom Controls */}
        {showControls && (
          <Animated.View
            style={[styles.controls, { opacity: fadeAnim }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.episodeTitle}>{episode.title}</Text>
                <Text style={styles.episodeInfo}>
                  Season {episode.seasonNumber} • Episode {episode.episodeNumber}
                </Text>
              </View>
            </View>
            
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {status?.isLoaded ? formatTime(status.positionMillis) : '0:00'}
                </Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={progress}
                    color="#6366f1"
                    backgroundColor="rgba(255, 255, 255, 0.3)"
                    height={4}
                    showPercentage={false}
                    animated={false}
                  />
                </View>
                <Text style={styles.timeText}>
                  {status?.isLoaded ? formatTime(status.durationMillis) : '0:00'}
                </Text>
              </View>
              
              <View style={styles.playbackControls}>
                <GameButton
                  title={status?.isLoaded && status.isPlaying ? 'PAUSE' : 'PLAY'}
                  onPress={handlePlayPause}
                  variant="primary"
                  size="medium"
                />
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
      
      {/* XP Reward Modal */}
      {showXPModal && (
        <View style={styles.xpModalContainer}>
          <Animated.View
            style={[
              styles.xpModal,
              {
                opacity: xpAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: xpAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.xpTitle}>EPISODE COMPLETE!</Text>
            <Text style={styles.xpAmount}>+{XP_PER_EPISODE} XP</Text>
            <Text style={styles.xpMessage}>Great job watching!</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  titleContainer: {
    flex: 1,
  },
  episodeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  episodeInfo: {
    color: '#a8a29e',
    fontSize: 14,
    marginTop: 4,
  },
  bottomControls: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 45,
  },
  playbackControls: {
    alignItems: 'center',
  },
  xpModalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  xpModal: {
    backgroundColor: '#6366f1',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
      },
      default: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  xpTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpAmount: {
    color: '#fbbf24',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    ...Platform.select({
      web: {
        textShadow: '0 0 20px #fbbf24',
      },
      default: {
        textShadowColor: '#fbbf24',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
      },
    }),
  },
  xpMessage: {
    color: 'white',
    fontSize: 16,
  },
});
