import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import { useStorage } from '@/hooks/useStorage';
import { formatTime } from '@/utils/timeFormatter';
import Slider from '@react-native-community/slider';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [podcast, setPodcast] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { getPodcast } = useStorage();
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const discAnimation = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  
  useEffect(() => {
    if (id) {
      loadPodcast();
    }
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id]);
  
  const startPlaybackStatusUpdate = () => {
    if (soundRef.current) {
      soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }
  };
  
  useEffect(() => {
    if (sound && podcast) {
      startPlaybackStatusUpdate();
    }
    
    return () => {
      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
      }
    };
  }, [sound, podcast]);
  
  useEffect(() => {
    let discRotation: Animated.CompositeAnimation | null = null;
    
    if (isPlaying) {
      discRotation = Animated.loop(
        Animated.timing(discAnimation, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true
        })
      );
      discRotation.start();
    } else {
      discAnimation.setValue(0);
    }
    
    return () => {
      if (discRotation) {
        discRotation.stop();
      }
    };
  }, [isPlaying]);
  
  const loadPodcast = async () => {
    try {
      setIsLoading(true);
      const podcastData = await getPodcast(id as string);
      if (podcastData) {
        setPodcast(podcastData);
        await loadAudio(podcastData.audioUrl);
      }
    } catch (error) {
      console.error('Error loading podcast:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAudio = async (audioUrl: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = newSound;
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };
  
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      progressAnimation.setValue(status.positionMillis / (status.durationMillis || 1));
    }
  };
  
  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };
  
  const handleSkipForward = async () => {
    if (!soundRef.current) return;
    
    try {
      const newPosition = Math.min(position + 15000, duration);
      await soundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };
  
  const handleSkipBackward = async () => {
    if (!soundRef.current) return;
    
    try {
      const newPosition = Math.max(position - 15000, 0);
      await soundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };
  
  const handleSliderChange = async (value: number) => {
    if (!soundRef.current) return;
    
    try {
      const newPosition = value * duration;
      await soundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const spin = discAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading podcast...</Text>
      </View>
    );
  }
  
  if (!podcast) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Podcast not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.albumArtContainer}>
        <Animated.View 
          style={[
            styles.discContainer, 
            { transform: [{ rotate: spin }] }
          ]}
        >
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2098913/pexels-photo-2098913.jpeg' }}
            style={styles.albumArt}
          />
        </Animated.View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.podcastTitle} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={styles.podcastCreator}>AI Generated Podcast</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={1}
          value={duration > 0 ? position / duration : 0}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#4B5563"
          thumbTintColor="#3B82F6"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleSkipBackward} style={styles.controlButton}>
          <SkipBack size={24} color="#FFFFFF" />
          <Text style={styles.skipText}>15s</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          {isPlaying ? (
            <Pause size={32} color="#FFFFFF" />
          ) : (
            <Play size={32} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkipForward} style={styles.controlButton}>
          <SkipForward size={24} color="#FFFFFF" />
          <Text style={styles.skipText}>15s</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          <Volume2 size={18} color="#9CA3AF" />
          <Text style={styles.metadataText}>AI Generated Voice</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  discContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  podcastTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  podcastCreator: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  metadataContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 8,
  },
});