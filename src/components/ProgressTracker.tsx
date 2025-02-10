import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

interface ProgressTrackerProps {
  sessionSummary?: string;
  goals?: Array<{
    title: string;
    description: string;
    progress: number;
    status?: 'not-started' | 'in-progress' | 'achieved';
  }>;
  improvements?: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  emotionalJourney?: {
    emotions?: Array<{
      timestamp: string;
      emotion: string;
      value: number;
    }>;
    dominantEmotions?: Array<{
      emotion: string;
      percentage: number;
    }>;
    engagementLevel?: number[];
  };
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

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sessionSummary = '',
  goals = [],
  improvements = defaultImprovements,
  emotionalJourney = defaultEmotionalJourney
}) => {
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
        // Clean the timestamp by removing asterisks
        const cleanTimestamp = entry.timestamp.replace(/\*/g, '').trim();
        const date = new Date(cleanTimestamp);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return {
          time: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          value: entry.value || 0,
          emotion: entry.emotion || 'neutral',
          tooltipTime: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };
      } catch (error) {
        console.error('Error processing emotion entry:', error, entry);
        // Clean the timestamp for display even in error case
        const displayTimestamp = entry.timestamp?.replace(/\*/g, '').trim() || 'Invalid Date';
        return {
          time: displayTimestamp,
          value: entry.value || 0,
          emotion: entry.emotion || 'unknown',
          tooltipTime: displayTimestamp
        };
      }
    });
  }, [emotionalJourney?.emotions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]?.payload) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.tooltipTime}</p>
          <p className="text-sm text-gray-600">Emotion: {payload[0].payload.emotion}</p>
          <p className="text-sm text-gray-600">Intensity: {payload[0].payload.value}</p>
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

  return (
    <div className="space-y-6">
      {/* Session Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-500">
            <Brain className="w-5 h-5 text-blue-500" />
            <CardTitle>Key points from your conversation</CardTitle>
          </div>
          <CardDescription>Summary of your therapy session</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionSummary ? (
            <div className="prose prose-sm max-w-none text-blue-100">
              {formatSummary(sessionSummary)}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 italic">
                Unable to generate summary
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emotional Journey */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-500">
            <Heart className="w-5 h-5 text-rose-500" />
            <CardTitle>Emotional Journey</CardTitle>
          </div>
          <CardDescription>Your emotional progression throughout the session</CardDescription>
        </CardHeader>
        <CardContent>
          {emotionChartData.length > 0 ? (
            <>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emotionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEmotion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time"
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#666' }}
                    />
                    <YAxis
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#666' }}
                      domain={[0, 5]}
                      tickCount={6}
                      label={{ 
                        value: 'Emotional Intensity', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#666' }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEmotion)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Emotion Labels */}
              <div className="mt-4 flex flex-wrap gap-2">
                {emotionChartData.map((entry, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm"
                  >
                    {entry.time}: {entry.emotion}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 italic">
                No emotional data available yet
              </p>
            </div>
          )}
          
          {/* Dominant Emotions Donut */}
          {dominantEmotionsData.length > 0 && (
            <div className="mt-6">
              <TremorCard>
                <Title>Dominant Emotions</Title>
                <DonutChart
                  className="mt-6 h-52"
                  data={dominantEmotionsData}
                  category="percentage"
                  index="emotion"
                  valueFormatter={(value) => `${value}%`}
                  colors={["rose", "cyan", "amber", "indigo", "green"]}
                />
              </TremorCard>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Radar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <CardTitle>Session Engagement</CardTitle>
          </div>
          <CardDescription>Analysis of your engagement during therapy</CardDescription>
        </CardHeader>
        <CardContent>
          {engagementData.some(d => d.value > 0) ? (
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={engagementData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#666' }}
                    tickCount={6}
                  />
                  <Radar
                    name="Engagement"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {data.subject}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {data.value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              
              {/* Engagement Metrics Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-white">
                {engagementData.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {metric.subject}
                    </div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {metric.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 italic">
                No engagement data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <CardTitle>Goals Progress</CardTitle>
            </div>
            <CardDescription>Track your therapy goals</CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.status && (
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 italic">
                  No goals set yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <CardTitle>Progress Insights</CardTitle>
          </div>
          <CardDescription>Your strengths and areas for growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-green-600 mb-3">Strengths</h4>
              {improvements.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {improvements.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No strengths identified yet
                </p>
              )}
            </div>

            {/* Challenges */}
            <div>
              <h4 className="font-semibold text-amber-600 mb-3">Challenges</h4>
              {improvements.challenges.length > 0 ? (
                <ul className="space-y-2">
                  {improvements.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                      <span className="text-sm text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No challenges identified yet
                </p>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-3">Recommendations</h4>
              {improvements.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {improvements.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No recommendations available yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <CardTitle>Recommended Content</CardTitle>
          </div>
          <CardDescription>Personalized content based on your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 italic">
              Content recommendations will appear here after your session
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
