import { GoogleGenerativeAI } from "@google/generative-ai";

export type ContentCategory = 
  | 'meditation'
  | 'relaxation'
  | 'educational'
  | 'motivation'
  | 'breathing'
  | 'mindfulness'
  | 'exercise'
  | 'sleep';

interface ContentItem {
  title: string;
  url: string;
  description: string;
  category: ContentCategory;
}

interface ContentRecommendation {
  meditation: ContentItem[];
  relaxation: ContentItem[];
  educational: ContentItem[];
  motivation: ContentItem[];
  breathing: ContentItem[];
  mindfulness: ContentItem[];
  exercise: ContentItem[];
  sleep: ContentItem[];
  reason: string;
}

export class ContentRecommender {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private lastCallTime: number = 0;
  private minTimeBetweenCalls: number = 10000; // 10 seconds between calls
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private parseRecommendations(text: string): ContentRecommendation {
    const recommendations: ContentRecommendation = {
      meditation: [],
      relaxation: [],
      educational: [],
      motivation: [],
      breathing: [],
      mindfulness: [],
      exercise: [],
      sleep: [],
      reason: ''
    };

    try {
      const sections = text.split('\n\n');
      sections.forEach(section => {
        if (section.toLowerCase().includes('reason:')) {
          recommendations.reason = section.split('Reason:')[1].trim();
        } else {
          const categoryMatch = section.match(/^(meditation|relaxation|educational|motivation|breathing|mindfulness|exercise|sleep):/i);
          if (categoryMatch) {
            const category = categoryMatch[1].toLowerCase() as ContentCategory;
            const contentLines = section.split('\n').slice(1);
            contentLines.forEach(line => {
              if (line.includes('|')) {
                const [title, url, description] = line.split('|').map(s => s.trim());
                if (title && url) {
                  recommendations[category].push({
                    title,
                    url,
                    description: description || '',
                    category
                  });
                }
              }
            });
          }
        }
      });
    } catch (error) {
      console.error('Error parsing recommendations:', error);
    }

    return recommendations;
  }

  private async rateLimitedRequest(prompt: string): Promise<string> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minTimeBetweenCalls) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minTimeBetweenCalls - timeSinceLastCall)
      );
    }

    try {
      this.lastCallTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      this.retryCount = 0; // Reset retry count on success
      return response.text();
    } catch (error: any) {
      if (error.message?.includes('429') && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const backoffTime = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.rateLimitedRequest(prompt); // Retry
      }
      throw error;
    }
  }

  async getRecommendations(mood: string, context: string): Promise<ContentRecommendation> {
    const prompt = `Based on the user's current emotional state and context, recommend appropriate YouTube content across different categories to support their emotional well-being. Provide recommendations in this format:

Reason:
[Explain why these recommendations would be helpful for the user's current emotional state]

Meditation:
[Title] | [YouTube URL] | [Brief description of why this meditation video would be helpful]

Relaxation:
[Title] | [YouTube URL] | [Brief description of why this relaxation content would help]

Educational:
[Title] | [YouTube URL] | [Brief description of why this educational content is relevant]

Motivation:
[Title] | [YouTube URL] | [Brief description of why this motivational content would be beneficial]

Breathing:
[Title] | [YouTube URL] | [Brief description of why this breathing exercise would help]

Mindfulness:
[Title] | [YouTube URL] | [Brief description of how this mindfulness practice relates]

Exercise:
[Title] | [YouTube URL] | [Brief description of why this physical activity would be beneficial]

Sleep:
[Title] | [YouTube URL] | [Brief description of how this content can help with sleep and relaxation]

User's Current Mood: ${mood}
Context: ${context}

Important: Only recommend actual, existing YouTube videos with valid URLs. Focus on content that is:
1. Specifically tailored to the user's current emotional state
2. High-quality and professionally produced
3. Well-reviewed by the therapy community
4. Safe and appropriate for therapeutic context
5. Varied in length (mix of short and longer content)`;

    try {
      const text = await this.rateLimitedRequest(prompt);
      return this.parseRecommendations(text);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        meditation: [],
        relaxation: [],
        educational: [],
        motivation: [],
        breathing: [],
        mindfulness: [],
        exercise: [],
        sleep: [],
        reason: 'Unable to generate recommendations at this time. Please try again later.'
      };
    }
  }
}

export const initializeContentRecommender = (apiKey: string) => {
  return new ContentRecommender(apiKey);
};
