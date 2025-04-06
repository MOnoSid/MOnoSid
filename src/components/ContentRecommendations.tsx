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
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Sparkles,
  BookOpen,
  Rocket,
  Wind,
  Heart,
  Activity,
  Moon,
  Play,
  ExternalLink,
  Clock,
  Star,
  User
} from "lucide-react";
import type { ContentCategory } from '@/utils/contentRecommender';
import YouTubePlayer from './YouTubePlayer';
import { searchYouTube, getRelevantYouTubeQuery } from '@/utils/youtubeSearch';

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

type RoutineTime = 'morning' | 'afternoon' | 'evening';

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
    userMood: string;
    focusAreas: string[];
    suggestedRoutine?: {
      [K in RoutineTime]: ContentItem[];
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
  };
}

const iconComponents = {
  Brain,
  Sparkles,
  BookOpen,
  Rocket,
  Wind,
  Heart,
  Activity,
  Moon
} as const;

const defaultRecommendations: ContentRecommendationsProps['recommendations'] = {
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
  categories: {} as ContentRecommendationsProps['recommendations']['categories'],
  suggestedRoutine: {
    morning: [],
    afternoon: [],
    evening: []
  }
};

const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({
  recommendations = defaultRecommendations
}) => {
  const [activeTab, setActiveTab] = useState<ContentCategory>('meditation');
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenLink = (item: ContentItem, category: ContentCategory) => {
    const videoId = getVideoId(item.url);
    if (videoId) {
      setActiveVideo(videoId);
    } else {
      const searchQuery = getRelevantYouTubeQuery(category, item.title);
      const searchUrl = searchYouTube(searchQuery);
      openInNewTab(searchUrl);
    }
  };

  const getVideoId = (url: string): string | null => {
    if (!url) return null;
    
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        return urlParams.get('v');
      }
      
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (url.includes('youtube.com/embed/')) {
        return url.split('youtube.com/embed/')[1]?.split('?')[0];
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    return null;
  };

  // Safely check if recommendations exist and have content
  const hasRecommendations = recommendations && Object.keys(recommendations).length > 0;
  const hasCategories = recommendations?.categories && Object.keys(recommendations.categories).length > 0;

  const totalRecommendations = hasRecommendations ? 
    Object.entries(recommendations)
      .filter(([key]) => key !== 'categories' && key !== 'reason' && key !== 'userMood' && key !== 'focusAreas' && key !== 'suggestedRoutine')
      .reduce((sum, [_, items]) => (Array.isArray(items) ? sum + items.length : sum), 0)
    : 0;

  if (!hasRecommendations || !hasCategories || totalRecommendations === 0) {
    return (
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Personalized Resources</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-indigo-600/80">
            No recommendations available at this time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Recommendations will appear here after your therapy session</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-1 sm:space-y-2 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" />
            <CardTitle className="text-lg sm:text-xl font-semibold">Personalized Resources</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base text-indigo-600/80">
            {recommendations.reason || 'Curated content to support your therapy journey'}
          </CardDescription>
          {recommendations.focusAreas?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {recommendations.focusAreas.map((area, index) => (
                <Badge 
                  key={index}
                  className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2 py-0.5"
                >
                  {area}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {/* Daily Routine Section */}
          {recommendations.suggestedRoutine && Object.entries(recommendations.suggestedRoutine).some(([_, items]) => items.length > 0) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Daily Routine</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.entries(recommendations.suggestedRoutine) as [RoutineTime, ContentItem[]][]).map(([time, items]) => (
                  items.length > 0 && (
                    <div 
                      key={time}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900 capitalize">{time}</h4>
                      </div>
                      <div className="space-y-3">
                        {items.map((item: ContentItem, index: number) => (
                          <div 
                            key={index}
                            className="p-3 rounded-lg bg-white border border-gray-100 hover:border-indigo-100 
                              transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {item.iconType && iconComponents[item.iconType] && (
                                <div className={`w-8 h-8 rounded-full ${item.themeColor?.bg || 'bg-gray-100'} 
                                  flex items-center justify-center`}>
                                  {React.createElement(iconComponents[item.iconType], {
                                    className: `w-4 h-4 ${item.themeColor?.text || 'text-gray-600'}`
                                  })}
                                </div>
                              )}
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm">{item.title}</h6>
                                {item.duration && (
                                  <p className="text-xs text-gray-500 mt-1">Duration: {item.duration}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {hasCategories && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {Object.entries(recommendations.categories).map(([category, metadata]) => {
                const hasContent = recommendations[category as ContentCategory]?.length > 0;
                const Icon = iconComponents[metadata.icon as keyof typeof iconComponents];
                
                if (!Icon) return null;
                
                return (
                  <div 
                    key={category}
                    className={`${metadata.themeColor.bg} p-4 rounded-xl border ${metadata.themeColor.border} 
                      text-center ${!hasContent ? 'opacity-50' : ''} transition-all duration-300 
                      hover:shadow-md cursor-pointer`}
                    onClick={() => hasContent && setActiveTab(category as ContentCategory)}
                  >
                    <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center 
                      justify-center mx-auto`}>
                      <Icon className={`w-5 h-5 ${metadata.themeColor.text}`} />
                    </div>
                    <h5 className={`${metadata.themeColor.text} font-medium mt-2`}>
                      {metadata.title}
                    </h5>
                    <p className={`text-sm ${metadata.themeColor.text}/80 mt-1`}>
                      {metadata.description}
                    </p>
                    {hasContent && (
                      <Badge 
                        className={`mt-2 ${metadata.themeColor.bg} ${metadata.themeColor.text} 
                          ${metadata.themeColor.border}`}
                      >
                        {recommendations[category as ContentCategory].length} items
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Content Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as ContentCategory)}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
              {Object.entries(recommendations.categories).map(([category, metadata]) => {
                const Icon = iconComponents[metadata.icon as keyof typeof iconComponents];
                const hasContent = recommendations[category as ContentCategory]?.length > 0;
                
                if (!Icon) return null;
                
                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    disabled={!hasContent}
                    className={`flex flex-col items-center p-2 ${!hasContent ? 'opacity-50' : ''}`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{metadata.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(recommendations.categories).map(([category, metadata]) => {
              const items = recommendations[category as ContentCategory];
              if (!Array.isArray(items) || items.length === 0) return null;
              
              return (
                <TabsContent key={category} value={category}>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className={`${metadata.themeColor.bg} p-4 rounded-lg hover:shadow-md 
                          transition-all duration-300 border ${metadata.themeColor.border}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`font-medium ${metadata.themeColor.text}`}>
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            
                            {/* Additional Content Details */}
                            <div className="flex flex-wrap gap-3 mt-3">
                              {item.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {item.duration}
                                </div>
                              )}
                              {item.difficulty && (
                                <Badge className={`${metadata.themeColor.bg} 
                                  ${metadata.themeColor.text} text-xs`}>
                                  {item.difficulty}
                                </Badge>
                              )}
                              {item.practitioner && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <User className="w-3 h-3" />
                                  {item.practitioner}
                                </div>
                              )}
                            </div>

                            {/* Tags and Benefits */}
                            {(item.tags || item.benefits) && (
                              <div className="mt-3 space-y-2">
                                {item.tags && (
                                  <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag, idx) => (
                                      <Badge 
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {item.benefits && (
                                  <div className="text-xs text-gray-600">
                                    <strong>Benefits:</strong> {item.benefits.join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                          {getVideoId(item.url) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveVideo(getVideoId(item.url))}
                                className={`flex items-center gap-2 ${metadata.themeColor.text}`}
                            >
                              <Play className="h-4 w-4" />
                              Watch
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLink(item, category as ContentCategory)}
                                className={`flex items-center gap-2 ${metadata.themeColor.text}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Find Videos
                            </Button>
                          )}
                          </div>
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

      <YouTubePlayer
        videoId={activeVideo || ''}
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </>
  );
};

export default ContentRecommendations;
