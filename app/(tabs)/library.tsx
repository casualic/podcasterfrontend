import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import { formatDate } from '@/utils/dateFormatter';
import { formatDuration } from '@/utils/timeFormatter';
import { ChevronRight, Calendar, Clock3 } from 'lucide-react-native';

export default function LibraryScreen() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllPodcasts } = useStorage();

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const podcastData = await getAllPodcasts();
      setPodcasts(podcastData);
    } catch (error) {
      console.error('Error loading podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPlayer = (id: string) => {
    router.push({
      pathname: '/(tabs)/player',
      params: { id }
    });
  };

  const renderPodcastItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.podcastItem}
        onPress={() => navigateToPlayer(item.id)}
      >
        <View style={styles.podcastInfo}>
          <Text style={styles.podcastTitle} numberOfLines={1}>
            {item.title}
          </Text>
          
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Calendar size={14} color="#9CA3AF" />
              <Text style={styles.metadataText}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Clock3 size={14} color="#9CA3AF" />
              <Text style={styles.metadataText}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </View>
        
        <ChevronRight size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Podcasts</Text>
      </View>

      {podcasts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't created any podcasts yet.
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/index')}
          >
            <Text style={styles.createButtonText}>Create Your First Podcast</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={podcasts}
          renderItem={renderPodcastItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  podcastInfo: {
    flex: 1,
    marginRight: 12,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});