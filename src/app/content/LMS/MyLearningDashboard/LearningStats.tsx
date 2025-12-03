import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Zap, Award, Users, CheckCircle } from "lucide-react";

// Type definitions
interface Streak {
  current: number;
  best: number;
  target: number;
}

interface WeeklyGoal {
  completed: number;
  target: number;
  unit: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
}

interface PeerComparison {
  rank: number;
  totalPeers: number;
  percentile: number;
  averageProgress: number;
  yourProgress: number;
}

interface StatsData {
  streak: Streak;
  weeklyGoal: WeeklyGoal;
  achievements: Achievement[];
  peerComparison: PeerComparison;
}

// Icon mapper component
const IconMapper = ({ name, size = 20, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const iconProps = { size, color };
  
  switch (name.toLowerCase()) {
    case 'flame':
      return <Flame {...iconProps} />;
    case 'target':
      return <Target {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'checkcircle':
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    default:
      return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.6, fontWeight: 'bold', color }}>{name.charAt(0)}</div>;
  }
};

const LearningStats: React.FC = () => {
  const stats: StatsData = {
    streak: {
      current: 12,
      best: 28,
      target: 30
    },
    weeklyGoal: {
      completed: 8,
      target: 12,
      unit: "hours"
    },
    achievements: [
      {
        id: 1,
        name: "Fast Learner",
        description: "Complete 5 courses in a month",
        icon: "zap",
        earned: true,
        earnedDate: "2025-07-15"
      },
      {
        id: 2,
        name: "Skill Master",
        description: "Reach advanced level in any skill",
        icon: "award",
        earned: true,
        earnedDate: "2025-07-20"
      },
      {
        id: 3,
        name: "Consistent Learner",
        description: "Maintain 30-day learning streak",
        icon: "target",
        earned: false,
        progress: 40
      }
    ],
    peerComparison: {
      rank: 3,
      totalPeers: 25,
      percentile: 88,
      averageProgress: 65,
      yourProgress: 78
    }
  };

  const weeklyGoalPercentage = Math.round((stats.weeklyGoal.completed / stats.weeklyGoal.target) * 100);
  const streakPercentage = Math.round((stats.streak.current / stats.streak.target) * 100);

  return (
    <div className="space-y-6">
      {/* Learning Streak */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Learning Streak</h2>
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-amber-500" />
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-foreground mb-2">{stats.streak.current}</div>
          <p className="text-sm text-muted-foreground">days in a row</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Goal: {stats.streak.target} days</span>
            <span className="text-amber-500 font-medium">{streakPercentage}%</span>
          </div>
          <Progress value={streakPercentage} className="h-2" />
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-muted-foreground">Best streak: {stats.streak.best} days</span>
          <span className="text-amber-500 font-medium">{stats.streak.target - stats.streak.current} days to go</span>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Weekly Goal</h2>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-blue-500" />
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.weeklyGoal.completed}<span className="text-lg text-muted-foreground">/{stats.weeklyGoal.target}</span>
          </div>
          <p className="text-sm text-muted-foreground">{stats.weeklyGoal.unit} this week</p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 relative">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-300"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (weeklyGoalPercentage / 100) * 251.2}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-foreground">{weeklyGoalPercentage}%</span>
                <span className="text-xs text-muted-foreground">Complete</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {stats.weeklyGoal.target - stats.weeklyGoal.completed} {stats.weeklyGoal.unit} remaining
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {stats.achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                achievement.earned 
                  ? 'bg-emerald-100' :'bg-gray-100'
              }`}>
                <IconMapper 
                  name={achievement.icon} 
                  size={20} 
                  color={achievement.earned ? '#10b981' : '#6b7280'}
                />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                {achievement.earned && achievement.earnedDate && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                )}
                {!achievement.earned && achievement.progress && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-blue-500 font-medium">{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Comparison */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Peer Comparison</h2>
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-purple-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              #{stats.peerComparison.rank}
            </div>
            <p className="text-sm text-muted-foreground">
              out of {stats.peerComparison.totalPeers} peers
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Your Progress</span>
                <span className="text-sm font-medium text-foreground">{stats.peerComparison.yourProgress}%</span>
              </div>
              <Progress value={stats.peerComparison.yourProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Peer Average</span>
                <span className="text-sm font-medium text-muted-foreground">{stats.peerComparison.averageProgress}%</span>
              </div>
              <Progress value={stats.peerComparison.averageProgress} className="h-2" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-emerald-600 font-medium">
              You're in the top {100 - stats.peerComparison.percentile}% of learners!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStats;