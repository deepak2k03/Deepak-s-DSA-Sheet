import { apiUrl } from '../config';
import { defaultTopics, type TopicDefinition } from '../data/topics';

export const fetchPublicTopics = async (): Promise<TopicDefinition[]> => {
  const response = await fetch(apiUrl('/api/topics'));

  if (!response.ok) {
    throw new Error('Failed to load topics');
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return defaultTopics;
  }

  return data;
};