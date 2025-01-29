const YOUTUBE_SEARCH_BASE = 'https://www.youtube.com/results?search_query=';

export const searchYouTube = (query: string): string => {
  // Encode the search query for URL
  const encodedQuery = encodeURIComponent(query);
  return `${YOUTUBE_SEARCH_BASE}${encodedQuery}`;
};

export const getRelevantYouTubeQuery = (category: string, title: string): string => {
  const categoryQueries: Record<string, string> = {
    meditation: 'guided meditation for',
    relaxation: 'relaxation techniques for',
    educational: 'mental health education',
    motivation: 'motivational video',
    breathing: 'breathing exercise for',
    mindfulness: 'mindfulness practice for',
    exercise: 'gentle exercise routine for',
    sleep: 'sleep meditation for'
  };

  const baseQuery = categoryQueries[category] || '';
  return `${baseQuery} ${title}`.trim();
};
