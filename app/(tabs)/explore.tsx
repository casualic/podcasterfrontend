import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { mockPodcasts } from '@/data/mockPodcasts';

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = [
    'All',
    'Tech',
    'Business',
    'Science',
    'Entertainment',
    'Health'
  ];
  
  const filteredPodcasts = selectedCategory === 'All'
    ? mockPodcasts
    : mockPodcasts.filter(podcast => podcast.category === selectedCategory);
  
  const navigateToPodcastDetails = (podcast: any) => {
    // In a real app, this would navigate to the player with the selected podcast
    console.log('Selected podcast:', podcast.title);
    
    // Mock saving the podcast to library and navigating
    router.push({
      pathname: '/(tabs)/player',
      params: { id: podcast.id }
    });
  };
  
  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryBadge,
        selectedCategory === item && styles.selectedCategoryBadge
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPodcastItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.podcastCard}
      onPress={() => navigateToPodcastDetails(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.podcastImage}
      />
      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.podcastCreator} numberOfLines={1}>
          {item.creator}
        </Text>
        <View style={styles.podcastMeta}>
          <Text style={styles.podcastMetaText}>
            {item.duration} • {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <FlatList
        data={filteredPodcasts}
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.podcastList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  categoriesList: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    marginRight: 8,
  },
  selectedCategoryBadge: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  podcastList: {
    padding: 20,
  },
  podcastCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  podcastImage: {
    width: 100,
    height: 100,
  },
  podcastInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  podcastCreator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
});