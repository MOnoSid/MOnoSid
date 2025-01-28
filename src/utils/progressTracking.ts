import { GoogleGenerativeAI } from "@google/generative-ai";

interface ProgressData {
  sessionSummary: string;
  goals: Array<{
    goal: string;
    progress: number;
    status: 'not-started' | 'in-progress' | 'achieved';
  }>;
  improvements: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  timestamp: string;
}

interface SessionAnalysis {
  emotionalState: string;
  keyTopics: string[];
  insights: string[];
}

export class ProgressTracker {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private parseAnalysisResponse(text: string): SessionAnalysis {
    const analysis: SessionAnalysis = {
      emotionalState: '',
      keyTopics: [],
      insights: []
    };

    try {
      const sections = text.split('\n\n');
      sections.forEach(section => {
        if (section.toLowerCase().includes('emotional state')) {
          analysis.emotionalState = section.split(':')[1]?.trim() || '';
        } else if (section.toLowerCase().includes('key topics')) {
          analysis.keyTopics = section.split(':')[1]?.trim().split('-').map(t => t.trim()).filter(t => t);
        } else if (section.toLowerCase().includes('insights')) {
          analysis.insights = section.split(':')[1]?.trim().split('-').map(i => i.trim()).filter(i => i);
        }
      });
    } catch (error) {
      console.error('Error parsing analysis:', error);
    }

    return analysis;
  }

  private parseProgressResponse(text: string): Partial<ProgressData> {
    const progress: Partial<ProgressData> = {
      sessionSummary: '',
      goals: [],
      improvements: {
        strengths: [],
        challenges: [],
        recommendations: []
      }
    };

    try {
      const sections = text.split('\n\n');
      sections.forEach(section => {
        const sectionTitle = section.split('\n')[0].toLowerCase();
        
        if (sectionTitle.includes('summary')) {
          progress.sessionSummary = section.split('\n').slice(1).join(' ').trim();
        } else if (sectionTitle.includes('goals')) {
          const goalLines = section.split('\n').slice(1);
          progress.goals = goalLines.map(line => {
            const [goal, statusStr] = line.split('|').map(s => s.trim());
            const progressMatch = statusStr.match(/(\d+)%/);
            const progress = progressMatch ? parseInt(progressMatch[1]) : 0;
            const status = statusStr.toLowerCase().includes('achieved') ? 'achieved' :
                          statusStr.toLowerCase().includes('progress') ? 'in-progress' : 'not-started';
            return { goal, progress, status };
          }).filter(g => g.goal);
        } else if (sectionTitle.includes('improvements')) {
          const lines = section.split('\n').slice(1);
          lines.forEach(line => {
            if (line.toLowerCase().includes('strengths:')) {
              progress.improvements!.strengths = line.split(':')[1].split('-').map(s => s.trim()).filter(s => s);
            } else if (line.toLowerCase().includes('challenges:')) {
              progress.improvements!.challenges = line.split(':')[1].split('-').map(s => s.trim()).filter(s => s);
            } else if (line.toLowerCase().includes('recommendations:')) {
              progress.improvements!.recommendations = line.split(':')[1].split('-').map(s => s.trim()).filter(s => s);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error parsing progress:', error);
    }

    return progress;
  }

  async analyzeSession(conversation: string[]): Promise<SessionAnalysis> {
    const prompt = `Analyze this therapy conversation and provide a structured response with:

Emotional State: [User's current emotional state]

Key Topics: 
- [Topic 1]
- [Topic 2]
...

Insights:
- [Insight 1]
- [Insight 2]
...

Conversation:
${conversation.join('\n')}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing session:', error);
      return {
        emotionalState: 'Unable to analyze',
        keyTopics: [],
        insights: []
      };
    }
  }

  async trackProgress(conversation: string[]): Promise<ProgressData> {
    const prompt = `Based on this therapy conversation, provide a structured progress report in the following format:

Summary:
[Brief summary of the session and key points discussed]

Goals:
[Goal 1] | [Progress percentage]% - [Status: not-started/in-progress/achieved]
[Goal 2] | [Progress percentage]% - [Status: not-started/in-progress/achieved]
...

Improvements:
Strengths: [Strength 1] - [Strength 2] - [Strength 3]
Challenges: [Challenge 1] - [Challenge 2] - [Challenge 3]
Recommendations: [Recommendation 1] - [Recommendation 2] - [Recommendation 3]

Conversation:
${conversation.join('\n')}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const progress = this.parseProgressResponse(text);

      return {
        sessionSummary: progress.sessionSummary || 'Unable to generate summary',
        goals: progress.goals || [],
        improvements: progress.improvements || {
          strengths: [],
          challenges: [],
          recommendations: []
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error tracking progress:', error);
      return {
        sessionSummary: "Unable to generate session summary",
        goals: [],
        improvements: {
          strengths: [],
          challenges: [],
          recommendations: []
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async saveProgress(progressData: ProgressData): Promise<void> {
    try {
      const existingData = localStorage.getItem('therapy-progress') || '[]';
      const allProgress = JSON.parse(existingData);
      allProgress.push(progressData);
      localStorage.setItem('therapy-progress', JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async getProgressHistory(): Promise<ProgressData[]> {
    try {
      const data = localStorage.getItem('therapy-progress') || '[]';
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting progress history:', error);
      return [];
    }
  }
}

export const initializeProgressTracker = (apiKey: string) => {
  return new ProgressTracker(apiKey);
};
