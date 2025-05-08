import AsyncStorage from '@react-native-async-storage/async-storage';

// Define podcast type
export interface Podcast {
  id: string;
  title: string;
  audioUrl: string;
  createdAt: string;
  duration: number;
}

export const useStorage = () => {
  // Keys
  const PODCASTS_KEY = '@podcaster_podcasts';
  
  // Save a podcast to storage
  const savePodcast = async (podcast: Podcast) => {
    try {
      // Get existing podcasts
      const existingPodcastsJson = await AsyncStorage.getItem(PODCASTS_KEY);
      const existingPodcasts: Podcast[] = existingPodcastsJson 
        ? JSON.parse(existingPodcastsJson) 
        : [];
      
      // Add new podcast
      const updatedPodcasts = [podcast, ...existingPodcasts];
      
      // Save updated list
      await AsyncStorage.setItem(PODCASTS_KEY, JSON.stringify(updatedPodcasts));
      
      return podcast;
    } catch (error) {
      console.error('Error saving podcast:', error);
      throw error;
    }
  };
  
  // Get all podcasts
  const getAllPodcasts = async (): Promise<Podcast[]> => {
    try {
      const podcastsJson = await AsyncStorage.getItem(PODCASTS_KEY);
      const podcasts = podcastsJson ? JSON.parse(podcastsJson) : [];
      // Sort podcasts by creation date, newest first
      return podcasts.sort((a: Podcast, b: Podcast) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting podcasts:', error);
      return [];
    }
  };
  
  // Get a single podcast by ID
  const getPodcast = async (id: string): Promise<Podcast | null> => {
    try {
      const podcasts = await getAllPodcasts();
      const podcast = podcasts.find(p => p.id === id);
      if (!podcast) {
        console.error('Podcast not found:', id);
        return null;
      }
      return podcast;
    } catch (error) {
      console.error('Error getting podcast:', error);
      return null;
    }
  };
  
  // Delete a podcast
  const deletePodcast = async (id: string): Promise<boolean> => {
    try {
      const podcasts = await getAllPodcasts();
      const updatedPodcasts = podcasts.filter(podcast => podcast.id !== id);
      await AsyncStorage.setItem(PODCASTS_KEY, JSON.stringify(updatedPodcasts));
      return true;
    } catch (error) {
      console.error('Error deleting podcast:', error);
      return false;
    }
  };
  
  return {
    savePodcast,
    getAllPodcasts,
    getPodcast,
    deletePodcast
  };
};