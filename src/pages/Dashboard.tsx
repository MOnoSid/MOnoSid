import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  LineChart,
  Brain,
  Activity,
  Calendar,
  ArrowRight,
  Clock,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Sessions",
      value: "24",
      change: "+12%",
      icon: Calendar,
    },
    {
      label: "Weekly Progress",
      value: "68%",
      change: "+4%",
      icon: Activity,
    },
    {
      label: "Avg. Session Length",
      value: "28m",
      change: "+2m",
      icon: Clock,
    },
    {
      label: "Goals Achieved",
      value: "12",
      change: "+3",
      icon: Target,
    },
  ];

  const quickActions = [
    {
      title: "Start Therapy Session",
      description: "Begin a new therapeutic conversation with EmpathyAI",
      icon: MessageSquare,
      action: () => navigate('/therapy'),
      color: "bg-blue-500",
    },
    {
      title: "View Progress Report",
      description: "Check your emotional growth and achievements",
      icon: LineChart,
      action: () => navigate('/progress'),
      color: "bg-green-500",
    },
    {
      title: "Review Coping Strategies",
      description: "Access personalized techniques and exercises",
      icon: Brain,
      action: () => navigate('/therapy'),
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Track your emotional wellbeing and continue your journey to better mental health.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <span className="text-sm text-green-500">{stat.change}</span>
                  </div>
                </div>
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="relative overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full ${action.color} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="absolute bottom-4 right-4"
                  onClick={action.action}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Completed therapy session</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
