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

interface ProgressTrackerProps {
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
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sessionSummary,
  goals,
  improvements
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
          <CardDescription>Key points from your conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{sessionSummary}</p>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goals Progress</CardTitle>
          <CardDescription>Track your therapy goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.goal}</span>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Insights</CardTitle>
          <CardDescription>Your strengths and areas for growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
              <ul className="list-disc list-inside space-y-1">
                {improvements.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div>
              <h4 className="font-semibold text-amber-600 mb-2">Challenges</h4>
              <ul className="list-disc list-inside space-y-1">
                {improvements.challenges.map((challenge, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {improvements.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
