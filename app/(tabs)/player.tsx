import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import { useStorage } from '@/hooks/useStorage';
import { formatTime } from '@/utils/timeFormatter';
import Slider from '@react-native-community/slider';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [podcast, setPodcast] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getPodcast } = useStorage();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (id) {
      loadPodcast();
    }
    
    return () => {
      cleanupResources();
    };
  }, [id]);

  useEffect(() => {
    cleanupResources();
    
    if (typeof window !== 'undefined' && podcast?.audioUrl) {
      const audio = new Audio(podcast.audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration * 1000);
        setIsLoading(false);
      });
      
      audio.addEventListener('timeupdate', () => {
        setPosition(audio.currentTime * 1000);
        setSliderValue(audio.currentTime / audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setPosition(0);
        setSliderValue(0);
      });
      
      audio.addEventListener('error', () => {
        showError('Error playing audio');
      });
      
      return () => {
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('error', () => {});
        audio.pause();
        audio.src = '';
      };
    }
  }, [podcast?.audioUrl]);

  const cleanupResources = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    setIsPlaying(false);
    setPosition(0);
    setSliderValue(0);
  };
  
  const showError = (message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setErrorMessage(message);
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };
  
  const loadPodcast = async () => {
    try {
      setIsLoading(true);
      const podcastData = await getPodcast(id as string);
      if (podcastData) {
        setPodcast(podcastData);
      }
    } catch (error) {
      showError('Error loading podcast');
    }
  };
  
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      showError('Playback control error');
    }
  };
  
  const handleSkipForward = () => {
    if (!audioRef.current) return;
    
    try {
      const newTime = Math.min(audioRef.current.currentTime + 15, audioRef.current.duration);
      audioRef.current.currentTime = newTime;
    } catch (error) {
      showError('Skip forward error');
    }
  };
  
  const handleSkipBackward = () => {
    if (!audioRef.current) return;
    
    try {
      const newTime = Math.max(audioRef.current.currentTime - 15, 0);
      audioRef.current.currentTime = newTime;
    } catch (error) {
      showError('Skip backward error');
    }
  };
  
  const handleSliderChange = (value: number) => {
    if (!audioRef.current || !duration) return;
    
    try {
      const newTime = value * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setPosition(newTime * 1000);
    } catch (error) {
      showError('Slider control error');
    }
  };
  
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
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2098913/pexels-photo-2098913.jpeg' }}
            style={styles.albumArt}
          />
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
            value={sliderValue}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
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
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumArt: {
    width: 240,
    height: 240,
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