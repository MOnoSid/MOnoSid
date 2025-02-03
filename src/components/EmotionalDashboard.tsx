import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EmotionalDashboard.css';
import CopingStrategies from './CopingStrategies';

interface EmotionData {
  timestamp: string;
  emotion: string;
  intensity: number;
  trigger?: string;
  recommendation?: string;
}

interface Insight {
  pattern: string;
  suggestion: string;
  progress: number;
}

interface EmotionalDashboardProps {
  sessionData: EmotionData[];
  messages: { text: string; isUser: boolean }[];
}

const EmotionalDashboard: React.FC<EmotionalDashboardProps> = ({ 
  sessionData,
  messages 
}) => {
  const [wellbeingScore, setWellbeingScore] = useState(50);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);

  useEffect(() => {
    analyzeEmotionalPatterns(sessionData);
    // Update current emotion when session data changes
    if (sessionData.length > 0) {
      setCurrentEmotion(sessionData[sessionData.length - 1]);
    }
  }, [sessionData]);

  const analyzeEmotionalPatterns = (data: EmotionData[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      setWellbeingScore(50);
      setInsights([
        {
          pattern: "Getting Started",
          suggestion: "Share your thoughts to begin your emotional journey",
          progress: 0
        }
      ]);
      return;
    }

    // Calculate emotional patterns
    const emotionFrequency = data.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate trends
    const recentEmotions = data.slice(-5); // Last 5 emotions
    const averageRecentIntensity = recentEmotions.reduce((sum, curr) => sum + curr.intensity, 0) / recentEmotions.length;
    const previousIntensity = data.slice(-10, -5).reduce((sum, curr) => sum + curr.intensity, 0) / 5;
    
    // Calculate emotional diversity
    const uniqueEmotions = new Set(data.map(d => d.emotion)).size;
    const emotionalDiversity = (uniqueEmotions / Object.keys(emotionFrequency).length) * 100;

    // Identify dominant emotions
    const dominantEmotions = Object.entries(emotionFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    // Calculate wellbeing score
    const positiveEmotions = ['joy', 'gratitude', 'hope', 'love'];
    const positiveCount = positiveEmotions.reduce((sum, emotion) => 
      sum + (emotionFrequency[emotion] || 0), 0);
    const totalEmotions = Object.values(emotionFrequency).reduce((a, b) => a + b, 0);
    const wellbeingScore = Math.round((positiveCount / totalEmotions) * 100);
    setWellbeingScore(wellbeingScore);

    // Generate dynamic insights
    const newInsights = [
      {
        pattern: "Emotional Growth",
        suggestion: generateEmotionalGrowthInsight(averageRecentIntensity, previousIntensity, dominantEmotions),
        progress: calculateGrowthProgress(averageRecentIntensity, previousIntensity)
      },
      {
        pattern: "Interaction Quality",
        suggestion: generateInteractionInsight(data.length, uniqueEmotions, dominantEmotions),
        progress: Math.min(data.length * 10, 100)
      },
      {
        pattern: "Emotional Balance",
        suggestion: generateBalanceInsight(emotionalDiversity, dominantEmotions),
        progress: Math.round(emotionalDiversity)
      }
    ];

    setInsights(newInsights);
  };

  const generateEmotionalGrowthInsight = (
    currentIntensity: number,
    previousIntensity: number,
    dominantEmotions: string[]
  ): string => {
    const change = currentIntensity - previousIntensity;
    const emotion = dominantEmotions[0];
    
    if (Math.abs(change) < 5) {
      return `You're maintaining steady emotional expression, primarily showing ${emotion}`;
    } else if (change > 0) {
      return `Your emotional expression has deepened, especially in showing ${emotion}`;
    } else {
      return `You're finding more balance in your emotional expression`;
    }
  };

  const generateInteractionInsight = (
    sessionLength: number,
    uniqueEmotions: number,
    dominantEmotions: string[]
  ): string => {
    if (sessionLength < 3) {
      return "Keep sharing your feelings to build a deeper understanding";
    } else if (uniqueEmotions < 3) {
      return `You're expressing ${dominantEmotions[0]} consistently. Feel free to explore other emotions`;
    } else {
      return `You're sharing a rich variety of emotions, which helps build better insights`;
    }
  };

  const generateBalanceInsight = (
    diversity: number,
    dominantEmotions: string[]
  ): string => {
    if (diversity < 30) {
      return `Your emotions are centered around ${dominantEmotions[0]}. Consider exploring other feelings`;
    } else if (diversity < 60) {
      return `You're showing good emotional range, balancing ${dominantEmotions[0]} and ${dominantEmotions[1]}`;
    } else {
      return `You're expressing a healthy range of emotions, showing good emotional awareness`;
    }
  };

  const calculateGrowthProgress = (current: number, previous: number): number => {
    const change = current - previous;
    return Math.min(Math.max(50 + (change * 2), 0), 100);
  };

  return (
    <div className="emotional-dashboard">
      <h2 className="dashboard-title">Emotional Intelligence Dashboard</h2>
      <div className="dashboard-grid">
        <div className="wellbeing-card">
          <h3>Emotional Wellbeing</h3>
          <div 
            className="score-circle" 
            style={{ '--score': `${wellbeingScore}%` } as React.CSSProperties}
          >
            <span>{wellbeingScore}%</span>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Emotional Journey</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessionData}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="intensity" stroke="#4f46e5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="insights-card">
          <h3>Personalized Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-header">
                  <h4>{insight.pattern}</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${insight.progress}%` }}
                    />
                  </div>
                </div>
                <p>{insight.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentEmotion && (
        <CopingStrategies
          currentEmotion={currentEmotion.emotion}
          intensity={currentEmotion.intensity}
          sessionData={sessionData}
          messages={messages}
        />
      )}
    </div>
  );
};

export default EmotionalDashboard;
