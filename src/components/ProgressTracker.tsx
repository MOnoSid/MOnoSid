import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Activity, Heart, Lightbulb } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Card as TremorCard, Title, DonutChart } from "@tremor/react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  sessionSummary: string;
  goals: Array<{
    goal: string;
    progress: number;
    status: 'not-started' | 'in-progress' | 'achieved';
    title?: string;
    description?: string;
  }>;
  improvements: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  emotionalJourney: {
    emotions: Array<{
      timestamp: string;
      emotion: string;
      value: number;
    }>;
    dominantEmotions: Array<{
      emotion: string;
      percentage: number;
    }>;
    engagementLevel: number[];
  };
  timestamp?: string;
}

const defaultEmotionalJourney = {
  emotions: [],
  dominantEmotions: [],
  engagementLevel: []
};

const defaultImprovements = {
  strengths: [],
  challenges: [],
  recommendations: []
};

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  indicatorClassName,
  ...props
}) => {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 bg-blue-500 transition-all", indicatorClassName)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sessionSummary = '',
  goals = [],
  improvements = defaultImprovements,
  emotionalJourney = defaultEmotionalJourney,
  timestamp
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (timestamp) {
      setIsLoading(true);
      setError(null);
      
      // Update charts and visualizations when new data arrives
      try {
        updateVisualizations();
      } catch (err) {
        setError('Error updating progress visualizations');
        console.error('Visualization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [timestamp]);

  const updateVisualizations = () => {
    // This will trigger re-renders of all charts and progress indicators
    // The data is already passed through props, so we just need to ensure
    // the component updates when new data arrives
  };

  const formatSummary = (text: string) => {
    if (!text) return null;
    
    // Replace double asterisks with emphasis tags
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<em>$1</em>');
    
    const sections = processedText.split(/\d\./).filter(Boolean);
    if (sections.length > 1) {
      return (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: section.trim() }} />
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Prepare data for emotional journey chart with better formatting
  const emotionChartData = React.useMemo(() => {
    const emotions = emotionalJourney?.emotions || [];
    return emotions.map((entry) => {
      try {
        // Clean and parse the timestamp
        const cleanTimestamp = entry.timestamp.replace(/\*/g, '').trim();
        const date = new Date(cleanTimestamp);
        
        // Scale the emotion value to 0-5 range if it's not already
        const scaledValue = entry.value > 5 ? entry.value / 20 : entry.value;
        
        return {
          time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          value: Math.min(5, Math.max(0, scaledValue)), // Ensure value is between 0-5
          emotion: entry.emotion || 'neutral',
          tooltipTime: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        };
      } catch (error) {
        console.error('Error processing emotion entry:', error, entry);
        return {
          time: entry.timestamp?.replace(/\*/g, '').trim() || 'Invalid Time',
          value: Math.min(5, Math.max(0, entry.value || 0)),
          emotion: entry.emotion || 'unknown',
          tooltipTime: entry.timestamp || 'Invalid Time'
        };
      }
    }).sort((a, b) => {
      // Sort by time to ensure proper chart progression
      return new Date(a.tooltipTime).getTime() - new Date(b.tooltipTime).getTime();
    });
  }, [emotionalJourney?.emotions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{data.tooltipTime}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Emotion:</span> {data.emotion}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Intensity:</span> {data.value.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Ensure dominantEmotions is always an array with valid data
  const dominantEmotionsData = React.useMemo(() => {
    const emotions = emotionalJourney?.dominantEmotions || [];
    return emotions.map(emotion => ({
      emotion: emotion.emotion || 'Unknown',
      percentage: emotion.percentage || 0
    }));
  }, [emotionalJourney?.dominantEmotions]);

  // Prepare data for engagement radar
  const engagementData = React.useMemo(() => {
    const levels = emotionalJourney?.engagementLevel || [];
    return [
      { subject: 'Participation', value: levels[0] || 0 },
      { subject: 'Emotional Depth', value: levels[1] || 0 },
      { subject: 'Self-Reflection', value: levels[2] || 0 },
      { subject: 'Progress', value: levels[3] || 0 },
      { subject: 'Openness', value: levels[4] || 0 },
    ];
  }, [emotionalJourney?.engagementLevel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
        <button 
          onClick={updateVisualizations}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Session Summary */}
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Session Insights</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-blue-600/80">
            Key takeaways and progress from your conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {sessionSummary ? (
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <h4 className="text-blue-800 font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Session Overview
                </h4>
                <div className="prose prose-blue max-w-none text-gray-700">
              {formatSummary(sessionSummary)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                  <h4 className="text-emerald-800 font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress Highlights
                  </h4>
                  <ul className="space-y-2">
                    {improvements.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100">
                  <h4 className="text-amber-800 font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Areas for Focus
                  </h4>
                  <ul className="space-y-2">
                    {improvements.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span className="text-gray-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Session summary will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Therapy Goals & Progress</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-blue-600/80">
            Goals identified from your therapy conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {goals.length > 0 ? (
            <div className="space-y-6">
              {/* Goals Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-emerald-800 font-medium">Achieved</h4>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {goals.filter(g => g.status === 'achieved').length}
                    </p>
                    <p className="text-sm text-emerald-600/80 mt-1">Completed goals</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-blue-800 font-medium">In Progress</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {goals.filter(g => g.status === 'in-progress').length}
                    </p>
                    <p className="text-sm text-blue-600/80 mt-1">Active goals</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-800 font-medium">Identified</h4>
                    <p className="text-2xl font-bold text-gray-600 mt-1">
                      {goals.filter(g => g.status === 'not-started').length}
                    </p>
                    <p className="text-sm text-gray-600/80 mt-1">New goals</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Goals List */}
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-xl bg-gradient-to-r from-blue-50/50 to-white border border-blue-100
                      hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${
                                goal.status === 'achieved' ? 'bg-emerald-500' :
                                goal.status === 'in-progress' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }`} />
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {goal.title || goal.goal}
                              </h4>
                              <Badge 
                                className={`
                                  ${goal.status === 'achieved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    goal.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'}
                                  px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                                `}
                              >
                                {goal.status === 'not-started' ? 'Identified' :
                                  goal.status.split('-').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                  </Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-gray-600">{goal.description}</p>
                            )}
              </div>
            </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress towards goal</span>
                            <span className={`font-medium ${
                              goal.status === 'achieved' ? 'text-emerald-600' :
                              goal.status === 'in-progress' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="relative pb-8">
                            <ProgressBar 
                              value={goal.progress} 
                              className="h-2.5 bg-blue-100" 
                              indicatorClassName={`
                                ${goal.status === 'achieved' ? 'bg-emerald-500' :
                                  goal.status === 'in-progress' ? 'bg-blue-500' :
                                  'bg-gray-400'}
                              `}
                            />
                            {/* Progress Milestones */}
                            <div className="absolute -bottom-1 left-0 w-full flex justify-between">
                              <div className="flex flex-col items-center">
                                <div className={`w-1 h-3 ${goal.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500 mt-1">Initial</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-1 h-3 ${goal.progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500 mt-1">Early</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-1 h-3 ${goal.progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500 mt-1">Halfway</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-1 h-3 ${goal.progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500 mt-1">Advanced</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-1 h-3 ${goal.progress >= 100 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500 mt-1">Complete</span>
            </div>
          </div>
                          </div>
                        </div>

                        {/* Goal Insights */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              goal.progress >= 75 ? 'bg-emerald-500' :
                              goal.progress >= 25 ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`} />
                            <span className={`${
                              goal.progress >= 75 ? 'text-emerald-700' :
                              goal.progress >= 50 ? 'text-blue-700' :
                              goal.progress >= 25 ? 'text-blue-700' :
                              goal.progress > 0 ? 'text-blue-700' :
                              'text-gray-600'
                            }`}>
                              {goal.progress >= 75 ? 'Excellent progress! Keep up the great work!' :
                               goal.progress >= 50 ? 'Strong progress on this goal - halfway there!' :
                               goal.progress >= 25 ? 'Making steady progress - keep going!' :
                               goal.progress > 0 ? 'Taking the first steps toward this goal' :
                               'Goal identified from your conversation'}
                            </span>
                          </div>
                        </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No goals identified yet</p>
              <p className="text-sm text-gray-400">Goals will be automatically identified from your therapy conversations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Insights */}
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
          <div className="flex items-center gap-2 text-purple-600">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Progress Insights</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-purple-600/80">
            Your strengths and areas for growth
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100
              hover:shadow-md transition-all duration-300">
              <h4 className="text-emerald-800 font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Strengths
              </h4>
              {improvements.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {improvements.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="text-emerald-500 transition-transform group-hover:scale-110">•</span>
                      <span className="text-gray-700 group-hover:text-emerald-700 transition-colors">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Strengths will be identified as you progress</p>
              )}
            </div>

            {/* Challenges */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-100
              hover:shadow-md transition-all duration-300">
              <h4 className="text-amber-800 font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Growth Areas
              </h4>
              {improvements.challenges.length > 0 ? (
                <ul className="space-y-3">
                  {improvements.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="text-amber-500 transition-transform group-hover:scale-110">•</span>
                      <span className="text-gray-700 group-hover:text-amber-700 transition-colors">
                        {challenge}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Areas for growth will be identified during sessions</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100
              hover:shadow-md transition-all duration-300">
              <h4 className="text-blue-800 font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Recommendations
              </h4>
              {improvements.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {improvements.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="text-blue-500 transition-transform group-hover:scale-110">•</span>
                      <span className="text-gray-700 group-hover:text-blue-700 transition-colors">
                        {recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Personalized recommendations will appear here</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Content */}
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Personalized Resources</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-indigo-600/80">
            Curated content to support your therapy journey
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {improvements.recommendations.length > 0 ? (
            <div className="space-y-6">
              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <h5 className="text-blue-800 font-medium mt-2">Mindfulness</h5>
                  <p className="text-sm text-blue-600/80 mt-1">Mental wellness</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h5 className="text-emerald-800 font-medium mt-2">Exercise</h5>
                  <p className="text-sm text-emerald-600/80 mt-1">Physical health</p>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <h5 className="text-purple-800 font-medium mt-2">Relaxation</h5>
                  <p className="text-sm text-purple-600/80 mt-1">Stress relief</p>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <h5 className="text-amber-800 font-medium mt-2">Educational</h5>
                  <p className="text-sm text-amber-600/80 mt-1">Learn & grow</p>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-4">
                {improvements.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="group p-6 rounded-xl bg-gradient-to-r from-indigo-50/50 to-white 
                      border border-indigo-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center
                        group-hover:bg-indigo-200 transition-colors shrink-0">
                        <Lightbulb className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Recommended Resource {index + 1}
                          </h5>
                          <Badge 
                            className="bg-indigo-100 text-indigo-700 border-indigo-200
                              px-2 py-0.5 rounded-full text-xs font-medium border"
                          >
                            Personalized
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-700">
                          {recommendation}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700
                            flex items-center gap-1 transition-colors">
                            <span>Learn More</span>
                            <TrendingUp className="w-3 h-3" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                              Recommended
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                              New
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Resources */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-gray-900 font-medium mb-4">Additional Support Resources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 
                    transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 group-hover:text-indigo-600 
                          transition-colors text-sm">Meditation Guides</h6>
                        <p className="text-xs text-gray-500">Guided practices for mental clarity</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 
                    transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 group-hover:text-indigo-600 
                          transition-colors text-sm">Wellness Activities</h6>
                        <p className="text-xs text-gray-500">Self-care and emotional balance</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 
                    transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 group-hover:text-indigo-600 
                          transition-colors text-sm">Progress Tools</h6>
                        <p className="text-xs text-gray-500">Track and celebrate your journey</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Personalizing your recommendations</p>
              <p className="text-sm text-gray-400">
                We'll suggest relevant content based on your therapy progress and goals
            </p>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
