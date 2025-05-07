import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { PodcastApi } from '@/services/podcastApi';
import { useStorage } from '@/hooks/useStorage';
import { formatDate } from '@/utils/dateFormatter';

export default function GenerateScreen() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { savePodcast } = useStorage();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic for your podcast');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await PodcastApi.generatePodcast(prompt, duration);
      
      // Save the podcast to local storage
      const podcast = {
        id: Date.now().toString(),
        title: prompt,
        audioUrl: response.audioUrl,
        createdAt: new Date().toISOString(),
        duration: parseInt(duration), // in minutes
      };
      
      await savePodcast(podcast);
      
      // Navigate to the player with the new podcast
      router.push({
        pathname: '/(tabs)/player',
        params: { id: podcast.id }
      });
    } catch (err) {
      console.error('Error generating podcast:', err);
      setError('Failed to generate podcast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Create New Podcast</Text>
        <Text style={styles.subtitle}>Use AI to generate a podcast on any topic</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a podcast topic..."
          placeholderTextColor="#6B7280"
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={[styles.input, styles.durationInput]}
          placeholder="5"
          placeholderTextColor="#6B7280"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Generate Podcast</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Our AI will create a conversational podcast based on your topic. The generation process typically takes 1-2 minutes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  durationInput: {
    height: 50,
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 10,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
});