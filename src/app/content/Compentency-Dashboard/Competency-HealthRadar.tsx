import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { cn } from "@/lib/utils";

// Competency Radar Component
const competencyData = [
  {
    area: 'Task Mapping',
    current: 85,
    target: 95,
    fullMark: 100,
  },
  {
    area: 'Skill Coverage',
    current: 72,
    target: 90,
    fullMark: 100,
  },
  {
    area: 'Behavior Mapping',
    current: 68,
    target: 85,
    fullMark: 100,
  },
  {
    area: 'External Alignment',
    current: 91,
    target: 95,
    fullMark: 100,
  },
  {
    area: 'Risk Assessment',
    current: 79,
    target: 88,
    fullMark: 100,
  },
  {
    area: 'Future Readiness',
    current: 64,
    target: 80,
    fullMark: 100,
  },
];

export function CompetencyRadar() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Competency Health Radar
          <span className="text-xs font-normal text-muted-foreground">
            Current vs target coverage
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={competencyData}>
              <PolarGrid gridType="polygon" className="stroke-border" />
              <PolarAngleAxis 
                dataKey="area" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickCount={6}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="hsl(var(--chart-primary))"
                fill="hsl(var(--chart-primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="hsl(var(--chart-secondary))"
                fill="hsl(var(--chart-secondary))"
                fillOpacity={0.05}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Coverage Gaps</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Future Readiness</span>
                <span className="text-warning font-medium">-16%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Skill Coverage</span>
                <span className="text-warning font-medium">-18%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Strengths</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">External Alignment</span>
                <span className="text-success font-medium">91%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Task Mapping</span>
                <span className="text-success font-medium">85%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Components
export interface StageData {
  id: string;
  name: string;
  count: number;
  color: string;
  bgColor: string;
  description: string;
  tooltip: string;
}

const funnelData: StageData[] = [
  {
    id: "identified",
    name: "Identified Orphans",
    count: 10000,
    color: "stage-identified",
    bgColor: "stage-identified-bg",
    description: "Unmapped skills/entities detected",
    tooltip: "Raw count of skills and entities that have been identified but not yet processed"
  },
  {
    id: "review",
    name: "In Review",
    count: 7000,
    color: "stage-review",
    bgColor: "stage-review-bg", 
    description: "Entities currently under review by SME",
    tooltip: "Skills and entities currently being reviewed by Subject Matter Experts"
  },
  {
    id: "mapped",
    name: "Mapped Candidates",
    count: 3000,
    color: "stage-mapped",
    bgColor: "stage-mapped-bg",
    description: "Skills/entities with proposed links—pending approval",
    tooltip: "Skills and entities that have been mapped and are awaiting final approval"
  },
  {
    id: "approved",
    name: "Approved & Integrated",
    count: 2000,
    color: "stage-approved",
    bgColor: "stage-approved-bg",
    description: "Skills/entities fully vetted and integrated",
    tooltip: "Skills and entities that have been fully processed and integrated into the system"
  }
];

// FunnelStage Component
interface FunnelStageProps {
  stage: StageData;
  width: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  totalCount: number;
}

const FunnelStage = ({
  stage,
  width,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  totalCount,
}: FunnelStageProps) => {
  const percentage = Math.round((stage.count / totalCount) * 100);
  
  return (
    <div
      className="relative cursor-pointer group transition-all duration-300 ease-bounce"
      style={{ width: `${width}%` }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Stage Bar */}
      <div
        className={cn(
          "relative h-20 rounded-lg transition-all duration-300 ease-smooth",
          "border-2 shadow-card",
          `bg-${stage.bgColor} border-${stage.color}/30`,
          {
            "shadow-funnel scale-105": isHovered,
            "ring-2 ring-primary/50": isSelected,
            "hover:shadow-funnel": !isHovered,
          }
        )}
      >
        {/* Background Pattern */}
        <div 
          className={cn(
            "absolute inset-0 rounded-lg opacity-10",
            `bg-${stage.color}`
          )}
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              currentColor 8px,
              currentColor 16px
            )`
          }}
        />
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-4">
          <div className="text-center">
            {/* Count */}
            <div className={cn(
              "text-2xl font-bold transition-all duration-300",
              `text-${stage.color}`,
              {
                "scale-110": isHovered
              }
            )}>
              {stage.count.toLocaleString()}
            </div>
            
            {/* Stage Name */}
            <div className="text-sm font-medium text-foreground/80 mt-1">
              {stage.name}
            </div>
            
            {/* Percentage */}
            <div className="text-xs text-muted-foreground">
              {percentage}% of total
            </div>
          </div>
        </div>
        
        {/* Hover Indicator */}
        {isHovered && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
        )}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          </div>
        )}
      </div>
      
      {/* Connecting Line to Next Stage */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-px h-4 bg-border" />
    </div>
  );
};

// StageTooltip Component
interface StageTooltipProps {
  stage: StageData;
}

const StageTooltip = ({ stage }: StageTooltipProps) => {
  return (
    <Card className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50 p-3 shadow-funnel border-2 border-primary/20 bg-card/95 backdrop-blur-sm min-w-64 animate-in fade-in-0 zoom-in-95">
      <div className="text-center">
        <div className={`text-lg font-bold text-${stage.color} mb-1`}>
          {stage.count.toLocaleString()}
        </div>
        <div className="text-sm font-medium text-foreground mb-2">
          {stage.name}
        </div>
        <div className="text-xs text-muted-foreground">
          {stage.tooltip}
        </div>
      </div>
      
      {/* Arrow pointing down */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-card border-r-2 border-b-2 border-primary/20 rotate-45" />
    </Card>
  );
};

// Main FunnelDashboard Component
export const FunnelDashboard = () => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const totalIdentified = funnelData[0].count;
  const totalApproved = funnelData[funnelData.length - 1].count;
  const completionRate = Math.round((totalApproved / totalIdentified) * 100);

  const handleStageClick = (stageId: string) => {
    setSelectedStage(selectedStage === stageId ? null : stageId);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting funnel data...");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skills Management Funnel</h1>
          <p className="text-muted-foreground mt-1">
            Track orphan skills through the review and integration process
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant="secondary" 
            className="bg-stage-approved-bg text-stage-approved border-stage-approved/20 px-4 py-2"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {completionRate}% Completion Rate
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Funnel Visualization */}
      <Card className="p-8 bg-gradient-card shadow-card">
        <div className="relative">
          {/* Funnel Container */}
          <div className="flex flex-col items-center space-y-4">
            {funnelData.map((stage, index) => {
              const widthPercentage = 100 - (index * 15); // Progressive narrowing
              const dropoffCount = index > 0 ? funnelData[index - 1].count - stage.count : 0;
              const dropoffPercentage = index > 0 ? Math.round((dropoffCount / funnelData[index - 1].count) * 100) : 0;
              
              return (
                <div key={stage.id} className="relative w-full flex flex-col items-center">
                  {/* Dropoff Indicator */}
                  {index > 0 && (
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="text-destructive font-medium">
                        -{dropoffCount.toLocaleString()} ({dropoffPercentage}%)
                      </span>
                      <span>entities filtered</span>
                    </div>
                  )}
                  
                  {/* Stage Component */}
                  <FunnelStage
                    stage={stage}
                    width={widthPercentage}
                    isSelected={selectedStage === stage.id}
                    isHovered={hoveredStage === stage.id}
                    onClick={() => handleStageClick(stage.id)}
                    onMouseEnter={() => setHoveredStage(stage.id)}
                    onMouseLeave={() => setHoveredStage(null)}
                    totalCount={totalIdentified}
                  />
                  
                  {/* Tooltip */}
                  {hoveredStage === stage.id && (
                    <StageTooltip stage={stage} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Stage Legend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stage Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {funnelData.map((stage) => (
            <div key={stage.id} className="flex items-start gap-3">
              <div 
                className={`w-4 h-4 rounded-full bg-${stage.color} flex-shrink-0 mt-1`}
              />
              <div>
                <h4 className="font-medium text-sm">{stage.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected Stage Details */}
      {selectedStage && (
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {funnelData.find(s => s.id === selectedStage)?.name} Details
              </h3>
              <p className="text-muted-foreground mt-1">
                Drill-down view for detailed analysis
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStage(null)}
            >
              ✕
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Detailed breakdown view would be implemented here with entity lists, 
              filtering options, and action buttons for the selected stage.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Main Dashboard Component that shows both CompetencyRadar and FunnelDashboard
export default function CombinedDashboard() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Competency Radar Section */}
      <div className="max-w-4xl mx-auto">
        <CompetencyRadar />
      </div>

      {/* Skills Management Funnel Section */}
      <div className="w-full">
        <FunnelDashboard />
      </div>
    </div>
  );
}
