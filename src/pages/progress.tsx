import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressTracker from '@/components/ProgressTracker';
import ContentRecommendations from '@/components/ContentRecommendations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { generateAnalysisPDF } from '@/utils/pdfGenerator';
import { toast } from '@/components/ui/use-toast';

const defaultProgress = {
  sessionSummary: '',
  goals: [],
  improvements: {
    strengths: [],
    challenges: [],
    recommendations: []
  },
  emotionalJourney: {
    emotions: [],
    dominantEmotions: [],
    engagementLevel: []
  }
};

const defaultRecommendations = {
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

const ProgressPage = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = React.useState(defaultProgress);
  const [recommendations, setRecommendations] = React.useState(defaultRecommendations);

  React.useEffect(() => {
    try {
      // Load progress data
      const savedProgress = localStorage.getItem('current-progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgressData({
          sessionSummary: parsed.sessionSummary || '',
          goals: Array.isArray(parsed.goals) ? parsed.goals.map(g => ({
            ...g,
            progress: Math.min(100, Math.max(0, g.progress || 0)),
            status: g.status || 'not-started'
          })) : [],
          improvements: {
            strengths: Array.isArray(parsed.improvements?.strengths) ? parsed.improvements.strengths : [],
            challenges: Array.isArray(parsed.improvements?.challenges) ? parsed.improvements.challenges : [],
            recommendations: Array.isArray(parsed.improvements?.recommendations) ? parsed.improvements.recommendations : []
          },
          emotionalJourney: {
            emotions: Array.isArray(parsed.emotionalJourney?.emotions) ? parsed.emotionalJourney.emotions : [],
            dominantEmotions: Array.isArray(parsed.emotionalJourney?.dominantEmotions) ? parsed.emotionalJourney.dominantEmotions : [],
            engagementLevel: Array.isArray(parsed.emotionalJourney?.engagementLevel) ? 
              parsed.emotionalJourney.engagementLevel.map((v: number) => Math.min(100, Math.max(0, v || 0))) : 
              [0, 0, 0, 0, 0]
          }
        });
      }

      // Load recommendations
      const savedRecommendations = localStorage.getItem('content-recommendations');
      if (savedRecommendations) {
        const parsed = JSON.parse(savedRecommendations);
        setRecommendations({
          meditation: Array.isArray(parsed.meditation) ? parsed.meditation : [],
          relaxation: Array.isArray(parsed.relaxation) ? parsed.relaxation : [],
          educational: Array.isArray(parsed.educational) ? parsed.educational : [],
          motivation: Array.isArray(parsed.motivation) ? parsed.motivation : [],
          breathing: Array.isArray(parsed.breathing) ? parsed.breathing : [],
          mindfulness: Array.isArray(parsed.mindfulness) ? parsed.mindfulness : [],
          exercise: Array.isArray(parsed.exercise) ? parsed.exercise : [],
          sleep: Array.isArray(parsed.sleep) ? parsed.sleep : [],
          reason: parsed.reason || ''
        });
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  }, []);

  const handleBack = () => {
    navigate('/therapy');
  };

  return (
    <div className="min-h-screen bg-therapy-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-therapy-surface/80 backdrop-blur-sm border-b border-therapy-border-light/10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-therapy-text-primary w-8 h-8 sm:w-10 sm:h-10"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold text-therapy-text-primary">
                Session Analysis
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await generateAnalysisPDF('analysis-content');
                  toast({
                    title: "Success",
                    description: "Analysis downloaded successfully",
                    variant: "default"
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to download analysis. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 h-auto"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Download Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div id="analysis-content" className="grid grid-cols-1 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {/* Progress Section */}
          <div className="space-y-4 sm:space-y-6">
            <ProgressTracker
              sessionSummary={progressData.sessionSummary}
              goals={progressData.goals}
              improvements={progressData.improvements}
              emotionalJourney={progressData.emotionalJourney}
            />
          </div>

          {/* Recommendations Section */}
          <div className="space-y-4 sm:space-y-6">
            <ContentRecommendations recommendations={recommendations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
