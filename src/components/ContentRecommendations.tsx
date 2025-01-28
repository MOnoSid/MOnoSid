import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Sparkles,
  BookOpen,
  Rocket,
  Wind,
  Heart,
  Activity,
  Moon
} from "lucide-react";
import type { ContentCategory } from '@/utils/contentRecommender';

interface ContentItem {
  title: string;
  url: string;
  description: string;
  category: ContentCategory;
}

interface ContentRecommendationsProps {
  recommendations: {
    meditation: ContentItem[];
    relaxation: ContentItem[];
    educational: ContentItem[];
    motivation: ContentItem[];
    breathing: ContentItem[];
    mindfulness: ContentItem[];
    exercise: ContentItem[];
    sleep: ContentItem[];
    reason: string;
  };
}

const categoryIcons = {
  meditation: Brain,
  relaxation: Sparkles,
  educational: BookOpen,
  motivation: Rocket,
  breathing: Wind,
  mindfulness: Heart,
  exercise: Activity,
  sleep: Moon,
};

const categoryTitles = {
  meditation: 'Meditation',
  relaxation: 'Relaxation',
  educational: 'Educational',
  motivation: 'Motivation',
  breathing: 'Breathing',
  mindfulness: 'Mindfulness',
  exercise: 'Exercise',
  sleep: 'Sleep',
};

const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({
  recommendations
}) => {
  const [activeTab, setActiveTab] = useState<ContentCategory>('meditation');
  
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Count total recommendations
  const totalRecommendations = Object.values(recommendations).reduce(
    (sum, items) => (Array.isArray(items) ? sum + items.length : sum),
    0
  );

  if (totalRecommendations === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Content</CardTitle>
        <CardDescription>{recommendations.reason}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meditation" onValueChange={(value) => setActiveTab(value as ContentCategory)}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
            {(Object.keys(categoryIcons) as ContentCategory[]).map((category) => {
              const Icon = categoryIcons[category];
              const hasContent = recommendations[category].length > 0;
              
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  disabled={!hasContent}
                  className={`flex flex-col items-center p-2 ${!hasContent ? 'opacity-50' : ''}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{categoryTitles[category]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(recommendations) as ContentCategory[]).map((category) => {
            if (!Array.isArray(recommendations[category])) return null;
            
            return (
              <TabsContent key={category} value={category}>
                <div className="space-y-4">
                  {recommendations[category].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-600">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openInNewTab(item.url)}
                          className="ml-4"
                        >
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentRecommendations;
