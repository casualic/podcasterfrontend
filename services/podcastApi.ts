const API_BASE_URL = 'https://a593-70-166-84-166.ngrok-free.app';

export class PodcastApi {
  /**
   * Generate a podcast with the given prompt and duration
   * @param text The prompt for the podcast
   * @param duration The duration in minutes
   * @returns The generated podcast data
   */
  static async generatePodcast(text: string, duration: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          podcast_length: duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      // The response is the audio file, create a blob URL for it
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      return {
        audioUrl,
        title: text,
        duration: parseInt(duration), // in minutes
      };
    } catch (error) {
      console.error('Error in generatePodcast:', error);
      throw error;
    }
  }
}