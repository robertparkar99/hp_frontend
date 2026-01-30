import React, { useState, useEffect } from 'react';
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
  message: string;
}

interface StatsData {
  streak: Streak;
  weeklyGoal: WeeklyGoal;
  achievements: Achievement[];
  overallProgress: number;
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
  const [streak, setStreak] = useState({ current: 0, best: 0, target: 30 });
  const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 12, unit: "hours" });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [peerComparison, setPeerComparison] = useState({ rank: 0, totalPeers: 0, percentile: 0, averageProgress: 0, yourProgress: 0, message: "" });

  const iconMap: { [key: string]: string } = {
    "Fast Learner": "zap",
    "Skill Master": "award",
    "Consistent Learner": "target"
  };

  const calculateProgress = (progressStr: string): number => {
    if (progressStr === "Achieved") return 100;
    const parts = progressStr.split('/');
    if (parts.length === 2) {
      const num = parseInt(parts[0]);
      const den = parseInt(parts[1]);
      return Math.round((num / den) * 100);
    }
    return 0;
  };

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
});

useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
        setSessionData({
            url: APP_URL,
            token,
            subInstituteId: sub_institute_id,
            orgType: org_type,
            userId: user_id,
        });
    }
}, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId && sessionData.userId) {
      fetch(`${sessionData.url}/api/skill-development/streak?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setStreak({
              current: data.data.current_streak,
              best: data.data.best_streak,
              target: data.data.goal
            });
          }
        })
        .catch(err => console.error('Error fetching streak data:', err));
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId && sessionData.userId) {
      fetch(`${sessionData.url}/api/skill-development/weekly-goal?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setWeeklyGoal({
              completed: data.data.current_hours,
              target: data.data.goal_hours,
              unit: "hours"
            });
          }
        })
        .catch(err => console.error('Error fetching weekly goal data:', err));
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId && sessionData.userId) {
      fetch(`${sessionData.url}/api/skill-development/achievements?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            const mappedAchievements = data.data.achievements.map((item: any, index: number) => ({
              id: index ,
              name: item.title,
              description: item.description,
              icon: iconMap[item.title] ,
              earned: item.earned,
              earnedDate: item.earned_date ? new Date(item.earned_date).toLocaleDateString() : undefined,
              progress: item.earned ? undefined : calculateProgress(item.progress)
            }));
            setAchievements(mappedAchievements);
            setOverallProgress(data.data.overall_progress);
          }
        })
        .catch(err => console.error('Error fetching achievements data:', err));
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId && sessionData.userId) {
      fetch(`${sessionData.url}/api/skill-development/peer-comparison?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setPeerComparison({
              rank: data.data.rank,
              totalPeers: data.data.total_peers,
              percentile: data.data.percentile,
              averageProgress: data.data.peer_average,
              yourProgress: data.data.your_progress,
              message: data.data.message
            });
          }
        })
        .catch(err => console.error('Error fetching peer comparison data:', err));
    }
  }, [sessionData]);

  const stats: StatsData = {
    streak: streak,
    weeklyGoal: weeklyGoal,
    achievements: achievements,
    overallProgress: overallProgress,
    peerComparison: peerComparison
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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.earned
                  ? 'bg-emerald-100' : 'bg-gray-100'
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
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">{stats.overallProgress}%</span>
          </div>
          <Progress value={stats.overallProgress} className="h-2" />
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
              {stats.peerComparison.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStats;