import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from './ProgressBar';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { XP_PER_EPISODE } from '@video-library/shared';

interface FeedEpisode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  videoUrl: string;
  thumbnail: string;
  watched: boolean;
  watchedAt?: string;
  progress: number;
  seriesId: string;
  seriesTitle: string;
  seriesThumbnail: string;
  seasonNumber: number;
}

interface VerticalVideoPlayerProps {
  episode: FeedEpisode;
  isActive: boolean;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VerticalVideoPlayer: React.FC<VerticalVideoPlayerProps> = ({
  episode,
  isActive,
  index,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [showControls, setShowControls] = useState(false);
  const [hasCompletedEpisode, setHasCompletedEpisode] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMutedIcon, setShowMutedIcon] = useState(true);
  
  const { userStats, setUserStats } = useStore();
  
  // Initialize video player with expo-video
  const player = useVideoPlayer(episode.videoUrl, (player) => {
    player.loop = true;
    player.muted = true; // Mute by default to allow autoplay on web
    player.volume = 0; // Set volume to 0 initially
  });
  
  // Calculate bottom padding to account for tab bar (60px) + safe area
  const bottomPadding = 60 + insets.bottom;
  
  // Animation values
  const likeScale = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const xpScale = useSharedValue(0);
  const xpOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      player.play();
      // Show muted icon for web autoplay compliance
      if (Platform.OS === 'web') {
        setShowMutedIcon(true);
        setTimeout(() => setShowMutedIcon(false), 3000);
      } else {
        // Native platforms can play with sound
        player.muted = false;
        player.volume = 1;
        setIsMuted(false);
      }
    } else {
      player.pause();
    }
  }, [isActive, player]);

  // Monitor playback progress
  useEffect(() => {
    if (!isActive) return;
    
    const intervalId = setInterval(async () => {
      if (player.playing && player.duration > 0) {
        const currentProgress = (player.currentTime / player.duration) * 100;
        
        // Mark as completed when 90% watched
        if (currentProgress >= 90 && !hasCompletedEpisode && !episode.watched) {
          setHasCompletedEpisode(true);
          await completeEpisode();
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [player, isActive, hasCompletedEpisode, episode]);

  const completeEpisode = async () => {
    try {
      await api.markEpisodeAsWatched(episode.id);
      
      if (userStats) {
        const newStats = {
          ...userStats,
          totalXP: userStats.totalXP + XP_PER_EPISODE,
          totalEpisodesWatched: userStats.totalEpisodesWatched + 1,
        };
        setUserStats(newStats);
      }
      
      showXPReward();
    } catch (error) {
      console.error('Error completing episode:', error);
    }
  };

  const showXPReward = () => {
    setShowXP(true);
    xpOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(2000, withTiming(0, { duration: 300 }))
    );
    xpScale.value = withSequence(
      withSpring(1, { damping: 10 }),
      withDelay(2000, withSpring(0))
    );
    
    setTimeout(() => setShowXP(false), 3000);
  };

  const handleDoubleTap = () => {
    likeScale.value = withSequence(
      withSpring(1.5),
      withSpring(0)
    );
    likeOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(600, withTiming(0, { duration: 200 }))
    );
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    
    // Unmute on first user interaction for web
    if (isMuted && Platform.OS === 'web') {
      player.muted = false;
      player.volume = 1;
      setIsMuted(false);
      setShowMutedIcon(false);
    }
  };

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
      // Ensure unmuted when manually playing
      player.muted = false;
      player.volume = 1;
    }
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
    opacity: likeOpacity.value,
  }));

  const xpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
    opacity: xpOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={toggleControls}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          allowsFullscreen={false}
          showsTimecodes={false}
          nativeControls={false}
        />
        
        {/* Like Animation */}
        <Animated.View style={[styles.likeAnimation, likeAnimatedStyle]}>
          <Ionicons name="heart" size={80} color="#ff4757" />
        </Animated.View>
        
        {/* Double-tap hint */}
        {index === 0 && !hasCompletedEpisode && (
          <Animated.View
            entering={FadeIn.delay(2000).duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.doubleTapHint}
          >
            <Text style={styles.doubleTapHintText}>Double-tap to like</Text>
          </Animated.View>
        )}
        
        {/* Muted indicator for web */}
        {isMuted && showMutedIcon && Platform.OS === 'web' && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.mutedIndicator}
          >
            <Ionicons name="volume-mute" size={24} color="white" />
            <Text style={styles.mutedText}>Tap to unmute</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
      
      {/* Controls Overlay */}
      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.controlsOverlay}
        >
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playPauseButton}
          >
            <Ionicons 
              name={player.playing ? 'pause' : 'play'}
              size={40}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Bottom Info with Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.95)']}
        style={[styles.bottomInfo, { paddingBottom: bottomPadding + 20 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Series', { seriesId: episode.seriesId })}
          style={styles.seriesInfo}
        >
          <Text style={styles.seriesTitle}>{episode.seriesTitle}</Text>
          <Text style={styles.episodeTitle}>
            S{episode.seasonNumber}E{episode.episodeNumber}: {episode.title}
          </Text>
          <Text style={styles.episodeDescription} numberOfLines={2}>
            {episode.description}
          </Text>
        </TouchableOpacity>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDoubleTap}>
            <Ionicons name="heart-outline" size={28} color="white" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={28} color="white" />
            <Text style={styles.actionText}>Comments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={28} color="white" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          {episode.watched && (
            <View style={styles.watchedBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#10b981" />
              <Text style={styles.actionText}>Watched</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Progress Bar - positioned above tab bar */}
      {episode.progress > 0 && (
        <View style={[styles.progressBarContainer, { bottom: bottomPadding }]}>
          <View 
            style={[
              styles.progressBar,
              { width: `${episode.progress}%` }
            ]}
          />
        </View>
      )}
      
      {/* XP Reward Animation */}
      {showXP && (
        <Animated.View style={[styles.xpReward, xpAnimatedStyle]}>
          <Text style={styles.xpTitle}>EPISODE COMPLETE!</Text>
          <Text style={styles.xpAmount}>+{XP_PER_EPISODE} XP</Text>
        </Animated.View>
      )}
    </View>
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
  likeAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -80,
    marginTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doubleTapHintText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  mutedIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  seriesInfo: {
    flex: 1,
    marginRight: 16,
    marginBottom: 10,
  },
  seriesTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  episodeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  episodeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  actionButtons: {
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
    minWidth: 44,
    minHeight: 44,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  watchedBadge: {
    alignItems: 'center',
    padding: 8,
    minWidth: 44,
    minHeight: 44,
  },
  progressBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  xpReward: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  xpTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 0 20px rgba(99, 102, 241, 0.8)' }
      : {
          textShadowColor: 'rgba(99, 102, 241, 0.8)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
        }
    ),
  },
  xpAmount: {
    color: '#fbbf24',
    fontSize: 48,
    fontWeight: 'bold',
    ...(Platform.OS === 'web' 
      ? { textShadow: '0 0 20px #fbbf24' }
      : {
          textShadowColor: '#fbbf24',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
        }
    ),
  },
});
