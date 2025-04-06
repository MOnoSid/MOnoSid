import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Activity,
  Heart,
  Calendar,
  Clock,
  MessageCircle,
  BarChart2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ProgressTracker } from '@/utils/progressTracking';
import { ContentRecommender } from '@/utils/contentRecommender';

interface DashboardProps {
  apiKey: string;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = React.useState<{
    sessionCount: number;
    totalDuration: number;
    averageEngagement: number;
    lastSessionDate: string;
    emotionalProgress: any[];
    goalCompletion: {
      achieved: number;
      inProgress: number;
      notStarted: number;
    };
    topEmotions: Array<{
      emotion: string;
      percentage: number;
    }>;
    recentSessions: Array<{
      date: string;
      summary: string;
      duration: number;
      emotions: string[];
    }>;
    recommendedContent: Array<{
      title: string;
      category: string;
      relevance: number;
    }>;
  }>({
    sessionCount: 0,
    totalDuration: 0,
    averageEngagement: 0,
    lastSessionDate: '',
    emotionalProgress: [],
    goalCompletion: {
      achieved: 0,
      inProgress: 0,
      notStarted: 0
    },
    topEmotions: [],
    recentSessions: [],
    recommendedContent: []
  });

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const progressTracker = new ProgressTracker(apiKey);
        const contentRecommender = new ContentRecommender(apiKey);

        // Get progress history
        const progressHistory = await progressTracker.getProgressHistory();

        if (progressHistory.length === 0) {
          setAnalyticsData({
            sessionCount: 0,
            totalDuration: 0,
            averageEngagement: 0,
            lastSessionDate: '',
            emotionalProgress: [],
            goalCompletion: {
              achieved: 0,
              inProgress: 0,
              notStarted: 0
            },
            topEmotions: [],
            recentSessions: [],
            recommendedContent: []
          });
          setIsLoading(false);
          return;
        }

        // Calculate session statistics
        const sessionCount = progressHistory.length;
        const lastSessionDate = new Date(progressHistory[progressHistory.length - 1].timestamp)
          .toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

        // Calculate goal completion stats
        const goalCompletion = progressHistory.reduce((acc, session) => {
          session.goals.forEach(goal => {
            if (goal.status === 'achieved') acc.achieved++;
            else if (goal.status === 'in-progress') acc.inProgress++;
            else acc.notStarted++;
          });
          return acc;
        }, { achieved: 0, inProgress: 0, notStarted: 0 });

        // Calculate emotional progress
        const emotionalProgress = progressHistory.map(session => ({
          date: new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          engagement: session.emotionalJourney.engagementLevel[0] || 0,
          positivity: session.emotionalJourney.emotions.reduce((sum, e) => sum + (e.value > 0 ? e.value : 0), 0) / 
            session.emotionalJourney.emotions.length || 0
        }));

        // Get top emotions
        const emotionCounts: { [key: string]: number } = {};
        progressHistory.forEach(session => {
          session.emotionalJourney.dominantEmotions.forEach(emotion => {
            emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + emotion.percentage;
          });
        });

        const topEmotions = Object.entries(emotionCounts)
          .map(([emotion, count]) => ({
            emotion,
            percentage: Math.round(count / progressHistory.length)
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);

        // Get recent sessions
        const recentSessions = progressHistory
          .slice(-5)
          .reverse()
          .map(session => ({
            date: new Date(session.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            summary: session.sessionSummary,
            duration: 30, // This would need to be tracked in the actual sessions
            emotions: session.emotionalJourney.dominantEmotions
              .slice(0, 3)
              .map(e => e.emotion)
          }));

        setAnalyticsData({
          sessionCount,
          totalDuration: sessionCount * 30, // Assuming 30 minutes per session
          averageEngagement: progressHistory.reduce((sum, session) => 
            sum + (session.emotionalJourney.engagementLevel[0] || 0), 0) / sessionCount,
          lastSessionDate,
          emotionalProgress,
          goalCompletion,
          topEmotions,
          recentSessions,
          recommendedContent: [] // This would be populated from ContentRecommender
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [apiKey]);

  const EMOTION_COLORS = {
    joy: '#10B981',
    sadness: '#6366F1',
    anger: '#EF4444',
    fear: '#F59E0B',
    surprise: '#8B5CF6',
    neutral: '#6B7280'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Therapy Journey Dashboard</h1>
          <p className="text-gray-600">Track your progress and insights from therapy sessions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.sessionCount}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-600">{analyticsData.totalDuration} minutes total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Goals Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.goalCompletion.achieved} Achieved
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">
                  {analyticsData.goalCompletion.inProgress} In Progress
                </Badge>
                <Badge className="bg-gray-100 text-gray-700">
                  {analyticsData.goalCompletion.notStarted} New
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(analyticsData.averageEngagement)}%
        </p>
      </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-600">Average session engagement</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Session</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.lastSessionDate || 'No sessions yet'}
                  </p>
                  </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <Button 
                className="mt-4 w-full"
                onClick={() => navigate('/therapy')}
              >
                Start New Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emotional Progress Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Emotional Progress</CardTitle>
              <CardDescription>Track your emotional journey over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.emotionalProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#6366F1"
                      name="Engagement"
                    />
                    <Line
                      type="monotone"
                      dataKey="positivity"
                      stroke="#10B981"
                      name="Positivity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Dominant Emotions Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Emotional Distribution</CardTitle>
              <CardDescription>Most frequent emotions during sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.topEmotions}
                      dataKey="percentage"
                      nameKey="emotion"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analyticsData.topEmotions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || '#6B7280'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            </Card>
      </div>

        {/* Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your latest therapy conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentSessions.map((session, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 
                        transition-colors bg-white"
            >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{session.date}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Duration: {session.duration} minutes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {session.emotions.map((emotion, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-gray-100 text-gray-700"
                            >
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                  </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {session.summary}
                    </p>
                  </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Continue your therapy journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-between"
                  onClick={() => navigate('/therapy')}
                >
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start New Session
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => navigate('/progress')}
                >
                  <span className="flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    View Detailed Progress
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => navigate('/goals')}
                >
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Review Goals
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Session Streak */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Session Streak</h4>
                  <Sparkles className="w-5 h-5 text-blue-500" />
      </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.min(analyticsData.sessionCount, 7)} Days
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Keep up the great work!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
