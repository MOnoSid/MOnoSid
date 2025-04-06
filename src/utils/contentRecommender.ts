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
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  benefits?: string[];
  practitioner?: string;
  iconType?: 'Brain' | 'Sparkles' | 'BookOpen' | 'Rocket' | 'Wind' | 'Heart' | 'Activity' | 'Moon';
  themeColor?: {
    bg: string;
    text: string;
    border: string;
  };
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
  userMood: string;
  focusAreas: string[];
  suggestedRoutine?: {
    morning: ContentItem[];
    afternoon: ContentItem[];
    evening: ContentItem[];
  };
  categories: {
    [key in ContentCategory]: {
      title: string;
      description: string;
      icon: string;
      themeColor: {
        bg: string;
        text: string;
        border: string;
      };
    };
  };
}

export class ContentRecommender {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private lastCallTime: number = 0;
  private minTimeBetweenCalls: number = 10000; // 10 seconds between calls
  private retryCount: number = 0;
  private maxRetries: number = 3;

  private readonly categoryMetadata = {
    meditation: {
      title: 'Mindfulness',
      description: 'Mental wellness',
      icon: 'Brain',
      themeColor: {
        bg: 'bg-blue-50/50',
        text: 'text-blue-800',
        border: 'border-blue-100'
      }
    },
    relaxation: {
      title: 'Relaxation',
      description: 'Stress relief',
      icon: 'Sparkles',
      themeColor: {
        bg: 'bg-purple-50/50',
        text: 'text-purple-800',
        border: 'border-purple-100'
      }
    },
    educational: {
      title: 'Educational',
      description: 'Learn & grow',
      icon: 'BookOpen',
      themeColor: {
        bg: 'bg-amber-50/50',
        text: 'text-amber-800',
        border: 'border-amber-100'
      }
    },
    motivation: {
      title: 'Motivation',
      description: 'Inspiration & drive',
      icon: 'Rocket',
      themeColor: {
        bg: 'bg-indigo-50/50',
        text: 'text-indigo-800',
        border: 'border-indigo-100'
      }
    },
    breathing: {
      title: 'Breathing',
      description: 'Breath work',
      icon: 'Wind',
      themeColor: {
        bg: 'bg-cyan-50/50',
        text: 'text-cyan-800',
        border: 'border-cyan-100'
      }
    },
    mindfulness: {
      title: 'Mindfulness',
      description: 'Present awareness',
      icon: 'Heart',
      themeColor: {
        bg: 'bg-rose-50/50',
        text: 'text-rose-800',
        border: 'border-rose-100'
      }
    },
    exercise: {
      title: 'Exercise',
      description: 'Physical health',
      icon: 'Activity',
      themeColor: {
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-800',
        border: 'border-emerald-100'
      }
    },
    sleep: {
      title: 'Sleep',
      description: 'Rest & recovery',
      icon: 'Moon',
      themeColor: {
        bg: 'bg-violet-50/50',
        text: 'text-violet-800',
        border: 'border-violet-100'
      }
    }
  };

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required for content recommendations');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
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
      this.retryCount = 0;
      return response.text();
    } catch (error: any) {
      if (error.message?.includes('429') && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const backoffTime = Math.pow(2, this.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.rateLimitedRequest(prompt);
      }
      throw error;
    }
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
      reason: '',
      userMood: '',
      focusAreas: [],
      categories: this.categoryMetadata
    };

    try {
      const sections = text.split('\n\n');
      sections.forEach(section => {
        if (section.toLowerCase().includes('reason:')) {
          recommendations.reason = section.split('Reason:')[1].trim();
        } else if (section.toLowerCase().includes('mood:')) {
          recommendations.userMood = section.split('Mood:')[1].trim();
        } else if (section.toLowerCase().includes('focus areas:')) {
          recommendations.focusAreas = section
            .split('Focus Areas:')[1]
            .trim()
            .split('-')
            .map(area => area.trim())
            .filter(Boolean);
        } else {
          const categoryMatch = section.match(/^(meditation|relaxation|educational|motivation|breathing|mindfulness|exercise|sleep):/i);
          if (categoryMatch) {
            const category = categoryMatch[1].toLowerCase() as ContentCategory;
            const contentLines = section.split('\n').slice(1);
            contentLines.forEach(line => {
              if (line.includes('|')) {
                const [
                  title,
                  url,
                  description,
                  duration,
                  difficulty,
                  practitioner,
                  tagsStr,
                  benefitsStr
                ] = line.split('|').map(s => s.trim());

                if (title && url) {
                  const metadata = this.categoryMetadata[category];
                  const contentItem: ContentItem = {
                    title,
                    url,
                    description: description || '',
                    category,
                    duration: duration || undefined,
                    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' || undefined,
                    practitioner: practitioner || undefined,
                    tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : undefined,
                    benefits: benefitsStr ? benefitsStr.split(',').map(b => b.trim()) : undefined,
                    iconType: metadata.icon as ContentItem['iconType'],
                    themeColor: metadata.themeColor
                  };
                  recommendations[category].push(contentItem);
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

  async getRecommendations(mood: string, context: string): Promise<ContentRecommendation> {
    const prompt = `Based on the user's current emotional state and context, recommend appropriate YouTube content across different categories to support their emotional well-being. Provide detailed recommendations in this format:

Mood:
[Current emotional state and intensity]

Reason:
[Detailed explanation of why these recommendations would be helpful]

Focus Areas:
- [Key area of focus 1]
- [Key area of focus 2]
- [Key area of focus 3]

For each category below, provide recommendations in this format:
[Title] | [YouTube URL] | [Detailed description] | [Duration] | [Difficulty] | [Practitioner] | [Tags] | [Benefits]

Meditation:
[Recommendations with focus on current emotional needs]

Relaxation:
[Recommendations for stress relief and calmness]

Educational:
[Recommendations for understanding and managing emotions]

Motivation:
[Recommendations for encouragement and positive mindset]

Breathing:
[Recommendations for specific breathing techniques]

Mindfulness:
[Recommendations for present-moment awareness]

Exercise:
[Recommendations for physical well-being]

Sleep:
[Recommendations for better rest and recovery]

User's Current Mood: ${mood}
Context: ${context}

Important Guidelines:
1. Ensure content is specifically tailored to the user's current emotional state
2. Include only high-quality, professionally produced content
3. Provide a mix of content lengths (short for immediate help, longer for deep work)
4. Include recognized practitioners and experts
5. Focus on evidence-based techniques and approaches
6. Consider the user's potential energy level and capacity based on their mood
7. Include specific benefits for each recommendation
8. Tag content appropriately for easy reference
9. Indicate difficulty level to prevent overwhelm
10. Ensure all URLs are valid and content is appropriate for therapeutic context`;

    try {
      const text = await this.rateLimitedRequest(prompt);
      const recommendations = this.parseRecommendations(text);
      
      // Add suggested routine based on time of day and recommendations
      recommendations.suggestedRoutine = this.createSuggestedRoutine(recommendations);
      
      return recommendations;
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
        reason: 'Unable to generate recommendations at this time. Please try again later.',
        userMood: mood,
        focusAreas: [],
        categories: this.categoryMetadata
      };
    }
  }

  private createSuggestedRoutine(recommendations: ContentRecommendation): ContentRecommendation['suggestedRoutine'] {
    const routine = {
      morning: [] as ContentItem[],
      afternoon: [] as ContentItem[],
      evening: [] as ContentItem[]
    };

    // Morning routine preferences
    if (recommendations.meditation.length > 0) {
      routine.morning.push(recommendations.meditation[0]);
    }
    if (recommendations.exercise.length > 0) {
      routine.morning.push(recommendations.exercise[0]);
    }

    // Afternoon routine preferences
    if (recommendations.mindfulness.length > 0) {
      routine.afternoon.push(recommendations.mindfulness[0]);
    }
    if (recommendations.educational.length > 0) {
      routine.afternoon.push(recommendations.educational[0]);
    }

    // Evening routine preferences
    if (recommendations.relaxation.length > 0) {
      routine.evening.push(recommendations.relaxation[0]);
    }
    if (recommendations.sleep.length > 0) {
      routine.evening.push(recommendations.sleep[0]);
    }

    return routine;
  }
}

export const initializeContentRecommender = (apiKey: string) => {
  return new ContentRecommender(apiKey);
};
