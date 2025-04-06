import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EmotionalDashboard.css';
import CopingStrategies from './CopingStrategies';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, PieChart, Info, Activity, BarChart } from 'lucide-react';

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
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const emotionalDiversity = (uniqueEmotions / Math.max(1, Object.keys(emotionFrequency).length)) * 100;

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
    const wellbeingScore = totalEmotions > 0 ? Math.round((positiveCount / totalEmotions) * 100) : 50;
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
    const emotion = dominantEmotions[0] || 'neutral';
    
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
      return `You're expressing ${dominantEmotions[0] || 'emotions'} consistently. Feel free to explore other emotions`;
    } else {
      return `You're sharing a rich variety of emotions, which helps build better insights`;
    }
  };

  const generateBalanceInsight = (
    diversity: number,
    dominantEmotions: string[]
  ): string => {
    if (diversity < 30) {
      return `Your emotions are centered around ${dominantEmotions[0] || 'a few feelings'}. Consider exploring other feelings`;
    } else if (diversity < 60) {
      return `You're showing good emotional range, balancing ${dominantEmotions[0] || 'primary'} and ${dominantEmotions[1] || 'secondary'} emotions`;
    } else {
      return `You're expressing a healthy range of emotions, showing good emotional awareness`;
    }
  };

  const calculateGrowthProgress = (current: number, previous: number): number => {
    const change = current - previous;
    return Math.min(Math.max(50 + (change * 2), 0), 100);
  };
  
  // Toggle dashboard visibility
  const toggleVisibility = () => {
    setVisible(!visible);
  };

  // Dashboard toggle button that's always visible
  const DashboardToggleButton = () => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleVisibility}
      className={`dashboard-toggle-button fixed ${visible ? 'left-4' : 'left-4'} top-24 p-3 rounded-xl bg-indigo-500/70 hover:bg-indigo-600/80 text-white shadow-lg backdrop-blur-sm z-50 transition-all duration-300`}
    >
      {visible ? 
        <ChevronLeft className="w-5 h-5" /> : 
        <BarChart className="w-5 h-5" />
      }
    </motion.button>
  );

  // If dashboard is not visible, only show the toggle button
  if (!visible) {
    return <DashboardToggleButton />;
  }

  return (
    <motion.div 
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="dashboard-panel flex flex-col h-full w-full md:w-96 absolute left-0 top-0 bottom-0 bg-white/5 backdrop-blur-md shadow-xl border-r border-white/10 z-40"
    >
      <DashboardToggleButton />
      
      {/* Dashboard Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header-animate-in flex-shrink-0 px-6 py-4 bg-transparent"
      >
        <div className="flex items-center gap-4 ml-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="interactive-element p-2.5 bg-indigo-100/5 rounded-xl"
          >
            <Activity className="w-5 h-5 text-indigo-600/50" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900/70">Emotional Analytics</h2>
            <p className="text-sm text-slate-500/70">Your emotional journey insights</p>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content with Fixed Height */}
      <div className="custom-scrollbar flex-1 px-6 py-4 h-[calc(100vh-15rem)] overflow-y-auto bg-transparent">
        <div className="space-y-6">
          {/* Wellbeing Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden group hover:bg-white/20 transition-all duration-300"
          >
            <h3 className="text-base font-semibold mb-3 text-slate-900/70">Emotional Wellbeing</h3>
            <div 
              className="score-circle relative z-10" 
              style={{ '--score': `${wellbeingScore}%` } as React.CSSProperties}
            >
              <span className="text-xl font-bold text-indigo-600">{wellbeingScore}%</span>
            </div>
          </motion.div>

          {/* Chart Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden group hover:bg-white/20 transition-all duration-300"
          >
            <h3 className="text-base font-semibold mb-3 text-slate-900/70">Emotional Journey</h3>
            <div className="relative z-10">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sessionData}>
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="rgb(79, 70, 229)" 
                    strokeWidth={2}
                    dot={{ fill: 'rgb(79, 70, 229)', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: 'rgb(79, 70, 229)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden group hover:bg-white/20 transition-all duration-300"
          >
            <h3 className="text-base font-semibold mb-4 text-slate-900/70">Personalized Insights</h3>
            <div className="space-y-4 relative z-10">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="insight-header mb-2">
                    <h4 className="text-sm font-medium text-slate-900/70 mb-2">{insight.pattern}</h4>
                    <div className="h-1.5 bg-gray-100/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500/70 to-purple-500/70 rounded-full transition-all duration-500"
                        style={{ width: `${insight.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-700/70">{insight.suggestion}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Coping Strategies */}
          {currentEmotion && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative z-10 mb-20"
            >
              <CopingStrategies
                currentEmotion={currentEmotion.emotion}
                intensity={currentEmotion.intensity}
                sessionData={sessionData}
                messages={messages}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionalDashboard;
