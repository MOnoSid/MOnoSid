import React, { useEffect, useState } from 'react';
import { getCopingStrategies } from '@/utils/gemini';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Heart,
  Sparkles,
  CheckCircle2,
  Timer,
  ArrowRight,
  Bookmark,
  PlayCircle,
  Lightbulb
} from 'lucide-react';
import './CopingStrategies.css';

interface Strategy {
  title: string;
  description: string;
  steps: string[];
  category: string;
}

interface CopingStrategiesProps {
  currentEmotion: string;
  intensity: number;
  sessionData: any[];
  messages: { text: string; isUser: boolean }[];
}

const CopingStrategies: React.FC<CopingStrategiesProps> = ({
  currentEmotion,
  intensity,
  messages
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStrategies = async () => {
      setLoading(true);
      try {
        // Get last 5 messages for context
        const recentMessages = messages.slice(-5);
        const newStrategies = await getCopingStrategies(
          currentEmotion,
          intensity,
          recentMessages
        );
        setStrategies(newStrategies);
      } catch (error) {
        console.error('Error fetching strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentEmotion && messages.length > 0) {
      fetchStrategies();
    }
  }, [currentEmotion, intensity, messages]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mindfulness':
        return Brain;
      case 'emotional':
        return Heart;
      case 'behavioral':
        return Sparkles;
      case 'physical':
        return Timer;
      default:
        return Lightbulb;
    }
  };

  const [activeStrategy, setActiveStrategy] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});

  const handleStrategyClick = (index: number) => {
    setActiveStrategy(activeStrategy === index ? null : index);
  };

  const handleStepComplete = (strategyIndex: number, totalSteps: number) => {
    setProgress(prev => ({
      ...prev,
      [strategyIndex]: Math.min(((prev[strategyIndex] || 0) + 1) * (100 / totalSteps), 100)
    }));
  };

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">
            Analyzing emotional context...
          </h3>
        </div>
        <Progress value={40} className="w-full" />
        <p className="text-sm text-muted-foreground">
          Personalizing coping strategies based on your conversation...
        </p>
      </Card>
    );
  }

  if (!strategies.length) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Personalized Strategies</h3>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {strategies.length} Strategies Available
        </Badge>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {strategies.map((strategy, index) => {
            const Icon = getCategoryIcon(strategy.category);
            const currentProgress = progress[index] || 0;
            
            return (
              <Card
                key={index}
                className={`p-4 transition-all duration-200 hover:shadow-md ${
                  activeStrategy === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{strategy.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {strategy.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Progress value={currentProgress} className="flex-1" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(currentProgress)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStrategyClick(index)}
                      >
                        {activeStrategy === index ? 'Hide Steps' : 'Show Steps'}
                        <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${
                          activeStrategy === index ? 'rotate-90' : ''
                        }`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    {activeStrategy === index && (
                      <div className="mt-4 space-y-3">
                        {strategy.steps.map((step, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleStepComplete(index, strategy.steps.length)}
                            >
                              <CheckCircle2 className={`h-4 w-4 ${
                                (progress[index] || 0) > (stepIndex * (100 / strategy.steps.length))
                                  ? 'text-green-500'
                                  : 'text-muted-foreground'
                              }`} />
                            </Button>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default CopingStrategies;
